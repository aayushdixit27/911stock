export class BlandError extends Error {
    statusCode;
    apiErrors;
    constructor(message, statusCode, apiErrors) {
        super(message);
        this.statusCode = statusCode;
        this.apiErrors = apiErrors;
        this.name = "BlandError";
    }
}
export class AuthError extends BlandError {
    constructor(message = "Not authenticated. Set BLAND_API_KEY environment variable or run `bland auth login`.") {
        super(message, 401);
        this.name = "AuthError";
    }
}
//# sourceMappingURL=errors.js.map