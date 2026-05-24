import os
from pathlib import Path

_base = Path(__file__).resolve().parent
_nltk_data = _base / "nltk_data"
_nltk_data.mkdir(exist_ok=True)
os.environ["NLTK_DATA"] = str(_nltk_data)


def _ensure_nltk_data():
    """NLTK corpora from build may not persist; download into project if missing."""
    if (_nltk_data / "corpora" / "stopwords").exists():
        return
    import nltk

    for pkg in ("punkt", "stopwords", "wordnet", "averaged_perceptron_tagger", "words"):
        nltk.download(pkg, download_dir=str(_nltk_data), quiet=True)


_ensure_nltk_data()

from app import create_app

application = create_app()
