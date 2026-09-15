import { AlertTriangle } from "lucide-react"

import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  tone = "neutral",
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  tone?: "neutral" | "destructive"
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <div className="flex items-start gap-3 p-4">
        {tone === "destructive" && (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive">
            <AlertTriangle className="size-5 text-white" />
          </div>
        )}
        <div className="space-y-1">
          <p className="text-base font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2 bg-muted p-4">
        <Button variant="outline" size="sm" className="px-5" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={tone === "destructive" ? "destructive" : "primary"}
          size="sm"
          className={
            tone === "destructive"
              ? "bg-destructive px-5 text-white hover:bg-destructive/90"
              : "px-5"
          }
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}

export { ConfirmationDialog }
