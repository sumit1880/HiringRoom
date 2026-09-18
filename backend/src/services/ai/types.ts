export interface AIProvider {
  name: string;

  generate(prompt: string): Promise<string>;

  /**
   * Token/chunk streaming variant of generate(). Each provider yields
   * plain text fragments as they arrive from the upstream API — the
   * caller is responsible for accumulating them into the full response.
   */
  generateStream(prompt: string): AsyncGenerator<string, void, unknown>;
}