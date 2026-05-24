import os

bind = f"0.0.0.0:{os.environ.get('PORT', '5000')}"
workers = 1
# Ollama cloud + NLP can exceed 30s; must be > OLLAMA_TIMEOUT (default 120)
timeout = int(os.environ.get("GUNICORN_TIMEOUT", "180"))
graceful_timeout = int(os.environ.get("GUNICORN_GRACEFUL_TIMEOUT", "30"))
keepalive = 5
