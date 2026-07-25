import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { LogOut, AlertTriangle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export function SettingsPage() {
  const { user, logout, deleteAccount } = useAuth()
  const navigate = useNavigate()

  const [signingOut, setSigningOut] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await logout()
      navigate("/login")
    } catch {
      toast.error("Couldn't sign out. Try again.")
      setSigningOut(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await deleteAccount()
      toast.success("Your account has been deleted")
      navigate("/login")
    } catch {
      toast.error("Couldn't delete your account. Try again.")
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Your account, at a glance.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Signed in with Google — managed by your Google account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatarUrl} alt={user?.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={handleSignOut} loading={signingOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Danger zone
          </CardTitle>
          <CardDescription>
            Permanently deletes your account, resumes, and all interview history. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="confirm-delete" className="text-sm">
            Type <span className="font-mono font-semibold">delete my account</span> to confirm
          </Label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete my account"
            className="mt-1.5"
          />
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            variant="destructive"
            disabled={confirmText.trim().toLowerCase() !== "delete my account"}
            loading={deleting}
            onClick={handleDeleteAccount}
          >
            Delete my account
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
