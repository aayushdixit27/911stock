#!/bin/bash
# bland-poll.sh — Poll a Bland AI call until it completes
# Uses adaptive intervals: 3s → 10s → 30s as call progresses.
#
# Usage: bland-poll.sh <call_id> [max_wait_seconds]
#   call_id           The call to monitor
#   max_wait_seconds  Timeout (default: 600 = 10 minutes)
#
# Output: Full call JSON on stdout when complete. Progress on stderr.
# Exit codes: 0 = completed, 1 = timeout/error
#
# Requires: BLAND_API_KEY env var, curl, jq

set -euo pipefail

# Auto-install missing dependencies
ensure_dep() {
  local bin="$1" pkg_brew="$2" pkg_apt="${3:-$2}"
  command -v "$bin" &>/dev/null && return 0
  echo "Installing $bin..." >&2
  if command -v brew &>/dev/null; then
    brew install "$pkg_brew"
  elif command -v apt-get &>/dev/null; then
    sudo apt-get install -y "$pkg_apt"
  else
    echo "Error: $bin not found and no package manager (brew/apt) available." >&2
    exit 1
  fi
}

CALL_ID="${1:?Usage: bland-poll.sh <call_id> [max_wait_seconds]}"
MAX_WAIT="${2:-600}"

: "${BLAND_API_KEY:?Error: Set BLAND_API_KEY environment variable}"
ensure_dep jq jq jq

ELAPSED=0
INTERVAL=3

while [ $ELAPSED -lt $MAX_WAIT ]; do
  RESULT=$(curl -s -H "authorization: $BLAND_API_KEY" \
    "https://api.bland.ai/v1/calls/$CALL_ID")
  COMPLETED=$(echo "$RESULT" | jq -r '.completed // false')
  STATUS=$(echo "$RESULT" | jq -r '.status // "unknown"')

  if [ "$COMPLETED" = "true" ] || echo "$STATUS" | grep -qE "^(failed|busy|no-answer)$"; then
    echo "$RESULT"
    exit 0
  fi

  echo "[$CALL_ID] status=$STATUS elapsed=${ELAPSED}s" >&2
  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))

  # Adaptive intervals: slow down as call progresses
  if [ $ELAPSED -gt 300 ]; then INTERVAL=30
  elif [ $ELAPSED -gt 30 ]; then INTERVAL=10
  fi
done

echo "Timeout: call $CALL_ID did not complete within ${MAX_WAIT}s" >&2
exit 1
