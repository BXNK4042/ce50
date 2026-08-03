#!/usr/bin/env bash

SESSION="dev"

# Kill lingering ngrok processes
pkill -f ngrok 2>/dev/null || true

# Attach if session exists
if tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "Attaching to existing tmux session '$SESSION'..."
  exec tmux attach-session -t "$SESSION"
fi

# Create session & run npm run dev
tmux new-session -d -s "$SESSION" -n "dev-tunnel" "npm run dev; exec \$SHELL"

# Split window horizontally & run ngrok http 3000
tmux split-window -h -t "$SESSION" "ngrok http 3000; exec \$SHELL"

# Evenly space panes & attach
tmux select-layout -t "$SESSION" tile
exec tmux attach-session -t "$SESSION"
