import { useEffect, useRef, useState } from "react"
import { Calendar, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

export type DatePreset = "7d" | "14d" | "30d" | "90d" | "this_month" | "last_month" | "custom"

export interface CustomRange {
  start: string
  end: string
}

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "14d", label: "Last 14 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "this_month", label: "This month" },
  { key: "last_month", label: "Last month" },
]

function formatRangeLabel(preset: DatePreset, customRange: CustomRange | null) {
  if (preset === "custom" && customRange) {
    return `${customRange.start} → ${customRange.end}`
  }
  return PRESETS.find((p) => p.key === preset)?.label ?? "Select range"
}

function DateRangeDropdown({
  preset,
  customRange,
  onChange,
}: {
  preset: DatePreset
  customRange: CustomRange | null
  onChange: (preset: DatePreset, customRange?: CustomRange) => void
}) {
  const [open, setOpen] = useState(false)
  const [draftStart, setDraftStart] = useState(customRange?.start ?? "")
  const [draftEnd, setDraftEnd] = useState(customRange?.end ?? "")
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
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 whitespace-nowrap rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground outline-none focus-visible:border-brand-cta"
      >
        <Calendar className="size-4 text-muted-foreground" />
        {formatRangeLabel(preset, customRange)}
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-md border border-border bg-card p-2 shadow-[0px_10px_15px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  onChange(p.key)
                  setOpen(false)
                }}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-muted",
                  preset === p.key ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-1 space-y-1.5 border-t border-border px-2.5 pt-2">
            <p className={cn("text-sm font-medium", preset === "custom" ? "text-foreground" : "text-muted-foreground")}>
              Custom range
            </p>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={draftStart}
                onChange={(e) => setDraftStart(e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-card px-1.5 text-xs text-foreground outline-none focus-visible:border-brand-cta"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <input
                type="date"
                value={draftEnd}
                onChange={(e) => setDraftEnd(e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-card px-1.5 text-xs text-foreground outline-none focus-visible:border-brand-cta"
              />
            </div>
            <button
              type="button"
              disabled={!draftStart || !draftEnd}
              onClick={() => {
                onChange("custom", { start: draftStart, end: draftEnd })
                setOpen(false)
              }}
              className="h-8 w-full rounded-md bg-primary text-xs font-semibold text-primary-foreground disabled:opacity-50"
            >
              Apply custom range
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export { DateRangeDropdown }
