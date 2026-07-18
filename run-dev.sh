#!/usr/bin/env bash
# =====================================================================
# CE50 Development Environment Launcher (Bash Version)
# Starts both frontend (Next.js) and backend (FastAPI/Uvicorn)
# =====================================================================
set -uo pipefail

ScriptDir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ProjectRoot="$ScriptDir"
[ -z "$ProjectRoot" ] && ProjectRoot="$(pwd)"

echo -e "\033[36m[1/3] Verifying project files...\033[0m"
if [ ! -f "$ProjectRoot/package.json" ]; then
    echo "ERROR: package.json not found in $ProjectRoot. Run from project root." >&2
    exit 1
fi

if [ ! -d "$ProjectRoot/node_modules" ]; then
    echo -e "\033[33m[WARNING] node_modules missing. Run: npm install\033[0m"
fi

VenvPython="$ProjectRoot/.venv/bin/python"
BackendCmd=""
if [ -x "$VenvPython" ]; then
    echo -e "\033[36m[2/3] Found Python virtual environment at .venv.\033[0m"
    BackendCmd="\"$VenvPython\" -m uvicorn main:app --reload --app-dir server"
else
    echo -e "\033[33m[2/3] .venv not found. Falling back to global uvicorn.\033[0m"
    BackendCmd="uvicorn main:app --reload --app-dir server"
fi

# Pick terminal multiplexer: tmux preferred, then screen, else background jobs.
echo -e "\033[36m[3/3] Checking for tmux/screen...\033[0m"
Session="ce50-dev"

if command -v tmux >/dev/null 2>&1; then
    echo -e "\033[32mLaunching tmux session '$Session' with split panes...\033[0m"
    tmux new-session -d -s "$Session" -c "$ProjectRoot" "npm run dev"
    tmux split-window -h -t "$Session" -c "$ProjectRoot" "$BackendCmd"
    exec tmux attach-session -t "$Session"
elif command -v screen >/dev/null 2>&1; then
    echo -e "\033[32mLaunching screen session '$Session' with split windows...\033[0m"
    screen -dmS "$Session" -t frontend bash -lc "cd '$ProjectRoot' && npm run dev"
    screen -S "$Session" -X screen -t backend bash -lc "cd '$ProjectRoot' && $BackendCmd"
    exec screen -r "$Session"
else
    echo -e "\033[33m[INFO] tmux/screen not found. Starting in background (logs in *.log).\033[0m"
    (cd "$ProjectRoot" && npm run dev) >"$ProjectRoot/frontend.log" 2>&1 &
    echo "  frontend PID $! -> frontend.log"
    (cd "$ProjectRoot" && eval "$BackendCmd") >"$ProjectRoot/backend.log" 2>&1 &
    echo "  backend  PID $! -> backend.log"
    echo -e "\033[32mDone! Tail logs: tail -F frontend.log backend.log\033[0m"
fi
