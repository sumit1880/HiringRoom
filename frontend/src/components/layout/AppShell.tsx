import type { ReactNode } from "react"
import { AppSidebar } from "./AppSidebar"
import { MobileTabBar } from "./MobileTabBar"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppSidebar />
      <MobileTabBar />
      <main className="pb-20 pl-0 lg:pb-0 lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">{children}</div>
      </main>
    </div>
  )
}
