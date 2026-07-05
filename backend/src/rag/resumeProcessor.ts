import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export class ResumeProcessor {
  async extractText(buffer: Buffer): Promise<string> {
    try {
      // Convert Buffer -> Uint8Array
      const uint8Array = new Uint8Array(buffer);

      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
      });

      const pdf = await loadingTask.promise;

      let text = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        const content = await page.getTextContent();

        const pageText = content.items
          .map((item: any) => ("str" in item ? item.str : ""))
          .join(" ");

        text += pageText + " ";
      }

      return text.replace(/\s+/g, " ").trim();
    } catch (error) {
      console.error("PDF parsing error:", error);
      throw new Error("Failed to extract resume text");
    }
  }
}

export const resumeProcessor = new ResumeProcessor();