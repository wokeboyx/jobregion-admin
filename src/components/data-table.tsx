import type { ReactNode } from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown, Minus, Check } from "lucide-react"

import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { SortDir } from "@/lib/use-table"

/** A column header you can click to sort: ↑ ascending, ↓ descending, a third click clears it. */
function SortHead({
  label,
  sortKey,
  sort,
  onSort,
  align = "left",
  className,
}: {
  label: string
  sortKey: string
  sort?: { key: string; dir: SortDir }
  onSort: (key: string) => void
  align?: "left" | "right"
  className?: string
}) {
  const on = sort?.key === sortKey
  const Icon = !on ? ChevronsUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown
  return (
    <TableHead
      aria-sort={on ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      className={cn(align === "right" && "text-right", className)}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "-mx-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors hover:bg-muted hover:text-foreground",
          on && "text-foreground",
          align === "right" && "flex-row-reverse",
        )}
      >
        {label}
        <Icon className={cn("size-3.5", !on && "opacity-40")} />
      </button>
    </TableHead>
  )
}

/** Our checkbox: a 20px rounded square, black when on, with a dash for "some selected". */
function Checkbox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
        checked || indeterminate ? "border-foreground bg-foreground text-white" : "border-input bg-card hover:border-foreground",
      )}
    >
      {indeterminate ? <Minus className="size-3.5" strokeWidth={3} /> : checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
    </button>
  )
}

/** The header cell with the select-all-on-this-page checkbox. */
function SelectHead({ all, some, onToggle }: { all: boolean; some: boolean; onToggle: () => void }) {
  return (
    <TableHead className="w-12">
      <Checkbox checked={all} indeterminate={some} onChange={onToggle} label="Select all on this page" />
    </TableHead>
  )
}

/**
 * Floating black bar that appears when rows are selected, like Airbnb's multi-select in Listings:
 * "3 selected", select all N, clear, and the bulk actions on the right.
 */
function BulkBar({
  count,
  total,
  onSelectAll,
  onClear,
  children,
}: {
  count: number
  total: number
  onSelectAll?: () => void
  onClear: () => void
  children: ReactNode
}) {
  if (count === 0) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-6">
      <div
        role="toolbar"
        aria-label="Bulk actions"
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-foreground py-2 pl-5 pr-2 text-sm text-white shadow-[0_8px_28px_rgb(0_0_0/0.28)] animate-[rise_.2s_ease-out]"
      >
        <span className="font-semibold">{count.toLocaleString()} selected</span>
        {onSelectAll && count < total && (
          <button type="button" onClick={onSelectAll} className="rounded-full px-2 py-1 text-white/80 underline underline-offset-2 hover:text-white">
            Select all {total.toLocaleString()}
          </button>
        )}
        <button type="button" onClick={onClear} className="rounded-full px-2 py-1 text-white/80 underline underline-offset-2 hover:text-white">
          Clear
        </button>
        <span className="mx-1 h-5 w-px bg-white/20" />
        <div className="flex items-center gap-1">{children}</div>
      </div>
    </div>
  )
}

/** A button for the bulk bar. `tone="danger"` for destructive actions. */
function BulkAction({ children, onClick, tone }: { children: ReactNode; onClick: () => void; tone?: "danger" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-full px-4 text-sm font-semibold transition-colors",
        tone === "danger" ? "bg-destructive text-white hover:brightness-110" : "bg-white/10 text-white hover:bg-white/20",
      )}
    >
      {children}
    </button>
  )
}

export { SortHead, Checkbox, SelectHead, BulkBar, BulkAction }
