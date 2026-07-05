import {
  InterviewStatus,
  InterviewType,
} from "@prisma/client";

import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { aiService } from "./ai.service.js";

class InterviewService {

  async createSession(
    userId: string,
    title: string,
    type: InterviewType
  ) {
    return prisma.interviewSession.create({
      data: {
        title,
        type,
        userId,
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
            orderBy: {
              questionNumber: "asc",
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
      };
    }

    const resume =
      await prisma.resume.findFirst({
        where: {
          userId,
        },
        orderBy: {
          uploadedAt: "desc",
        },
      });

    if (!resume?.extractedText) {
      throw new ApiError(
        400,
        "Please upload a resume first."
      );
    }

    const prompt = `
You are an experienced software engineering interviewer.

Generate ONLY the FIRST interview question.

Rules:
- Ask exactly ONE question.
- No greeting.
- No explanation.
- No numbering.
- Prefer asking about one of the candidate's projects.

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
    const resume =
      await prisma.resume.findFirst({
        where: {
          userId,
        },
        orderBy: {
          uploadedAt: "desc",
        },
      });
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


const prompt = `
You are an experienced software engineering interviewer.

You are conducting a mock interview.

Candidate Resume:

${resumeContext}

Conversation:

${conversationHistory}

Latest Candidate Answer:

${answer}

Evaluate the candidate's latest answer.

Then generate the NEXT interview question.

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


await prisma.questionEvaluation.create({
  data: {
    technicalScore: result.technicalScore,
    communicationScore: result.communicationScore,
    confidenceScore: result.confidenceScore,

    strengths: Array.isArray(result.strengths)
      ? result.strengths.join("\n")
      : result.strengths,

    weaknesses: Array.isArray(result.weaknesses)
      ? result.weaknesses.join("\n")
      : result.weaknesses,

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
    strengths: result.strengths,
    weaknesses: result.weaknesses,
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