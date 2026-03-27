---
name: bland-live-listen
description: >
  Listen to in-progress Bland AI calls in real-time through your speakers.
  Use when the user wants to hear a live call, monitor audio quality, or
  listen to an ongoing conversation.
user-invocable: true
---

# Bland AI Live Listen

Live audio streaming requires a persistent WebSocket connection and direct speaker output, which cannot go through MCP. This skill uses the `bland-listen.sh` helper script to handle the full pipeline.

## Prerequisites

- Call must be **in-progress** (not completed)
- Organization must have `live_listen_enabled`
- Dependencies: `websocat` (WebSocket CLI), `sox` (audio playback via `play`)

Install on macOS:
```bash
brew install websocat sox
```

## Usage

```bash
${CLAUDE_PLUGIN_ROOT}/bin/bland-listen.sh <call_id>
```

Press `Ctrl+C` to stop listening.

To find a call ID for a currently active call, use the `bland_active_calls` MCP tool, which returns all in-progress calls with their IDs.

## How It Works

1. The script `POST`s to `/v1/calls/:call_id/listen`, which returns a WebSocket URL streaming raw audio
2. `websocat` connects to the WebSocket and receives binary audio frames
3. `sox` (`play`) decodes **s16le 16kHz mono** audio and plays through speakers

**Important**: The script uses websocat's `cmd:` specifier to pipe audio to the player. Standard shell pipes (`websocat | play`) do NOT work reliably due to websocat output buffering.

## Combine with Live Transcript

For the richest monitoring experience, run live listen and a transcript stream simultaneously in separate terminals:

```bash
# Terminal 1: Audio
${CLAUDE_PLUGIN_ROOT}/bin/bland-listen.sh <call_id>

# Terminal 2: Live transcript via SSE
curl -N -s -H "authorization: $BLAND_API_KEY" \
  "https://api.bland.ai/v1/calls/<call_id>/transcript/stream"
```

Alternatively, once the call has ended, use the `bland_call_get` MCP tool with the call ID to retrieve the full transcript and call details without needing curl.

## Audio Format

The WebSocket streams raw PCM audio:
- **Encoding**: s16le (signed 16-bit little-endian)
- **Sample rate**: 16,000 Hz
- **Channels**: 1 (mono)
- **Byte rate**: ~32,000 bytes/sec

This is NOT mulaw/G.711 despite being telephony. The Bland API transcodes to linear PCM.

## Troubleshooting

- **"Could not get live listen URL"**: Call may have ended, or `live_listen_enabled` is off for your org. Use `bland_call_get` to check call status before attempting to listen.
- **No audio / immediate exit**: The call likely ended before the WebSocket connected. Use `bland_active_calls` to confirm the call is still in-progress before running the script.
- **Loud static**: Wrong audio format. Must use `s16le` at `16000` Hz (not mulaw, not 8kHz)
- **Audio plays too slow**: Sample rate is too low — use 16kHz, not 8kHz
- **Audio plays too fast / chipmunk**: Sample rate is too high — use 16kHz, not 24kHz or 48kHz
- **Silence with shell pipe (`websocat | play`)**: Known issue — websocat buffers output when piped. The script already handles this with the `cmd:` specifier.
- **`websocat: Invalid argument (os error 22)`**: Can occur intermittently with long JWT-based WSS URLs. Retry; if persistent, check `websocat --version` (tested with 1.14.1)
- **Choppy / stuttering audio**: Network latency or system audio buffer underrun. Close other audio-heavy apps

### Debugging: Capture raw audio to file

To verify the audio stream is working without playback issues:
```bash
# Capture 10 seconds of raw audio
websocat --binary --no-close "$WSS_URL" > /tmp/bland_debug.raw &
PID=$!; sleep 10; kill $PID 2>/dev/null

# Check byte count (~32KB per second expected)
wc -c < /tmp/bland_debug.raw

# Inspect format (should show small 16-bit integer values)
xxd -l 64 /tmp/bland_debug.raw

# Play the captured file
play -t raw -r 16000 -e signed-integer -b 16 -c 1 /tmp/bland_debug.raw
```
