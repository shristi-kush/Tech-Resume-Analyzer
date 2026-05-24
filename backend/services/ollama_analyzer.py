from __future__ import annotations

import json
import re
from typing import Any, Dict, List

import requests

from config import OLLAMA_API_KEY, OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_TIMEOUT, OLLAMA_USE_CLOUD
from services.analyzer import analyze_resume
from services.pdf_reader import extract_text_from_pdf
from services.youtube_catalog import resolve_youtube

MAX_RESUME_CHARS = 14_000

# Models that work on Ollama Cloud direct API (qwen2.5 is local-only)
CLOUD_MODEL_FALLBACKS = (
    "qwen3-next:80b",
    "qwen3-next:80b-cloud",
    "qwen3-coder:480b",
    "gpt-oss:20b",
    "gpt-oss:120b",
)

SYSTEM_PROMPT = """You are an expert resume coach and technical recruiter.
Analyze the resume text and return ONLY valid JSON (no markdown) with this exact schema:
{
  "summary": "2-3 sentence overview",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "improvement_tips": ["..."],
  "career_track": "Data Science | Web Development | Android Development | IOS Development | UI-UX Development | General",
  "skill_gaps": ["..."],
  "overall_score": 0-100,
  "youtube_recommendation": {
    "applicable": true or false,
    "category": "one of: resume_writing, resume_format, interview_prep, behavioral_interview, data_science, machine_learning, web_development, react, android, ios, ui_ux, internship, fresher_career, projects_portfolio, certifications",
    "reason": "why this video helps"
  }
}
Set youtube_recommendation.applicable to false only if no learning video would help (rare)."""


def _ollama_headers() -> Dict[str, str]:
    headers = {"Content-Type": "application/json"}
    if OLLAMA_API_KEY:
        headers["Authorization"] = f"Bearer {OLLAMA_API_KEY}"
    return headers


def _parse_json_from_response(text: str) -> Dict[str, Any]:
    text = (text or "").strip()
    if not text:
        raise ValueError("Empty response from Ollama")

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        return json.loads(match.group(0))
    raise ValueError("Ollama did not return valid JSON")


def _models_to_try() -> List[str]:
    """Primary model from .env, then cloud fallbacks if not found."""
    seen = set()
    order: List[str] = []
    for name in (OLLAMA_MODEL,) + CLOUD_MODEL_FALLBACKS:
        if name and name not in seen:
            seen.add(name)
            order.append(name)
    return order


def _chat_payload(model: str, messages: List[Dict[str, str]]) -> Dict[str, Any]:
    return {
        "model": model,
        "messages": messages,
        "stream": False,
        "format": "json",
    }


def _call_ollama_chat(resume_text: str, nlp_context: dict) -> Dict[str, Any]:
    if OLLAMA_USE_CLOUD and not OLLAMA_API_KEY:
        raise ValueError(
            "OLLAMA_API_KEY is missing in backend/.env. "
            "Add your key from https://ollama.com/settings/keys and restart Flask."
        )

    user_content = (
        f"Resume text:\n\n{resume_text[:MAX_RESUME_CHARS]}\n\n"
        f"NLP baseline (for reference): field={nlp_context.get('predicted_field')}, "
        f"level={nlp_context.get('candidate_level')}, "
        f"skills={', '.join((nlp_context.get('skills') or [])[:20])}, "
        f"score={nlp_context.get('resume_score')}"
    )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    base = OLLAMA_BASE_URL.rstrip("/")
    url = f"{base}/api/chat"
    headers = _ollama_headers()
    errors: List[str] = []

    for model in _models_to_try():
        payload = _chat_payload(model, messages)
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=OLLAMA_TIMEOUT)
            if resp.status_code == 401:
                raise ValueError(
                    "Invalid Ollama API key. Update OLLAMA_API_KEY in backend/.env "
                    "(https://ollama.com/settings/keys) and restart python app.py"
                )
            if resp.status_code == 404:
                try:
                    err_body = resp.json()
                    err_msg = err_body.get("error", resp.text[:120])
                except Exception:
                    err_msg = resp.text[:120]
                errors.append(f"{model}: {err_msg}")
                if "not found" in str(err_msg).lower():
                    continue
                break
            if resp.status_code >= 400:
                errors.append(f"{model}: HTTP {resp.status_code} — {resp.text[:200]}")
                continue
            data = resp.json()
            content = data.get("message", {}).get("content") or ""
            return _parse_json_from_response(content)
        except requests.RequestException as e:
            errors.append(f"{model}: {e}")
        except (ValueError, json.JSONDecodeError) as e:
            errors.append(f"{model}: {e}")

    if OLLAMA_USE_CLOUD:
        hint = (
            f"Ollama Cloud failed ({base}). "
            "Use a cloud model like qwen3-next:80b (qwen2.5 is not on cloud). "
            "Set OLLAMA_MODEL=qwen3-next:80b in backend/.env and restart python app.py"
        )
    else:
        hint = (
            "Local Ollama not running. Install from https://ollama.com, run:\n"
            "  ollama pull qwen2.5\n"
            "  ollama serve\n"
            "Or use cloud: set OLLAMA_API_KEY + OLLAMA_BASE_URL=https://ollama.com in .env"
        )
    raise ValueError(f"{hint}\nDetails: {'; '.join(errors[:3])}")


