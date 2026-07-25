import { NavLink } from "react-router-dom"
import { LayoutDashboard, FileText, Mic, User as UserIcon, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/resume", label: "Resume", icon: FileText },
  { to: "/interview/setup", label: "Interview", icon: Mic },
  { to: "/profile", label: "Profile", icon: UserIcon },
  { to: "/settings", label: "Settings", icon: Settings },
]

export function MobileTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-background/95 px-2 py-2 backdrop-blur-sm lg:hidden">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === "/dashboard"}>
          {({ isActive }) => (
            <div className={cn("flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px]", isActive ? "text-primary" : "text-muted-foreground")}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
