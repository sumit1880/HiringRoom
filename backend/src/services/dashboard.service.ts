import {
  InterviewStatus,
  InterviewType,
  InterviewDifficulty,
  InterviewSession,
  InterviewQuestion,
  QuestionEvaluation,
} from "@prisma/client";

import { prisma } from "../config/prisma.js";

type SessionWithQuestions = InterviewSession & {
  questions: (InterviewQuestion & { evaluation: QuestionEvaluation | null })[];
};

const TYPE_MAP: Record<InterviewType, string> = {
  DSA: "technical",
  BEHAVIORAL: "behavioral",
  SYSTEM_DESIGN: "system-design",
};

const DIFFICULTY_MAP: Record<InterviewDifficulty, string> = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

class DashboardService {
  private async getCompletedSessions(
    userId: string
  ): Promise<SessionWithQuestions[]> {
    return prisma.interviewSession.findMany({
      where: {
        userId,
        status: InterviewStatus.COMPLETED,
      },
      include: {
        questions: {
          include: {
            evaluation: true,
          },
        },
      },
      orderBy: {
        startedAt: "asc",
      },
    });
  }

  /**
   * Average of technical/communication/confidence scores across all
   * answered+evaluated questions in a session, scaled from 1-10 to 0-100.
   * Returns null when the session has no evaluated questions yet.
   */
  private computeSessionScore(session: SessionWithQuestions): number | null {
    const evaluated = session.questions.filter((q) => q.evaluation);

    if (evaluated.length === 0) return null;

    const total = evaluated.reduce((sum, q) => {
      const evalScore =
        (q.evaluation!.technicalScore +
          q.evaluation!.communicationScore +
          q.evaluation!.confidenceScore) /
        3;
      return sum + evalScore;
    }, 0);

    return (total / evaluated.length) * 10;
  }

  private computeSessionDurationMinutes(session: InterviewSession): number {
    if (!session.endedAt) return 0;
    const ms =
      new Date(session.endedAt).getTime() -
      new Date(session.startedAt).getTime();
    return Math.max(0, ms / 60000);
  }

