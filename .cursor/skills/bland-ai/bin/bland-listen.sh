#!/bin/bash
# bland-listen.sh — Live listen to an in-progress Bland AI call
# Streams real-time audio through your speakers via WebSocket.
#
# Usage: bland-listen.sh <call_id>
#
# Audio format: s16le (signed 16-bit little-endian PCM), 16kHz, mono
# Requires: BLAND_API_KEY env var, curl, jq, websocat, sox (play)
#
# Install deps (macOS): brew install websocat sox

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

CALL_ID="${1:?Usage: bland-listen.sh <call_id>}"

: "${BLAND_API_KEY:?Error: Set BLAND_API_KEY environment variable}"
ensure_dep jq jq jq
ensure_dep websocat websocat websocat
ensure_dep play sox sox

# Get WebSocket streaming URL
echo "Getting live listen URL for call $CALL_ID..."
RESPONSE=$(curl -s -X POST \
  -H "authorization: $BLAND_API_KEY" \
  "https://api.bland.ai/v1/calls/$CALL_ID/listen")

WSS_URL=$(echo "$RESPONSE" | jq -r '.data.url // .url // empty')

if [ -z "$WSS_URL" ] || [ "$WSS_URL" = "null" ]; then
  ERROR=$(echo "$RESPONSE" | jq -r '.errors[0].message // .message // "Unknown error"' 2>/dev/null)
  echo "Error: Could not get live listen URL."
  echo "Reason: $ERROR"
  echo "Note: Call must be in-progress and live_listen must be enabled on your account."
  exit 1
fi

echo "Connected! Streaming audio... (Ctrl+C to stop)"
echo ""

# Use websocat's cmd: specifier to pipe audio directly to sox play.
# NOTE: Standard shell pipes (websocat | play) do NOT work reliably — websocat
# buffers output when it detects a pipe, causing silence or dropped audio.
# The cmd: specifier lets websocat manage the subprocess stdin directly.
#
# Audio is s16le (signed 16-bit LE PCM), 16kHz sample rate, mono.
websocat --binary --no-close \
  "$WSS_URL" \
  "cmd:play -t raw -r 16000 -e signed-integer -b 16 -c 1 -q -" \
  2>/dev/null
