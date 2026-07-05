import type { InterviewSession } from "../../types/interview";

export default function InterviewCard({
  interview,
}: {
  interview: InterviewSession;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">

        <div>

          <h3 className="font-semibold text-white">
            {interview.title}
          </h3>

          <p className="text-sm text-slate-400">
            {interview.type}
          </p>

        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs ${
            interview.status ===
            "COMPLETED"
              ? "bg-green-500/10 text-green-400"
              : "bg-blue-500/10 text-blue-400"
          }`}
        >
          {interview.status}
        </span>

      </div>
    </div>
  );
}