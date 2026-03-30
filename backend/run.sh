#!/bin/bash
# Memory Web Admin — one-click start
cd "$(dirname "$0")"

echo "🧠 Starting Memory Web Admin on http://localhost:18090"

# Check if qdrant is running
if ! curl -s http://localhost:6333/healthz > /dev/null 2>&1; then
    echo "⚠️  Qdrant not detected at localhost:6333"
    echo "   Run: cd /data/home/leonfeng/qdrant && docker compose up -d"
fi

exec python3 main.py
