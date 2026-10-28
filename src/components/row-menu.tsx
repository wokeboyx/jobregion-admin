import { useEffect, useRef, useState, type ReactNode } from "react"
import { MoreHorizontal } from "lucide-react"

import { useMenuAlign } from "@/lib/use-menu-align"

export interface RowMenuItem {
  label: string
  onSelect: () => void
  destructive?: boolean
}

function RowMenu({ items, children }: { items: RowMenuItem[]; children?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { menuRef, side } = useMenuAlign<HTMLDivElement>(open, "right")

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-label="More actions"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        className={children ? undefined : "flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"}
      >
        {children ?? <MoreHorizontal className="size-4" />}
      </button>
      {open && (
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          className={`absolute ${side === "right" ? "right-0" : "left-0"} top-full z-20 mt-1 w-48 rounded-lg bg-card py-2 shadow-dropdown`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.onSelect()
                setOpen(false)
              }}
              className={`block w-full px-4 py-2 text-left text-sm font-medium hover:bg-muted ${
                item.destructive ? "text-destructive" : "text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export { RowMenu }
