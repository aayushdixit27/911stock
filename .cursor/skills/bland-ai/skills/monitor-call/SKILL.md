---
name: bland-monitor-call
description: >
  Monitor and manage Bland AI voice calls: check call status, list active or recent calls,
  stop calls, retrieve transcripts, play recordings, and monitor active calls via SSE stream.
  Use when the user wants to check on a call, list calls, stop a call, get a transcript,
  play a recording, or watch calls in real time.
user-invocable: true
---

# Bland AI Call Monitoring & Management

## Check Call Status

Use the `bland_call_get` MCP tool with the call ID to retrieve status and details:

```
bland_call_get(call_id="<call_id>")
```

The response includes `status`, `completed`, `call_length`, `call_ended_by`, and `answered_by`.

## Get Full Call Details & Transcript

Use the same `bland_call_get` MCP tool — the response contains the full transcript and all call metadata:

```
bland_call_get(call_id="<call_id>")
```

The response includes both `concatenated_transcript` (plain text) and `transcripts` (structured array with speaker labels, timestamps).

**Key response fields**:
- `completed` (boolean) — call has ended
- `status` — completed, failed, busy, no-answer
- `call_length` — duration in seconds
- `call_ended_by` — agent, customer, system
- `concatenated_transcript` — full transcript as string
- `transcripts` — array of `{text, user, created_at}`
- `recording_url` — URL to call recording
- `analysis` — post-call analysis results
- `variables` — variables set during call
- `answered_by` — human, voicemail, machine

## List Active Calls

Use the `bland_call_active` MCP tool to see all currently in-progress calls:

```
bland_call_active()
```

Returns an array of active calls with `call_id`, `status`, `to`, and `objective`.

## List Recent Calls

Use the `bland_call_list` MCP tool to retrieve recent calls:

```
bland_call_list(limit=10)
```

Returns calls with `call_id`, `status`, `to`, `created_at`, and `call_length`.

## Stop a Call

Use the `bland_call_stop` MCP tool with the call ID:

```
bland_call_stop(call_id="<call_id>")
```

## Stop All Active Calls

Use the `bland_call_stop_all` MCP tool to terminate every active call:

```
bland_call_stop_all()
```

## Play Recording

Recording playback requires shell access for audio output:

```bash
${CLAUDE_PLUGIN_ROOT}/bin/bland-play.sh <call_id>

# Or save to file
${CLAUDE_PLUGIN_ROOT}/bin/bland-play.sh <call_id> --save recording.wav
```

## Poll Until Completion

Use the helper script to wait for a call to finish (adaptive intervals: 3s -> 10s -> 30s):

```bash
RESULT=$(${CLAUDE_PLUGIN_ROOT}/bin/bland-poll.sh "$CALL_ID" 300)
echo "$RESULT" | jq '{status, call_length, concatenated_transcript, recording_url}'
```

Alternatively, you can poll manually by calling `bland_call_get` in a loop and checking the `completed` field.

## Real-Time Monitoring via SSE Stream

> **Note**: SSE streaming requires shell scripts. These long-lived HTTP connections cannot go through MCP tools.

### Monitor All Active Calls

Connect to the active calls SSE stream for real-time status updates:

```bash
# Formatted output
${CLAUDE_PLUGIN_ROOT}/bin/bland-monitor.sh

# Raw SSE events
${CLAUDE_PLUGIN_ROOT}/bin/bland-monitor.sh --raw
```

**SSE events**:

On connect — snapshot of all active calls:
```json
{"type":"INITIAL_STATE","data":[
  {"call_id":"abc-123","status":"IN_PROGRESS","from":"+1...","to":"+1...","objective":"Book appt..."}
]}
```

On status change:
```json
{"type":"UPDATE","data":{"call_id":"abc-123","status":"COMPLETE","timestamp":"..."}}
```

Status flow: `QUEUED` -> `IN_PROGRESS` -> `TRANSFERRED` (optional) -> `COMPLETE`

Heartbeat every 30s:
```json
{"type":"HEARTBEAT","timestamp":1710330125000}
```

### Live Transcript Stream

> **Note**: Live transcript streaming requires an SSE connection and must be done through shell scripts.

The live transcript endpoint (`/v1/calls/<call_id>/transcript/stream`) provides real-time conversation events:
- `{"type":"initial","messages":[...]}` — existing transcript
- `{"type":"new","text":"Hello","role":"assistant","timestamp":...}` — new speech
- `{"type":"update","transcript_id":"...","text":"corrected text",...}` — STT correction
- `{"type":"end"}` — call finished

Resume from a specific point with `?lastId=<stream_id>`.

For the completed transcript (after the call ends), use `bland_call_get` instead — it returns the full transcript without needing SSE.

### Multi-Call Monitoring Pattern

```bash
# 1. Start stream monitor in background
${CLAUDE_PLUGIN_ROOT}/bin/bland-monitor.sh > /tmp/calls.log &

# 2. Create multiple calls (via create-call skill)
# 3. Watch progress
tail -f /tmp/calls.log
```

Once calls complete, use `bland_call_get` for each call to fetch full results.
