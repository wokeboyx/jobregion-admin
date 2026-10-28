import { Dialog, DialogTextButton } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

/** Airbnb-style confirm: a short modal with the question as the header, one line of context, Cancel link and one button. */
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
    <Dialog
      open={open}
      onClose={onClose}
      width="w-[440px]"
      footer={
        <>
          <DialogTextButton onClick={onClose}>{cancelLabel}</DialogTextButton>
          <Button
            variant={tone === "destructive" ? "danger" : "primary"}
            size="lg"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="px-6 pb-2 pt-7">
        <h2 className="heading-section">{title}</h2>
        <p className="mt-2 text-body1 leading-6 text-muted-foreground">{description}</p>
      </div>
    </Dialog>
  )
}

export { ConfirmationDialog }
