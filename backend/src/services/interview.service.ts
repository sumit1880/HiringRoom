import {
  InterviewStatus,
  InterviewType,
  InterviewDifficulty,
  QuestionStrategy,
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
    durationMinutes: number = 30,
    jobDescription?: string
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
        // See "Read before writing" note near jobDescription's other
        // usages: typed via `as any` until `prisma generate` (already
        // wired into postinstall) regenerates client types for this
        // newly added column.
        ...( { jobDescription: jobDescription?.trim() || null } as any),
      },
    });
  }

  // Paginated — a user's session count grows unbounded over months of
  // use; previously this always returned every session ever created.
  // Backward compatible: omitting page/limit still returns page 1 of 20.
  async getSessions(userId: string, page = 1, limit = 20) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);

    const [sessions, total] = await Promise.all([
      prisma.interviewSession.findMany({
        where: { userId },
        orderBy: { startedAt: "desc" },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      prisma.interviewSession.count({ where: { userId } }),
    ]);

    return {
      sessions,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
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
  /**
   * Resolves the resumeId a chat message for this session should use for
   * RAG context — used by message.controller.ts so /messages requests
   * scope retrieval to the correct resume, not just the user.
   */
  async getResumeIdForSession(sessionId: string, userId: string): Promise<string> {
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new ApiError(404, "Interview session not found");
    }

    const resume = await this.resolveResumeForSession(session);

    if (!resume) {
      throw new ApiError(400, "No resume associated with this interview.");
    }

    return resume.id;
  }

  async resolveResumeForSession(session: {
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

  /**
   * Optional job-description block injected into both the opening and
   * follow-up question prompts. Returns an empty string (rendering as a
   * harmless blank line) when the session has no jobDescription set, so
   * this is a no-op for the majority of sessions that aren't JD-targeted.
   */
  private buildJobDescriptionGuidance(session: { jobDescription?: string | null }): string {
    const jd = session.jobDescription?.trim();
    if (!jd) return "";

    return `
Target Job Description — tailor every question toward the skills, responsibilities, and seniority this JD describes, in addition to the resume:

${jd.substring(0, 3000)}
`;
  }

  /**
   * Parses a JSON object out of raw AI output, stripping the markdown
   * code-fence wrapping models sometimes add despite instructions not to.
   * Shared by both the opening-question generation and the
   * evaluate+next-question generation, since both now expect JSON back.
   */
  private parseJsonResponse(text: string) {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/^json/i, "")
      .trim();

    return JSON.parse(cleaned);
  }

  private normalizeToStringArray(value: unknown): string[] {
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
  }

  /**
   * Validates the AI's chosen next-question strategy, falling back to
   * NEW_TOPIC (the safest default — it never pretends a struggling
   * candidate did fine) if the model returns something unexpected.
   */
  private normalizeStrategy(value: unknown): QuestionStrategy {
    if (
      value === QuestionStrategy.FOLLOW_UP ||
      value === QuestionStrategy.NEW_TOPIC ||
      value === QuestionStrategy.SIMPLIFY
    ) {
      return value;
    }
    return QuestionStrategy.NEW_TOPIC;
  }

  /**
   * Generic "positives" that are not real strengths — they describe
   * effort/tone/intent rather than any demonstrated technical content.
   * The prompt already forbids these, but this is a server-side safety
   * net in case the model includes one anyway.
   */
  private static readonly BANNED_GENERIC_STRENGTHS = [
    "engaged",
    "attempted the question",
    "attempted to answer",
    "acknowledged the question",
    "acknowledged the topic",
    "shows awareness",
    "seems familiar",
    "familiarity with",
    "aware of the domain",
    "willingness to",
    "shows interest",
    "shows confidence",
    "positive attitude",
    "good attitude",
  ];

  /**
   * Strips generic non-strengths, and forces an empty strengths list for
   * weak/refused/meaningless answers regardless of what the model returned —
   * this is the direct fix for the "hallucinated positive feedback" bug.
   */
  private sanitizeStrengths(
    strengths: string[],
    isWeakAnswer: boolean
  ): string[] {
    if (isWeakAnswer) {
      return [];
    }

    return strengths.filter((s) => {
      const lower = s.toLowerCase();
      return !InterviewService.BANNED_GENERIC_STRENGTHS.some((phrase) =>
        lower.includes(phrase)
      );
    });
  }

  /**
   * Hard ceiling on scores for weak/refused/meaningless answers. The
   * prompt already instructs the model to score these near zero, but
   * models don't always follow scoring instructions precisely — this
   * guarantees a refusal can never surface as a 9 or 10 regardless of
   * what the model returns.
   */
  private clampScoresForWeakAnswer(
    scores: {
      technicalScore: number;
      communicationScore: number;
      confidenceScore: number;
    },
    isWeakAnswer: boolean
  ) {
    if (!isWeakAnswer) {
      return scores;
    }

    return {
      technicalScore: Math.min(scores.technicalScore, 2),
      communicationScore: Math.min(scores.communicationScore, 3),
      confidenceScore: Math.min(scores.confidenceScore, 2),
    };
  }

  async startInterview(
    sessionId: string,
    userId: string
  ) {
    const setup = await this.prepareOpeningQuestion(sessionId, userId);
    if ("existing" in setup) return setup.existing;

    const raw = (await aiService.generate(setup.prompt)).trim();
    return this.finalizeOpeningQuestion(sessionId, setup.session, raw);
  }

  /**
   * Streaming variant of startInterview — yields raw text chunks as the
   * opening question's JSON is generated, then a final `done` event with
   * the same shape startInterview() returns. The prompt/JSON contract is
   * unchanged from the non-streaming path (see prepareOpeningQuestion) —
   * only how the response reaches the caller differs, which keeps this
   * from risking any regression in question generation itself.
   */
  async *startInterviewStream(
    sessionId: string,
    userId: string
  ): AsyncGenerator<
    { type: "chunk"; text: string } | { type: "done"; data: any },
    void,
    unknown
  > {
    const setup = await this.prepareOpeningQuestion(sessionId, userId);
    if ("existing" in setup) {
      yield { type: "done", data: setup.existing };
      return;
    }

    let raw = "";
    for await (const chunk of aiService.generateStream(setup.prompt)) {
      raw += chunk;
      yield { type: "chunk", text: chunk };
    }

    const result = await this.finalizeOpeningQuestion(
      sessionId,
      setup.session,
      raw.trim()
    );
    yield { type: "done", data: result };
  }

  /**
   * Shared setup for both startInterview() and startInterviewStream():
   * validates the session, returns the already-generated first question
   * if one exists (idempotent on refresh, same as before), otherwise
   * builds the opening-question prompt.
   */
  private async prepareOpeningQuestion(sessionId: string, userId: string) {
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
        existing: {
          questionNumber: existing.questionNumber,
          question: existing.question,
          durationMinutes: session.durationMinutes,
          startedAt: session.startedAt,
        },
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

    const jobDescriptionGuidance = this.buildJobDescriptionGuidance(session as any);

    const prompt = `
You are an experienced software engineering interviewer.

Generate ONLY the FIRST interview question.
${typeGuidance}
${difficultyGuidance}
${jobDescriptionGuidance}

Rules:
- Ask exactly ONE question.
- No greeting.
- No explanation.
- No numbering.
- Stay strictly within the interview type described above.

Return ONLY valid JSON in this exact shape:

{
  "topic": "...",
  "question": "..."
}

- "topic" is a short 2-5 word label for the concept/skill this question targets (e.g. "Array complexity", "Conflict with teammate", "Caching strategy").
- "question" must contain exactly ONE interview question, with no numbering or greeting.
- Do NOT wrap the JSON in markdown.

Resume:

${resume.extractedText.substring(0, 2500)}
`.trim();

    return { session, prompt };
  }

  /** Parses the opening-question JSON and persists it — shared by both
   * the streaming and non-streaming entry points so they can never
   * diverge in how a response is interpreted or saved. */
  private async finalizeOpeningQuestion(
    sessionId: string,
    session: { id: string; durationMinutes: number; startedAt: Date }
  , raw: string) {
    // Defaults preserve the old behavior (raw text as the question) in
    // case the model doesn't return valid JSON despite instructions.
    let question = raw || "Tell me about yourself.";
    let topic = "Introduction";

    try {
      const parsed = this.parseJsonResponse(raw);
      if (parsed?.question) {
        question = String(parsed.question).trim() || question;
      }
      if (parsed?.topic) {
        topic = String(parsed.topic).trim() || topic;
      }
    } catch {
      // AI didn't return valid JSON — fall back to treating the raw
      // output as the question, same as the previous behavior.
    }

    await prisma.interviewQuestion.create({
      data: {
        sessionId,
        questionNumber: 1,
        question,
        topic,
        strategy: QuestionStrategy.OPENING,
      },
    });

    await prisma.interviewSession.update({
      where: { id: session.id },
      data: {
        coveredTopics: [topic],
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
  // ANSWER QUESTION
  // ====================================================

  async answerQuestion(
    sessionId: string,
    userId: string,
    answer: string
  ) {
    const { session, currentQuestion, currentTopic, prompt } =
      await this.prepareAnswerQuestion(sessionId, userId, answer);

    const response = await aiService.generate(prompt);

    return this.finalizeAnswer(session, currentQuestion, currentTopic, response);
  }

  /**
   * Streaming variant of answerQuestion() - yields the evaluation+
   * next-question JSON as raw text chunks while the model generates
   * it, then a final `done` event with the same shape answerQuestion()
   * returns. The prompt and JSON contract are completely unchanged
   * from the non-streaming path (see prepareAnswerQuestion) - only how
   * the response reaches the caller differs, so the strict scoring
   * rules can never drift between the two entry points.
   */
  async *answerQuestionStream(
    sessionId: string,
    userId: string,
    answer: string
  ): AsyncGenerator<
    { type: "chunk"; text: string } | { type: "done"; data: any },
    void,
    unknown
  > {
    const { session, currentQuestion, currentTopic, prompt } =
      await this.prepareAnswerQuestion(sessionId, userId, answer);

    let response = "";
    for await (const chunk of aiService.generateStream(prompt)) {
      response += chunk;
      yield { type: "chunk", text: chunk };
    }

    const result = await this.finalizeAnswer(
      session,
      currentQuestion,
      currentTopic,
      response
    );
    yield { type: "done", data: result };
  }

  private async prepareAnswerQuestion(
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

    await prisma.interviewQuestion.update({
      where: {
        id: currentQuestion.id,
      },
      data: {
        answer,
      },
    });

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

    const jobDescriptionGuidance = this.buildJobDescriptionGuidance(session as any);

    const coveredTopicsList =
      session.coveredTopics.length > 0
        ? session.coveredTopics.map((t) => `- ${t}`).join("\n")
        : "None yet";

    const currentTopic = currentQuestion.topic ?? "General";

    // Tells the model explicitly what to do about repeated struggling,
    // instead of leaving it to guess and generating a next question
    // "as if nothing happened".
    const struggleGuidance =
      session.consecutiveStruggles >= 2
        ? `The candidate has struggled or given weak/unclear answers ${session.consecutiveStruggles} times in a row. Do NOT keep drilling into the same concept. Either simplify significantly or move to a completely different topic — do not pretend they answered well.`
        : session.consecutiveStruggles === 1
        ? `The candidate's previous answer was weak or unclear. Consider simplifying the follow-up, or moving on, rather than escalating difficulty.`
        : `The candidate has been answering reasonably so far.`;

    const prompt = `
You are an experienced software engineering interviewer.

You are conducting a mock interview.
${typeGuidance}
${difficultyGuidance}
${jobDescriptionGuidance}
Candidate Resume:

${resumeContext}

Topics already covered in this interview so far — do NOT ask about these again, even rephrased:
${coveredTopicsList}

Current topic: ${currentTopic}
${struggleGuidance}

Recent Conversation:

${conversationHistory}

Latest Candidate Answer:

${answer}

Step 1 — Evaluate the candidate's latest answer STRICTLY and ONLY based on what they actually wrote. Act like a strict, no-nonsense senior interviewer, not a cheerleader.

Hard evaluation rules — follow these exactly:
- Judge ONLY the technical/factual content actually present in the answer. Never infer, assume, or credit understanding that was not explicitly demonstrated.
- NEVER reward effort, confidence, tone, politeness, engagement, or intent to answer. A candidate saying "I know this but won't explain it" has demonstrated ZERO knowledge — score it exactly as you would silence or "I don't know".
- If the answer is a refusal, a non-answer ("I don't know", "no idea", "pass"), gibberish, or completely off-topic: technicalScore and confidenceScore must be 0-1, communicationScore must be 0-2, "strengths" MUST be an empty array, and feedback must state plainly that no technical content was demonstrated.
- If the answer is partially correct: state EXACTLY what was correct and EXACTLY what was missing or wrong. Do not round up to "good".
- If the answer is wrong: explain clearly why it is wrong. Do not soften the criticism.
- A strength is only valid if it names a SPECIFIC correct concept, term, or explanation the candidate actually stated. NEVER list a strength like "engaged", "attempted the question", "acknowledged the question", "shows awareness", or "seems familiar with the domain" — these are not strengths. If no specific strength exists, "strengths" MUST be an empty array. An empty array is the correct, expected output for a weak answer — do not pad it to reach a minimum count.
- feedback must reference specifics from the actual answer (e.g. "You correctly identified inheritance, but did not explain parent-child relationships or give an example" — never generic filler like "needs more detail").
- Scoring anchors for technicalScore: 0-1 = no answer/refusal/gibberish/irrelevant; 2-3 = attempts the topic but substantially incorrect; 4-5 = partially correct with notable gaps; 6-7 = mostly correct with minor gaps; 8-9 = correct, clear, and reasonably complete; 10 = excellent, fully correct, and demonstrates deep understanding — reserve for genuinely outstanding answers only.

Step 2 — Decide the interviewing strategy for the NEXT question:
- "FOLLOW_UP": dig deeper into the current topic, based specifically on what the candidate just said. Only choose this if their answer was solid and there's a genuine deeper angle to probe.
- "SIMPLIFY": ask an easier question on the same or a closely related topic, because the candidate is struggling.
- "NEW_TOPIC": move to a different topic entirely, because the current one is sufficiently covered or the candidate is stuck on it.

Step 3 — Generate the NEXT interview question consistent with that strategy, staying strictly within the interview type described above, and never repeating or closely resembling a topic already covered.

Return ONLY valid JSON in this exact shape:

{
  "technicalScore": number,
  "communicationScore": number,
  "confidenceScore": number,
  "isWeakAnswer": boolean,
  "strengths": [
    "..."
  ],
  "weaknesses": [
    "..."
  ],
  "feedback": "...",
  "strategy": "FOLLOW_UP" | "SIMPLIFY" | "NEW_TOPIC",
  "topic": "...",
  "nextQuestion": "..."
}

Rules:

- Scores must be integers from 0 to 10. Do not avoid 0 — a genuinely empty or refused answer deserves 0-1, not a sympathy score.
- "isWeakAnswer" is true if the latest answer was a non-answer, "I don't know", off-topic, gibberish, or showed no real understanding — false otherwise.
- strengths must contain ONLY specific, evidence-based items actually demonstrated in the answer — 0 to 3 items. An empty array is valid and expected for weak, refused, or meaningless answers. Do NOT invent generic positives to reach a minimum count.
- weaknesses must contain 1-3 items describing specifically what was missing, incorrect, or absent.
- feedback should be under 50 words, and must be specific to what the candidate actually wrote.
- "topic" is a short 2-5 word label for whatever concept nextQuestion targets. If strategy is FOLLOW_UP, reuse the current topic's label.
- nextQuestion must be exactly ONE interview question.
- Do NOT wrap JSON inside markdown.
`.trim();

    return { session, currentQuestion, currentTopic, prompt };
  }

  /**
   * Parses the evaluation+next-question JSON and persists everything
   * (evaluation row, next question row, session topic/struggle update) -
   * shared by answerQuestion() and answerQuestionStream() so the two
   * entry points can never diverge in how a response is interpreted,
   * scored, or saved.
   */
  private async finalizeAnswer(
    session: {
      id: string;
      coveredTopics: string[];
      consecutiveStruggles: number;
    },
    currentQuestion: { id: string; questionNumber: number },
    currentTopic: string,
    response: string
  ) {

    const result =
      this.parseJsonResponse(response);

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

    const isWeakAnswer = Boolean(result.isWeakAnswer);
    const strategy = this.normalizeStrategy(result.strategy);

    // Server-side safety net on top of the strict prompt: guarantees a
    // refusal/non-answer can never surface a high score or an invented
    // strength, even if the model doesn't follow the prompt precisely.
    const clampedScores = this.clampScoresForWeakAnswer(
      {
        technicalScore: Number(result.technicalScore),
        communicationScore: Number(result.communicationScore),
        confidenceScore: Number(result.confidenceScore),
      },
      isWeakAnswer
    );

    const sanitizedStrengths = this.sanitizeStrengths(
      this.normalizeToStringArray(result.strengths),
      isWeakAnswer
    );

    const nextTopic =
      typeof result.topic === "string" && result.topic.trim()
        ? result.topic.trim()
        : currentTopic;

    const alreadyCovered = session.coveredTopics.some(
      (t) => t.toLowerCase() === nextTopic.toLowerCase()
    );
    const updatedCoveredTopics = alreadyCovered
      ? session.coveredTopics
      : [...session.coveredTopics, nextTopic];

    const updatedConsecutiveStruggles = isWeakAnswer
      ? session.consecutiveStruggles + 1
      : 0;

    await prisma.questionEvaluation.create({
      data: {
        technicalScore: clampedScores.technicalScore,
        communicationScore: clampedScores.communicationScore,
        confidenceScore: clampedScores.confidenceScore,
        isWeakAnswer,
        strengths: sanitizedStrengths,
        weaknesses: this.normalizeToStringArray(result.weaknesses),
        feedback: result.feedback,
        questionId: currentQuestion.id,
      },
    });

    const saved =
      await prisma.interviewQuestion.create({
        data: {
          sessionId: session.id,
          questionNumber:
            currentQuestion.questionNumber + 1,
          question: result.nextQuestion,
          topic: nextTopic,
          strategy,
        },
      });

    await prisma.interviewSession.update({
      where: { id: session.id },
      data: {
        coveredTopics: updatedCoveredTopics,
        consecutiveStruggles: updatedConsecutiveStruggles,
      },
    });

    return {
      evaluation: {
        technicalScore: clampedScores.technicalScore,
        communicationScore: clampedScores.communicationScore,
        confidenceScore: clampedScores.confidenceScore,
        strengths: sanitizedStrengths,
        weaknesses: this.normalizeToStringArray(result.weaknesses),
        feedback: result.feedback,
      },
      nextQuestion: {
        questionNumber: saved.questionNumber,
        question: saved.question,
        topic: saved.topic,
      },
    };
  }
}

export const interviewService =
  new InterviewService();