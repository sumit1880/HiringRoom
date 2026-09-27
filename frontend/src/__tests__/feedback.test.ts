import { describe, it, expect } from "vitest"
import { toInterviewFeedback, splitLines } from "../services/feedbackService"

describe("Feedback Service Transformation", () => {
  it("should split multiline strings into clean trimmed arrays", () => {
    const raw = "Solid algorithms knowledge\n\n  Good communication  \nClean code syntax\n"
    const lines = splitLines(raw)

    expect(lines).toEqual([
      "Solid algorithms knowledge",
      "Good communication",
      "Clean code syntax",
    ])
  })

  it("should transform backend feedback row to frontend InterviewFeedback format", () => {
    const backendData = {
      sessionId: "session-xyz-123",
      technicalScore: 8.5,
      communicationScore: 9.0,
      overallScore: 88,
      strengths: "Clear explanations\nStructured approach",
      weaknesses: "Could explain edge cases sooner",
      suggestions: "Practice time complexity tradeoffs",
    }

    const feedback = toInterviewFeedback(backendData)

    expect(feedback.sessionId).toBe("session-xyz-123")
    expect(feedback.overallScore).toBe(88)
    expect(feedback.categories).toEqual([
      { label: "Technical", score: 85 },
      { label: "Communication", score: 90 },
    ])
    expect(feedback.strengths).toEqual([
      "Clear explanations",
      "Structured approach",
    ])
    expect(feedback.weaknesses).toEqual(["Could explain edge cases sooner"])
    expect(feedback.recommendations).toEqual([
      "Practice time complexity tradeoffs",
    ])
  })
})
