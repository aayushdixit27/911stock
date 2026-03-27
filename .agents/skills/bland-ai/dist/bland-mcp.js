import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { createApiClient } from "./api.js";
import { handleToolCall, MCP_TOOLS } from "./tools.js";
/**
 * Create an SDK-compatible MCP server for Bland AI.
 * Use this in Agent SDK applications (like the demo) to provide
 * Bland tools directly to the agent without a subprocess.
 */
export function createBlandMcpServer(apiKey) {
    const api = createApiClient(apiKey);
    // Convert MCP tool definitions to SDK tool() calls
    const sdkTools = MCP_TOOLS.map((t) => {
        // Build zod schema from inputSchema properties
        const shape = {};
        for (const [key, prop] of Object.entries(t.inputSchema.properties)) {
            const base = z.string().describe(prop.description);
            if (t.inputSchema.required?.includes(key)) {
                shape[key] = base;
            }
            else {
                shape[key] = base.optional();
            }
        }
        return tool(t.name, t.description, shape, async (args) => {
            try {
                const result = await handleToolCall(api, t.name, args);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            catch (err) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${err instanceof Error ? err.message : String(err)}`,
                        },
                    ],
                };
            }
        });
    });
    return createSdkMcpServer({
        name: "bland",
        version: "2.0.0",
        tools: sdkTools,
    });
}
//# sourceMappingURL=bland-mcp.js.map