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

echo "[3/3] Launching frontend and backend..." >&2

Cleanup() {
    echo
    echo "Stopping dev servers..."
    [[ -n "${FrontPid:-}" ]] && kill "$FrontPid" 2>/dev/null || true
    [[ -n "${BackPid:-}" ]]  && kill "$BackPid" 2>/dev/null || true
}
trap Cleanup EXIT INT TERM

( cd "$ProjectRoot" && npm run dev ) &
FrontPid=$!

eval "( cd \"$ProjectRoot\" && $BackendCmd )" &
BackPid=$!

wait
