import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({
  children,
  className,
}: CardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
      }}
      className={cn(
        "rounded-3xl",
        "border border-slate-700",
        "bg-slate-800/90",
        "p-8",
        "shadow-2xl backdrop-blur",
        className
      )}
    >
      {children}
    </motion.div>
  );
}