def check_ollama_available() -> dict:
    base = OLLAMA_BASE_URL.rstrip("/")
    headers = _ollama_headers()

    if OLLAMA_USE_CLOUD and not OLLAMA_API_KEY:
        return {
            "available": False,
            "base_url": base,
            "model": OLLAMA_MODEL,
            "cloud": True,
            "api_key_set": False,
            "hint": "Add OLLAMA_API_KEY to backend/.env and restart Flask.",
        }

    for url in (f"{base}/api/tags", f"{base}/v1/models"):
        try:
            r = requests.get(url, headers=headers, timeout=15)
            if r.ok:
                return {
                    "available": True,
                    "base_url": base,
                    "model": OLLAMA_MODEL,
                    "cloud": OLLAMA_USE_CLOUD,
                    "api_key_set": bool(OLLAMA_API_KEY),
                }
        except requests.RequestException:
            continue

    return {
        "available": False,
        "base_url": base,
        "model": OLLAMA_MODEL,
        "cloud": OLLAMA_USE_CLOUD,
        "api_key_set": bool(OLLAMA_API_KEY),
        "hint": (
            "Cloud: verify OLLAMA_API_KEY in backend/.env. "
            "Local: run `ollama serve`."
        ),
    }


def analyze_resume_comprehensive(pdf_path: str, course_count: int = 5) -> dict:
    """NLP baseline + Ollama comprehensive analysis + YouTube pick."""
    nlp = analyze_resume(pdf_path, course_count=course_count)
    resume_text = extract_text_from_pdf(pdf_path)
    if not (resume_text or "").strip():
        raise ValueError("Could not extract text from PDF for AI analysis.")

    ai_raw = _call_ollama_chat(resume_text, nlp)
    yt_raw = ai_raw.get("youtube_recommendation") or {}
    youtube = None
    if yt_raw.get("applicable", True):
        youtube = resolve_youtube(
            yt_raw.get("category"),
            ai_raw.get("career_track") or nlp.get("predicted_field", "NA"),
            nlp.get("candidate_level", "Fresher"),
        )
        if youtube and yt_raw.get("reason"):
            youtube["reason"] = str(yt_raw["reason"])

    ai_score = ai_raw.get("overall_score")
    if isinstance(ai_score, (int, float)):
        nlp["resume_score"] = max(0, min(100, int(ai_score)))

    track = ai_raw.get("career_track")
    if track and track not in ("General", "NA"):
        nlp["predicted_field"] = track

    gaps = ai_raw.get("skill_gaps") or []
    if gaps:
        nlp["recommended_skills"] = list(dict.fromkeys(gaps))[:12]

    nlp["analysis_mode"] = "ollama"
    nlp["ai_analysis"] = {
        "summary": ai_raw.get("summary", ""),
        "strengths": ai_raw.get("strengths") or [],
        "weaknesses": ai_raw.get("weaknesses") or [],
        "improvement_tips": ai_raw.get("improvement_tips") or [],
        "career_track": ai_raw.get("career_track") or nlp.get("predicted_field"),
        "overall_score": nlp["resume_score"],
    }
    nlp["youtube_video"] = youtube
    return nlp
