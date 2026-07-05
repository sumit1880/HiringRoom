import axios from "./axios";
import type {
  InterviewSession,
  InterviewType,
} from "../types/interview";

export async function getInterviews(): Promise<
  InterviewSession[]
> {
  const res = await axios.get("/interviews");
  return res.data.data;
}

export async function createInterview(data: {
  title: string;
  type: InterviewType;
}): Promise<InterviewSession> {
  const res = await axios.post(
    "/interviews",
    data
  );

  return res.data.data;
}

export async function startInterview(
  sessionId: string
) {
  const res = await axios.post(
    `/interviews/${sessionId}/start`
  );

  return res.data.data;
}

export async function answerInterview(
  sessionId: string,
  answer: string
) {
  const res = await axios.post(
    `/interviews/${sessionId}/answer`,
    {
      answer,
    }
  );

  return res.data.data;
}