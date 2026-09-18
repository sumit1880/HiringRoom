import { prisma } from "../config/prisma.js";
import { resumeProcessor } from "../rag/resumeProcessor.js";
import { aiService } from "./ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import {
  resumeProcessingQueue,
  ResumeProcessingJobData,
} from "../config/queue.js";

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

  // Step 1.5: Validate this is actually a resume BEFORE saving or
  // queuing any processing. Rejecting here leaves any previous valid
  // resume completely untouched, and nothing has been persisted or
  // queued yet — the in-memory upload (multer memoryStorage, no file
  // written to disk) is simply discarded.
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

  // Step 2: Save the resume row immediately as PENDING and return —
  // chunking + embedding generation is expensive (a PDF-parse-sized
  // resume can be dozens of chunks) and previously ran synchronously
  // inside this request, risking timeouts and blocking the request
  // thread. It's now handled by the background worker (see src/worker.ts)
  // via the resume-processing queue; the client already polls
  // embeddingStatus (PENDING -> PROCESSING -> COMPLETED/FAILED) since the
  // frontend's resumeService already models these states.
  const resume = await prisma.resume.create({
    data: {
      userId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileUrl: "local-upload",
      extractedText,
      embeddingStatus: "PENDING",
    },
  });

  await resumeProcessingQueue.add("process-resume", {
    resumeId: resume.id,
    userId,
    extractedText,
  } satisfies ResumeProcessingJobData);

  return resume;
};

export const getUserResumes = async (userId: string, page = 1, limit = 20) => {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safePage = Math.max(page, 1);

  // Used by the "list my resumes" endpoint (interview creation resume
  // picker) — deliberately excludes extractedText/embeddings so we never
  // ship large resume content just to populate a selection list.
  const [resumes, total] = await Promise.all([
    prisma.resume.findMany({
      where: { userId },
      orderBy: { uploadedAt: "desc" },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      select: {
        id: true,
        originalName: true,
        uploadedAt: true,
        embeddingStatus: true,
      },
    }),
    prisma.resume.count({ where: { userId } }),
  ]);

  return {
    resumes,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const getResumeById = async (id: string, userId: string) => {
  return prisma.resume.findFirst({
    where: {
      id,
      userId,
    },
  });
};

interface AtsScoreResult {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
}

function parseAtsScoreResponse(text: string): AtsScoreResult {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/^json/i, "")
    .trim();

  return JSON.parse(cleaned);
}

/**
 * ATS-style resume scoring — reuses the same AI-provider abstraction as
 * classifyDocument() above, scoring how well a resume would parse and
 * read for an Applicant Tracking System / recruiter screen, optionally
 * targeted at a specific job description.
 */
export const scoreResumeATS = async (
  id: string,
  userId: string,
  jobDescription?: string
): Promise<AtsScoreResult> => {
  const resume = await getResumeById(id, userId);

  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }

  if (!resume.extractedText) {
    throw new ApiError(400, "Resume text is not available yet. Please wait for processing to finish.");
  }

  const jdBlock = jobDescription?.trim()
    ? `\nScore this resume specifically against the following job description — weight keyword/skill alignment with it heavily:\n\n${jobDescription.trim().substring(0, 3000)}\n`
    : "\nNo specific job description was provided — score against general ATS best practices for this candidate's apparent field.\n";

  const prompt = `
You are an ATS (Applicant Tracking System) resume screening expert.

Evaluate the following resume for ATS-friendliness and recruiter readability.
${jdBlock}
Resume:

${resume.extractedText.substring(0, 4000)}

Return ONLY valid JSON in this exact shape:

{
  "score": number,
  "summary": "...",
  "strengths": ["..."],
  "improvements": ["..."],
  "missingKeywords": ["..."]
}

Rules:
- "score" is an integer 0-100 representing overall ATS/recruiter fit.
- "summary" is under 40 words.
- "strengths" and "improvements" each contain 2-5 short, specific items.
- "missingKeywords" lists 0-8 relevant skills/keywords the resume is missing (empty array if none, or if no job description was given and the resume is already strong).
- Do NOT wrap JSON inside markdown.
`.trim();

  let response: string;

  try {
    response = await aiService.generate(prompt);
  } catch (error) {
    console.error("[Resume ATS Score] AI provider call failed:", error);
    throw new ApiError(500, "Could not score this resume right now. Please try again.");
  }

  try {
    return parseAtsScoreResponse(response);
  } catch {
    console.error("[Resume ATS Score] Failed to parse AI response:", response);
    throw new ApiError(500, "Could not score this resume right now. Please try again.");
  }
};

export const deleteResume = async (id: string, userId: string) => {
  return prisma.resume.deleteMany({
    where: {
      id,
      userId,
    },
  });
};

export const retryResumeProcessing = async (id: string, userId: string) => {
  const resume = await getResumeById(id, userId);
  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }

  if (!resume.extractedText) {
    throw new ApiError(400, "Resume text is not available for retry. Please re-upload.");
  }

  await prisma.resume.update({
    where: { id },
    data: { embeddingStatus: "PENDING" },
  });

  await resumeProcessingQueue.add("process-resume", {
    resumeId: resume.id,
    userId,
    extractedText: resume.extractedText,
  });

  return prisma.resume.findUnique({ where: { id } });
};