#!/bin/bash
# Start the overclaw signal agent HTTP server.
# Reads GEMINI_API_KEY from web/.env.local if not already set.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$ROOT_DIR/web/.env.local"

# Load env vars from web/.env.local
if [ -f "$ENV_FILE" ]; then
  while IFS= read -r line; do
    # Skip comments and blank lines
    [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
    # Only export if not already set
    key="${line%%=*}"
    if [ -z "${!key+x}" ]; then
      export "$line" 2>/dev/null || true
    fi
  done < "$ENV_FILE"
fi

# Find the overclaw Python (installed via uv)
OVERCLAW_PYTHON="$(uv tool dir)/overclaw/bin/python"

if [ ! -f "$OVERCLAW_PYTHON" ]; then
  echo "[overclaw] ERROR: Python not found at $OVERCLAW_PYTHON" >&2
  echo "[overclaw] Run: uv tool install overclaw" >&2
  exit 1
fi

echo "[overclaw] starting signal agent server..."
cd "$SCRIPT_DIR"
exec "$OVERCLAW_PYTHON" server.py
