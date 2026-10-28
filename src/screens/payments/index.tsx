import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Download, Search, Wallet } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { PillTabs } from "@/components/pill-tabs"
import { DateRangeDropdown, type CustomRange, type DatePreset } from "@/components/date-range-dropdown"
import { Pagination } from "@/components/pagination"
import { ReasonDialog } from "@/components/reason-dialog"
import { BulkAction, BulkBar, Checkbox, SelectHead, SortHead } from "@/components/data-table"
import { EmptyState, ErrorState } from "@/components/page-state"
import { cn } from "@/lib/utils"
import { useTable } from "@/lib/use-table"
import { usePreviewState } from "@/lib/preview-state"
import { ANCHOR_DATE, naira } from "@/lib/mock-data"
import { monthName, paidWith, payments as seedPayments, paymentTitle, paymentUser, type Payment } from "@/lib/payments-data"
import { ReceiptDialog } from "./receipt-dialog"
import { RevenueChart } from "./revenue-chart"
import { PaymentStatusDot } from "./status-dot"

const REFUND_REASONS = [
  "Charged twice for the same thing",
  "The promotion didn't start",
  "Asked for a refund within 24 hours",
  "We removed the job or profile",
  "Something else",
]

type TabKey = "all" | "promotions" | "pro" | "issues"

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function addMonths(period: string, months: number) {
  const d = new Date(`${period}-01T00:00:00`)
  d.setMonth(d.getMonth() + months)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function rangeFor(preset: DatePreset, custom: CustomRange | null) {
  const days: Record<string, number> = { "7d": 7, "14d": 14, "30d": 30, "90d": 90 }
  if (days[preset]) return { start: addDays(ANCHOR_DATE, -(days[preset] - 1)), end: ANCHOR_DATE }
  const month = ANCHOR_DATE.slice(0, 7)
  if (preset === "this_month") return { start: `${month}-01`, end: `${month}-31` }
  if (preset === "last_month") {
    const last = addMonths(month, -1)
    return { start: `${last}-01`, end: `${last}-31` }
  }
  return custom
}

function shortDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function downloadCsv(rows: Payment[]) {
  const header = ["Reference", "Date", "Time", "Name", "Email", "Type", "What", "Amount (NGN)", "Method", "Paid with", "Provider", "Status", "Refund reason"]
  const body = rows.map((p) => {
    const person = paymentUser(p)
    return [
      p.reference,
      p.date,
      p.time,
      person?.name ?? "",
      person?.email ?? "",
      p.kind,
      paymentTitle(p),
      String(p.amount),
      p.method,
      paidWith(p),
      p.provider,
      p.status,
      p.refundReason ?? "",
    ]
  })
  const csv = [header, ...body].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }))
  const a = document.createElement("a")
  a.href = url
  a.download = `jobs-region-payments-${ANCHOR_DATE}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <p className="text-body2 text-muted-foreground">{label}</p>
      <p className="mt-1 text-h3 font-bold leading-10 tracking-tight text-foreground">{value}</p>
      {note && <p className="mt-0.5 text-body2 text-muted-foreground">{note}</p>}
    </div>
  )
}

/** Airbnb Earnings style: the month's revenue in words and numbers on the left, twelve months of bars on the right. */
function Earnings({ payments }: { payments: Payment[] }) {
  const month = ANCHOR_DATE.slice(0, 7)
  const paidThisMonth = payments.filter((p) => p.status === "Paid" && p.date.startsWith(month))
  const sum = (rows: Payment[]) => rows.reduce((total, p) => total + p.amount, 0)
  const promotions = paidThisMonth.filter((p) => p.kind === "Promotion")
  const pro = paidThisMonth.filter((p) => p.kind === "Pro")
  const refunded = payments.filter((p) => p.status === "Refunded")
  const yearStart = `${addMonths(month, -11)}-01`
  const lastYear = payments.filter((p) => p.status === "Paid" && p.date >= yearStart)
  const byMonth = Array.from({ length: 12 }, (_, i) => {
    const m = addMonths(month, i - 11)
    return { date: `${m}-01`, count: sum(payments.filter((p) => p.status === "Paid" && p.date.startsWith(m))) }
  })

  return (
    <div className="mb-10 grid grid-cols-1 gap-10 border-b border-border pb-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div>
        <h2 className="heading-section">You've earned {naira(sum(paidThisMonth))} this month</h2>
        <p className="mt-1 text-body1 text-muted-foreground">
          {monthName(month, { month: "long", year: "numeric" })} so far · {paidThisMonth.length} payments
        </p>
        <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-8">
          <Stat label="Revenue this month" value={naira(sum(paidThisMonth))} note={`${paidThisMonth.length} paid`} />
          <Stat label="From promotions" value={naira(sum(promotions))} note={`${promotions.length} bought`} />
          <Stat label="From Pro" value={naira(sum(pro))} note={`${pro.length} memberships`} />
          <Stat label="Last 12 months" value={naira(sum(lastYear))} note={`${lastYear.length.toLocaleString()} paid`} />
          <Stat label="Refunds" value={naira(sum(refunded))} note={`${refunded.length} refunded, all time`} />
        </div>
      </div>
      <div>
        <h3 className="heading-card">Paid by month</h3>
        <p className="mb-6 text-body2 text-muted-foreground">The last 12 months, paid payments only</p>
        <RevenueChart data={byMonth} />
      </div>
    </div>
  )
}

function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(seedPayments)
  const [tab, setTab] = useState<TabKey>("all")
  const [search, setSearch] = useState("")
  const [preset, setPreset] = useState<DatePreset | null>(null)
  const [customRange, setCustomRange] = useState<CustomRange | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [refunding, setRefunding] = useState(false)
  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const open = payments.find((p) => p.id === openId) ?? null

  const searched = useMemo(() => {
    const query = search.trim().toLowerCase()
    const range = preset ? rangeFor(preset, customRange) : null
    return payments.filter((p) => {
      if (range && (p.date < range.start || p.date > range.end)) return false
      if (query) {
        const person = paymentUser(p)
        if (!`${person?.name ?? ""} ${person?.email ?? ""} ${paymentTitle(p)} ${p.reference}`.toLowerCase().includes(query)) return false
      }
      return true
    })
  }, [payments, search, preset, customRange])

  const inTab = useMemo(
    () =>
      searched.filter((p) =>
        tab === "promotions" ? p.kind === "Promotion" : tab === "pro" ? p.kind === "Pro" : tab !== "issues" || p.status === "Refunded" || p.status === "Failed",
      ),
    [searched, tab],
  )

  const tabs = [
    { key: "all" as const, label: "All", count: searched.length },
    { key: "promotions" as const, label: "Promotions", count: searched.filter((p) => p.kind === "Promotion").length },
    { key: "pro" as const, label: "Pro", count: searched.filter((p) => p.kind === "Pro").length },
    { key: "issues" as const, label: "Refunds & failed", count: searched.filter((p) => p.status === "Refunded" || p.status === "Failed").length },
  ]

  const rows = useMemo(() => (previewState === "no-results" ? [] : inTab), [previewState, inTab])

  const t = useTable(rows, {
    getId: (p) => p.id,
    sorters: {
      date: (p) => `${p.date} ${p.time}`,
      amount: (p) => p.amount,
      name: (p) => paymentUser(p)?.name ?? "",
    },
    initialSort: { key: "date", dir: "desc" },
    pageSize: 25,
  })

  const [notice, setNotice] = useState("")
  const resendReceipts = () => {
    const sendable = t.selection.rows.filter((p) => p.status === "Paid" || p.status === "Refunded")
    const skipped = t.selection.count - sendable.length
    setNotice(
      `Receipts sent again for ${sendable.length.toLocaleString()} ${sendable.length === 1 ? "payment" : "payments"}.` +
        (skipped > 0 ? ` ${skipped} failed or pending ${skipped === 1 ? "payment was" : "payments were"} skipped.` : ""),
    )
    t.selection.clear()
  }

  const filtersActive = search.trim() !== "" || preset !== null || tab !== "all"
  const clearFilters = () => {
    setSearch("")
    setPreset(null)
    setCustomRange(null)
    setTab("all")
  }

  const refund = (reason: string, note: string) => {
    if (!open) return
    setPayments((all) =>
      all.map((p) =>
        p.id === open.id ? { ...p, status: "Refunded", refundReason: note.trim() ? `${reason}: ${note.trim()}` : reason, refundedDate: ANCHOR_DATE } : p,
      ),
    )
  }

  const header = (
    <PageHeader
      title="Payments"
      description="Every promotion and Pro payment made on Jobs Region, with receipts and refunds."
      actions={
        <Button variant="outline" onClick={() => downloadCsv(inTab)} disabled={previewState !== "default" || inTab.length === 0}>
          <Download />
          Export CSV
        </Button>
      }
    />
  )

  if (previewState === "error") {
    return (
      <div>
        {header}
        <ErrorState onRetry={() => setPreviewState("default")} />
      </div>
    )
  }
  if (previewState === "empty") {
    return (
      <div>
        {header}
        <EmptyState icon={Wallet} title="No payments yet" description="When someone buys a promotion or Pro, the payment and receipt show up here." />
      </div>
    )
  }

  return (
    <div>
      {header}
      <Earnings payments={payments} />

      <div className="mb-8 flex flex-col items-stretch gap-6">
        <PillTabs options={tabs} value={tab} onChange={setTab} />
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="relative h-10 w-[26rem] max-w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search by name, item or reference"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-full border border-input bg-card pl-10 pr-4 text-body2 text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
            />
          </div>
          <DateRangeDropdown
            preset={preset ?? "custom"}
            customRange={preset === "custom" ? customRange : null}
            onChange={(next, custom) => {
              setPreset(next)
              setCustomRange(custom ?? null)
            }}
          />
          {preset && (
            <button
              type="button"
              onClick={() => {
                setPreset(null)
                setCustomRange(null)
              }}
              className="rounded-md px-2 py-1.5 text-body2 font-semibold text-foreground underline underline-offset-2 hover:bg-muted"
            >
              All dates
            </button>
          )}
        </div>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-3 text-body2 text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{t.total.toLocaleString()}</span> {t.total === 1 ? "payment" : "payments"}
        </span>
        {filtersActive && (
          <button type="button" onClick={clearFilters} className="font-semibold text-foreground underline underline-offset-2">
            Clear filters
          </button>
        )}
        {notice && (
          <span role="status" className="ml-auto flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-foreground">
            {notice}
            <button type="button" onClick={() => setNotice("")} className="font-semibold underline underline-offset-2">
              Dismiss
            </button>
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="border-t border-border py-16 text-center">
          <p className="heading-card">No payments match these filters</p>
          <p className="mt-1 text-body2 text-muted-foreground">Try a different search, tab or date range.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SelectHead all={t.selection.allOnPage} some={t.selection.someOnPage} onToggle={t.selection.togglePage} />
              <SortHead label="Paid by" sortKey="name" sort={t.sort} onSort={t.toggleSort} />
              <TableHead>What</TableHead>
              <SortHead label="Date" sortKey="date" sort={t.sort} onSort={t.toggleSort} />
              <SortHead label="Amount" sortKey="amount" sort={t.sort} onSort={t.toggleSort} align="right" />
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {t.pagedRows.map((p) => {
              const person = paymentUser(p)
              const name = person?.name ?? "Unknown user"
              const who = (
                <>
                  <Avatar name={name} className="size-8 text-caption" />
                  <span className="whitespace-nowrap">{name}</span>
                </>
              )
              return (
                <TableRow key={p.id} onClick={() => setOpenId(p.id)} className="cursor-pointer">
                  <TableCell>
                    <Checkbox checked={t.selection.isSelected(p.id)} onChange={() => t.selection.toggle(p.id)} label={`Select ${p.reference}`} />
                  </TableCell>
                  <TableCell>
                    {person?.known ? (
                      <Link
                        to={`/users/${p.userId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-3 font-semibold text-foreground hover:underline"
                      >
                        {who}
                      </Link>
                    ) : (
                      <span className="flex items-center gap-3 font-semibold text-foreground">{who}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="block max-w-[260px] truncate text-foreground" title={paymentTitle(p)}>
                      {paymentTitle(p)}
                    </span>
                    <span className="block text-caption">{p.kind === "Pro" ? "Membership" : "Promotion"}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">
                    <span className="text-foreground">{shortDate(p.date)}</span>
                    <span className="block text-caption">{p.time}</span>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-foreground">
                    <span className={cn((p.status === "Refunded" || p.status === "Failed") && "text-muted-foreground line-through")}>{naira(p.amount)}</span>
                  </TableCell>
                  <TableCell>
                    <PaymentStatusDot status={p.status} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      <Pagination
        page={t.page}
        totalPages={t.totalPages}
        onPageChange={t.setPage}
        total={t.total}
        pageSize={t.pageSize}
        onPageSizeChange={t.setPageSize}
        noun="payments"
      />

      <BulkBar count={t.selection.count} total={t.total} onSelectAll={t.selection.selectAll} onClear={t.selection.clear}>
        <BulkAction onClick={() => downloadCsv(t.selection.rows)}>Export selected</BulkAction>
        <BulkAction onClick={resendReceipts}>Resend receipts</BulkAction>
      </BulkBar>

      {open && !refunding && <ReceiptDialog key={open.id} payment={open} onClose={() => setOpenId(null)} onRefund={() => setRefunding(true)} />}
      {open && (
        <ReasonDialog
          open={refunding}
          onClose={() => setRefunding(false)}
          onSubmit={refund}
          title={`Refund ${naira(open.amount)}`}
          description={
            open.kind === "Promotion"
              ? `The money goes back to ${paymentUser(open)?.name ?? "them"} through Paystack in 3–5 working days. The promotion ends now and the Promoted badge comes off.`
              : `The money goes back to ${paymentUser(open)?.name ?? "them"} through Paystack in 3–5 working days. Pro perks stop at the end of today.`
          }
          reasons={REFUND_REASONS}
          confirmLabel="Refund"
          successTitle="Refund sent"
          successDescription={
            open.kind === "Promotion"
              ? `${open.reference} is marked refunded and the promotion has ended. We've emailed a refund receipt.`
              : `${open.reference} is marked refunded. We've emailed a refund receipt.`
          }
        />
      )}
    </div>
  )
}

export default PaymentsPage
