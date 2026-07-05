import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Sparkles } from "lucide-react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-[-150px] right-[-100px] h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      {/* Left Side */}
      <div className="relative hidden w-1/2 items-center justify-center lg:flex">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-lg px-10"
        >
          <div className="mb-8 flex items-center gap-3">
            <BrainCircuit size={42} className="text-blue-500" />
            <h1 className="text-4xl font-bold text-white">
              AI Interview Coach
            </h1>
          </div>

          <h2 className="mb-5 text-5xl font-bold leading-tight text-white">
            Crack Your
            <span className="text-blue-500"> Dream Job.</span>
          </h2>

          <p className="mb-10 text-lg leading-8 text-slate-400">
            Practice AI-powered technical interviews with personalized resume
            analysis, real-time evaluation, and detailed feedback.
          </p>

          <div className="space-y-5">
            {[
              "Resume-based interview questions",
              "AI evaluation after every answer",
              "Technical & communication scoring",
              "Interview history & analytics",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Sparkles className="text-blue-400" size={20} />
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Side */}
      <div className="relative flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl"
        >
          <h2 className="mb-2 text-3xl font-bold text-white">
            {title}
          </h2>

          <p className="mb-8 text-slate-400">
            {subtitle}
          </p>

          {children}
        </motion.div>
      </div>
    </div>
  );
}