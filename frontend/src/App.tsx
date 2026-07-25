import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/hooks/useAuth"
import { AppShell } from "@/components/layout/AppShell"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { AnimatedOutlet } from "@/components/layout/AnimatedOutlet"
import { Orb } from "@/components/shared/Orb"

const LandingPage = lazy(() => import("@/features/landing/LandingPage").then((m) => ({ default: m.LandingPage })))
const LoginPage = lazy(() => import("@/features/auth/LoginPage").then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import("@/features/auth/RegisterPage").then((m) => ({ default: m.RegisterPage })))
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })))
const ResumePage = lazy(() => import("@/features/resume/ResumePage").then((m) => ({ default: m.ResumePage })))
const InterviewSetupPage = lazy(() => import("@/features/interview-setup/InterviewSetupPage").then((m) => ({ default: m.InterviewSetupPage })))
const LiveInterviewPage = lazy(() => import("@/features/live-interview/LiveInterviewPage").then((m) => ({ default: m.LiveInterviewPage })))
const FeedbackPage = lazy(() => import("@/features/feedback/FeedbackPage").then((m) => ({ default: m.FeedbackPage })))
const ProfilePage = lazy(() => import("@/features/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })))
const SettingsPage = lazy(() => import("@/features/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })))
const NotFoundPage = lazy(() => import("@/features/not-found/NotFoundPage").then((m) => ({ default: m.NotFoundPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
})

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Orb state="thinking" size={56} />
    </div>
  )
}

function AppLayout() {
  return (
    <AppShell>
      <AnimatedOutlet />
    </AppShell>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider delayDuration={200}>
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/resume" element={<ResumePage />} />
                    <Route path="/interview/setup" element={<InterviewSetupPage />} />
                    <Route path="/interview/live/:sessionId" element={<LiveInterviewPage />} />
                    <Route path="/interview/feedback/:sessionId" element={<FeedbackPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "hsl(240 6% 10%)",
                border: "1px solid hsl(220 20% 96% / 0.1)",
                color: "hsl(220 20% 96%)",
              },
            }}
          />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
