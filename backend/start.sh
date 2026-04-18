#!/bin/bash
cd "$(dirname "$0")"
pip install -r requirements.txt -q
echo "Starting RecoveryIQ Python backend on http://localhost:8000"
python main.py
