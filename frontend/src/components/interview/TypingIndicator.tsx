import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="h-10 w-10 rounded-full bg-blue-600" />

      <div className="rounded-2xl bg-slate-800 px-5 py-4">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                delay: i * 0.2,
              }}
              className="h-2 w-2 rounded-full bg-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
}