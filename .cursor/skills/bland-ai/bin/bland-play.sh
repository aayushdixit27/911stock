#!/bin/bash
# bland-play.sh — Download and play a Bland AI call recording
#
# Usage: bland-play.sh <call_id> [--save filename]
#   call_id     The call whose recording to play
#   --save      Save recording to a file instead of (or in addition to) playing
#
# Audio player detection chain: afplay (macOS) → ffplay → mpv → sox play → paplay
#
# Requires: BLAND_API_KEY env var, curl

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

CALL_ID="${1:?Usage: bland-play.sh <call_id> [--save filename]}"

: "${BLAND_API_KEY:?Error: Set BLAND_API_KEY environment variable}"

TMPFILE=$(mktemp /tmp/bland-recording-XXXXXX.wav)
trap 'rm -f "$TMPFILE"' EXIT

echo "Downloading recording for $CALL_ID..."
HTTP_CODE=$(curl -s -w "%{http_code}" -H "authorization: $BLAND_API_KEY" \
  "https://api.bland.ai/v1/recordings/$CALL_ID" -o "$TMPFILE")

if [ "$HTTP_CODE" != "200" ] || [ ! -s "$TMPFILE" ]; then
  echo "Error: No recording found (HTTP $HTTP_CODE). Call may still be in progress or recording unavailable."
  exit 1
fi

FILE_SIZE=$(wc -c < "$TMPFILE" | tr -d ' ')
echo "Downloaded: $(echo "scale=1; $FILE_SIZE / 1024" | bc)KB"

# Save if requested
if [ "${2:-}" = "--save" ] && [ -n "${3:-}" ]; then
  cp "$TMPFILE" "$3"
  echo "Saved to $3"
fi

# Play with best available player
if command -v afplay &>/dev/null; then
  echo "Playing with afplay..."
  afplay "$TMPFILE"
elif command -v ffplay &>/dev/null; then
  echo "Playing with ffplay..."
  ffplay -nodisp -autoexit "$TMPFILE" 2>/dev/null
elif command -v mpv &>/dev/null; then
  echo "Playing with mpv..."
  mpv --no-video "$TMPFILE" 2>/dev/null
elif command -v play &>/dev/null; then
  echo "Playing with sox..."
  play "$TMPFILE"
elif command -v paplay &>/dev/null; then
  echo "Playing with paplay..."
  paplay "$TMPFILE"
else
  echo "No audio player found. Installing ffmpeg..."
  ensure_dep ffplay ffmpeg ffmpeg
  echo "Playing with ffplay..."
  ffplay -nodisp -autoexit "$TMPFILE" 2>/dev/null
fi
