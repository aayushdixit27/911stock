#!/bin/bash
# bland-monitor.sh — Connect to Bland AI active calls SSE stream
# Streams real-time status updates for ALL your active calls.
#
# Usage: bland-monitor.sh [--raw]
#   --raw    Output raw SSE events (default: formatted human-readable)
#
# Requires: BLAND_API_KEY env var, curl, jq
# Events: INITIAL_STATE, UPDATE (QUEUED/IN_PROGRESS/TRANSFERRED/COMPLETE), HEARTBEAT

set -euo pipefail

# Auto-install missing dependencies
ensure_dep() {
  local bin="$1" pkg_brew="$2" pkg_apt="${3:-$2}"
  command -v "$bin" &>/dev/null && return 0
  echo "Installing $bin..."
  if command -v brew &>/dev/null; then
    brew install "$pkg_brew"
  elif command -v apt-get &>/dev/null; then
    sudo apt-get install -y "$pkg_apt"
  else
    echo "Error: $bin not found and no package manager (brew/apt) available. Install manually." >&2
    exit 1
  fi
}

RAW_MODE="${1:-}"

: "${BLAND_API_KEY:?Error: Set BLAND_API_KEY environment variable}"
ensure_dep jq jq jq

if [ "$RAW_MODE" = "--raw" ]; then
  # Raw mode: pass through SSE events as-is
  exec curl -N -s -H "authorization: $BLAND_API_KEY" \
    "https://api.bland.ai/v1/calls/active/stream"
fi

# Formatted mode: parse and display events nicely
echo "Connecting to Bland AI active calls stream..."
echo "Press Ctrl+C to stop."
echo ""

curl -N -s -H "authorization: $BLAND_API_KEY" \
  "https://api.bland.ai/v1/calls/active/stream" | while IFS= read -r line; do
  # SSE lines start with "data: "
  if [[ "$line" == data:* ]]; then
    JSON="${line#data: }"
    TYPE=$(echo "$JSON" | jq -r '.type // empty' 2>/dev/null)

    case "$TYPE" in
      INITIAL_STATE)
        COUNT=$(echo "$JSON" | jq '.data | length' 2>/dev/null)
        echo "[INIT] $COUNT active call(s)"
        echo "$JSON" | jq -r '.data[] | "  [\(.status)] \(.call_id) → \(.to) (\(.objective // "no objective"))"' 2>/dev/null
        ;;
      UPDATE)
        CALL_ID=$(echo "$JSON" | jq -r '.data.data.call_id // .data.call_id // empty' 2>/dev/null)
        STATUS=$(echo "$JSON" | jq -r '.data.data.status // .data.status // empty' 2>/dev/null)
        TO=$(echo "$JSON" | jq -r '.data.data.to // .data.to // empty' 2>/dev/null)
        TS=$(date '+%H:%M:%S')
        echo "[$TS] $CALL_ID → $STATUS ${TO:+(to: $TO)}"
        ;;
      HEARTBEAT)
        # Silent heartbeat — don't clutter output
        ;;
      ERROR)
        MSG=$(echo "$JSON" | jq -r '.message // "unknown error"' 2>/dev/null)
        echo "[ERROR] $MSG"
        ;;
      *)
        echo "[EVENT] $JSON"
        ;;
    esac
  fi
done
