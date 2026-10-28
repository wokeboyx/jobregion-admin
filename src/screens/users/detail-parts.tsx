import type { ComponentType, ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Star } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { StatusPill, type Status } from "@/components/ui/status-pill"
import { cn } from "@/lib/utils"
import { HIRE_STATE_STATUS, REVIEW_STATE_STATUS, type Hire, type Review } from "@/lib/trust-data"
import type { PromotionRow } from "./profiles"
import { findUser } from "./generated"

const DOT: Record<Status, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  neutral: "bg-muted-foreground",
}

export function StatusDot({ status, label }: { status: Status; label: string }) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap text-body2 text-foreground">
      <span className={cn("size-2 shrink-0 rounded-full", DOT[status])} />
      {label}
    </span>
  )
}

/** A section split from the one above by a hairline, Airbnb listing style. */
export function Section({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="border-t border-border py-8 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="heading-section">{title}</h2>
          {description && <p className="mt-1 text-body1 text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-8 first:mt-0">
      <h3 className="heading-subsection mb-4">{title}</h3>
      {children}
    </div>
  )
}

export function Pills({ items, empty = "Not provided." }: { items: string[]; empty?: string }) {
  if (items.length === 0) return <p className="text-body1 text-muted-foreground">{empty}</p>
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => (
        <span key={i} className="rounded-full border border-input px-4 py-2 text-body2 text-foreground">
          {i}
        </span>
      ))}
    </div>
  )
}

export function IconRow({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-4 text-body1 text-foreground">
      <Icon className="size-6 shrink-0" strokeWidth={1.5} />
      <span className="min-w-0 break-words">{children}</span>
    </div>
  )
}

/** A fact with an icon, a bold line and a grey line under it, like Airbnb's listing highlights. */
export function Fact({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  title: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="flex items-start gap-4">
      <Icon className="mt-0.5 size-6 shrink-0 text-foreground" strokeWidth={1.5} />
      <div className="min-w-0">
        <p className="text-body1 font-semibold text-foreground">{title}</p>
        {children && <p className="text-body2 text-muted-foreground">{children}</p>}
      </div>
    </div>
  )
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-border py-4">
      <p className="text-body2 text-muted-foreground">{label}</p>
      <div className="mt-0.5 text-body1 text-foreground">{value}</div>
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-border px-6 py-8 text-center text-body1 text-muted-foreground">{children}</p>
}

const nameOf = (id: string) => findUser(id)?.name ?? "Unknown user"

export function ReviewList({ items, empty }: { items: Review[]; empty: string }) {
  if (items.length === 0) return <Empty>{empty}</Empty>
  return (
    <div className="divide-y divide-border">
      {items.map((r) => (
        <div key={r.id} className="py-5 first:pt-0">
          <div className="flex items-center gap-3">
            <Avatar name={nameOf(r.authorId)} className="size-10 text-caption" />
            <div className="min-w-0 flex-1">
              <Link to={`/users/${r.authorId}`} className="text-body1 font-semibold text-foreground hover:underline">
                {nameOf(r.authorId)}
              </Link>
              <p className="text-caption text-muted-foreground">{r.date}</p>
            </div>
            <StatusPill status={REVIEW_STATE_STATUS[r.state]} label={r.state} />
          </div>
          <div className="mt-3 flex items-center gap-0.5" aria-label={`${r.rating} out of 5`}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className={cn("size-3.5", i < r.rating ? "fill-foreground text-foreground" : "text-border")} />
            ))}
          </div>
          <p className="mt-2 max-w-2xl text-body1 text-foreground">{r.text}</p>
          {r.reply && <p className="mt-2 max-w-2xl border-l-2 border-border pl-3 text-body2 text-muted-foreground">Reply: {r.reply}</p>}
        </div>
      ))}
    </div>
  )
}

/** Hires on one side: the job, the other person, the state and the date. */
export function HireTable({ items, otherSide, empty }: { items: Hire[]; otherSide: "worker" | "poster"; empty: string }) {
  const navigate = useNavigate()
  if (items.length === 0) return <Empty>{empty}</Empty>
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="first:pl-0">Job</TableHead>
          <TableHead>{otherSide === "worker" ? "Worker" : "Posted by"}</TableHead>
          <TableHead>State</TableHead>
          <TableHead className="last:pr-0">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((h) => {
          const other = otherSide === "worker" ? h.workerId : h.posterId
          return (
            <TableRow key={h.id} onClick={() => navigate(`/jobs/${h.jobId}`)} className="cursor-pointer">
              <TableCell className="first:pl-0">
                <p title={h.jobTitle} className="max-w-72 truncate text-body2 font-semibold text-foreground">
                  {h.jobTitle}
                </p>
              </TableCell>
              <TableCell>
                <Link
                  to={`/users/${other}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 text-foreground hover:underline"
                >
                  <Avatar name={nameOf(other)} className="size-7 text-caption" />
                  {nameOf(other)}
                </Link>
              </TableCell>
              <TableCell>
                <StatusDot status={HIRE_STATE_STATUS[h.state]} label={h.state} />
              </TableCell>
              <TableCell className="whitespace-nowrap tabular-nums last:pr-0">{h.confirmedDate ?? h.date}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export function PromotionTable({ items, empty }: { items: PromotionRow[]; empty: string }) {
  const navigate = useNavigate()
  if (items.length === 0) return <Empty>{empty}</Empty>
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="first:pl-0">Promotion</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Views</TableHead>
          <TableHead className="text-right last:pr-0">Messages</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((p) => (
          <TableRow
            key={p.id}
            onClick={p.to ? () => navigate(p.to!) : undefined}
            className={cn(p.to ? "cursor-pointer" : "hover:bg-transparent")}
          >
            <TableCell className="py-2.5 first:pl-0">
              <div className="flex items-center gap-3">
                <img src={p.photo} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                <p title={p.title} className="max-w-64 truncate text-body2 font-semibold text-foreground">
                  {p.title}
                </p>
              </div>
            </TableCell>
            <TableCell className="text-foreground">{p.plan}</TableCell>
            <TableCell className="whitespace-nowrap tabular-nums">{p.dates}</TableCell>
            <TableCell>
              <StatusDot status={p.status} label={p.statusLabel} />
            </TableCell>
            <TableCell className="text-right tabular-nums text-foreground">{p.views.toLocaleString()}</TableCell>
            <TableCell className="text-right tabular-nums last:pr-0">{p.messages?.toLocaleString() ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
