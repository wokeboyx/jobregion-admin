import { useId, type FormEvent, type ReactNode } from "react"

import { Dialog, DialogTextButton } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {children}
    </div>
  )
}

/** A focused task in an Airbnb modal: ✕ and title on top, the fields, then Cancel and one black button. */
function FormDialog({
  open,
  onClose,
  onSubmit,
  title,
  description,
  submitLabel,
  children,
}: {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  title: string
  description: string
  submitLabel: string
  children: ReactNode
}) {
  const formId = useId()
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <DialogTextButton onClick={onClose}>Cancel</DialogTextButton>
          <Button type="submit" form={formId} size="lg">
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-6 p-6">
        <p className="text-body1 leading-6 text-muted-foreground">{description}</p>
        <div className="space-y-5">{children}</div>
      </form>
    </Dialog>
  )
}

export { FormField, FormDialog }
