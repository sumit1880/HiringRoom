import { prisma } from "../config/prisma.js";
import { resumeProcessor } from "../rag/resumeProcessor.js";
import { textChunker } from "../rag/textChunker.js";
import { embeddingService } from "../rag/embedding.js";
import { vectorStore } from "../rag/vectorStore.js";
import { aiService } from "./ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import { randomUUID } from "crypto";

interface ResumeClassification {
  isResume: boolean;
  confidence: number;
  reason: string;
}

/**
 * Same JSON-cleanup pattern used by interview.service.ts's
 * parseEvaluationResponse — strips markdown fences before parsing.
 */
function parseClassificationResponse(text: string): ResumeClassification {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/^json/i, "")
    .trim();

  return JSON.parse(cleaned);
}

/**
 * Uses the existing AI provider abstraction (aiService -> providerService)
 * to classify whether extracted document text is actually a resume/CV,
 * before it's allowed to become the user's active resume.
 */
async function classifyDocument(
  extractedText: string
): Promise<ResumeClassification> {
  // A document with little to no extractable text (e.g. a scanned image
  // PDF) can't be a usable resume either way — skip the AI call.
  if (extractedText.trim().length < 50) {
    return {
      isResume: false,
      confidence: 1,
      reason: "Document contains little to no extractable text.",
    };
  }

  const prompt = `
You are an expert technical recruiter.

Determine whether the following document is a resume/CV — a document summarizing a person's education, work experience, skills, and/or projects for job applications.

Document:

${extractedText.substring(0, 3000)}

Return ONLY valid JSON in this exact format:

{
  "isResume": boolean,
  "confidence": number,
  "reason": "..."
}

Rules:
- isResume must be true only if the document is clearly a resume/CV.
- confidence must be a number between 0 and 1.
- reason should be a short explanation, under 30 words.
- Do NOT wrap JSON inside markdown.
`.trim();

  let response: string;

  try {
    response = await aiService.generate(prompt);
  } catch (error) {
    console.error("[Resume Validation] AI provider call failed:", error);
    throw new ApiError(
      500,
      "Could not validate the uploaded document. Please try again."
    );
  }

  let result: ResumeClassification;

  try {
    result = parseClassificationResponse(response);
  } catch {
    console.error(
      "[Resume Validation] Failed to parse AI classification response:",
      response
    );
    throw new ApiError(
      500,
      "Could not validate the uploaded document. Please try again."
    );
  }

  if (typeof result.isResume !== "boolean") {
    console.error(
      "[Resume Validation] Malformed classification response:",
      result
    );
    throw new ApiError(
      500,
      "Could not validate the uploaded document. Please try again."
    );
  }

  return result;
}

export const uploadResume = async (
  userId: string,
  file: Express.Multer.File
) => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  // Step 1: Extract text from PDF
  const extractedText = await resumeProcessor.extractText(file.buffer);

  // Step 1.5: Validate this is actually a resume BEFORE saving, chunking,
  // or creating embeddings. Rejecting here leaves any previous valid
  // resume completely untouched, and nothing has been persisted or
  // written to the vector store yet — the in-memory upload (multer
  // memoryStorage, no file written to disk) is simply discarded.
  const classification = await classifyDocument(extractedText);

  console.log(
    `[Resume Validation] isResume=${classification.isResume} confidence=${classification.confidence} reason="${classification.reason}"`
  );

  if (!classification.isResume) {
    throw new ApiError(
      400,
      "The uploaded document is not a valid resume. Please upload your resume in PDF format."
    );
  }

  // Step 2: Split into chunks
  const chunks = textChunker.split(extractedText);

  console.log(`Chunks created: ${chunks.length}`);

  // Step 3: Generate embeddings
for (const chunk of chunks) {
  const embedding =
    await embeddingService.generateEmbedding(chunk);

  await vectorStore.addDocument(
    randomUUID(),
    chunk,
    embedding,
    userId
  );

  console.log(
    "Stored:",
    chunk.substring(0, 60)
  );
}

  // Step 4: Save resume
  const resume = await prisma.resume.create({
    data: {
      userId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileUrl: "local-upload",
      extractedText,
      embeddingStatus: "COMPLETED",
    },
  });

 

  return resume;
};

export const getUserResumes = async (userId: string) => {
  // Used by the "list my resumes" endpoint (interview creation resume
  // picker) — deliberately excludes extractedText/embeddings so we never
  // ship large resume content just to populate a selection list.
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
    select: {
      id: true,
      originalName: true,
      uploadedAt: true,
      embeddingStatus: true,
    },
  });
};

export const getResumeById = async (id: string, userId: string) => {
  return prisma.resume.findFirst({
    where: {
      id,
      userId,
    },
  });
};

export const deleteResume = async (id: string, userId: string) => {
  return prisma.resume.deleteMany({
    where: {
      id,
      userId,
    },
  });
};