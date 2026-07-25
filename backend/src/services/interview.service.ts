import {
  InterviewStatus,
  InterviewType,
  InterviewDifficulty,
} from "@prisma/client";

import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { aiService } from "./ai.service.js";

type DifficultyInput = "easy" | "medium" | "hard";

const DIFFICULTY_MAP: Record<DifficultyInput, InterviewDifficulty> = {
  easy: InterviewDifficulty.EASY,
  medium: InterviewDifficulty.MEDIUM,
  hard: InterviewDifficulty.HARD,
};

const DIFFICULTY_PROMPT_GUIDANCE: Record<InterviewDifficulty, string> = {
  [InterviewDifficulty.EASY]: `
Difficulty: EASY
- Ask beginner-friendly fundamentals.
- Focus on basic DSA concepts (arrays, strings, loops, simple complexity) or straightforward questions about the candidate's projects.
- Keep the question simple, clear, and approachable for someone early in their learning.
- Avoid multi-part or trick questions.`,
  [InterviewDifficulty.MEDIUM]: `
Difficulty: MEDIUM
- Ask at a standard campus/placement interview level.
- Cover common DSA patterns, core CS fundamentals, or reasonably detailed project questions.
- The question should require solid understanding but not deep specialization.`,
  [InterviewDifficulty.HARD]: `
Difficulty: HARD
- Ask at a senior engineer level.
- Focus on production-scale system design, trade-offs, optimization, and edge cases.
- Expect the candidate to justify decisions, discuss scalability, failure modes, and performance implications.
- The question can be multi-layered or probe deeper reasoning.`,
};

// Previously the interview TYPE was never mentioned in the prompt at all —
// every interview (technical, behavioral, system design, case study) got
// the same generic "ask about a project" instruction. This is what made
// every interview feel like a generic technical one regardless of the
// type selected on the setup page.
const TYPE_PROMPT_GUIDANCE: Record<InterviewType, string> = {
  [InterviewType.DSA]: `
Interview Type: TECHNICAL / DSA
- Ask data structures & algorithms questions, or hands-on coding/problem-solving questions.
- You may also ask focused technical questions about the candidate's resume projects (implementation details, trade-offs, complexity).
- Do NOT ask behavioral ("tell me about a time...") or pure system-design architecture questions.`,
  [InterviewType.BEHAVIORAL]: `
Interview Type: BEHAVIORAL
- Ask about past experiences, teamwork, conflict, leadership, failures, and decision-making.
- Prefer "Tell me about a time..." / "Describe a situation where..." style questions grounded in the candidate's resume.
- Do NOT ask DSA/coding puzzles or system-design architecture questions.`,
  [InterviewType.SYSTEM_DESIGN]: `
Interview Type: SYSTEM DESIGN
- Ask the candidate to design or reason about a system's architecture, scalability, data model, or trade-offs.
- Focus on high-level design decisions rather than syntax or specific algorithms.
- Do NOT ask behavioral or DSA coding questions.`,
  [InterviewType.CASE_STUDY]: `
Interview Type: CASE STUDY
- Present an open-ended business/product/technical scenario and ask the candidate to reason through it step by step.
- Focus on structured problem-solving, prioritization, and justifying trade-offs — not raw coding or "tell me about a time" stories.
- Do NOT ask DSA coding puzzles or pure behavioral storytelling questions.`,
};

class InterviewService {

  async createSession(
    userId: string,
    title: string,
    type: InterviewType,
    difficulty: DifficultyInput = "medium",
    resumeId: string,
    durationMinutes: number = 30
  ) {
    // Validate the selected resume before the session is ever created.
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new ApiError(404, "Selected resume not found");
    }

    if (resume.userId !== userId) {
      throw new ApiError(403, "This resume does not belong to you");
    }

    if (resume.embeddingStatus !== "COMPLETED") {
      throw new ApiError(400, "Selected resume is not a valid resume");
    }

