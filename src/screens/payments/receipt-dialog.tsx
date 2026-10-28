import { useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { Check } from "lucide-react"

import { Dialog, DialogTextButton } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { LogoMark } from "@/components/layout/logo-mark"
import { cn } from "@/lib/utils"
import { getPromotionPlan, naira } from "@/lib/mock-data"
import { monthName, paidWith, paymentJobTitle, paymentTitle, paymentUser, type Payment } from "@/lib/payments-data"
import { PaymentStatusDot } from "./status-dot"

function longDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function Row({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-6 py-1.5">
      <span className={cn("text-body1", strong ? "font-semibold text-foreground" : "text-muted-foreground")}>{label}</span>
      <span className={cn("text-right text-body1 text-foreground", strong && "font-semibold")}>{value}</span>
    </div>
  )
}

/** The receipt as the person got it by email, plus the admin's two actions: resend it, or refund the payment. */
function ReceiptDialog({
  payment,
  onClose,
  onRefund,
}: {
  payment: Payment
  onClose: () => void
  onRefund: () => void
}) {
  const [sent, setSent] = useState(false)
  const user = paymentUser(payment)
  const name = user?.name ?? "Unknown user"
  const plan = payment.kind === "Promotion" ? getPromotionPlan(payment.plan ?? "boost") : undefined
  const job = paymentJobTitle(payment)
  const canRefund = payment.status === "Paid"
  const canResend = payment.status === "Paid" || payment.status === "Refunded"

  const item =
    payment.kind === "Promotion" && plan
      ? { name: `${plan.name} promotion · ${plan.days} days`, detail: `${job ? `Job: ${job}` : "Profile"} · runs ${longDate(payment.date)} – ${longDate(addDays(payment.date, plan.days))}` }
      : {
          name: `${payment.planName ?? "Jobs Region Pro"} · 1 month`,
          detail: `Membership for ${monthName(payment.period ?? payment.date.slice(0, 7), { month: "long", year: "numeric" })}`,
        }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Receipt"
      footer={
        <>
          {canResend ? (
            <DialogTextButton onClick={() => setSent(true)}>{sent ? "Sent again" : "Resend receipt"}</DialogTextButton>
          ) : (
            <span />
          )}
          {canRefund ? (
            <Button variant="outline" size="lg" onClick={onRefund}>
              Refund {naira(payment.amount)}
            </Button>
          ) : (
            <Button size="lg" onClick={onClose}>
              Done
            </Button>
          )}
        </>
      }
    >
      <div className="px-6 py-7">
        <div className="flex items-start justify-between gap-4">
          <LogoMark className="h-7 w-auto" />
          <PaymentStatusDot status={payment.status} />
        </div>

        <p className="mt-8 text-body2 text-muted-foreground">{payment.status === "Paid" ? "Paid" : "Amount"} on {longDate(payment.date)}</p>
        <p className="mt-1 text-h3 font-bold leading-10 tracking-tight text-foreground">{naira(payment.amount)}</p>
        <p className="mt-1 text-body1 text-foreground">{paymentTitle(payment)}</p>

        {(() => {
          const payer = (
            <>
              <Avatar name={name} className="size-10 text-body2" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{name}</p>
                <p className="truncate text-body2 text-muted-foreground">{user?.email}</p>
              </div>
            </>
          )
          return user?.known ? (
            <Link
              to={`/users/${payment.userId}`}
              className="mt-6 flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-muted"
            >
              {payer}
            </Link>
          ) : (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-border p-4">{payer}</div>
          )
        })()}

        <div className="mt-6 border-t border-border pt-5">
          <h3 className="mb-2 text-body1 font-semibold text-foreground">Price details</h3>
          <div className="flex items-start justify-between gap-6 py-1.5">
            <div>
              <p className="text-body1 text-foreground">{item.name}</p>
              <p className="text-body2 text-muted-foreground">{item.detail}</p>
            </div>
            <span className="text-body1 text-foreground">{naira(payment.amount)}</span>
          </div>
          <Row label="VAT" value="None charged" />
          <div className="mt-2 border-t border-border pt-3">
            <Row label="Total (NGN)" value={naira(payment.amount)} strong />
          </div>
          <p className="mt-2 text-caption text-muted-foreground">
            One-off payment, nothing renews automatically. No VAT is added to promotions or Pro.
          </p>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <h3 className="mb-2 text-body1 font-semibold text-foreground">Payment</h3>
          <Row label="Reference" value={<span className="font-mono text-body2">{payment.reference}</span>} />
          <Row label="Paid with" value={`${paidWith(payment)} via ${payment.provider}`} />
          <Row label="Date" value={`${longDate(payment.date)}, ${payment.time}`} />
          {payment.failureReason && <Row label="Why it failed" value={payment.failureReason} />}
          {payment.status === "Pending" && <Row label="Waiting on" value="Bank confirmation from Paystack" />}
          {payment.status === "Refunded" && (
            <>
              <Row label="Refunded" value={payment.refundedDate ? longDate(payment.refundedDate) : "Today"} />
              {payment.refundReason && <Row label="Reason" value={payment.refundReason} />}
            </>
          )}
        </div>

        {sent && (
          <p className="mt-5 flex items-center gap-2 text-body2 font-medium text-success">
            <Check className="size-4" strokeWidth={2.5} />
            Receipt sent to {user?.email ?? "their email"}
          </p>
        )}
      </div>
    </Dialog>
  )
}

export { ReceiptDialog }
