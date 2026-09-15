import type { FormEvent, ReactNode } from "react"

import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function FormField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[13px] font-medium text-foreground">{label}</p>
      {children}
    </div>
  )
}

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
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit()
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} width="w-[384px]">
      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="space-y-4">{children}</div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export { FormDialog, FormField }
