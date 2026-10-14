export class AIProviderError extends Error {
  constructor(
    public readonly provider: string,
    public readonly status: number,
    message: string
  ) {
    super(message);

    this.name = "AIProviderError";
  }

  get retryable(): boolean {
    return (
      this.status === 402 ||
      this.status === 408 ||
      this.status === 429 ||
      this.status >= 500
    );
  }
}