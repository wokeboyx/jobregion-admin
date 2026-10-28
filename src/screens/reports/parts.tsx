import { cn } from "@/lib/utils"
import type { ReportState } from "@/lib/trust-data"

const DOT: Record<ReportState, string> = {
  Received: "bg-brand",
  "In review": "bg-warning",
  Resolved: "bg-success",
  Dismissed: "bg-muted-foreground",
}

const LABEL: Record<ReportState, string> = {
  Received: "New",
  "In review": "In review",
  Resolved: "Action taken",
  Dismissed: "Dismissed",
}

/** Status as a dot and a word, like Airbnb's listing status. */
export function ReportStatus({ state, className }: { state: ReportState; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 whitespace-nowrap text-body2 text-foreground", className)}>
      <span className={cn("size-2 shrink-0 rounded-full", DOT[state])} />
      {LABEL[state]}
    </span>
  )
}
