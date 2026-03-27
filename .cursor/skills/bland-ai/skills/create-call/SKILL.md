---
name: bland-create-call
description: >
  Create outbound voice calls via Bland AI. The recommended flow is persona-based:
  list the user's personas, pick one, and dispatch a call with persona_id + phone
  number. Also supports raw task/pathway calls. Use when the user asks to make a
  phone call, schedule a call, or test a voice agent.
user-invocable: true
---

# Bland AI Call Creation

## Recommended: Persona-Based Calls

Most accounts come pre-configured with personas and an inbound phone number. **Always start by listing the user's personas** so they can pick one (or update an existing one) before making a call.

### Step 1 — List Personas

Use the `bland_persona_list` MCP tool to retrieve all personas. Present the user with a summary of each (id, name, role, description, voice, prompt preview) so they can pick one.

Either pick an existing persona if it is relevant or create a new one.

If the user wants to **modify a persona** before calling (e.g., change the prompt, voice, or attached knowledge bases), use `bland_persona_update` to edit the draft and `bland_persona_promote` to make it live.

### Step 2 — Dispatch Call with Persona

Once the user picks a persona, dispatch the call using the `bland_call_send` MCP tool. The persona bundles the personality prompt, voice, call config, tools, and knowledge bases — so you only need `phone_number` and `persona_id`:

```json
{
  "phone_number": "+14155551234",
  "persona_id": "<persona_uuid>"
}
```

**Response**: `{ "status": "success", "call_id": "uuid-here" }`

You can still pass optional overrides alongside `persona_id` — any explicit field takes priority over the persona's config:

```json
{
  "phone_number": "+14155551234",
  "persona_id": "<persona_uuid>",
  "record": true,
  "max_duration": 10,
  "metadata": {"campaign": "spring-outreach"}
}
```

### Updating a Persona Before Calling

If the user wants to tweak the persona (prompt, voice, tools, etc.) before dispatching:

1. **Update the draft** using `bland_persona_update`:

```json
{
  "persona_id": "<persona_id>",
  "name": "Current Name",
  "personality_prompt": "Updated instructions for the agent...",
  "call_config": {"voice": "Mason", "record": true}
}
```

2. **Promote draft to production** using `bland_persona_promote` with the persona ID. This makes the changes live.

3. **Dispatch the call** using `bland_call_send` as above.

For the full persona management API, see the `personas` skill.

---

## Alternative: Raw Task/Pathway Calls

If the user prefers a one-off call without a persona, use the `bland_call_send` MCP tool with `task` directly:

```json
{
  "phone_number": "+14155551234",
  "task": "You are a friendly assistant calling to book an appointment...",
  "voice": "mason",
  "record": true,
  "max_duration": 5
}
```

**Response**: `{ "status": "success", "call_id": "uuid-here" }`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `phone_number` | string | E.164 format (e.g., `+14155551234`) |

### One of (required — unless using `persona_id`)

| Parameter | Type | Description |
|-----------|------|-------------|
| `persona_id` | string | UUID of a persona (bundles prompt, voice, tools, config) |
| `task` | string | Free-form prompt describing agent behavior |
| `pathway_id` | string | UUID of a pre-built Conversational Pathway |

### Optional Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `voice` | string | Voice name (`mason`, `josh`, etc.) or UUID |
| `first_sentence` | string | Agent's opening line |
| `wait_for_greeting` | boolean | Wait for recipient to speak first |
| `record` | boolean | Record the call |
| `max_duration` | number | Max call length in minutes |
| `webhook` | string | Post-call webhook URL |
| `language` | string | Language code (`en`, `es`, etc.) |
| `tools` | string[] | IDs of knowledge bases and/or custom tools (e.g. `["kb_...", "TL-..."]`) |
| `transfer_phone_number` | string | Number to transfer to if needed |
| `interruption_threshold` | number | 0-255, lower = more interruptible |
| `model` | string | LLM model to use |
| `temperature` | number | LLM temperature 0-1 |
| `metadata` | object | Arbitrary JSON metadata |
| `request_data` | object | Variables accessible during the call |
| `from` | string | Caller ID configuration |
| `start_time` | string | Schedule call (min 5 min in advance) |

