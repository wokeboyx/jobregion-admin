import { useEffect, useRef, useState, type ReactNode } from "react"
import { MoreHorizontal } from "lucide-react"

export interface RowMenuItem {
  label: string
  onSelect: () => void
  destructive?: boolean
}

function RowMenu({ items, children }: { items: RowMenuItem[]; children?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full z-20 mt-1 w-44 rounded-md border border-border bg-card py-1 shadow-[0px_10px_15px_rgba(0,0,0,0.08)]"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.onSelect()
                setOpen(false)
              }}
              className={`block w-full px-3 py-1.5 text-left text-[13px] font-medium hover:bg-muted ${
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