    return prisma.interviewSession.create({
      data: {
        title,
        type,
        difficulty: DIFFICULTY_MAP[difficulty],
        userId,
        resumeId,
        durationMinutes,
      },
    });
  }

  async getSessions(userId: string) {
    return prisma.interviewSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        startedAt: "desc",
      },
    });
  }

  async getSessionById(
    sessionId: string,
    userId: string
  ) {
    const session =
      await prisma.interviewSession.findFirst({
        where: {
          id: sessionId,
          userId,
        },
        include: {
          feedback: true,
       questions: {
  include: {
    evaluation: true,
  },
  orderBy: {
    questionNumber: 'asc',
  },
},
        },
      });

    if (!session) {
      throw new ApiError(
        404,
        "Interview session not found"
      );
    }

    return session;
  }

  async completeSession(
    sessionId: string,
    userId: string
  ) {
    const session =
      await this.getSessionById(
        sessionId,
        userId
      );

    return prisma.interviewSession.update({
      where: {
        id: session.id,
      },
      data: {
        status:
          InterviewStatus.COMPLETED,
        endedAt: new Date(),
      },
    });
  }

  async deleteSession(
    sessionId: string,
    userId: string
  ) {
    const session =
      await this.getSessionById(
        sessionId,
        userId
      );

    await prisma.interviewSession.delete({
      where: {
        id: session.id,
      },
    });
  }

  /**
   * Resolves which resume's extracted text should be used for a given
   * session's AI context.
   *
   * - If the session has a resumeId (created after multi-resume support
   *   was added), that exact resume is used — never the "latest" one.
   * - If the session predates this feature (resumeId is null), we fall
   *   back to the previous behavior (most recently uploaded resume) so
   *   existing interviews keep working unchanged.
   */
  private async resolveResumeForSession(session: {
    userId: string;
    resumeId: string | null;
  }) {
    if (session.resumeId) {
      return prisma.resume.findUnique({
        where: { id: session.resumeId },
      });
    }

    return prisma.resume.findFirst({
      where: { userId: session.userId },
      orderBy: { uploadedAt: "desc" },
    });
  }

  async startInterview(
    sessionId: string,
    userId: string
  ) {
    const session =
      await prisma.interviewSession.findFirst({
        where: {
          id: sessionId,
          userId,
        },
      });

    if (!session) {
      throw new ApiError(
        404,
        "Interview session not found"
      );
    }

    const existing =
      await prisma.interviewQuestion.findFirst({
        where: {
          sessionId,
        },
      });

    if (existing) {
      return {
        questionNumber:
          existing.questionNumber,
        question: existing.question,
        durationMinutes: session.durationMinutes,
        startedAt: session.startedAt,
      };
    }

    const resume = await this.resolveResumeForSession(session);

    if (!resume?.extractedText) {
      throw new ApiError(
        400,
        "Please upload a resume first."
      );
    }

    const difficultyGuidance =
      DIFFICULTY_PROMPT_GUIDANCE[session.difficulty];

    const typeGuidance =
      TYPE_PROMPT_GUIDANCE[session.type];

    const prompt = `
You are an experienced software engineering interviewer.

Generate ONLY the FIRST interview question.
${typeGuidance}
${difficultyGuidance}

Rules:
- Ask exactly ONE question.
- No greeting.
- No explanation.
- No numbering.
- Stay strictly within the interview type described above.

Resume:

${resume.extractedText.substring(0, 2500)}
`.trim();
  const question =
  (await aiService.generate(prompt)).trim() ||
  "Tell me about yourself.";

    await prisma.interviewQuestion.create({
      data: {
        sessionId,
        questionNumber: 1,
        question,
      },
    });

    return {
      questionNumber: 1,
      question,
      durationMinutes: session.durationMinutes,
      startedAt: session.startedAt,
    };
  }

  // ====================================================
  // NEW : ANSWER QUESTION
  // ====================================================


