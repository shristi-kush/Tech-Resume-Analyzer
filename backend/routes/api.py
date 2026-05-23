import os
import secrets
from functools import wraps
from pathlib import Path
from typing import Optional

import jwt
from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

from config import ADMIN_PASSWORD, ADMIN_USERNAME, MAX_CONTENT_LENGTH, SECRET_KEY, UPLOAD_DIR
from services.analyzer import analyze_resume
from services.ollama_analyzer import analyze_resume_comprehensive, check_ollama_available
from services.auth import authenticate_user, register_user
from services.database import fetch_analytics, fetch_feedback, init_db, save_analysis, save_feedback
from services.geo import get_client_ip, lookup_geo

api_bp = Blueprint("api", __name__, url_prefix="/api/v1")

ALLOWED = {".pdf"}


def _decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])


def _token_from_request():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    try:
        return _decode_token(auth.split(" ", 1)[1])
    except jwt.PyJWTError:
        return None


def _optional_user_id():
    payload = _token_from_request()
    if not payload or payload.get("role") != "user":
        return None
    try:
        return int(payload["sub"])
    except (TypeError, ValueError):
        return None


def _token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not _token_from_request():
            return jsonify({"error": "Missing or invalid token"}), 401
        return f(*args, **kwargs)

    return decorated


def _build_charts(analyses, feedback_scores, admin: bool):
    def count_by(key):
        counts = {}
        for row in analyses:
            val = row.get(key) or "Unknown"
            counts[val] = counts.get(val, 0) + 1
        return [{"label": k, "value": v} for k, v in counts.items()]

    charts = {
        "predicted_field": count_by("predicted_field"),
        "user_level": count_by("user_level"),
        "resume_score": count_by("resume_score"),
    }
    if admin:
        charts.update({
            "country": count_by("country"),
            "region": count_by("region"),
            "city": count_by("city"),
            "upload_source": count_by("upload_source"),
        })
        feedback_counts = {}
        for s in feedback_scores:
            feedback_counts[str(s)] = feedback_counts.get(str(s), 0) + 1
        charts["feedback_rating"] = [
            {"label": k, "value": v} for k, v in feedback_counts.items()
        ]
    return charts


@api_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "resume-analyzer-api"})


@api_bp.route("/ollama/status", methods=["GET"])
def ollama_status():
    return jsonify(check_ollama_available())


@api_bp.route("/analyze", methods=["POST"])
def analyze():
    if "resume" not in request.files:
        return jsonify({"error": "PDF file required (field: resume)"}), 400

    file = request.files["resume"]
    if not file.filename:
        return jsonify({"error": "Empty filename"}), 400

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED:
        return jsonify({"error": "Only PDF files are allowed"}), 400

    act_name = request.form.get("act_name", "").strip()
    act_mail = request.form.get("act_mail", "").strip()
    act_mob = request.form.get("act_mob", "").strip()
    course_count = min(int(request.form.get("course_count", 5)), 10)
    analysis_mode = (request.form.get("analysis_mode") or "nlp").strip().lower()
    if analysis_mode not in ("nlp", "ollama"):
        return jsonify({"error": "analysis_mode must be 'nlp' or 'ollama'"}), 400

    filename = secure_filename(file.filename)
    unique_name = f"{secrets.token_hex(8)}_{filename}"
    save_path = UPLOAD_DIR / unique_name
    file.save(save_path)

    try:
        if analysis_mode == "ollama":
            result = analyze_resume_comprehensive(str(save_path), course_count=course_count)
        else:
            result = analyze_resume(str(save_path), course_count=course_count)
        profile = result["profile"]
        client_ip = get_client_ip(request)
        geo = lookup_geo(client_ip)
        upload_source = (request.headers.get("X-Upload-Source") or "api").strip()[:64]
        user_id = _optional_user_id()
        save_analysis(
            act_name,
            act_mail,
            act_mob,
            profile.get("name"),
            profile.get("email"),
            result["resume_score"],
            profile.get("pages"),
            result["predicted_field"],
            result["candidate_level"],
            result["skills"],
            result["recommended_skills"],
            result["courses"],
            unique_name,
            ip_address=client_ip,
            country=geo.get("country"),
            region=geo.get("region"),
            city=geo.get("city"),
            upload_source=upload_source,
            user_id=user_id,
        )
        return jsonify({"success": True, "data": result})
    except ValueError as e:
        return jsonify({"error": str(e)}), 422
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {e}"}), 500
    finally:
        if save_path.exists():
            try:
                os.remove(save_path)
            except OSError:
                pass


@api_bp.route("/feedback", methods=["POST"])
def feedback():
    body = request.get_json(silent=True) or {}
    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip()
    score = body.get("score")
    comments = (body.get("comments") or "").strip()

    if not name or not email or score is None:
        return jsonify({"error": "name, email, and score are required"}), 400

    try:
        score = int(score)
        if score < 1 or score > 5:
            raise ValueError()
    except (TypeError, ValueError):
        return jsonify({"error": "score must be 1-5"}), 400

    save_feedback(name, email, score, comments)
    return jsonify({"success": True, "message": "Feedback recorded"})


@api_bp.route("/feedback", methods=["GET"])
def feedback_list():
    return jsonify({"data": fetch_feedback()})


def _issue_token(role: str, sub: str, email: Optional[str] = None):
    payload = {"role": role, "sub": sub}
    if email:
        payload["email"] = email
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return jsonify({
        "token": token,
        "role": role,
        "email": email or sub,
        "expires_in": 86400,
    })


@api_bp.route("/auth/register", methods=["POST"])
def auth_register():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip()
    password = body.get("password") or ""
    name = (body.get("name") or "").strip()
    try:
        user = register_user(email, password, name)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    return _issue_token("user", str(user["id"]), user["email"])


@api_bp.route("/auth/login", methods=["POST"])
def auth_login():
    body = request.get_json(silent=True) or {}
    login_id = (body.get("email") or body.get("username") or "").strip()
    password = body.get("password") or ""

    if login_id == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        return _issue_token("admin", ADMIN_USERNAME, ADMIN_USERNAME)

    user = authenticate_user(login_id, password)
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
    return _issue_token("user", str(user["id"]), user["email"])


@api_bp.route("/admin/login", methods=["POST"])
def admin_login():
    return auth_login()


@api_bp.route("/profile/analytics", methods=["GET"])
@_token_required
def profile_analytics():
    payload = _token_from_request()
    role = payload.get("role")
    is_admin = role == "admin"

    if is_admin:
        data = fetch_analytics()
    else:
        try:
            user_id = int(payload["sub"])
        except (TypeError, ValueError, KeyError):
            return jsonify({"error": "Invalid token"}), 401
        data = fetch_analytics(user_id=user_id, include_feedback=False)

    analyses = data["analyses"]
    return jsonify({
        "role": role,
        "total_users": data["total_users"],
        "analyses": analyses,
        "charts": _build_charts(analyses, data["feedback_scores"], admin=is_admin),
    })


@api_bp.route("/admin/analytics", methods=["GET"])
@_token_required
def admin_analytics():
    return profile_analytics()
