#!/usr/bin/env bash
# =====================================================================
# CE50 Development Environment Launcher (Bash Version)
# Starts both frontend (Next.js) and backend (FastAPI/Uvicorn)
# =====================================================================
set -euo pipefail

ScriptDir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ProjectRoot="$ScriptDir"

echo "[1/3] Verifying project files..."
if [[ ! -f "$ProjectRoot/package.json" ]]; then
    echo "ERROR: package.json not found in $ProjectRoot." >&2
    exit 1
fi

if [[ ! -d "$ProjectRoot/node_modules" ]]; then
    echo "[WARNING] node_modules missing. Run: npm install"
fi

VenvPython="$ProjectRoot/.venv/bin/python"
if [[ ! -x "$VenvPython" ]]; then
    VenvPython="$ProjectRoot/.venv/Scripts/python.exe"
fi

BackendCmd=""
if [[ -x "$VenvPython" ]]; then
    echo "[2/3] Found Python venv at .venv."
    BackendCmd="\"$VenvPython\" -m uvicorn main:app --reload --app-dir server"
else
    echo "[2/3] venv not found at .venv. Falling back to global uvicorn."
    BackendCmd="uvicorn main:app --reload --app-dir server"
fi

echo "[3/3] Launching frontend and backend in tmux..." >&2

Session="ce50-dev"

if tmux has-session -t "$Session" 2>/dev/null; then
    echo "tmux session '$Session' exists. Attach: tmux attach -t $Session" >&2
    exit 0
fi

tmux new-session -d -s "$Session" -n dev -c "$ProjectRoot" "$BackendCmd"
tmux split-window -h -t "$Session:dev" -c "$ProjectRoot" "npm run dev"
tmux attach-session -t "$Session:dev"
