#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
export PATH="$HOME/.local/node/bin:$PATH"

cd "$ROOT/backend"
python3.13 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000 &
BACK_PID=$!

cd "$ROOT/frontend"
npm run dev -- --host 127.0.0.1 --port 5173 &
FRONT_PID=$!

cleanup() {
  kill "$BACK_PID" "$FRONT_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo ""
echo "jizer site"
echo "  frontend: http://127.0.0.1:5173"
echo "  backend:  http://127.0.0.1:8000"
echo "  admin:    jizer / jizer_admin"
echo ""

wait
