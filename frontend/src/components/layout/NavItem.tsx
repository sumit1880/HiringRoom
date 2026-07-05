import type { LucideIcon } from "lucide-react";

import { NavLink } from "react-router-dom";

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
}

export default function NavItem({
  to,
  icon: Icon,
  label,
}: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
            : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
        }`
      }
    >
      <Icon
        size={22}
        className="transition-transform duration-200 group-hover:scale-110"
      />

      <span className="font-medium">{label}</span>
    </NavLink>
  );
}