export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Resume {
  id: string;
  originalName: string;
  mimeType: string;
  fileUrl: string;
  extractedText?: string;
  embeddingStatus: string;
  uploadedAt: string;
}

export interface InterviewSession {
  id: string;
  title: string;
  type: string;
  status: string;
  startedAt: string;
  endedAt?: string;
}