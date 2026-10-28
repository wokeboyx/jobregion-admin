import { useState, type ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Briefcase, CalendarDays, ChevronLeft, ChevronRight, Flag, MapPin, ShieldBan, Star, UserRound } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { OutlineBadge, StatusPill } from "@/components/ui/status-pill"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/page-state"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { ReasonDialog } from "@/components/reason-dialog"
import { cn } from "@/lib/utils"
import { jobCover } from "@/lib/photos"
import { jobs, users } from "@/lib/mock-data"
import { REPORT_KIND_LABEL, REPORT_REASONS } from "@/lib/trust-data"
import { allHires, allReviews } from "@/screens/reviews/generated"
import { ENFORCE, decide, getNavOrder, isOpen, startReview, useReports, userName, type ReportRecord } from "./store"
import { ReportStatus } from "./parts"
import { formatDate } from "./format"

function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="border-t border-border py-8 first:border-t-0 first:pt-0">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="heading-section">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function IconRow({ icon: Icon, children }: { icon: typeof MapPin; children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-body1 text-foreground">
      <Icon className="size-5 shrink-0 text-foreground" strokeWidth={1.75} />
      {children}
    </p>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-px" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn("size-3.5", i < rating ? "fill-foreground text-foreground" : "fill-border text-border")} />
      ))}
    </span>
  )
}

