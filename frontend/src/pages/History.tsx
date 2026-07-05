import {
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import { useDashboard } from "../hooks/useDashboard";

export default function History() {
  const {
    interviews,
    isLoading,
  } = useDashboard();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] items-center justify-center text-white">
          Loading Interviews...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Hero */}

        <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-10">
          <h1 className="text-5xl font-bold text-white">
            Interview History
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            View your previous AI interview sessions and
            continue practicing.
          </p>
        </section>

        {/* List */}

        {interviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/50 py-20 text-center">
            <Clock
              size={60}
              className="mx-auto mb-6 text-blue-500"
            />

            <h2 className="text-3xl font-bold text-white">
              No Interviews Yet
            </h2>

            <p className="mt-4 text-slate-400">
              Your completed interview sessions will
              appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition-all duration-200 hover:border-blue-500/40 hover:bg-slate-900"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {interview.title}
                    </h2>

                    <p className="mt-2 text-slate-400">
                      {interview.type}
                    </p>
                  </div>

                  <div className="flex items-center gap-5">
                    {interview.status ===
                    "COMPLETED" ? (
                      <span className="flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-green-400">
                        <CheckCircle2 size={18} />
                        Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-2 text-yellow-400">
                        <Clock size={18} />
                        In Progress
                      </span>
                    )}

                    <Link
                      to={`/interview/${interview.id}`}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                      Open

                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}