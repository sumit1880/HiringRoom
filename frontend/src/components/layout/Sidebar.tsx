import {
  BrainCircuit,
  LayoutDashboard,
  FileText,
  Mic,
  History,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import NavItem from "./NavItem";
import { getUser, logout } from "../../utils/auth";

export default function Sidebar() {
  const navigate = useNavigate();

  const user = getUser();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="sticky top-0 flex h-screen w-72 flex-col border-r border-slate-800/70 bg-slate-900/60 backdrop-blur-2xl">
      {/* Logo */}
      <div className="border-b border-slate-800/70 px-7 py-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-600/30">
            <BrainCircuit
              size={30}
              className="text-white"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              AI Coach
            </h1>

            <p className="text-sm text-slate-400">
              Smart Interview Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-2 px-5 py-6">
        <NavItem
          to="/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
        />

        <NavItem
          to="/resume"
          icon={FileText}
          label="Resume"
        />

        <NavItem
          to="/interview/:id"
          icon={Mic}
          label="Interview"
        />

        <NavItem
          to="/history"
          icon={History}
          label="History"
        />
      </div>

      {/* User */}
      <div className="border-t border-slate-800/70 p-5">
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-800/50 p-4">
          <p className="truncate font-semibold text-white">
            {user?.name ?? "User"}
          </p>

          <p className="mt-1 truncate text-sm text-slate-400">
            {user?.email}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}