/** The thing that was reported, shown the way people saw it in the app. */
function ReportedItem({ report }: { report: ReportRecord }) {
  if (report.kind === "job") {
    const job = jobs.find((j) => j.id === report.targetId)
    return (
      <Link to={`/jobs/${report.targetId}`} className="group flex gap-5 rounded-xl border border-border p-4 transition-shadow hover:shadow-card">
        <img src={jobCover(report.targetId)} alt="" className="size-28 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 py-1">
          <p className="heading-card group-hover:underline">{report.targetLabel}</p>
          {job && (
            <>
              <p className="mt-1 text-body2 text-muted-foreground">
                {job.poster} · {job.category}
              </p>
              <p className="mt-1 text-body2 text-muted-foreground">
                {job.location} · {job.budget}
              </p>
              <StatusPill status={job.status} label={job.statusLabel} className="mt-3" />
            </>
          )}
        </div>
      </Link>
    )
  }

  if (report.kind === "review") {
    const review = allReviews.find((r) => r.id === report.targetId)
    if (!review) return <p className="text-body1 text-muted-foreground">This review is no longer available.</p>
    const hire = allHires.find((h) => h.id === review.hireId)
    return (
      <div className="rounded-xl border border-border p-5">
        <div className="flex items-center gap-3">
          <Avatar name={userName(review.authorId)} className="size-10 text-caption" />
          <div className="min-w-0">
            <p className="text-body1 font-semibold text-foreground">{userName(review.authorId)}</p>
            <p className="truncate text-body2 text-muted-foreground">
              Reviewed {userName(review.subjectId)} as the {review.about} · {formatDate(review.date)}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-body2">
          <Stars rating={review.rating} />
          {hire && <span className="truncate text-muted-foreground">· {hire.jobTitle}</span>}
        </div>
        <p className="mt-2 text-body1 text-foreground">{review.text}</p>
        <Link to="/reviews" className="mt-4 inline-block text-body2 font-semibold underline underline-offset-2">
          Open in reviews
        </Link>
      </div>
    )
  }

  if (report.kind === "chat") {
    return (
      <div className="rounded-xl border border-border p-5">
        {report.excerpt ? (
          <div className="space-y-4">
            {report.excerpt.map((m, i) => {
              const mine = m.from === "reporter"
              const name = userName(mine ? report.reporterId : report.reportedUserId)
              return (
                <div key={i} className={cn("flex items-end gap-2.5", mine && "flex-row-reverse")}>
                  <Avatar name={name} className="size-8 text-caption" />
                  <div className={cn("flex max-w-[75%] flex-col", mine ? "items-end" : "items-start")}>
                    <p
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-body1",
                        mine ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-muted-strong text-foreground",
                      )}
                    >
                      {m.body}
                    </p>
                    <span className="mt-1 text-caption text-muted-foreground">
                      {name} · {m.time}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-body1 text-muted-foreground">The reporter didn’t attach messages.</p>
        )}
      </div>
    )
  }

  const person = users.find((u) => u.id === report.targetId)
  return (
    <Link to={`/users/${report.targetId}`} className="group flex gap-5 rounded-xl border border-border p-5 transition-shadow hover:shadow-card">
      <Avatar name={report.targetLabel} className="size-16 text-body1" />
      <div className="min-w-0">
        <p className="heading-card group-hover:underline">{report.targetLabel}</p>
        {person && (
          <>
            <p className="mt-0.5 text-body2 text-muted-foreground">
              {person.roles.join(" and ")} · {person.location}
            </p>
            <p className="mt-2 line-clamp-2 text-body2 text-foreground">{person.bio}</p>
          </>
        )}
      </div>
    </Link>
  )
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-body2">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right font-medium text-foreground">{children}</span>
    </div>
  )
}

type Pending = "warn" | "enforce" | "dismiss" | null

function ReportView({ report, all }: { report: ReportRecord; all: ReportRecord[] }) {
  const navigate = useNavigate()
  const [note, setNote] = useState("")
  const [pending, setPending] = useState<Pending>(null)

  const reporter = users.find((u) => u.id === report.reporterId)
  const reported = users.find((u) => u.id === report.reportedUserId)
  const reportedName = userName(report.reportedUserId)
  const others = all.filter((r) => r.reportedUserId === report.reportedUserId && r.id !== report.id)
  const filedByReporter = all.filter((r) => r.reporterId === report.reporterId).length
  const enforce = ENFORCE[report.kind]
  const open = isOpen(report)

  const order = getNavOrder(all, report.id)
  const index = order.indexOf(report.id)
  const prevId = index > 0 ? order[index - 1] : undefined
  const nextId = index >= 0 && index < order.length - 1 ? order[index + 1] : undefined

  const arrow =
    "flex size-10 items-center justify-center rounded-full border border-input bg-card text-foreground transition-colors hover:border-foreground disabled:pointer-events-none disabled:opacity-30"

  return (
    <div>
      <PageHeader
        back={{ to: "/reports", label: "Back to reports" }}
        title={report.reason}
        description={`${REPORT_KIND_LABEL[report.kind]} report · ${report.id} · Received ${formatDate(report.date)}`}
        actions={
          <>
            <span className="mr-2 text-body2 tabular-nums text-muted-foreground">
              {index + 1} of {order.length.toLocaleString()}
            </span>
            <button type="button" aria-label="Previous report" disabled={!prevId} onClick={() => prevId && navigate(`/reports/${prevId}`)} className={arrow}>
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" aria-label="Next report" disabled={!nextId} onClick={() => nextId && navigate(`/reports/${nextId}`)} className={arrow}>
              <ChevronRight className="size-4" />
            </button>
          </>
        }
      />

      <div className="grid items-start gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <Section title="What was reported">
            {report.details && (
              <blockquote className="mb-6 border-l-2 border-foreground pl-4 text-body1 text-foreground">“{report.details}”</blockquote>
            )}
            <ReportedItem report={report} />
          </Section>

          <Section
            title="Reported by"
            action={
              <Link to={`/users/${report.reporterId}`} className="text-body2 font-semibold underline underline-offset-2">
                View profile
              </Link>
            }
          >
            <div className="flex items-center gap-4">
              <Avatar name={userName(report.reporterId)} className="size-14 text-body2" />
              <div>
                <p className="heading-card">{userName(report.reporterId)}</p>
                {reporter && <p className="text-body2 text-muted-foreground">{reporter.roles.join(" and ")}</p>}
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {reporter && <IconRow icon={MapPin}>{reporter.location}</IconRow>}
              {reporter && <IconRow icon={CalendarDays}>Joined {formatDate(reporter.dateJoined)}</IconRow>}
              <IconRow icon={Flag}>
                Has sent {filedByReporter} {filedByReporter === 1 ? "report" : "reports"}
              </IconRow>
              {report.blocked && <IconRow icon={ShieldBan}>Also blocked {reportedName}, so they can no longer message each other</IconRow>}
            </div>
          </Section>

          <Section
            title={`History of ${reportedName}`}
            action={
              <Link to={`/users/${report.reportedUserId}`} className="text-body2 font-semibold underline underline-offset-2">
                View profile
              </Link>
            }
          >
            <div className="flex items-center gap-4">
              <Avatar name={reportedName} className="size-14 text-body2" />
              <div className="min-w-0">
                <p className="heading-card">{reportedName}</p>
                {reported && (
                  <p className="text-body2 text-muted-foreground">
                    {reported.roles.join(" and ")} · {reported.location}
                  </p>
                )}
              </div>
            </div>
            {reported && (
              <div className="mt-5 space-y-3">
                <IconRow icon={UserRound}>
                  Account {reported.accountLabel.toLowerCase()} · ID {reported.verificationLabel.toLowerCase()}
                </IconRow>
                <IconRow icon={CalendarDays}>Joined {formatDate(reported.dateJoined)}</IconRow>
                <IconRow icon={Briefcase}>
                  {jobs.filter((j) => j.posterId === reported.id).length} jobs posted on Jobs Region
                </IconRow>
              </div>
            )}

            <h3 className="heading-card mb-2 mt-8">
              {others.length === 0 ? "No other reports against them" : `${others.length} other ${others.length === 1 ? "report" : "reports"} against them`}
            </h3>
            {others.length > 0 && (
              <ul className="divide-y divide-border border-y border-border">
                {others.slice(0, 6).map((r) => (
                  <li key={r.id}>
                    <Link to={`/reports/${r.id}`} className="flex items-center gap-4 py-3 hover:bg-muted">
                      <OutlineBadge label={REPORT_KIND_LABEL[r.kind]} className="shrink-0 text-caption" />
                      <span className="min-w-0 flex-1 truncate text-body2 text-foreground" title={r.reason}>
                        {r.reason}
                      </span>
                      <span className="shrink-0 text-body2 tabular-nums text-muted-foreground">{formatDate(r.date)}</span>
                      <ReportStatus state={r.state} className="w-28 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {others.length > 6 && <p className="mt-3 text-body2 text-muted-foreground">And {others.length - 6} more.</p>}
          </Section>

          <Section title="Timeline">
            <ol className="relative ml-1.5 space-y-6 border-l border-border pl-6">
              {report.timeline.map((e, i) => (
                <li key={i} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[31px] top-1.5 size-3 rounded-full border-2 border-card",
                      e.tone === "danger" ? "bg-destructive" : e.tone === "success" ? "bg-success" : "bg-foreground",
                    )}
                  />
                  <p className="text-body1 font-semibold text-foreground">{e.label}</p>
                  <p className="text-body2 text-muted-foreground">
                    {formatDate(e.date)}
                    {e.by && ` · ${e.by}`}
                  </p>
                  {e.note && <p className="mt-1 text-body2 text-foreground">{e.note}</p>}
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Audit note">
            {open ? (
              <>
                <label htmlFor="report-note" className="text-body2 text-muted-foreground">
                  Optional. Saved to the audit log with your decision.
                </label>
                <textarea
                  id="report-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What did you check, and why this outcome?"
                  className="mt-3 h-28 w-full resize-none rounded-lg border border-input bg-card p-3.5 text-body1 text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
                />
              </>
            ) : (
              <p className="text-body1 text-foreground">{report.note ?? "No note was added."}</p>
            )}
          </Section>
        </div>

        <aside className="sticky top-28 rounded-xl border border-border p-6 shadow-card">
          <ReportStatus state={report.state} className="text-body1 font-semibold" />
          <p className="mt-2 text-body2 text-muted-foreground">
            {report.state === "Received"
              ? "Nobody has looked at this yet."
              : report.state === "In review"
                ? "Someone is checking this report."
                : report.resolution}
          </p>

          <div className="mt-4 divide-y divide-border border-y border-border">
            <Fact label="Type">{REPORT_KIND_LABEL[report.kind]}</Fact>
            <Fact label="Reported user">{reportedName}</Fact>
            <Fact label="Other reports">{others.length}</Fact>
            <Fact label="Received">{formatDate(report.date)}</Fact>
          </div>

          {open ? (
            <div className="mt-6 space-y-3">
              {report.state === "Received" && (
                <Button size="lg" className="w-full" onClick={() => startReview([report.id])}>
                  Start review
                </Button>
              )}
              <Button variant="outline" size="lg" className="w-full" onClick={() => setPending("warn")}>
                Warn user
              </Button>
              <Button variant="danger" size="lg" className="w-full" onClick={() => setPending("enforce")}>
                {enforce.label}
              </Button>
              <Button variant="ghost" size="lg" className="w-full" onClick={() => setPending("dismiss")}>
                Dismiss
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="lg" className="mt-6 w-full" onClick={() => navigate("/reports")}>
              Back to reports
            </Button>
          )}
        </aside>
      </div>

      <ConfirmationDialog
        open={pending === "warn"}
        onClose={() => setPending(null)}
        onConfirm={() =>
          decide([report.id], { state: "Resolved", label: "User warned", resolution: `${reportedName} was warned.`, note })
        }
        title={`Warn ${reportedName}?`}
        description="They get an email and an in-app notice about the rule, and the report closes. A second report may lead to suspension."
        confirmLabel="Send warning"
      />
      <ConfirmationDialog
        open={pending === "dismiss"}
        onClose={() => setPending(null)}
        onConfirm={() => decide([report.id], { state: "Dismissed", label: "Dismissed", resolution: "No rule broken. Report dismissed.", note })}
        title="Dismiss this report?"
        description="Nothing happens to the reported user. The reporter gets a short update that we checked it."
        confirmLabel="Dismiss"
      />
      <ReasonDialog
        open={pending === "enforce"}
        onClose={() => setPending(null)}
        onSubmit={(reason, details) =>
          decide([report.id], {
            state: "Resolved",
            label: enforce.label.replace(/^Remove/, "Removed").replace(/^Suspend/, "Suspended"),
            resolution: `${enforce.done} Rule: ${reason.replace(/[.]$/, "")}.`,
            note: [note.trim(), details.trim()].filter(Boolean).join(" "),
          })
        }
        title={enforce.title}
        description={enforce.description}
        reasons={REPORT_REASONS[report.kind].filter((r) => r !== "Something else").concat("Another rule in our guidelines")}
        confirmLabel={enforce.label}
        successTitle="Done"
        successDescription={`${enforce.done} The report is closed and logged.`}
      />
    </div>
  )
}

function ReportDetailPage() {
  const { id } = useParams()
  const all = useReports()
  const report = all.find((r) => r.id === id)

  if (!report) {
    return (
      <div>
        <PageHeader title="Report not found" back={{ to: "/reports", label: "Back to reports" }} />
        <EmptyState icon={Flag} title="This report doesn’t exist" description="It may have been removed, or the link is wrong." />
      </div>
    )
  }

  return <ReportView key={report.id} report={report} all={all} />
}

export default ReportDetailPage
