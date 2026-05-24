import os

bind = f"0.0.0.0:{os.environ.get('PORT', '5000')}"
workers = 1
# NLP + Ollama cloud can take several minutes; must be > OLLAMA_TIMEOUT
timeout = int(os.environ.get("GUNICORN_TIMEOUT", "480"))
graceful_timeout = int(os.environ.get("GUNICORN_GRACEFUL_TIMEOUT", "90"))
keepalive = 5
