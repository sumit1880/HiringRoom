export class TextChunker {
  private readonly chunkSize = 500;
  private readonly overlap = 100;

  split(text: string): string[] {
    const cleaned = text.replace(/\s+/g, " ").trim();

    const chunks: string[] = [];

    let start = 0;

    while (start < cleaned.length) {
      const end = Math.min(
        start + this.chunkSize,
        cleaned.length
      );

      chunks.push(cleaned.slice(start, end));

      start += this.chunkSize - this.overlap;
    }

    return chunks;
  }
}

export const textChunker = new TextChunker();
