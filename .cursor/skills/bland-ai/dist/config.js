import * as fs from "fs";
import * as path from "path";
import * as os from "os";
const DEFAULT_BASE_URL = "https://api.bland.ai";
// Bland CLI stores config via the `conf` npm package.
// Config path varies by platform:
//   macOS:  ~/Library/Preferences/bland-cli-nodejs/config.json
//   Linux:  ~/.config/bland-cli-nodejs/config.json
//   Win:    %APPDATA%/bland-cli-nodejs/config.json
export function getBlandCliConfigPath() {
    const platform = os.platform();
    if (platform === "darwin") {
        return path.join(os.homedir(), "Library", "Preferences", "bland-cli-nodejs", "config.json");
    }
    if (platform === "win32") {
        return path.join(process.env.APPDATA ||
            path.join(os.homedir(), "AppData", "Roaming"), "bland-cli-nodejs", "config.json");
    }
    // Linux / others: XDG
    const configDir = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
    return path.join(configDir, "bland-cli-nodejs", "config.json");
}
function readBlandCliConfig() {
    try {
        const configPath = getBlandCliConfigPath();
        if (!fs.existsSync(configPath))
            return null;
        const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        const profileName = raw.current_profile || "default";
        const profile = raw.profiles?.[profileName];
        return profile || null;
    }
    catch {
        return null;
    }
}
/**
 * Resolve API key with layered fallback:
 * 1. Explicit key parameter (for SDK usage — demo passes process.env.BLAND_API_KEY)
 * 2. BLAND_API_KEY env var
 * 3. Bland CLI config file (~/.config/bland-cli-nodejs/config.json)
 */
export function getApiKey(explicitKey) {
    if (explicitKey)
        return explicitKey;
    if (process.env.BLAND_API_KEY)
        return process.env.BLAND_API_KEY;
    const cliConfig = readBlandCliConfig();
    if (cliConfig?.api_key)
        return cliConfig.api_key;
    throw new Error("No API key found. Set BLAND_API_KEY environment variable or run `bland auth login`.");
}
export function getBaseUrl() {
    if (process.env.BLAND_BASE_URL)
        return process.env.BLAND_BASE_URL;
    const cliConfig = readBlandCliConfig();
    return cliConfig?.base_url || DEFAULT_BASE_URL;
}
export function isAuthenticated(explicitKey) {
    try {
        getApiKey(explicitKey);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=config.js.map