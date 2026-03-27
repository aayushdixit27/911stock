---
name: bland-personas
description: >
  Manage Bland AI personas: create, list, get, update, and delete voice agent
  personas. Handle versioning with draft/production workflow — edit drafts, promote
  to production, and inspect version history. Use when the user wants to create or
  configure a voice agent persona, update its prompt or call settings, manage
  versions, or attach knowledge bases and tools to a persona.
user-invocable: true
---

# Bland AI Persona Management

Personas are reusable voice agent configurations that bundle personality prompts, call settings, knowledge bases, tools, and pathway routing into a single deployable unit. Each persona has a **draft** and a **production** version — edits always go to the draft, and you explicitly promote to production when ready.

## List Personas

Use the `bland_persona_list` MCP tool to retrieve all active (non-deleted) personas.

Returns all active personas with their current production and draft versions, including metadata like `id`, `name`, `role`, `tags`, and `created_at`.

To inspect full details such as production/draft prompts and voice settings, retrieve the list and examine the `current_production_version` and `current_draft_version` fields on each persona.

---

## Get Persona

Use the `bland_persona_get` MCP tool with the persona's `id` to retrieve full details.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `id` | yes | The persona UUID |

**Key response fields**:
- `id` — unique persona identifier (UUID)
- `name`, `role`, `description`, `tags` — persona metadata
- `current_production_version` — the live version used by calls
- `current_draft_version` — the editable version (not yet live)
- `inbound_numbers` — phone numbers currently using this persona
- `current_production_version_id`, `current_draft_version_id` — version UUIDs

**Version object fields** (both production and draft):
- `personality_prompt` — the agent's personality and behavior instructions
- `orchestration_prompt` — optional orchestration layer prompt
- `call_config` — call settings (voice, language, record, max_duration, etc.)
- `pathway_conditions` — pathway routing rules
- `kb_ids` — attached knowledge base IDs
- `default_tools` — enabled tools
- `version_number` — sequential version number
- `version_type` — `production`, `draft`, or `archived`

---

## Create Persona

Use the `bland_persona_create` MCP tool to create a new persona.

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `name` | yes | string | Display name for the persona |
| `role` | no | string | Role label (e.g., "Sales", "Support") |
| `description` | no | string | Purpose description |
| `tags` | no | string | JSON array string, e.g. `'["support", "tier-1"]'` |
| `image_url` | no | string | Profile image URL |
| `personality_prompt` | no | string | Agent personality/behavior instructions (defaults to "You are a helpful assistant") |
| `orchestration_prompt` | no | string | Orchestration layer prompt |
| `call_config` | no | string | JSON string of call settings (see table below) |
| `default_tools` | no | string | JSON array string of tool IDs to enable |
| `pathway_conditions` | no | string | JSON array string of pathway routing conditions |
| `kb_ids` | no | string | JSON array string of knowledge base IDs, e.g. `'["KB-abc123"]'` |

### call_config options

Pass `call_config` as a JSON string containing any of these fields:

| Field | Type | Description |
|-------|------|-------------|
| `voice` | string | Voice identifier (e.g., "June", "Mason") |
| `record` | boolean | Whether to record calls |
| `language` | string | Language code (e.g., "en-US") |
| `background` | string | Background audio setting (e.g., "office") |
| `max_duration` | number | Max call duration in minutes |
| `wait_for_greeting` | boolean | Wait for greeting before starting |
| `interruption_threshold` | number | Interruption sensitivity (ms) |

### pathway_conditions format

Each condition routes to a pathway based on conversation context. Pass as a JSON array string where each element has:

```json
{
  "name": "Billing Inquiry",
  "prompt": "When the caller asks about billing or payments",
  "pathway_id": "<pathway_uuid>",
  "pathway_version": "<version>",
  "start_node_id": "<node_uuid>"
}
```

**On creation**: Both a production (v1) and draft (v2) version are created with identical config. The persona is immediately usable.

---

## Update Persona

Use the `bland_persona_update` MCP tool to modify the **draft version** of a persona. The current draft is archived and a new draft is created with merged fields. Fields you don't include keep their existing draft values.

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `id` | yes | string | The persona UUID |
| `name` | yes | string | Display name (required even on update) |
| `role` | no | string | Updated role |
| `description` | no | string | Updated description (pass `null` to clear) |
| `tags` | no | string | JSON array string of updated tags |
| `image_url` | no | string | Updated image URL (pass `null` to clear) |
| `personality_prompt` | no | string | Updated personality prompt (omit to keep existing) |
| `orchestration_prompt` | no | string | Updated orchestration prompt |
| `call_config` | no | string | JSON string of updated call settings |
| `default_tools` | no | string | JSON array string of updated tools |
| `pathway_conditions` | no | string | JSON array string of updated pathway conditions |
| `kb_ids` | no | string | JSON array string of updated knowledge base IDs |

**Important**: Updates go to draft only. To make changes live, promote the draft to production.

---

## Delete Persona

Use the `bland_persona_delete` MCP tool to soft-delete a persona and disconnect all inbound phone numbers.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `id` | yes | The persona UUID |

Returns a success confirmation on completion.

**Warning**: This disconnects all inbound numbers using this persona. Those numbers will need to be reconfigured.

---

## Promote Draft to Production

Use the `bland_persona_promote` MCP tool to make the current draft version the live production version. The previous production version is archived.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `id` | yes | The persona UUID |

---

## Version Management

Personas follow a **production / draft / archived** lifecycle:

- **Production** — the live version used when calls reference this persona. Only one production version exists at a time.
- **Draft** — the editable version. Every update creates a new draft and archives the previous one. Only one draft exists at a time.
- **Archived** — previous production or draft versions, kept for history. Multiple archived versions may exist.

**Typical workflow**:
1. Create persona (production v1 + draft v2)
2. Update persona (draft v3 created, v2 archived)
3. Test with draft...
4. Promote (production v4 created from draft v3, old production v1 archived)

To inspect version history, use `bland_persona_get` and examine the `current_production_version` and `current_draft_version` fields, including their `version_number` and `version_type`.

---

## Common Patterns

### Create a persona and make a call with it

1. Use `bland_persona_create` with the desired `name`, `personality_prompt`, and `call_config`.
2. Note the `id` from the response.
3. Use `bland_call_create` with `persona_id` set to the persona's `id` and the target `phone_number`.

### Update persona draft and promote

1. Use `bland_persona_update` with the persona `id`, required `name`, and any fields to change (e.g., updated `personality_prompt`, new `kb_ids`).
2. Verify the draft looks correct using `bland_persona_get`.
3. Use `bland_persona_promote` with the persona `id` to make the draft live.

### Find a persona by name

1. Use `bland_persona_list` to retrieve all personas.
2. Filter the results by matching the `name` field.

### Compare production vs draft

1. Use `bland_persona_get` with the persona `id`.
2. Compare the `current_production_version` and `current_draft_version` objects — check `personality_prompt`, `call_config.voice`, `version_number`, and any other fields of interest.

---

## Error Handling

- **400**: Invalid request — missing `name` or malformed fields
- **401**: Invalid API key
- **404**: Persona not found or access denied
- **500**: Server error — retry after a few seconds
