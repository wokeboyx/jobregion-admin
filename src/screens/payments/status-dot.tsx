import { cn } from "@/lib/utils"
import type { PaymentStatus } from "@/lib/payments-data"

const DOT: Record<PaymentStatus, string> = {
  Paid: "bg-success",
  Pending: "bg-warning",
  Failed: "bg-destructive",
  Refunded: "bg-muted-foreground/50",
}

function PaymentStatusDot({ status }: { status: PaymentStatus }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-body2 text-foreground">
      <span className={cn("size-2 rounded-full", DOT[status])} />
      {status}
    </span>
  )
}

export { PaymentStatusDot }
