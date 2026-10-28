import { cn } from "@/lib/utils"

export type Status = "neutral" | "success" | "warning" | "destructive"

const CHIP_CLASSES: Record<Status, string> = {
  neutral: "bg-muted-strong text-muted-foreground",
  success: "bg-success/12 text-success",
  warning: "bg-[#fff5cc] text-warning",
  destructive: "bg-destructive/8 text-destructive",
}

function StatusPill({
  status,
  label,
  className,
}: {
  status: Status
  label: string
  className?: string
}) {
  return (
    <span
      data-slot="status-pill"
      className={cn(
        "inline-flex h-6 w-fit items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap",
        CHIP_CLASSES[status],
        className,
      )}
    >
      {label}
    </span>
  )
}

function OutlineBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      data-slot="outline-badge"
      className={cn(
        "inline-flex w-fit items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground",
        className,
      )}
    >
      {label}
    </span>
  )
}

export { StatusPill, OutlineBadge }
