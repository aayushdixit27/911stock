import { getApiKey, getBaseUrl } from "./config.js";
import { BlandError, AuthError } from "./errors.js";
function buildUrl(path, query) {
    const base = getBaseUrl().replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${base}${cleanPath}`);
    if (query) {
        for (const [key, val] of Object.entries(query)) {
            if (val !== undefined && val !== null) {
                url.searchParams.set(key, String(val));
            }
        }
    }
    return url.toString();
}
export function createApiClient(explicitApiKey) {
    async function request(path, options = {}) {
        const { method = "GET", body, query } = options;
        let apiKey;
        try {
            apiKey = getApiKey(explicitApiKey);
        }
        catch {
            throw new AuthError();
        }
        const url = buildUrl(path, query);
        const headers = {
            authorization: apiKey,
        };
        const fetchOptions = { method, headers };
        if (body) {
            headers["content-type"] = "application/json";
            fetchOptions.body = JSON.stringify(body);
        }
        let response;
        try {
            response = await fetch(url, fetchOptions);
        }
        catch (err) {
            throw new BlandError(`Network error: ${err instanceof Error ? err.message : "Failed to connect to Bland API"}`);
        }
        if (response.status === 401) {
            throw new AuthError("Invalid API key.");
        }
        let data;
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            data = await response.json();
        }
        else {
            const text = await response.text();
            try {
                data = JSON.parse(text);
            }
            catch {
                if (!response.ok) {
                    throw new BlandError(`API error (${response.status}): ${text}`);
                }
                return text;
            }
        }
        const apiResponse = data;
        if (apiResponse.errors && apiResponse.errors.length > 0) {
            throw new BlandError(apiResponse.errors.map((e) => e.message).join("; "), response.status, apiResponse.errors);
        }
        if (apiResponse.data !== undefined) {
            return apiResponse.data;
        }
        return data;
    }
    return {
        get: (path, query) => request(path, { method: "GET", query }),
        post: (path, body) => request(path, { method: "POST", body }),
        put: (path, body) => request(path, { method: "PUT", body }),
        patch: (path, body) => request(path, { method: "PATCH", body }),
        delete: (path) => request(path, { method: "DELETE" }),
    };
}
// Default client (uses env var / CLI config)
export const api = createApiClient();
//# sourceMappingURL=api.js.map