export class AIProviderError extends Error {
    provider;
    status;
    constructor(provider, status, message) {
        super(message);
        this.provider = provider;
        this.status = status;
        this.name = "AIProviderError";
    }
    get retryable() {
        return (this.status === 429 ||
            this.status === 503);
    }
}
