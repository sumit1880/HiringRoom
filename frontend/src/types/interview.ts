export type InterviewType =
  | "TECHNICAL"
  | "HR"
  | "DSA"
  | "SYSTEM_DESIGN";

export interface InterviewSession {
  id: string;
  title: string;
  type: InterviewType;
  status: string;
  startedAt: string;
}