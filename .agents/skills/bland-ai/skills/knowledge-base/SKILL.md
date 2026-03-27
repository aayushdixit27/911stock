---
name: bland-knowledge-base
description: >
  Manage Bland AI knowledge bases: upload files, text, or web content to create
  searchable knowledge for your voice agents. List, inspect, update, and delete
  knowledge bases. Use when the user wants to give an agent reference material,
  upload documents, or manage existing knowledge bases.
user-invocable: true
---

# Bland AI Knowledge Base Management


## Create Knowledge Base

Knowledge bases start in `PROCESSING` status. After creation, poll with `bland_knowledge_get` until the status is `COMPLETED` before attaching to a call.

### From Text

For inline text content (max 1 MB). Use the `bland_knowledge_create` MCP tool:

```
bland_knowledge_create(
  type: "text",
  name: "Product Info",
  description: "Product specifications",
  text: "Your text content here..."
)
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| `type` | yes | Must be `"text"` |
| `text` | yes | The text content (max 1 MB) |
| `name` | yes | KB name |
| `description` | no | Optional description |

### From Web Scrape

Create a KB from one or more URLs (max 100). Pass `urls` as a JSON array string:

```
bland_knowledge_create(
  type: "web",
  name: "Support Docs",
  description: "Customer support documentation",
  urls: "[\"https://example.com/docs/overview\", \"https://example.com/docs/faq\"]"
)
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| `type` | yes | Must be `"web"` |
| `urls` | yes | JSON array string of URLs to scrape (max 100) |
| `name` | yes | KB name |
| `description` | no | Optional description |

### File Uploads

File uploads are not supported via MCP tools. To create a KB from a document, read the file content and use `type: "text"` with the content passed in the `text` parameter.

### Creation Response

All methods return a response containing:

```json
{
  "data": {
    "id": "kb_01H8X9QK5R2N7P3M6Z8W4Y1V5T",
    "name": "Company FAQs",
    "status": "PROCESSING",
    "type": "FILE"
  },
  "errors": null
}
```

**Save the `id`** — you need it to check status, attach to calls, or delete later.

---

## Poll Until Ready

Knowledge bases are not immediately usable. After creation, repeatedly call `bland_knowledge_get` until the `status` field is `COMPLETED`:

```
bland_knowledge_get(id: "<kb_id>")
```

Check the `status` field in the response:
- **`PROCESSING`** — not ready yet, wait a few seconds and check again
- **`COMPLETED`** — ready to use, attach to calls
- **`FAILED`** — check the `error_message` field for details

Status flow: `PROCESSING` -> `COMPLETED` or `FAILED`

For text KBs, processing is usually fast (a few seconds). For web scrapes or large content, it may take longer. Wait 3-5 seconds between polls.

---

## List Knowledge Bases

Use the `bland_knowledge_list` MCP tool to retrieve all knowledge bases:

```
bland_knowledge_list()
```

The response includes an array of KBs with their `id`, `name`, `status`, and `type` fields. Results are paginated.

## Get Knowledge Base Details

Use the `bland_knowledge_get` MCP tool with the KB ID:

```
bland_knowledge_get(id: "<kb_id>")
```

**Key response fields**:
- `id` — unique identifier (use this in `tools` when creating calls)
- `status` — `PROCESSING`, `COMPLETED`, `FAILED`, or `DELETED`
- `type` — `FILE`, `TEXT`, or `WEB_SCRAPE`
- `error_message` — present when status is `FAILED`
- `file` — object with `file_name`, `file_size`, `file_type` (for FILE type)

## Delete Knowledge Base

Soft-deletes by setting status to `DELETED`:

```
bland_knowledge_delete(id: "<kb_id>")
```

---

## Attaching a Knowledge Base to a Call

Once a KB is `COMPLETED`, pass its ID in the `tools` array when creating a call with `bland_call_send`. KB IDs are prefixed with `KB-`:

```
bland_call_send(
  phone_number: "+14155551234",
  task: "You are a support agent. Use your knowledge base to answer questions.",
  tools: "[\"KB-01H8...\"]",
  record: true,
  max_duration: 5
)
```

The `tools` array accepts both knowledge base IDs and custom tool IDs:
```
tools: "[\"KB-01H8...\", \"TL-ba6c4237-...\"]"
```

See the `create-call` skill for full call creation documentation.

---

## Common Patterns

### Create a text KB and make a call with it

1. Create the KB:
```
bland_knowledge_create(
  type: "text",
  name: "Product Guide",
  text: "<paste or read file content here>"
)
```

2. Poll until ready — call `bland_knowledge_get(id: "<kb_id>")` every 3-5 seconds until `status` is `COMPLETED`. If `FAILED`, check `error_message` and stop.

3. Create call with KB attached:
```
bland_call_send(
  phone_number: "+1XXXXXXXXXX",
  task: "You are a product specialist. Use your knowledge base to answer any questions about the product.",
  tools: "[\"<kb_id>\"]",
  record: true,
  max_duration: 5
)
```

### Quick text KB for a one-off call

```
bland_knowledge_create(
  type: "text",
  name: "Call Context",
  text: "The customer ordered item #12345 on March 1. It shipped on March 3 via FedEx tracking 789456123. Expected delivery is March 7."
)
```

Then poll with `bland_knowledge_get(id: "<kb_id>")` — text KBs are usually fast (a few seconds).

## Error Handling

- **401**: Invalid API key — check that the Bland MCP server is configured with a valid key
- **400**: Missing required fields or invalid input
- **404**: Knowledge base not found or access denied
- **429**: Rate limited — wait 10 seconds between uploads, or wait for current upload to complete
- **413**: Content too large
- **500**: Server error — retry after 5 seconds
