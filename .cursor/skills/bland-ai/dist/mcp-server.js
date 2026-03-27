#!/usr/bin/env node
import { api } from "./api.js";
import { isAuthenticated } from "./config.js";
import { MCP_TOOLS, handleToolCall } from "./tools.js";
function sendResponse(response) {
    const body = JSON.stringify(response);
    const message = `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`;
    process.stdout.write(message);
}
function handleMessage(msg) {
    switch (msg.method) {
        case "initialize":
            sendResponse({
                jsonrpc: "2.0",
                id: msg.id,
                result: {
                    protocolVersion: "2024-11-05",
                    capabilities: { tools: {} },
                    serverInfo: { name: "bland-plugin", version: "2.0.0" },
                },
            });
            break;
        case "notifications/initialized":
            break;
        case "tools/list":
            sendResponse({
                jsonrpc: "2.0",
                id: msg.id,
                result: { tools: MCP_TOOLS },
            });
            break;
        case "tools/call": {
            const toolName = msg.params.name;
            const toolArgs = msg.params.arguments ||
                {};
            handleToolCall(api, toolName, toolArgs)
                .then((result) => {
                sendResponse({
                    jsonrpc: "2.0",
                    id: msg.id,
                    result: {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    },
                });
            })
                .catch((err) => {
                sendResponse({
                    jsonrpc: "2.0",
                    id: msg.id,
                    result: {
                        content: [
                            {
                                type: "text",
                                text: `Error: ${err instanceof Error ? err.message : String(err)}`,
                            },
                        ],
                        isError: true,
                    },
                });
            });
            break;
        }
        default:
            if (msg.id !== undefined) {
                sendResponse({
                    jsonrpc: "2.0",
                    id: msg.id,
                    error: {
                        code: -32601,
                        message: `Method not found: ${msg.method}`,
                    },
                });
            }
    }
}
// ── Main ──
if (!isAuthenticated()) {
    process.stderr.write("Warning: No API key configured. Set BLAND_API_KEY or run `bland auth login`.\n");
}
let buffer = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => {
    buffer += chunk;
    while (true) {
        const headerEnd = buffer.indexOf("\r\n\r\n");
        if (headerEnd === -1)
            break;
        const header = buffer.slice(0, headerEnd);
        const contentLengthMatch = header.match(/Content-Length:\s*(\d+)/i);
        if (!contentLengthMatch) {
            try {
                const msg = JSON.parse(buffer.trim());
                buffer = "";
                handleMessage(msg);
            }
            catch {
                break;
            }
            continue;
        }
        const contentLength = parseInt(contentLengthMatch[1], 10);
        const bodyStart = headerEnd + 4;
        if (buffer.length < bodyStart + contentLength)
            break;
        const body = buffer.slice(bodyStart, bodyStart + contentLength);
        buffer = buffer.slice(bodyStart + contentLength);
        try {
            handleMessage(JSON.parse(body));
        }
        catch {
            sendResponse({
                jsonrpc: "2.0",
                id: 0,
                error: { code: -32700, message: "Parse error" },
            });
        }
    }
});
process.stdin.resume();
//# sourceMappingURL=mcp-server.js.map