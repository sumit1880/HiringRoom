import api from "./axios";
import type { Resume } from "../types/dashboard";

export async function getResumes(): Promise<Resume[]> {
  const response = await api.get("/resumes");

  return response.data.data;
}

export async function uploadResume(file: File) {
  const formData = new FormData();

  formData.append("resume", file);

  const response = await api.post(
    "/resumes/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.data;
}

export async function deleteResume(id: string) {
  await api.delete(`/resumes/${id}`);
}