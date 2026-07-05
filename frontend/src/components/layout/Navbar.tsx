import { Bell } from "lucide-react";

import { getUser } from "../../utils/auth";

export default function Navbar() {
  const user = getUser();

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-800/70 bg-slate-950/60 px-8 backdrop-blur-xl">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-blue-400">
          AI Interview Platform
        </p>

        <h2 className="mt-1 text-3xl font-bold text-white">
          Welcome back,
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {" "}
            {user?.name ?? "Candidate"}
          </span>
        </h2>

        <p className="mt-1 text-slate-400">
          Practice. Improve. Get Hired.
        </p>
      </div>

      <button className="group relative rounded-2xl border border-slate-700 bg-slate-900/70 p-3 transition-all duration-300 hover:scale-105 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20">
        <Bell
          size={20}
          className="text-slate-300 transition group-hover:text-blue-400"
        />

        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-blue-500" />
      </button>
    </header>
  );
}