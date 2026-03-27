import * as http from "http";
import * as net from "net";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import { getBlandCliConfigPath, getBaseUrl, isAuthenticated } from "./config.js";
const AUTH_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const SIGNUP_URL_BASE = "https://app.bland.ai/auth";
function findFreePort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(0, "127.0.0.1", () => {
            const addr = server.address();
            if (addr && typeof addr === "object") {
                const port = addr.port;
                server.close(() => resolve(port));
            }
            else {
                reject(new Error("Could not find free port"));
            }
        });
        server.on("error", reject);
    });
}
function isValidApiKey(key) {
    return typeof key === "string" && /^[a-zA-Z0-9_\-]{10,}$/.test(key);
}
function saveApiKeyToConfig(apiKey) {
    if (!isValidApiKey(apiKey)) {
        throw new Error("Invalid API key format received from server");
    }
    const configPath = getBlandCliConfigPath();
    const configDir = path.dirname(configPath);
    fs.mkdirSync(configDir, { recursive: true });
    const config = {
        current_profile: "default",
        profiles: {
            default: {
                api_key: apiKey,
                base_url: "https://api.bland.ai",
            },
        },
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}
const SUCCESS_HTML = `<!DOCTYPE html>
<html>
<head><title>Bland AI</title></head>
<body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f8f9fa;">
  <div style="text-align: center; padding: 2rem;">
    <h1 style="color: #10b981;">Authentication Successful</h1>
    <p>You can close this tab and return to your terminal.</p>
  </div>
</body>
</html>`;
const ALLOWED_BASE_URLS = [
    "https://api.bland.ai",
    "https://staging-api.bland.ai",
];
function validateBaseUrl(baseUrl) {
    if (ALLOWED_BASE_URLS.includes(baseUrl))
        return baseUrl;
    try {
        const parsed = new URL(baseUrl);
        if (parsed.hostname.endsWith(".bland.ai") && parsed.protocol === "https:") {
            return baseUrl;
        }
    }
    catch {
        // invalid URL
    }
    throw new Error(`Untrusted base URL: ${baseUrl}`);
}
async function exchangeToken(baseUrl, token, redirectUri, retries = 1) {
    const validatedUrl = validateBaseUrl(baseUrl);
    const exchangeUrl = `${validatedUrl}/auth/exchange`;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetch(exchangeUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, redirect_uri: redirectUri }),
            });
            if (!res.ok) {
                throw new Error(`Exchange failed: ${res.status} ${res.statusText}`);
            }
            return await res.json();
        }
        catch (err) {
            if (attempt < retries) {
                await new Promise((r) => setTimeout(r, 1000));
                continue;
            }
            throw err;
        }
    }
}
export async function handleAuthLogin() {
    if (isAuthenticated()) {
        return { success: true, already_authenticated: true };
    }
    let port;
    try {
        port = await findFreePort();
    }
    catch {
        return { success: false, error: "COULD_NOT_FIND_PORT" };
    }
    const redirectUri = `http://127.0.0.1:${port}/callback`;
    const authUrl = `${SIGNUP_URL_BASE}?ref=plugin&redirect_uri=${encodeURIComponent(redirectUri)}`;
    return new Promise(async (resolve) => {
        let resolved = false;
        function finish(result) {
            if (resolved)
                return;
            resolved = true;
            server.close();
            resolve(result);
        }
        const server = http.createServer(async (req, res) => {
            const parsedUrl = url.parse(req.url || "", true);
            if (parsedUrl.pathname === "/callback" && parsedUrl.query.token) {
                const token = parsedUrl.query.token;
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(SUCCESS_HTML);
                try {
                    const baseUrl = getBaseUrl();
                    const response = await exchangeToken(baseUrl, token, redirectUri, 1);
                    const data = response.data;
                    saveApiKeyToConfig(data.api_key);
                    finish({
                        success: true,
                        api_key: data.api_key,
                        org_id: data.org_id,
                        phone_number: data.phone_number || null,
                        persona_id: data.persona_id || null,
                    });
                }
                catch (err) {
                    finish({
                        success: false,
                        error: `TOKEN_EXCHANGE_FAILED: ${err instanceof Error ? err.message : String(err)}`,
                    });
                }
            }
            else {
                res.writeHead(404);
                res.end("Not found");
            }
        });
        server.listen(port, "127.0.0.1", async () => {
            try {
                const open = (await import("open")).default;
                await open(authUrl);
            }
            catch {
                finish({
                    success: false,
                    error: `BROWSER_OPEN_FAILED. Please open this URL manually: ${authUrl}`,
                });
            }
        });
        setTimeout(() => {
            finish({
                success: false,
                error: "TIMEOUT — user did not complete signup within 5 minutes",
            });
        }, AUTH_TIMEOUT_MS);
    });
}
//# sourceMappingURL=auth.js.map