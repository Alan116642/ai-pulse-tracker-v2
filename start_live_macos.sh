#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
RUNTIME_DIR="$PROJECT_ROOT/.runtime"
APP_DIR="$PROJECT_ROOT/app"

mkdir -p "$RUNTIME_DIR"

find_python() {
  if command -v python3.12 >/dev/null 2>&1; then
    echo "python3.12"
    return
  fi
  if command -v python3 >/dev/null 2>&1; then
    echo "python3"
    return
  fi
  echo ""
}

PYTHON_BIN="$(find_python)"
if [ -z "$PYTHON_BIN" ]; then
  echo "Python 3.12 or python3 is required."
  exit 1
fi

stop_port() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -ti tcp:"$port" || true)"
    if [ -n "$pids" ]; then
      echo "$pids" | xargs kill -9 2>/dev/null || true
      sleep 1
    fi
  fi
}

stop_port 3000
stop_port 8010

: > "$RUNTIME_DIR/backend.out.log"
: > "$RUNTIME_DIR/backend.err.log"
: > "$RUNTIME_DIR/frontend.out.log"
: > "$RUNTIME_DIR/frontend.err.log"

"$PYTHON_BIN" -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8010 \
  >"$RUNTIME_DIR/backend.out.log" 2>"$RUNTIME_DIR/backend.err.log" &
echo $! > "$RUNTIME_DIR/backend.pid"

(
  cd "$APP_DIR"
  "$PYTHON_BIN" -m http.server 3000 --bind 127.0.0.1 \
    >"$RUNTIME_DIR/frontend.out.log" 2>"$RUNTIME_DIR/frontend.err.log"
) &
echo $! > "$RUNTIME_DIR/frontend.pid"

sleep 5

echo "AI Pulse Tracker started."
echo "Backend: http://127.0.0.1:8010"
echo "Frontend: http://127.0.0.1:3000"
echo "Logs: $RUNTIME_DIR"
