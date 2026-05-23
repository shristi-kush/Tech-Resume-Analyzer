import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Load .env from backend folder before reading Ollama settings
load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'resume_analyzer.db'}")

SECRET_KEY = os.getenv("SECRET_KEY", "dev-change-me-in-production")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin@resume-analyzer")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB

# Ollama — local: http://localhost:11434 | cloud: https://ollama.com
OLLAMA_API_KEY = (os.getenv("OLLAMA_API_KEY") or "").strip()
_local_default = "http://localhost:11434"
_configured_base = (os.getenv("OLLAMA_BASE_URL") or "").strip()

if OLLAMA_API_KEY and (not _configured_base or _configured_base == _local_default):
    # API key present → use Ollama Cloud unless user explicitly set another URL
    OLLAMA_BASE_URL = "https://ollama.com"
elif _configured_base:
    OLLAMA_BASE_URL = _configured_base.rstrip("/")
else:
    OLLAMA_BASE_URL = _local_default

_configured_model = (os.getenv("OLLAMA_MODEL") or "").strip()
if _configured_model:
    OLLAMA_MODEL = _configured_model
elif OLLAMA_API_KEY or "ollama.com" in OLLAMA_BASE_URL:
    OLLAMA_MODEL = "qwen3-next:80b"
else:
    OLLAMA_MODEL = "qwen2.5"

OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "120"))
OLLAMA_USE_CLOUD = bool(OLLAMA_API_KEY) or "ollama.com" in OLLAMA_BASE_URL
