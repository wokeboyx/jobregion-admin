import { useState } from "react"
import { CalendarDays, Clock, Mail, ShieldCheck } from "lucide-react"

import { Dialog, DialogTextButton } from "@/components/ui/dialog"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { admins, currentAdminId } from "@/lib/mock-data"

const INPUT_CLASS =
  "h-12 w-full rounded-md border border-input bg-card px-4 text-body1 text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"

function MyProfileDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const admin = admins.find((a) => a.id === currentAdminId)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  if (!admin) return null

  const handleClose = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setSaved(false)
    setError("")
    onClose()
  }

  const updatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Fill in all three fields.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.")
      return
    }
    setError("")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const facts = [
    { icon: Mail, text: admin.email },
    { icon: ShieldCheck, text: admin.role },
    { icon: CalendarDays, text: `Added ${admin.dateAdded}` },
    { icon: Clock, text: `Last active ${admin.lastActive}` },
  ]

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Your profile"
      footer={
        <>
          <DialogTextButton onClick={handleClose}>Cancel</DialogTextButton>
          <Button size="lg" onClick={updatePassword}>
            Update password
          </Button>
        </>
      }
    >
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Avatar name={admin.name} className="size-16 text-lg" />
          <div className="min-w-0">
            <p className="heading-section truncate">{admin.name}</p>
            <p className="text-body1 text-muted-foreground">{admin.role}</p>
          </div>
        </div>

        <ul className="mt-6 space-y-3 border-t border-border pt-6">
          {facts.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-body1 text-foreground">
              <Icon className="size-5 shrink-0" strokeWidth={1.5} />
              <span className="truncate">{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-3 border-t border-border pt-6">
          <p className="heading-card">Change password</p>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            aria-label="Current password"
            className={INPUT_CLASS}
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            aria-label="New password"
            className={INPUT_CLASS}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            aria-label="Confirm new password"
            className={INPUT_CLASS}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {saved && <p className="text-sm text-success">Password updated.</p>}
        </div>
      </div>
    </Dialog>
  )
}

export { MyProfileDialog }
