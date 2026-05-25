"""Download resume PDFs from public URLs (e.g. Google Drive share links)."""

from __future__ import annotations

import re
import secrets
from pathlib import Path
from typing import Tuple
from urllib.parse import urlparse

import requests

from config import MAX_CONTENT_LENGTH, UPLOAD_DIR

_DRIVE_ID_PATTERNS = (
    re.compile(r"https?://drive\.google\.com/file/d/([a-zA-Z0-9_-]+)"),
    re.compile(r"https?://drive\.google\.com/open\?[^#]*\bid=([a-zA-Z0-9_-]+)"),
    re.compile(r"[?&]id=([a-zA-Z0-9_-]+)"),
)


def normalize_resume_url(url: str) -> str:
    """Turn common Google Drive share links into a direct download URL."""
    raw = (url or "").strip()
    if not raw:
        raise ValueError("Resume link is empty.")

    for pattern in _DRIVE_ID_PATTERNS:
        if "drive.google.com" in raw:
            match = pattern.search(raw)
            if match:
                file_id = match.group(1)
                return f"https://drive.google.com/uc?export=download&id={file_id}"

    parsed = urlparse(raw)
    if parsed.scheme not in ("http", "https"):
        raise ValueError("Link must start with http:// or https://")

    return raw


def download_resume_pdf(url: str) -> Tuple[Path, str]:
    """
    Download a PDF from a public URL into UPLOAD_DIR.
    Returns (save_path, filename).
    """
    download_url = normalize_resume_url(url)
    headers = {"User-Agent": "ResumeAnalyzer/1.0"}

    try:
        resp = requests.get(
            download_url,
            headers=headers,
            timeout=90,
            allow_redirects=True,
            stream=True,
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise ValueError(
            "Could not download PDF from that link. "
            "Ensure the file is public (Anyone with the link) and is a PDF."
        ) from exc

    chunks: list[bytes] = []
    total = 0
    for chunk in resp.iter_content(chunk_size=65536):
        if not chunk:
            continue
        total += len(chunk)
        if total > MAX_CONTENT_LENGTH:
            raise ValueError("PDF is too large (max 10 MB).")
        chunks.append(chunk)

    data = b"".join(chunks)
    if not data.startswith(b"%PDF"):
        raise ValueError(
            "That link did not return a PDF. "
            "For Google Drive: share → Anyone with the link → copy link."
        )

    filename = "resume.pdf"
    if "content-disposition" in resp.headers:
        cd = resp.headers["content-disposition"]
        match = re.search(r'filename[*]?=(?:UTF-8\'\')?"?([^";\n]+)"?', cd, re.I)
        if match and match.group(1).lower().endswith(".pdf"):
            filename = Path(match.group(1).strip()).name

    safe_name = f"{secrets.token_hex(8)}_{filename}"
    save_path = UPLOAD_DIR / safe_name
    save_path.write_bytes(data)
    return save_path, filename
