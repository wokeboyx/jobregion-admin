import { cn } from "@/lib/utils"

export type Status = "neutral" | "success" | "warning" | "destructive"

const CHIP_CLASSES: Record<Status, string> = {
  neutral: "bg-muted-foreground/16 text-muted-foreground",
  success: "bg-success/16 text-success",
  warning: "bg-warning/16 text-warning",
  destructive: "bg-destructive/16 text-destructive",
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
        "inline-flex w-fit items-center rounded-xs px-1.5 text-xs font-bold tracking-[-0.12px] h-6",
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
