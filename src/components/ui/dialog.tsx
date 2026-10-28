import { useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Airbnb's modal: a round ✕ on the left, the title centred in a header with a hairline under it, the body, and an
 * optional footer with a text link on the left ("Cancel", "Clear all") and one black button on the right.
 * Pass `title` to get the header; leave it out for a bare panel.
 */
function Dialog({
  open,
  onClose,
  children,
  title,
  footer,
  width = "w-[568px]",
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: ReactNode
  footer?: ReactNode
  width?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = overflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-[fadeIn_.15s_ease-out]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "flex max-h-[90vh] max-w-full flex-col overflow-hidden rounded-xl bg-card shadow-[0_8px_28px_rgb(0_0_0/0.28)] animate-[rise_.25s_cubic-bezier(.2,.8,.2,1)]",
          width,
        )}
      >
        {title !== undefined && (
          <div className="relative flex h-16 shrink-0 items-center justify-center border-b border-border px-14">
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute left-4 flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <X className="size-4" strokeWidth={2.5} />
            </button>
            <p className="truncate text-base font-semibold text-foreground">{title}</p>
          </div>
        )}
        <div className={cn("min-h-0 flex-1", title !== undefined && "overflow-y-auto")}>{children}</div>
        {footer && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-6 py-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  )
}

/** The underlined text button Airbnb puts on the left of a modal footer. */
function DialogTextButton({ children, onClick, className }: { children: ReactNode; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("-mx-2 rounded-md px-2 py-1.5 text-body1 font-semibold text-foreground underline underline-offset-2 hover:bg-muted", className)}
    >
      {children}
    </button>
  )
}

export { Dialog, DialogTextButton }
