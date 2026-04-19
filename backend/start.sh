#!/bin/bash
cd "$(dirname "$0")"
PYTHON=/opt/homebrew/bin/python3.12
if [ ! -d ".venv" ] || [ ! -f ".venv/bin/python" ]; then
  rm -rf .venv
  $PYTHON -m venv .venv
fi
source .venv/bin/activate
python -m pip install -r requirements.txt -q
echo "Starting RecoveryIQ Python backend on http://localhost:8000"
python main.py
