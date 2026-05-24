#!/usr/bin/env bash
set -euo pipefail

echo "Python: $(python --version)"

pip install --upgrade "pip<25" setuptools wheel

# Spacy 2.3.5 stack — wheels only (never compile blis/thinc on Render)
pip install "numpy<2.0.0"
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

python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet'); nltk.download('averaged_perceptron_tagger'); nltk.download('words')"

python -c "import spacy; spacy.load('en_core_web_sm'); print('spacy OK')"