  private computeCurrentStreak(sessions: SessionWithQuestions[]): number {
    const dateSet = new Set(
      sessions
        .filter((s) => s.endedAt)
        .map((s) => toDateKey(new Date(s.endedAt!)))
    );

    if (dateSet.size === 0) return 0;

    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    if (!dateSet.has(toDateKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
      if (!dateSet.has(toDateKey(cursor))) return 0;
    }

    let streak = 0;
    while (dateSet.has(toDateKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }

  async getStats(userId: string) {
    const sessions = await this.getCompletedSessions(userId);

    if (sessions.length === 0) {
      return {
        totalInterviews: 0,
        averageScore: 0,
        hoursPracticed: 0,
        currentStreak: 0,
        lastWeekAverage: 0,
        improvementPercentage: 0,
      };
    }

    const scored = sessions.map((session) => ({
      session,
      score: this.computeSessionScore(session),
      duration: this.computeSessionDurationMinutes(session),
    }));

    const totalMinutes = scored.reduce((sum, s) => sum + s.duration, 0);
    const hoursPracticed = Math.round((totalMinutes / 60) * 10) / 10;

    const validScores = scored
      .filter((s) => s.score !== null)
      .map((s) => s.score as number);

    const averageScore = validScores.length
      ? Math.round(
          validScores.reduce((a, b) => a + b, 0) / validScores.length
        )
      : 0;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const lastWeekScores = scored
      .filter(
        (s) =>
          s.score !== null &&
          s.session.endedAt &&
          new Date(s.session.endedAt) >= sevenDaysAgo
      )
      .map((s) => s.score as number);

    const prevWeekScores = scored
      .filter(
        (s) =>
          s.score !== null &&
          s.session.endedAt &&
          new Date(s.session.endedAt) >= fourteenDaysAgo &&
          new Date(s.session.endedAt) < sevenDaysAgo
      )
      .map((s) => s.score as number);

    const lastWeekAverage = lastWeekScores.length
      ? Math.round(
          lastWeekScores.reduce((a, b) => a + b, 0) / lastWeekScores.length
        )
      : 0;

    const prevWeekAverage = prevWeekScores.length
      ? prevWeekScores.reduce((a, b) => a + b, 0) / prevWeekScores.length
      : 0;

    const improvementPercentage =
      prevWeekAverage > 0
        ? Math.round(
            ((lastWeekAverage - prevWeekAverage) / prevWeekAverage) * 100
          )
        : 0;

    const currentStreak = this.computeCurrentStreak(sessions);

    return {
      totalInterviews: sessions.length,
      averageScore,
      hoursPracticed,
      currentStreak,
      lastWeekAverage,
      improvementPercentage,
    };
  }

  async getRecentSessions(userId: string) {
    const sessions = await prisma.interviewSession.findMany({
      where: {
        userId,
        status: InterviewStatus.COMPLETED,
      },
      orderBy: {
        endedAt: "desc",
      },
      take: 5,
    });

    return sessions.map((session) => ({
      id: session.id,
      config: {
        type: TYPE_MAP[session.type],
        role: session.title,
        difficulty: DIFFICULTY_MAP[session.difficulty],
        durationMinutes: Math.round(
          this.computeSessionDurationMinutes(session)
        ),
      },
      status: "completed" as const,
      startedAt: session.startedAt.toISOString(),
      completedAt: session.endedAt
        ? session.endedAt.toISOString()
        : undefined,
    }));
  }

  async getScoreTrend(userId: string) {
    const sessions = await this.getCompletedSessions(userId);

    return sessions
      .map((session) => ({
        rawDate: session.endedAt ?? session.startedAt,
        score: this.computeSessionScore(session),
      }))
      .filter((entry) => entry.score !== null)
      .slice(-10)
      .map((entry) => ({
        date: formatShortDate(new Date(entry.rawDate)),
        score: Math.round(entry.score as number),
      }));
  }

  async getAchievements(userId: string) {
    const sessions = await this.getCompletedSessions(userId);

    const scored = sessions.map((session) => ({
      session,
      score: this.computeSessionScore(session),
      duration: this.computeSessionDurationMinutes(session),
    }));

    const dateOf = (session: InterviewSession) =>
      (session.endedAt ?? session.startedAt).toISOString();

    const currentStreak = this.computeCurrentStreak(sessions);

    const highScoreEntry = scored.find(
      (s) => s.score !== null && (s.score as number) >= 90
    );

    const longSessionEntry = scored.find((s) => s.duration >= 60);

    return [
      {
        id: "first-interview",
        title: "First Interview",
        description: "Complete your first mock interview",
        unlocked: sessions.length >= 1,
        unlockedAt: sessions.length >= 1 ? dateOf(sessions[0]) : undefined,
      },
      {
        id: "three-interviews",
        title: "3 Interviews",
        description: "Complete 3 mock interviews",
        unlocked: sessions.length >= 3,
        unlockedAt: sessions.length >= 3 ? dateOf(sessions[2]) : undefined,
      },
      {
        id: "five-day-streak",
        title: "5-Day Streak",
        description: "Practice 5 days in a row",
        unlocked: currentStreak >= 5,
        unlockedAt: currentStreak >= 5 ? new Date().toISOString() : undefined,
      },
      {
        id: "ninety-plus-score",
        title: "90+ Score",
        description: "Score 90 or higher in an interview",
        unlocked: !!highScoreEntry,
        unlockedAt: highScoreEntry
          ? dateOf(highScoreEntry.session)
          : undefined,
      },
      {
        id: "sixty-minute-session",
        title: "60-Minute Session",
        description: "Complete a session lasting 60 minutes or more",
        unlocked: !!longSessionEntry,
        unlockedAt: longSessionEntry
          ? dateOf(longSessionEntry.session)
          : undefined,
      },
    ];
  }
}

export const dashboardService = new DashboardService();
