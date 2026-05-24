#!/usr/bin/env bash
set -euo pipefail

echo "Python: $(python --version)"

PY_MAJOR=$(python -c "import sys; print(sys.version_info.major)")
PY_MINOR=$(python -c "import sys; print(sys.version_info.minor)")

if [[ "$PY_MAJOR" -ne 3 || "$PY_MINOR" -ne 9 ]]; then
  echo ""
  echo "============================================================"
  echo "ERROR: Python 3.9 is required (spacy 2.3.5 / pyresparser)."
  echo "Detected: Python ${PY_MAJOR}.${PY_MINOR}"
  echo ""
  echo "Fix on Render:"
  echo "  1. Environment → Add: PYTHON_VERSION = 3.9.18"
  echo "  2. Manual Deploy → Clear build cache & deploy"
  echo "============================================================"
  exit 1
fi

pip install --upgrade "pip<25" "setuptools<81" wheel

# Spacy 2.3.5 stack — wheels only (never compile blis/thinc on Render)
pip install "numpy>=1.19.0,<2.0.0" --only-binary=numpy
pip install \
  blis==0.7.9 \
  cymem==2.0.5 \
  preshed==3.0.5 \
  murmurhash==1.0.5 \
  thinc==7.4.5 \
  spacy==2.3.5 \
  --only-binary=:all:

pip install --prefer-binary -r requirements.txt

pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-2.3.1/en_core_web_sm-2.3.1.tar.gz

NLTK_DIR="$(pwd)/nltk_data"
mkdir -p "$NLTK_DIR"
export NLTK_DATA="$NLTK_DIR"
python -c "
import nltk, os
d = os.environ['NLTK_DATA']
for pkg in ('punkt', 'stopwords', 'wordnet', 'averaged_perceptron_tagger', 'words'):
    nltk.download(pkg, download_dir=d)
print('NLTK data:', d)
"

python -c "import pkg_resources; import spacy; spacy.load('en_core_web_sm'); print('spacy OK')"
