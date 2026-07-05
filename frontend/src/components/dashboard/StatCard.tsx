import { motion } from "framer-motion";

interface Props {
  title: string;
  value: number;
}

export default function StatCard({
  title,
  value,
}: Props) {
  return (
    <motion.div
      whileHover={{
        y: -6,
      }}
      className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
    >
      <p className="text-slate-400">
        {title}
      </p>

      <h2 className="mt-3 text-4xl font-bold text-white">
        {value}
      </h2>
    </motion.div>
  );
}