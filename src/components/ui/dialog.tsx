import { useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

function Dialog({
  open,
  onClose,
  children,
  width = "w-96",
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  width?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "flex flex-col overflow-hidden rounded-lg bg-card shadow-[0px_10px_15px_rgba(0,0,0,0.12)]",
          width,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

export { Dialog }
