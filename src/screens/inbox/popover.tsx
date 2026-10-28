import { useEffect, useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * A small floating panel opened by a trigger button (saved replies, attach a link). Opens upwards by default since it
 * sits in the composer at the bottom of the thread. Closes on outside click or Escape.
 */
function Popover({
  trigger,
  children,
  label,
  className,
  side = "top",
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode
  children: (close: () => void) => ReactNode
  label: string
  className?: string
  side?: "top" | "bottom"
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          role="dialog"
          aria-label={label}
          className={cn(
            "absolute left-0 z-30 w-80 rounded-xl bg-card py-2 shadow-dropdown animate-[rise_.15s_ease-out]",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2",
            className,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

export { Popover }
