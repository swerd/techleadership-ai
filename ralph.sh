#!/usr/bin/env bash
# ralph.sh — the "Ralph Wiggum" loop: re-feed a fixed prompt to the agent each
# iteration, letting it make one improvement at a time and self-correct.
#
# Usage:
#   ./ralph.sh            # loop until you Ctrl-C
#   ./ralph.sh 5          # run at most 5 iterations
#
# Requires the `claude` CLI on PATH. Each iteration runs headless (-p) against
# PROMPT.md, then runs QA. Stop anytime with Ctrl-C.

set -euo pipefail
cd "$(dirname "$0")"

MAX="${1:-0}"   # 0 = infinite
i=0

trap 'echo; echo "Ralph loop stopped after $i iteration(s)."; exit 0' INT

while :; do
  i=$((i + 1))
  echo "==================== Ralph iteration $i ===================="

  if command -v claude >/dev/null 2>&1; then
    claude -p "$(cat PROMPT.md)" --permission-mode acceptEdits || true
  else
    echo "claude CLI not found — running QA-only iteration."
  fi

  echo "--- QA ---"
  if ! python3 qa.py; then
    echo "QA reported errors; next iteration will address them."
  fi

  if [ "$MAX" -ne 0 ] && [ "$i" -ge "$MAX" ]; then
    echo "Reached max iterations ($MAX). Done."
    break
  fi

  sleep 2
done
