import { FileText } from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";

import ResumeUploader from "../components/resume/ResumeUploader";
import ResumeCard from "../components/resume/ResumeCard";
import EmptyResume from "../components/resume/EmptyResume";
import ResumeSkeleton from "../components/resume/ResumeSkeleton";

import { useResume } from "../hooks/useResume";
import { useDeleteResume } from "../mutations/useDeleteResume";

export default function Resume() {
  const { resumes, isLoading } = useResume();

  const deleteMutation = useDeleteResume();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Hero */}

        <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
                AI RESUME
              </p>

              <h1 className="mt-4 text-5xl font-bold text-white">
                Resume Center
              </h1>

              <p className="mt-5 text-lg text-slate-300">
                Upload your resume once and let AI
                personalize every interview with your
                skills, projects and experience.
              </p>
            </div>

            <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-xl shadow-blue-500/30">
              <FileText
                size={50}
                className="text-white"
              />
            </div>
          </div>
        </section>

        {/* Upload */}

        <ResumeUploader />

        {/* Uploaded Resumes */}

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Uploaded Resumes
              </h2>

              <p className="text-slate-400">
                Manage your uploaded resumes.
              </p>
            </div>

            <span className="rounded-full bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400">
              {resumes.length} Resume
              {resumes.length !== 1 ? "s" : ""}
            </span>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map(
                (_, index) => (
                  <ResumeSkeleton key={index} />
                )
              )}
            </div>
          ) : resumes.length === 0 ? (
            <EmptyResume />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {resumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onDelete={() =>
                    deleteMutation.mutate(
                      resume.id
                    )
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}