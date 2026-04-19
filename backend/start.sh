#!/bin/bash
cd "$(dirname "$0")"
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
python3 -m pip install -r requirements.txt -q
echo "Starting RecoveryIQ Python backend on http://localhost:8000"
python3 main.py
