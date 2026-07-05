import { motion } from "framer-motion";
import {
  FileText,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import type { Resume } from "../../types/dashboard";

interface Props {
  resume: Resume;
  onDelete: () => void;
}

export default function ResumeCard({
  resume,
  onDelete,
}: Props) {
  const uploaded = new Date(
    resume.uploadedAt
  ).toLocaleDateString();

  const completed =
    resume.embeddingStatus === "COMPLETED";

  return (
    <motion.div
      layout
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      className="group rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-6 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="rounded-2xl bg-blue-500/10 p-4">
            <FileText
              className="text-blue-500"
              size={32}
            />
          </div>

          <div>
            <h3 className="max-w-[220px] truncate text-lg font-semibold text-white">
              {resume.originalName}
            </h3>

            <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
              <Calendar size={15} />
              {uploaded}
            </div>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-500"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            completed
              ? "bg-green-500/10 text-green-400"
              : "bg-yellow-500/10 text-yellow-400"
          }`}
        >
          {completed ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 size={14} />
              Ready
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Clock3 size={14} />
              Processing
            </span>
          )}
        </div>

        <span className="text-xs text-slate-500">
          PDF
        </span>
      </div>
    </motion.div>
  );
}