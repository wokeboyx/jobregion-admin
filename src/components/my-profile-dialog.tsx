import { useState } from "react"

import { Dialog } from "@/components/ui/dialog"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StatusPill, OutlineBadge } from "@/components/ui/status-pill"
import { admins, currentAdminId } from "@/lib/mock-data"

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

  return (
    <Dialog open={open} onClose={handleClose} width="w-[420px]">
      <div className="p-5">
        <div className="mb-5 flex items-center gap-3">
          <Avatar name={admin.name} className="size-11 shrink-0 text-sm" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-foreground">{admin.name}</p>
              {admin.roleVariant === "outline" ? (
                <OutlineBadge label={admin.role} />
              ) : (
                <StatusPill status={admin.roleVariant} label={admin.role} />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{admin.email}</p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <p>Added {admin.dateAdded}</p>
          <p>Last active {admin.lastActive}</p>
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-sm font-semibold text-foreground">Change password</p>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-brand-cta"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-brand-cta"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-brand-cta"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
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
              }}
            >
              Update password
            </Button>
            {saved && <span className="text-xs text-muted-foreground">Password updated.</span>}
          </div>
        </div>
      </div>
    </Dialog>
  )
}

export { MyProfileDialog }