## After Call Creation

Once the call is successfully created and you have the `CALL_ID`:

- **If interacting via a proxy (e.g. Telegram):** Tell the user the call is dispatched and you'll notify them when it completes. **Do not poll.** A post-call webhook will be delivered automatically when the call ends — handle the results then.

- **If interacting via CLI directly:** You can offer the user these options:

| Option | Label | Description |
|--------|-------|-------------|
| 1 | **Listen to the call** | Stream live audio through your speakers in real-time |
| 2 | **Watch the transcript** | See the conversation as text in real-time |
| 3 | **Get a summary when done** | Wait for the call to finish, then show results |

### Option 1: Listen to the call

Invoke the `live-listen` skill or use the script directly:

```bash
${CLAUDE_PLUGIN_ROOT}/bin/bland-listen.sh "$CALL_ID"
```

After listening ends, use `bland_call_get` to retrieve final results.

### Option 2: Watch the transcript

Connect to the transcript SSE endpoint (this cannot be done via MCP and requires a direct connection):

```
GET https://api.bland.ai/v1/calls/$CALL_ID/transcript/stream
Header: authorization: $BLAND_API_KEY
```

Parse and display each event as it arrives:
- `{"type":"new", "text":"...", "role":"assistant"|"user"}` — new utterance
- `{"type":"update", "text":"..."}` — corrected/updated text
- `{"type":"end"}` — call ended

When the `end` event arrives, use `bland_call_get` to retrieve final results.

### Option 3: Get a summary when done

Use `bland_call_get` MCP tool with the call ID to check status and retrieve results. Alternatively, use the polling script for automatic waiting:

```bash
${CLAUDE_PLUGIN_ROOT}/bin/bland-poll.sh "$CALL_ID" 300
```

The result includes `status`, `call_length`, `concatenated_transcript`, and `recording_url`.

## Attaching Knowledge Bases and Tools

The `tools` parameter accepts an array of string IDs — knowledge base IDs and/or custom tool IDs. Pass them to `bland_call_send`:

```json
{
  "phone_number": "+14155551234",
  "task": "You are a support agent. Answer questions using your knowledge base.",
  "tools": ["KB-01H8X9QK5R2N7P3M6Z8W4Y1V5T"],
  "record": true
}
```

Multiple tools and KBs can be combined:
```json
"tools": ["kb_01H8...", "TL-ba6c4237-..."]
```

**Important**: Knowledge bases must be in `COMPLETED` status before attaching. Use the `knowledge-base` skill to create and check KB status.

## Common Patterns

### Persona call (recommended)
```json
{
  "phone_number": "+1XXXXXXXXXX",
  "persona_id": "<persona_uuid>"
}
```

### Persona call with overrides
```json
{
  "phone_number": "+1XXXXXXXXXX",
  "persona_id": "<persona_uuid>",
  "record": true,
  "max_duration": 10,
  "metadata": {"campaign": "spring-outreach"}
}
```

### Quick test call (no persona)
```json
{
  "phone_number": "+1XXXXXXXXXX",
  "task": "Say hello and ask how the person is doing. Keep it brief.",
  "record": true,
  "max_duration": 1
}
```

### Appointment booking (no persona)
```json
{
  "phone_number": "+1XXXXXXXXXX",
  "task": "You are calling to book an appointment for John Smith. Be polite and confirm date/time.",
  "first_sentence": "Hi, I'm calling on behalf of John Smith to schedule an appointment.",
  "record": true,
  "max_duration": 5
}
```

### Lead qualification (no persona)
```json
{
  "phone_number": "+1XXXXXXXXXX",
  "task": "You are calling to qualify this lead for our SaaS product. Ask about their current solution, team size, budget, and timeline. Be conversational and friendly.",
  "record": true,
  "max_duration": 5,
  "metadata": {"lead_id": "lead_123"}
}
```

## Error Handling

- **401**: Invalid API key — check `$BLAND_API_KEY`
- **400**: Missing required fields or invalid phone number
- **429**: Rate limited — back off and retry after a few seconds
- **500**: Server error — retry after 5 seconds
