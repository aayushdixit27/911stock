---
name: bland-ai
description: >
  Voice AI agent skills and MCP tools for Bland AI. Make phone calls, manage personas,
  knowledge bases, pathways, and more. Use when the user wants to build, test, or manage
  AI-powered phone agents.
license: MIT
compatibility: claude-code, cursor, codex, gemini, cline, copilot
author:
  name: Bland AI
  github: CINTELLILABS
---

# Bland AI — Voice Agent Skills

Build, deploy, and manage AI-powered phone agents from natural language. This skill provides MCP tools for the full Bland AI API and workflow guidance for common voice agent tasks.

## Authentication

The MCP server resolves your API key automatically:

1. `BLAND_API_KEY` environment variable (recommended)
2. Local config saved by `bland_auth_login` (`~/.config/bland-cli-nodejs/config.json`)

To authenticate interactively, use the `bland_auth_login` tool — it opens a browser to sign up or log in, then saves your API key automatically.

**Manual fallback**: Visit https://app.bland.ai, create an account, copy your API key from Settings > API Keys, and set `BLAND_API_KEY` in your environment.

After setup, validate with `bland_call_list` (limit: 1). A 401 means the key is invalid.

## Making Calls

### Persona-Based Calls (Recommended)

Personas bundle personality prompts, voice, tools, and config into a reusable agent. Always start by listing personas so the user can pick one:

1. `bland_persona_list` — list all personas
2. Pick one (or create/update one)
3. `bland_call_send` with `phone_number` + `persona_id`

```json
{
  "phone_number": "+14155551234",
  "persona_id": "<persona_uuid>"
}
```

You can pass optional overrides alongside `persona_id` — explicit fields take priority over the persona's config (e.g., `record`, `max_duration`, `metadata`).

### Quick Calls (No Persona)

For one-off calls, use `bland_call_send` with `task` directly:

```json
{
  "phone_number": "+14155551234",
  "task": "You are a friendly assistant calling to book an appointment...",
  "voice": "mason",
  "record": true,
  "max_duration": 5
}
```

### Required Parameters

- `phone_number` — E.164 format (e.g., `+14155551234`)
- One of: `persona_id`, `task`, or `pathway_id`

### Key Optional Parameters

| Parameter | Description |
|-----------|-------------|
| `voice` | Voice name or UUID |
| `first_sentence` | Agent's opening line |
| `record` | Record the call |
| `max_duration` | Max length in minutes |
| `webhook` | Post-call webhook URL |
| `language` | Language code |
| `tools` | Array of KB/tool IDs |
| `metadata` | Arbitrary JSON metadata |
| `from` | Caller ID |
| `start_time` | Schedule call (min 5 min in advance) |

## Monitoring Calls

- `bland_call_get` — Get full call details: status, transcript, recording URL, analysis
- `bland_call_list` — List recent calls
- `bland_call_active` — List in-progress calls
- `bland_call_stop` — Stop a specific call
- `bland_call_stop_all` — Stop all active calls

**Key response fields** from `bland_call_get`: `completed`, `status`, `call_length`, `concatenated_transcript`, `transcripts` (structured), `recording_url`, `analysis`, `answered_by`.

### After Creating a Call

Offer the user options:
1. **Listen live** — stream audio through speakers (requires `bland-listen.sh` script)
2. **Watch transcript** — connect to the SSE endpoint at `/v1/calls/$CALL_ID/transcript/stream`
3. **Get summary when done** — poll with `bland_call_get` until `completed` is true

## Persona Management

Personas use a **draft/production** versioning model. Edits go to draft; promote to make live.

- `bland_persona_list` — List all personas
- `bland_persona_get` — Full details including production and draft versions
- `bland_persona_create` — Create new persona (both production v1 and draft v2 created)
- `bland_persona_update` — Edit the draft version (pass `id`, `name` required, plus any fields to change)
- `bland_persona_promote` — Make draft the live production version
- `bland_persona_delete` — Soft-delete and disconnect inbound numbers

### Persona Fields

`name`, `role`, `description`, `tags`, `personality_prompt`, `orchestration_prompt`, `call_config` (JSON string with voice, record, language, max_duration, etc.), `kb_ids` (JSON array of KB IDs), `default_tools`, `pathway_conditions`.

### Typical Workflow

1. Create persona with `bland_persona_create`
2. Update draft with `bland_persona_update` as needed
3. Verify with `bland_persona_get`
4. Promote with `bland_persona_promote`
5. Make calls with `bland_call_send` using `persona_id`

## Knowledge Bases

Knowledge bases give agents reference material. They start in `PROCESSING` status — poll until `COMPLETED` before attaching to calls.

- `bland_knowledge_create` — Create from text (`type: "text"`) or URLs (`type: "web"`)
- `bland_knowledge_get` — Check status and details (poll until `COMPLETED`)
- `bland_knowledge_list` — List all KBs
- `bland_knowledge_delete` — Soft-delete

### Attaching to Calls

Pass KB IDs in the `tools` array when creating a call:

```json
{
  "phone_number": "+14155551234",
  "task": "Answer questions using your knowledge base.",
  "tools": ["KB-01H8X9QK5R2N7P3M6Z8W4Y1V5T"]
}
```

## Pathways

- `bland_pathway_list` — List pathways
- `bland_pathway_get` — Get pathway details
- `bland_pathway_create` — Create pathway
- `bland_pathway_chat` — Chat with pathway interactively
- `bland_pathway_node_test` — Test individual node

## Phone Numbers & Voices

- `bland_number_list` — List your phone numbers
- `bland_number_buy` — Purchase a new number
- `bland_voice_list` — List available voices

## SMS (Enterprise)

Use `bland_sms_send` to send outbound SMS or WhatsApp messages:

```json
{
  "user_number": "+14155551234",
  "agent_number": "+18005551234",
  "agent_message": "Your appointment is confirmed for tomorrow at 2pm."
}
```

Set `channel: "whatsapp"` for WhatsApp. Supports AI-generated responses via `pathway_id` or `persona_id`.

## Other Tools

- `bland_tool_test` — Test a custom tool
- `bland_audio_generate` — Generate TTS audio

## Shell Scripts

For operations requiring persistent connections (SSE, WebSocket) that can't go through MCP:

| Script | Purpose |
|--------|---------|
| `bin/bland-monitor.sh` | SSE stream of active call status updates |
| `bin/bland-poll.sh <call_id>` | Poll until call completes (adaptive intervals) |
| `bin/bland-play.sh <call_id>` | Download and play recording |
| `bin/bland-listen.sh <call_id>` | Live audio via WebSocket |

These scripts read `BLAND_API_KEY` from the environment. Dependencies: `curl`, `jq`. Live listen also requires `websocat` and `sox`.

## CLI

For additional operations, the [Bland CLI](https://www.npmjs.com/package/bland-cli) (`npm install -g bland-cli`) provides interactive management of calls, pathways, and configuration.

## Error Handling

- **401**: Invalid API key
- **400**: Missing required fields or invalid input
- **403**: Insufficient permissions (or Enterprise-only feature)
- **404**: Resource not found
- **429**: Rate limited — back off and retry
- **500**: Server error — retry after a few seconds
