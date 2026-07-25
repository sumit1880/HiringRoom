import { prisma } from '../config/prisma.js'

export const profileService = {
  async getSummary(userId: string) {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    })

    // Completed sessions with feedback
    const sessions = await prisma.interviewSession.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      include: {
        feedback: true,
      },
      orderBy: { endedAt: 'desc' },
    })

    const interviewsCompleted = sessions.length

    // Extract feedback records
    const feedbacks = sessions
      .map((s) => s.feedback)
      .filter((f): f is NonNullable<typeof f> => f !== null)

    const avg = (arr: number[]): number =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

    // Skill calculations
    const communication = Math.round(
      avg(feedbacks.map((f) => f.communicationScore))
    )

    const technicalDepth = Math.round(
      avg(feedbacks.map((f) => f.technicalScore))
    )

    // Since we don't have a separate problem-solving score,
    // derive it from technical performance
    const problemSolving = Math.round(
      avg(feedbacks.map((f) => f.technicalScore))
    )

    // System design only
    const systemDesign = Math.round(
      avg(
        sessions
          .filter((s) => s.type === 'SYSTEM_DESIGN')
          .map((s) => s.feedback?.technicalScore ?? 0)
      )
    )

    // Overall score
    const overallScore = Math.round(
      avg(feedbacks.map((f) => f.overallScore))
    )

    // Simple streak calculation
    const uniqueDays = new Set(
      sessions
        .filter((s) => s.endedAt)
        .map((s) => s.endedAt!.toISOString().split('T')[0])
    )

    let currentStreak = 0
    const cursor = new Date()

    while (true) {
      const key = cursor.toISOString().split('T')[0]

      if (uniqueDays.has(key)) {
        currentStreak++
        cursor.setDate(cursor.getDate() - 1)
      } else {
        break
      }
    }

    return {
      memberSince: user?.createdAt ?? new Date(),
      interviewsCompleted,
      averageScore: overallScore,
      currentStreak,
      skillProgress: {
        communication,
        technicalDepth,
        problemSolving,
        systemDesign,
      },
    }
  },
}