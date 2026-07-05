import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

interface Props {
  role: "ai" | "user";
  text: string;
}

export default function ChatBubble({
  role,
  text,
}: Props) {
  const ai = role === "ai";

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
      className={`flex gap-4 ${
        ai ? "" : "justify-end"
      }`}
    >
      {ai && (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600">
          <Bot size={20} />
        </div>
      )}

      <div
        className={`max-w-xl rounded-3xl px-5 py-4 ${
          ai
            ? "bg-slate-800 text-white"
            : "bg-blue-600 text-white"
        }`}
      >
        {text}
      </div>

      {!ai && (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-700">
          <User size={20} />
        </div>
      )}
    </motion.div>
  );
}