export const MCP_TOOLS = [
    // ── Auth ──
    {
        name: "bland_auth_login",
        description: "Authenticate with Bland AI. Opens a browser for signup/login, then automatically saves the API key to local config. Returns immediately if already authenticated. On failure, returns manual fallback instructions.",
        inputSchema: {
            type: "object",
            properties: {},
            required: [],
        },
    },
    // ── Calls ──
    {
        name: "bland_call_send",
        description: "Make an outbound phone call via Bland AI. Use persona_id for persona-based calls, or task/pathway_id for one-off calls.",
        inputSchema: {
            type: "object",
            properties: {
                phone_number: {
                    type: "string",
                    description: "Phone number to call (E.164 format, e.g. +14155551234)",
                },
                task: {
                    type: "string",
                    description: "Task/prompt for the agent (not needed if using persona_id)",
                },
                persona_id: {
                    type: "string",
                    description: "Persona ID to use (recommended — bundles prompt, voice, tools)",
                },
                pathway_id: { type: "string", description: "Pathway ID to use" },
                voice: {
                    type: "string",
                    description: "Voice to use (e.g. mason, june)",
                },
                first_sentence: {
                    type: "string",
                    description: "Opening sentence",
                },
                model: {
                    type: "string",
                    description: "Model: base or turbo",
                },
                from: {
                    type: "string",
                    description: "From phone number (caller ID)",
                },
                record: {
                    type: "string",
                    description: "Whether to record the call (true/false)",
                },
                max_duration: {
                    type: "string",
                    description: "Max call duration in minutes",
                },
                webhook: { type: "string", description: "Post-call webhook URL" },
                language: {
                    type: "string",
                    description: "Language code (e.g. en, es)",
                },
                transfer_phone_number: {
                    type: "string",
                    description: "Number to transfer to if needed",
                },
                metadata: {
                    type: "string",
                    description: "Arbitrary JSON metadata string",
                },
                request_data: {
                    type: "string",
                    description: "Variables accessible during call (JSON string)",
                },
                tools: {
                    type: "string",
                    description: 'JSON array of tool/KB IDs (e.g. ["KB-...", "TL-..."])',
                },
            },
            required: ["phone_number"],
        },
    },
    {
        name: "bland_call_list",
        description: "List recent calls with optional filters",
        inputSchema: {
            type: "object",
            properties: {
                limit: {
                    type: "string",
                    description: "Max results (default: 20)",
                },
                start_date: {
                    type: "string",
                    description: "Start date (YYYY-MM-DD)",
                },
                end_date: {
                    type: "string",
                    description: "End date (YYYY-MM-DD)",
                },
            },
        },
    },
    {
        name: "bland_call_get",
        description: "Get detailed call info including transcript, recording URL, status, and variables",
        inputSchema: {
            type: "object",
            properties: {
                call_id: { type: "string", description: "Call ID" },
            },
            required: ["call_id"],
        },
    },
    {
        name: "bland_call_stop",
        description: "Stop an in-progress call",
        inputSchema: {
            type: "object",
            properties: {
                call_id: { type: "string", description: "Call ID to stop" },
            },
            required: ["call_id"],
        },
    },
    {
        name: "bland_call_stop_all",
        description: "Stop all currently active calls",
        inputSchema: { type: "object", properties: {} },
    },
    {
        name: "bland_call_active",
        description: "List all currently active (in-progress) calls",
        inputSchema: { type: "object", properties: {} },
    },
    // ── Pathways ──
    {
        name: "bland_pathway_list",
        description: "List all conversational pathways",
        inputSchema: { type: "object", properties: {} },
    },
    {
        name: "bland_pathway_get",
        description: "Get pathway details including nodes and edges",
        inputSchema: {
            type: "object",
            properties: {
                pathway_id: { type: "string", description: "Pathway ID" },
            },
            required: ["pathway_id"],
        },
    },
    {
        name: "bland_pathway_create",
        description: "Create a new pathway with nodes and edges",
        inputSchema: {
            type: "object",
            properties: {
                name: { type: "string", description: "Pathway name" },
                nodes: {
                    type: "string",
                    description: "Nodes array as JSON string",
                },
                edges: {
                    type: "string",
                    description: "Edges array as JSON string",
                },
            },
            required: ["name"],
        },
    },
    {
        name: "bland_pathway_chat",
        description: "Chat with a pathway to test it interactively. First call needs pathway_id, subsequent calls use chat_id.",
        inputSchema: {
            type: "object",
            properties: {
                pathway_id: {
                    type: "string",
                    description: "Pathway ID (required for first message)",
                },
                chat_id: {
                    type: "string",
                    description: "Chat session ID (from first response)",
                },
                message: { type: "string", description: "Message to send" },
            },
            required: ["message"],
        },
    },
    {
        name: "bland_pathway_node_test",
        description: "Test an individual pathway node with permutations",
        inputSchema: {
            type: "object",
            properties: {
                pathway_id: { type: "string", description: "Pathway ID" },
                node_id: { type: "string", description: "Node ID to test" },
                prompt: {
                    type: "string",
                    description: "Override node prompt",
                },
                permutations: {
                    type: "string",
                    description: "Number of variations (default: 5)",
                },
            },
            required: ["pathway_id", "node_id"],
        },
    },
    // ── Personas ──
    {
        name: "bland_persona_list",
        description: "List all personas with their production and draft versions",
        inputSchema: { type: "object", properties: {} },
    },
    {
        name: "bland_persona_get",
        description: "Get detailed persona info including production/draft versions, attached numbers, and config",
        inputSchema: {
            type: "object",
            properties: {
                persona_id: { type: "string", description: "Persona ID" },
            },
            required: ["persona_id"],
        },
    },
    {
        name: "bland_persona_create",
        description: "Create a new persona with personality prompt, voice, and call config. Creates both production (v1) and draft (v2).",
        inputSchema: {
            type: "object",
            properties: {
                name: { type: "string", description: "Persona display name" },
                role: {
                    type: "string",
                    description: "Role label (e.g. Sales, Support)",
                },
                description: {
                    type: "string",
                    description: "Purpose description",
                },
                tags: { type: "string", description: "JSON array of tags" },
                personality_prompt: {
                    type: "string",
                    description: "Agent personality/behavior instructions",
                },
                call_config: {
                    type: "string",
                    description: "JSON object with voice, record, language, max_duration, etc.",
                },
                kb_ids: {
                    type: "string",
                    description: "JSON array of knowledge base IDs to attach",
                },
                default_tools: {
                    type: "string",
                    description: "JSON array of tool IDs to enable",
                },
                pathway_conditions: {
                    type: "string",
                    description: "JSON array of pathway routing conditions",
                },
            },
            required: ["name"],
        },
    },
    {
        name: "bland_persona_update",
        description: "Update a persona's draft version. Changes go to draft only — promote to make live. Name is required even on update.",
        inputSchema: {
            type: "object",
            properties: {
                persona_id: {
                    type: "string",
                    description: "Persona ID to update",
                },
                name: {
                    type: "string",
                    description: "Persona name (required)",
                },
                role: { type: "string", description: "Updated role" },
                description: {
                    type: "string",
                    description: "Updated description",
                },
                tags: { type: "string", description: "JSON array of tags" },
                personality_prompt: {
                    type: "string",
                    description: "Updated personality prompt",
                },
                call_config: {
                    type: "string",
                    description: "JSON object with voice, record, language, etc.",
                },
                kb_ids: {
                    type: "string",
                    description: "JSON array of knowledge base IDs",
                },
                default_tools: {
                    type: "string",
                    description: "JSON array of tool IDs",
                },
                pathway_conditions: {
                    type: "string",
                    description: "JSON array of pathway conditions",
                },
            },
            required: ["persona_id", "name"],
        },
    },
    {
        name: "bland_persona_delete",
        description: "Soft-delete a persona and disconnect all inbound numbers",
        inputSchema: {
            type: "object",
            properties: {
                persona_id: {
                    type: "string",
                    description: "Persona ID to delete",
                },
            },
            required: ["persona_id"],
        },
    },
    {
        name: "bland_persona_promote",
        description: "Promote a persona's draft version to production (makes changes live)",
        inputSchema: {
            type: "object",
            properties: {
                persona_id: { type: "string", description: "Persona ID" },
            },
            required: ["persona_id"],
        },
    },
    // ── Phone Numbers ──
    {
        name: "bland_number_list",
        description: "List owned phone numbers",
        inputSchema: { type: "object", properties: {} },
    },
    {
        name: "bland_number_buy",
        description: "Purchase a phone number",
        inputSchema: {
            type: "object",
            properties: {
                area_code: {
                    type: "string",
                    description: "Preferred area code",
                },
                country_code: {
                    type: "string",
                    description: "Country code (default: US)",
                },
            },
        },
    },
    // ── Voices ──
    {
        name: "bland_voice_list",
        description: "List available TTS voices",
        inputSchema: { type: "object", properties: {} },
    },
    // ── Custom Tools ──
    {
        name: "bland_tool_test",
        description: "Test a custom tool with sample input",
        inputSchema: {
            type: "object",
            properties: {
                tool_id: { type: "string", description: "Tool ID" },
                input: {
                    type: "string",
                    description: "Test input as JSON string",
                },
            },
            required: ["tool_id"],
        },
    },
    // ── Knowledge Bases ──
    {
        name: "bland_knowledge_list",
        description: "List all knowledge bases",
        inputSchema: { type: "object", properties: {} },
    },
    {
        name: "bland_knowledge_create",
        description: "Create a knowledge base from text or web URLs. For file uploads, use type=text with the file contents.",
        inputSchema: {
            type: "object",
            properties: {
                type: {
                    type: "string",
                    description: "Source type: text or web",
                },
                name: { type: "string", description: "KB name" },
                description: {
                    type: "string",
                    description: "Optional description",
                },
                text: {
                    type: "string",
                    description: "Text content (required if type=text)",
                },
                urls: {
                    type: "string",
                    description: "JSON array of URLs (required if type=web)",
                },
            },
            required: ["type", "name"],
        },
    },
    {
        name: "bland_knowledge_get",
        description: "Get knowledge base details and processing status",
        inputSchema: {
            type: "object",
            properties: {
                kb_id: { type: "string", description: "Knowledge base ID" },
            },
            required: ["kb_id"],
        },
    },
    {
        name: "bland_knowledge_delete",
        description: "Soft-delete a knowledge base",
        inputSchema: {
            type: "object",
            properties: {
                kb_id: { type: "string", description: "Knowledge base ID" },
            },
            required: ["kb_id"],
        },
    },
    // ── SMS ──
    {
        name: "bland_sms_send",
        description: "Send an outbound SMS or WhatsApp message (Enterprise only)",
        inputSchema: {
            type: "object",
            properties: {
                user_number: {
                    type: "string",
                    description: "Recipient phone number (E.164)",
                },
                agent_number: {
                    type: "string",
                    description: "Sender phone number (must be your inbound number)",
                },
                agent_message: {
                    type: "string",
                    description: "Message text to send",
                },
                channel: {
                    type: "string",
                    description: "sms or whatsapp (default: sms)",
                },
                persona_id: {
                    type: "string",
                    description: "Persona ID for AI responses",
                },
                pathway_id: {
                    type: "string",
                    description: "Pathway ID for AI responses",
                },
            },
            required: ["user_number", "agent_number"],
        },
    },
    // ── Audio ──
    {
        name: "bland_audio_generate",
        description: "Generate TTS audio from text",
        inputSchema: {
            type: "object",
            properties: {
                text: { type: "string", description: "Text to speak" },
                voice: {
                    type: "string",
                    description: "Voice to use (default: nat)",
                },
            },
            required: ["text"],
        },
    },
];
// Helper to parse JSON string args safely
function parseJson(val) {
    if (typeof val !== "string")
        return val;
    try {
        return JSON.parse(val);
    }
    catch {
        return val;
    }
}
export async function handleToolCall(api, name, args) {
    switch (name) {
        // ── Auth ──
        case "bland_auth_login": {
            const { handleAuthLogin } = await import("./auth.js");
            const result = await handleAuthLogin();
            if (result.success && result.already_authenticated) {
                return "Already authenticated. Your API key is configured and working.";
            }
            if (result.success) {
                return JSON.stringify({
                    status: "authenticated",
                    message: "API key saved to config. You are ready to make calls.",
                    api_key_preview: result.api_key ? result.api_key.slice(0, 8) + "..." : null,
                    phone_number: result.phone_number,
                    persona_id: result.persona_id,
                });
            }
            return JSON.stringify({
                status: "failed",
                error: result.error,
                manual_fallback: "Ask the user to: 1) Go to https://app.bland.ai and sign up, 2) Copy their API key from Settings > API Keys, 3) Paste it here. Then save it to their environment or config.",
            });
        }
        // ── Calls ──
        case "bland_call_send": {
            const body = {
                phone_number: args.phone_number,
            };
            if (args.task)
                body.task = args.task;
            if (args.persona_id)
                body.persona_id = args.persona_id;
            if (args.pathway_id)
                body.pathway_id = args.pathway_id;
            if (args.voice)
                body.voice = args.voice;
            if (args.first_sentence)
                body.first_sentence = args.first_sentence;
            if (args.model)
                body.model = args.model;
            if (args.from)
                body.from = args.from;
            if (args.record)
                body.record = args.record === "true";
            if (args.max_duration)
                body.max_duration = parseInt(args.max_duration, 10);
            if (args.webhook)
                body.webhook = args.webhook;
            if (args.language)
                body.language = args.language;
            if (args.transfer_phone_number)
                body.transfer_phone_number = args.transfer_phone_number;
            if (args.metadata)
                body.metadata = parseJson(args.metadata);
            if (args.request_data)
                body.request_data = parseJson(args.request_data);
            if (args.tools)
                body.tools = parseJson(args.tools);
            return api.post("/v1/calls", body);
        }
        case "bland_call_list":
            return api.get("/v1/calls", {
                limit: args.limit,
                start_date: args.start_date,
                end_date: args.end_date,
            });
        case "bland_call_get":
            return api.get(`/v1/calls/${args.call_id}`);
        case "bland_call_stop":
            return api.post(`/v1/calls/${args.call_id}/stop`);
        case "bland_call_stop_all":
            return api.post("/v1/calls/active/stop");
        case "bland_call_active":
            return api.get("/v1/calls/active");
        // ── Pathways ──
        case "bland_pathway_list":
            return api.get("/v1/convo_pathway");
        case "bland_pathway_get":
            return api.get(`/v1/convo_pathway/${args.pathway_id}`);
        case "bland_pathway_create": {
            const body = { name: args.name };
            if (args.nodes)
                body.nodes = parseJson(args.nodes);
            if (args.edges)
                body.edges = parseJson(args.edges);
            return api.post("/v1/convo_pathway", body);
        }
        case "bland_pathway_chat": {
            if (args.chat_id) {
                return api.post(`/v1/pathway/chat/${args.chat_id}`, {
                    message: args.message,
                });
            }
            const session = await api.post("/v1/pathway/chat", { pathway_id: args.pathway_id });
            const response = await api.post(`/v1/pathway/chat/${session.chat_id}`, { message: args.message });
            return {
                chat_id: session.chat_id,
                ...response,
            };
        }
        case "bland_pathway_node_test":
            return api.post("/v1/node_tests/run", {
                pathway_id: args.pathway_id,
                node_id: args.node_id,
                new_prompt: args.prompt,
                n_permutations: args.permutations
                    ? parseInt(args.permutations, 10)
                    : 5,
            });
        // ── Personas ──
        case "bland_persona_list":
            return api.get("/v1/personas");
        case "bland_persona_get":
            return api.get(`/v1/personas/${args.persona_id}`);
        case "bland_persona_create": {
            const body = { name: args.name };
            if (args.role)
                body.role = args.role;
            if (args.description)
                body.description = args.description;
            if (args.tags)
                body.tags = parseJson(args.tags);
            if (args.personality_prompt)
                body.personality_prompt = args.personality_prompt;
            if (args.call_config)
                body.call_config = parseJson(args.call_config);
            if (args.kb_ids)
                body.kb_ids = parseJson(args.kb_ids);
            if (args.default_tools)
                body.default_tools = parseJson(args.default_tools);
            if (args.pathway_conditions)
                body.pathway_conditions = parseJson(args.pathway_conditions);
            return api.post("/v1/personas", body);
        }
        case "bland_persona_update": {
            const body = { name: args.name };
            if (args.role)
                body.role = args.role;
            if (args.description)
                body.description = args.description;
            if (args.tags)
                body.tags = parseJson(args.tags);
            if (args.personality_prompt)
                body.personality_prompt = args.personality_prompt;
            if (args.call_config)
                body.call_config = parseJson(args.call_config);
            if (args.kb_ids)
                body.kb_ids = parseJson(args.kb_ids);
            if (args.default_tools)
                body.default_tools = parseJson(args.default_tools);
            if (args.pathway_conditions)
                body.pathway_conditions = parseJson(args.pathway_conditions);
            return api.patch(`/v1/personas/${args.persona_id}`, body);
        }
        case "bland_persona_delete":
            return api.delete(`/v1/personas/${args.persona_id}`);
        case "bland_persona_promote":
            return api.post(`/v1/personas/${args.persona_id}/versions/promote`);
        // ── Phone Numbers ──
        case "bland_number_list":
            return api.get("/v1/inbound");
        case "bland_number_buy":
            return api.post("/v1/inbound/purchase", {
                area_code: args.area_code,
                country_code: args.country_code || "US",
            });
        // ── Voices ──
        case "bland_voice_list":
            return api.get("/v1/voices");
        // ── Custom Tools ──
        case "bland_tool_test": {
            const testInput = args.input ? parseJson(args.input) : {};
            return api.post(`/v1/tools/${args.tool_id}/test`, {
                input: testInput,
            });
        }
        // ── Knowledge Bases ──
        case "bland_knowledge_list":
            return api.get("/v1/knowledge");
        case "bland_knowledge_create": {
            const body = {
                type: args.type,
                name: args.name,
            };
            if (args.description)
                body.description = args.description;
            if (args.text)
                body.text = args.text;
            if (args.urls)
                body.urls = parseJson(args.urls);
            return api.post("/v1/knowledge/learn", body);
        }
        case "bland_knowledge_get":
            return api.get(`/v1/knowledge/${args.kb_id}`);
        case "bland_knowledge_delete":
            return api.delete(`/v1/knowledge/${args.kb_id}`);
        // ── SMS ──
        case "bland_sms_send": {
            const body = {
                user_number: args.user_number,
                agent_number: args.agent_number,
            };
            if (args.agent_message)
                body.agent_message = args.agent_message;
            if (args.channel)
                body.channel = args.channel;
            if (args.persona_id)
                body.persona_id = args.persona_id;
            if (args.pathway_id)
                body.pathway_id = args.pathway_id;
            return api.post("/v1/sms/send", body);
        }
        // ── Audio ──
        case "bland_audio_generate":
            return api.post("/v1/speak", {
                text: args.text,
                voice: args.voice || "nat",
            });
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
//# sourceMappingURL=tools.js.map