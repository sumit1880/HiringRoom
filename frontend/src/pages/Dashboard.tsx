import DashboardLayout from "../layouts/DashboardLayout";

import StatCard from "../components/dashboard/StatCard";
import InterviewCard from "../components/dashboard/InterviewCard";

import { useDashboard } from "../hooks/useDashboard";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  Mic,
} from "lucide-react";

export default function Dashboard() {
  const {
    user,
    resumes,
    interviews,
    isLoading,
  } = useDashboard();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] items-center justify-center text-white">
          Loading Dashboard...
        </div>
      </DashboardLayout>
    );
  }

  const completed = interviews.filter(
    (i) => i.status === "COMPLETED"
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero */}

        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
                AI INTERVIEW COACH
              </p>

              <h1 className="mt-4 text-5xl font-extrabold leading-tight text-white">
                Welcome back,
                <span className="text-blue-400">
                  {" "}
                  {user?.name ?? "Candidate"}
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-lg text-slate-300">
                Upload your resume, practice with AI,
                receive instant feedback and improve
                your interview performance.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/resume"
                  className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:scale-105 hover:bg-blue-700"
                >
                  <FileText size={20} />
                  Upload Resume
                </Link>

                <Link
  to="/new-interview"
  className="flex items-center gap-2 rounded-2xl border border-slate-700 px-6 py-4 text-white transition hover:border-blue-500 hover:bg-slate-800"
>
  <Mic size={20} />
  My Interviews
</Link>
              </div>
            </div>

            <div className="grid w-full max-w-md gap-5">
              <StatCard
                title="Resumes"
                value={resumes.length}
              />

              <StatCard
                title="Interviews"
                value={interviews.length}
              />

              <StatCard
                title="Completed"
                value={completed}
              />
            </div>
          </div>
        </section>

        {/* Recent Interviews */}

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Recent Interviews
              </h2>

              <p className="text-slate-400">
                Continue your interview journey.
              </p>
            </div>

            <ArrowRight className="text-slate-500" />
          </div>

          {interviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 py-16 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800">
                <Mic
                  size={36}
                  className="text-blue-400"
                />
              </div>

              <h3 className="text-2xl font-semibold text-white">
                No Interviews Yet
              </h3>

              <p className="mt-3 text-slate-400">
                Start your first AI interview and
                receive instant feedback.
              </p>

            <Link
  to="/history"
  className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
>
  Go to Interviews
</Link>
            </div>
          ) : (
            <div className="space-y-5">
              {interviews
                .slice(0, 5)
                .map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                  />
                ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}