private parseEvaluationResponse(text: string) {
  
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/^json/i, "")
      .trim();

    return JSON.parse(cleaned);
  
}

  async answerQuestion(
    sessionId: string,
    userId: string,
    answer: string
  ) {
    const session =
      await prisma.interviewSession.findFirst({
        where: {
          id: sessionId,
          userId,
        },
      });

    if (!session) {
      throw new ApiError(
        404,
        "Interview session not found"
      );
    }

    const currentQuestion =
      await prisma.interviewQuestion.findFirst({
        where: {
          sessionId,
          answer: null,
        },
        orderBy: {
          questionNumber: "desc",
        },
      });

    if (!currentQuestion) {
      throw new ApiError(
        400,
        "No pending interview question."
      );
    }

console.log("Answer received:", answer);
console.log("Type:", typeof answer);
console.log("Current Question ID:", currentQuestion.id);
console.log("Answer:", answer);
console.log("Answer type:", typeof answer);

   try {
  console.log("Updating answer...");

  const updated = await prisma.interviewQuestion.update({
    where: {
      id: currentQuestion.id,
    },
    data: {
      answer,
    },
  });

  console.log("Updated:", updated.id);
} catch (err) {
  console.error("UPDATE ERROR:");
  console.error(err);
  throw err;
}
    const resume = await this.resolveResumeForSession(session);
  let resumeContext = "";

if (resume?.extractedText) {
  resumeContext = resume.extractedText.substring(0, 2500);
}

const previousQuestions =
  await prisma.interviewQuestion.findMany({
    where: {
      sessionId,
    },
    orderBy: {
      questionNumber: "desc",
    },
    take: 3,
  });

const conversationHistory =
  previousQuestions
    .reverse()
    .map(
      (q) => `
Question ${q.questionNumber}
${q.question}

Candidate Answer
${q.answer ?? "Not answered"}
`
    )
    .join("\n-------------------------\n");


const difficultyGuidance =
  DIFFICULTY_PROMPT_GUIDANCE[session.difficulty];

const typeGuidance =
  TYPE_PROMPT_GUIDANCE[session.type];

const prompt = `
You are an experienced software engineering interviewer.

You are conducting a mock interview.
${typeGuidance}
${difficultyGuidance}

Candidate Resume:

${resumeContext}

Conversation:

${conversationHistory}

Latest Candidate Answer:

${answer}

Evaluate the candidate's latest answer.

Then generate the NEXT interview question, staying strictly within the interview type described above.

Return ONLY valid JSON.

{
  "technicalScore": number,
  "communicationScore": number,
  "confidenceScore": number,
  "strengths": [
    "..."
  ],
  "weaknesses": [
    "..."
  ],
  "feedback": "...",
  "nextQuestion": "..."
}

Rules:

- Scores must be integers from 1 to 10.
- strengths must contain 2-3 items.
- weaknesses must contain 2-3 items.
- feedback should be under 50 words.
- nextQuestion must be exactly ONE interview question.
- Do NOT wrap JSON inside markdown.
`.trim();
const response =
  await aiService.generate(prompt);

const result =
  this.parseEvaluationResponse(
    response
  );

console.log(result);



if (
  result.technicalScore === undefined ||
  result.communicationScore === undefined ||
  result.confidenceScore === undefined ||
  !result.nextQuestion
) {
  throw new ApiError(
    500,
    "Invalid AI evaluation response."
  );
}


const normalizeToStringArray = (
  value: unknown
): string[] => {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
};

await prisma.questionEvaluation.create({
  data: {
    technicalScore: result.technicalScore,
    communicationScore: result.communicationScore,
    confidenceScore: result.confidenceScore,

    strengths: normalizeToStringArray(result.strengths),

    weaknesses: normalizeToStringArray(result.weaknesses),

    feedback: result.feedback,
    questionId: currentQuestion.id,
  },
});


    const saved =
      await prisma.interviewQuestion.create({
        data: {
          sessionId,
          questionNumber:
            currentQuestion.questionNumber + 1,
          question: result.nextQuestion,
        },
      });


  return {
  evaluation: {
    technicalScore: result.technicalScore,
    communicationScore: result.communicationScore,
    confidenceScore: result.confidenceScore,
    strengths: normalizeToStringArray(result.strengths),
    weaknesses: normalizeToStringArray(result.weaknesses),
    feedback: result.feedback,
  },
  nextQuestion: {
    questionNumber: saved.questionNumber,
    question: saved.question,
  },
};
  
  }
}

export const interviewService =
  new InterviewService();
