import { motion } from "framer-motion";
import { FileSearch } from "lucide-react";

export default function EmptyResume() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 py-20 text-center"
    >
      <FileSearch
        className="mx-auto text-slate-500"
        size={72}
      />

      <h2 className="mt-6 text-2xl font-bold text-white">
        No Resume Uploaded
      </h2>

      <p className="mt-3 text-slate-400">
        Upload your first resume to start AI-powered
        interview practice.
      </p>
    </motion.div>
  );
}