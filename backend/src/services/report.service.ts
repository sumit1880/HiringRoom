import PDFDocument from "pdfkit";
import { Response } from "express";
import { interviewService } from "./interview.service.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Renders a downloadable PDF summary of a completed (or in-progress)
 * interview session — overall scores, per-question breakdown, and
 * feedback. Streams directly to the response instead of buffering the
 * whole PDF in memory first.
 */
export async function streamInterviewReportPdf(
  sessionId: string,
  userId: string,
  res: Response
): Promise<void> {
  const session = await interviewService.getSessionById(sessionId, userId);

  const answered = session.questions.filter((q: any) => q.evaluation);

  if (answered.length === 0) {
    throw new ApiError(400, "This interview has no answered questions yet.");
  }

  const avg = (field: "technicalScore" | "communicationScore" | "confidenceScore") =>
    answered.reduce((sum: number, q: any) => sum + (q.evaluation?.[field] ?? 0), 0) /
    answered.length;

  const technicalAvg = avg("technicalScore");
  const communicationAvg = avg("communicationScore");
  const confidenceAvg = avg("confidenceScore");
  const overall = (technicalAvg + communicationAvg + confidenceAvg) / 3;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="interview-report-${sessionId}.pdf"`
  );

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(20).text("Interview Report", { align: "left" });
  doc.moveDown(0.3);
  doc.fontSize(11).fillColor("#555").text(session.title);
  doc.fillColor("#000");
  doc.moveDown(1);

  doc.fontSize(13).text("Overall Scores");
  doc.moveDown(0.3);
  doc.fontSize(10);
  doc.text(`Technical:      ${technicalAvg.toFixed(1)} / 10`);
  doc.text(`Communication:  ${communicationAvg.toFixed(1)} / 10`);
  doc.text(`Confidence:     ${confidenceAvg.toFixed(1)} / 10`);
  doc.text(`Overall:        ${overall.toFixed(1)} / 10`);
  doc.moveDown(1.2);

  doc.fontSize(13).text("Question-by-Question Breakdown");
  doc.moveDown(0.5);

  for (const q of answered as any[]) {
    doc
      .fontSize(11)
      .fillColor("#000")
      .text(`Q${q.questionNumber}. ${q.question}`, { continued: false });

    doc.moveDown(0.2);
    doc.fontSize(9).fillColor("#333").text(`Your answer: ${q.answer ?? "—"}`);
    doc.moveDown(0.2);

    doc
      .fontSize(9)
      .fillColor("#555")
      .text(
        `Scores — Technical: ${q.evaluation.technicalScore}/10, Communication: ${q.evaluation.communicationScore}/10, Confidence: ${q.evaluation.confidenceScore}/10`
      );

    if (q.evaluation.strengths?.length) {
      doc.fillColor("#0a7d2c").text(`Strengths: ${q.evaluation.strengths.join(", ")}`);
    }
    if (q.evaluation.weaknesses?.length) {
      doc.fillColor("#a3241c").text(`Weaknesses: ${q.evaluation.weaknesses.join(", ")}`);
    }
    doc.fillColor("#333").text(`Feedback: ${q.evaluation.feedback}`);

    doc.fillColor("#000");
    doc.moveDown(0.8);
    doc
      .strokeColor("#ddd")
      .moveTo(doc.x, doc.y)
      .lineTo(545, doc.y)
      .stroke();
    doc.moveDown(0.8);
  }

  doc.end();
}
