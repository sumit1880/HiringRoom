import type { ReactNode } from "react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute right-0 top-1/3 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full bg-purple-600/10 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_45%)]" />
      </div>

      <Sidebar />

      <div className="relative z-10 flex flex-1 flex-col">
        <Navbar />

        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}