export interface AIProvider {
  name: string;

  generate(prompt: string): Promise<string>;
}