import { prisma } from '../config/prisma.js'

export const profileService = {
  async getSummary(userId: string) {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    })

    // Completed sessions with feedback & question evaluations
    const sessions = await prisma.interviewSession.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      include: {
        questions: {
          include: {
            evaluation: true,
          },
        },
      },
      orderBy: { endedAt: 'desc' },
    })

    const interviewsCompleted = sessions.length

    // Extract feedback records or derive from evaluated questions
    const feedbacks = sessions
      .map((s) => {
        const answered = s.questions.filter((q) => q.evaluation)
        if (answered.length === 0) return null

        const techAvg =
          (answered.reduce(
            (sum, q) => sum + (q.evaluation?.technicalScore || 0),
            0
          ) /
            answered.length) *
          10
        const commAvg =
          (answered.reduce(
            (sum, q) => sum + (q.evaluation?.communicationScore || 0),
            0
          ) /
            answered.length) *
          10
        const confAvg =
          (answered.reduce(
            (sum, q) => sum + (q.evaluation?.confidenceScore || 0),
            0
          ) /
            answered.length) *
          10

        return {
          communicationScore: commAvg,
          technicalScore: techAvg,
          overallScore: (techAvg + commAvg + confAvg) / 3,
        }
      })
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

    // System design skill
    const systemDesignSessions = sessions.filter(
      (s) => s.type === 'SYSTEM_DESIGN'
    )
    const systemDesign = Math.round(
      systemDesignSessions.length > 0
        ? avg(
            systemDesignSessions
              .map((s) => {
                const answered = s.questions.filter((q) => q.evaluation)
                if (answered.length === 0) return 0
                return (
                  (answered.reduce(
                    (sum, q) => sum + (q.evaluation?.technicalScore || 0),
                    0
                  ) /
                    answered.length) *
                  10
                )
              })
              .filter((score) => score > 0)
          )
        : technicalDepth
    )

    // Overall score
    const overallScore = Math.round(avg(feedbacks.map((f) => f.overallScore)))

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