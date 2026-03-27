---
name: bland-send-sms
description: >
  Send SMS messages via Bland AI. Dispatch outbound SMS from an agent number to a
  user number, with optional AI-generated responses via pathways or personas. Use
  when the user wants to send a text message or start an SMS conversation.
user-invocable: true
---

# Bland AI SMS Send

**Enterprise plan required** — SMS is only available on Enterprise plans.

## Send an SMS

Use the `bland_sms_send` MCP tool:

```
bland_sms_send(
  user_number: "+14155551234",
  agent_number: "+18005551234",
  agent_message: "Hi! Just checking in — do you have any questions?"
)
```

**Response**:
```json
{
  "status": "processing",
  "message": "SMS accepted for delivery. Check status of SMS with the message_id",
  "conversation_id": "convo_abc123",
  "message_id": "msg_uuid_here"
}
```

The `message_id` can be used to track delivery status. The `conversation_id` references the conversation thread.

---

## Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `user_number` | string | E.164 formatted phone number of the recipient (e.g., `+14155551234`) |
| `agent_number` | string | E.164 formatted phone number to send from — must belong to your account as an inbound number |

## Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `agent_message` | string | — | The message text to send. If omitted, the AI generates a response using the configured pathway/prompt |
| `channel` | string | `"sms"` | `"sms"` or `"whatsapp"` |
| `new_conversation` | boolean | `false` | Start a fresh conversation, archiving any existing one |
| `request_data` | object | — | Variables accessible during the conversation |
| `pathway_id` | string | — | Pathway ID for AI-generated responses |
| `pathway_version` | number | — | Specific pathway version |
| `start_node_id` | string | — | Node within the pathway to start from |
| `webhook` | string | — | Override the webhook URL for this conversation |
| `persona_id` | string | — | UUID of a persona to use for AI-generated responses |
| `persona_version` | string | — | `"draft"` to use the draft version; defaults to production |

---

## Common Patterns

### Send a simple text message

```
bland_sms_send(
  user_number: "+14155551234",
  agent_number: "+18005551234",
  agent_message: "Your appointment is confirmed for tomorrow at 2pm."
)
```

### Send via WhatsApp

Use the `channel` parameter set to `"whatsapp"`:

```
bland_sms_send(
  user_number: "+14155551234",
  agent_number: "+18005551234",
  agent_message: "Your order has shipped!",
  channel: "whatsapp"
)
```

---

## Error Handling

- **400**: Invalid parameters or missing required fields
- **401**: Invalid API key — check that the Bland MCP server is configured with a valid key
- **403**: Not on an Enterprise plan — SMS requires enterprise access
- **404**: `agent_number` not found as an inbound number on your account
- **500**: Server error — retry after a few seconds
