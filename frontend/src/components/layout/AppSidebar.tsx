import { NavLink, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  LayoutDashboard, FileText, Mic, User as UserIcon, Settings, LogOut, Sparkles, ChevronRight,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resume", label: "Resume", icon: FileText },
  { to: "/interview/setup", label: "New interview", icon: Mic },
  { to: "/profile", label: "Profile", icon: UserIcon },
  { to: "/settings", label: "Settings", icon: Settings },
]

export function AppSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = (user?.name ?? "A R").split(" ").map((n) => n[0]).join("").slice(0, 2)

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-background lg:flex">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-4 w-4 text-background" />
        </div>
        <span className="font-display text-lg font-semibold">Aptitude</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === "/dashboard"}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 3 }}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <item.icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{item.label}</span>
                {isActive && <ChevronRight className="relative z-10 ml-auto h-3.5 w-3.5 opacity-60" />}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar className="h-9 w-9 border border-white/10">
            <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name ?? "Alex Rivera"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email ?? "alex@example.com"}</p>
          </div>
          <button
            aria-label="Log out"
            onClick={async () => { await logout(); navigate("/login") }}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
