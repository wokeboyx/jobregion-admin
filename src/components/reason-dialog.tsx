import { useState } from "react"
import { CheckCircle2, ChevronDown } from "lucide-react"

import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function ReasonDialog({
  open,
  onClose,
  onSubmit,
  title,
  description,
  reasons,
  confirmLabel = "Reject",
  successTitle,
  successDescription,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (reason: string, details: string) => void
  title: string
  description: string
  reasons: string[]
  confirmLabel?: string
  successTitle: string
  successDescription: string
}) {
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [touched, setTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const reset = () => {
    setReason("")
    setDetails("")
    setTouched(false)
    setSubmitted(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = () => {
    if (!reason) {
      setTouched(true)
      return
    }
    onSubmit(reason, details)
    setSubmitted(true)
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      {submitted ? (
        <>
          <div className="flex items-start gap-3 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success">
              <CheckCircle2 className="size-5 text-white" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium text-foreground">{successTitle}</p>
              <p className="text-sm text-muted-foreground">{successDescription}</p>
            </div>
          </div>
          <div className="flex justify-end bg-muted p-4">
            <Button size="sm" className="px-5" onClick={handleClose}>
              Done
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-1 p-4 pb-0">
            <p className="text-base font-medium text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="space-y-4 p-4">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">Reason</p>
              <div className="relative">
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={`h-9 w-full appearance-none rounded-md border bg-card pl-2.5 pr-8 text-sm outline-none ${
                    touched && !reason
                      ? "border-destructive text-foreground"
                      : "border-border text-foreground"
                  }`}
                >
                  <option value="">Select a reason</option>
                  {reasons.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              {touched && !reason && (
                <p className="text-xs text-destructive">Select a reason to continue.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">Additional details</p>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Add any additional context (optional)"
                className="h-[72px] w-full resize-none rounded-md border border-border bg-card p-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-brand-cta"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 bg-muted p-4">
            <Button variant="outline" size="sm" className="px-5" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="bg-destructive px-5 text-white hover:bg-destructive/90"
              onClick={handleSubmit}
            >
              {confirmLabel}
            </Button>
          </div>
        </>
      )}
    </Dialog>
  )
}

export { ReasonDialog }
