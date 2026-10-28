import { useState } from "react"
import { CheckCircle2 } from "lucide-react"

import { Dialog, DialogTextButton } from "@/components/ui/dialog"
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
    <Dialog
      open={open}
      onClose={handleClose}
      title={submitted ? undefined : title}
      footer={
        submitted ? (
          <Button size="lg" className="ml-auto" onClick={handleClose}>
            Got it
          </Button>
        ) : (
          <>
            <DialogTextButton onClick={handleClose}>Cancel</DialogTextButton>
            <Button variant="danger" size="lg" onClick={handleSubmit}>
              {confirmLabel}
            </Button>
          </>
        )
      }
    >
      {submitted ? (
        <div className="flex flex-col items-center px-8 pb-4 pt-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-success/12">
            <CheckCircle2 className="size-7 text-success" />
          </div>
          <h2 className="heading-section mt-5">{successTitle}</h2>
          <p className="mt-2 text-body1 leading-6 text-muted-foreground">{successDescription}</p>
        </div>
      ) : (
        <>
          <p className="px-6 pt-6 text-body1 leading-6 text-muted-foreground">{description}</p>
          <div className="space-y-5 p-6">
            {/* Reasons as a radio list, like the web app's Report sheet. */}
            <fieldset>
              <legend className="mb-1 text-base font-semibold text-foreground">Why?</legend>
              <div className="divide-y divide-border">
                {reasons.map((r) => (
                  <label key={r} className="flex cursor-pointer items-center justify-between gap-4 py-4 text-body1 text-foreground">
                    {r}
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="size-6 shrink-0 accent-foreground"
                    />
                  </label>
                ))}
              </div>
              {touched && !reason && <p className="mt-1 text-sm text-destructive">Choose a reason to continue.</p>}
            </fieldset>
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-foreground">Anything else? <span className="font-normal text-muted-foreground">(optional)</span></p>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Add context the person will see in the email"
                className="h-28 w-full resize-none rounded-md border border-input bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
              />
            </div>
          </div>
        </>
      )}
    </Dialog>
  )
}

export { ReasonDialog }
