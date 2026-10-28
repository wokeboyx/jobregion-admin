import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  BadgeCheck,
  Briefcase,
  Flag,
  LifeBuoy,
  Megaphone,
  Newspaper,
  Plug,
  PlusCircle,
  Send,
  SlidersHorizontal,
  Star,
  UserPlus,
} from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { SelectMenu } from "@/components/ui/select-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { PillTabs } from "@/components/pill-tabs"
import { Pagination } from "@/components/pagination"
import { SortHead } from "@/components/data-table"
import { Sparkline } from "@/components/sparkline-chart"
import { BarChart } from "@/components/bar-chart"
import { DateRangeDropdown, type DatePreset, type CustomRange } from "@/components/date-range-dropdown"
import { cn } from "@/lib/utils"
import { jobCover } from "@/lib/photos"
import { useTable } from "@/lib/use-table"
import {
  stats,
  users,
  jobs,
  admins,
  blogPosts,
  currentAdminId,
  auditLog,
  dailySignups,
  proSubscriberTrend,
  pendingVerificationUsers,
  ANCHOR_DATE,
  type AuditLogEntry,
} from "@/lib/mock-data"
import { reports, reviews, openReportCount, flaggedReviewCount } from "@/lib/trust-data"

const currentAdmin = admins.find((a) => a.id === currentAdminId)!
const userName = (id: string) => users.find((u) => u.id === id)?.name ?? "Unknown user"

type TaskType = "report" | "verification" | "approve" | "flagged" | "review"
type Priority = 0 | 1 | 2

const TYPE_LABEL: Record<TaskType, string> = {
  report: "Report",
  verification: "Verification",
  approve: "Job to approve",
  flagged: "Flagged job",
  review: "Reported review",
}

const TYPE_STYLE: Record<TaskType, string> = {
  report: "bg-destructive/8 text-destructive",
  review: "bg-destructive/8 text-destructive",
  flagged: "bg-[#fff5cc] text-warning",
  verification: "bg-muted-strong text-foreground",
  approve: "bg-muted-strong text-foreground",
}

const PRIORITY: Record<Priority, { label: string; dot: string }> = {
  0: { label: "Urgent", dot: "bg-destructive" },
  1: { label: "High", dot: "bg-warning" },
  2: { label: "Normal", dot: "bg-muted-foreground" },
}

/** Money asks, scams, impersonation and threats go to the top of the pile. */
const SAFETY = /money|fee|scam|fraud|pretend|someone else|threat|harass|unsafe|safety/i

/** One thing waiting on an admin. */
type Task = {
  id: string
  type: TaskType
  title: string
  detail: string
  photo?: string
  person?: string
  who: string
  whoDetail?: string
  whoId?: string
  /** When it started waiting, "2026-07-01". */
  since: string
  priority: Priority
  to: string
  action: string
}

const TASKS: Task[] = [
  ...reports
    .filter((r) => r.state === "Received" || r.state === "In review")
    .map(
      (r): Task => ({
        id: r.id,
        type: "report",
        title: r.reason,
        detail: `${r.targetLabel} · ${r.state}`,
        photo: r.kind === "job" ? jobCover(r.targetId) : undefined,
        person: userName(r.reportedUserId),
        who: userName(r.reportedUserId),
        whoDetail: `Reported by ${userName(r.reporterId)}`,
        whoId: r.reportedUserId,
        since: r.date,
        priority: SAFETY.test(`${r.reason} ${r.details ?? ""}`) ? 0 : 1,
        to: `/reports/${r.id}`,
        action: "Review",
      }),
    ),
  ...reviews
    .filter((r) => r.reportCount > 0 && r.state !== "Removed")
    .map(
      (r): Task => ({
        id: r.id,
        type: "review",
        title: `“${r.text}”`,
        detail: `${r.rating}★ about ${userName(r.subjectId)} · ${r.reportCount} report${r.reportCount === 1 ? "" : "s"}`,
        person: userName(r.authorId),
        who: userName(r.authorId),
        whoDetail: "Wrote the review",
        whoId: r.authorId,
        since: r.date,
        priority: r.reportCount > 1 ? 0 : 1,
        to: "/reviews",
        action: "Read review",
      }),
    ),
  ...jobs
    .filter((j) => j.statusLabel === "Pending Review" || j.statusLabel === "Flagged")
    .map((j): Task => {
      const flagged = j.statusLabel === "Flagged"
      return {
        id: j.id,
        type: flagged ? "flagged" : "approve",
        title: j.title,
        detail: `${j.category} · ${j.budget}`,
        photo: jobCover(j.id),
        who: j.poster,
        whoDetail: j.location,
        whoId: j.posterId,
        since: j.datePosted,
        priority: flagged ? 1 : 2,
        to: `/jobs/${j.id}`,
        action: flagged ? "Look at job" : "Review job",
      }
    }),
  ...pendingVerificationUsers.map(
    (u): Task => ({
      id: u.id,
      type: "verification",
      title: `${u.documents[0]?.label ?? "ID"} sent`,
      detail: `${u.roles.join(" and ")} · ${u.location}`,
      person: u.name,
      who: u.name,
      whoDetail: u.email,
      whoId: u.id,
      since: u.documents[0]?.uploadedDate ?? u.dateJoined,
      priority: 2,
      to: `/users/${u.id}`,
      action: "Check ID",
    }),
  ),
]

const DAY = 86_400_000
const ageDays = (iso: string) =>
  Math.max(0, Math.round((new Date(`${ANCHOR_DATE}T00:00:00`).getTime() - new Date(`${iso}T00:00:00`).getTime()) / DAY))

/** "Today", "1 day", "12 days", "2 months". */
function waitingFor(iso: string) {
  const d = ageDays(iso)
  if (d === 0) return "Today"
  if (d < 30) return `${d} day${d === 1 ? "" : "s"}`
  const m = Math.floor(d / 30)
  return `${m} month${m === 1 ? "" : "s"}`
}

const TASK_SORTERS = {
  type: (t: Task) => TYPE_LABEL[t.type],
  who: (t: Task) => t.who,
  waiting: (t: Task) => t.since,
  // Most urgent first, then the oldest within each level.
  priority: (t: Task) => t.priority * 100_000 - ageDays(t.since),
}

function TypeLabel({ type }: { type: TaskType }) {
  return (
    <span className={cn("inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 text-caption font-semibold", TYPE_STYLE[type])}>
      {TYPE_LABEL[type]}
    </span>
  )
}

function ActionTable() {
  const navigate = useNavigate()
  const [type, setType] = useState<"all" | TaskType>("all")
  const rows = useMemo(() => (type === "all" ? TASKS : TASKS.filter((t) => t.type === type)), [type])
  const t = useTable(rows, {
    getId: (r) => `${r.type}-${r.id}`,
    sorters: TASK_SORTERS,
    initialSort: { key: "waiting", dir: "asc" },
    pageSize: 10,
  })

  const typeOptions = [
    { value: "all", label: `All types (${TASKS.length})` },
    ...(Object.keys(TYPE_LABEL) as TaskType[])
      .map((k) => ({ k, n: TASKS.filter((x) => x.type === k).length }))
      .filter(({ n }) => n > 0)
      .map(({ k, n }) => ({ value: k, label: `${TYPE_LABEL[k]} (${n})` })),
  ]

  if (TASKS.length === 0) {
    return (
      <div className="rounded-xl bg-muted px-8 py-14 text-center">
        <p className="heading-card">You’re all caught up</p>
        <p className="mt-1 text-body1 text-muted-foreground">Nothing needs a decision right now.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-body2 text-muted-foreground">
          <span className="font-semibold text-foreground">{t.total.toLocaleString()}</span> item{t.total === 1 ? "" : "s"} waiting
          {type !== "all" && (
            <button
              type="button"
              onClick={() => setType("all")}
              className="ml-3 font-semibold text-foreground underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </p>
        <SelectMenu
          aria-label="Type"
          align="right"
          value={type}
          onChange={(v) => setType(v as "all" | TaskType)}
          options={typeOptions}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <SortHead label="Type" sortKey="type" sort={t.sort} onSort={t.toggleSort} />
            <TableHead>Item</TableHead>
            <SortHead label="Who" sortKey="who" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Waiting for" sortKey="waiting" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Priority" sortKey="priority" sort={t.sort} onSort={t.toggleSort} />
            <TableHead className="text-right">
              <span className="sr-only">Action</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {t.pagedRows.map((task) => (
            <TableRow key={`${task.type}-${task.id}`} onClick={() => navigate(task.to)} className="cursor-pointer">
              <TableCell className="w-40">
                <TypeLabel type={task.type} />
              </TableCell>
              <TableCell className="max-w-[220px]">
                <div className="flex items-center gap-3">
                  {task.photo ? (
                    <img src={task.photo} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <Avatar name={task.person ?? task.who} className="size-10 text-caption" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-body2 font-semibold text-foreground" title={task.title}>
                      {task.title}
                    </p>
                    <p className="truncate text-caption text-muted-foreground" title={task.detail}>
                      {task.detail}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="max-w-[160px]">
                {task.whoId ? (
                  <Link
                    to={`/users/${task.whoId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="block truncate text-body2 font-medium text-foreground hover:underline"
                  >
                    {task.who}
                  </Link>
                ) : (
                  <p className="truncate text-body2 font-medium text-foreground">{task.who}</p>
                )}
                {task.whoDetail && <p className="truncate text-caption text-muted-foreground">{task.whoDetail}</p>}
              </TableCell>
              <TableCell className="whitespace-nowrap tabular-nums text-foreground">{waitingFor(task.since)}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-2 whitespace-nowrap text-foreground">
                  <span className={cn("size-2 rounded-full", PRIORITY[task.priority].dot)} />
                  {PRIORITY[task.priority].label}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Link
                  to={task.to}
                  onClick={(e) => e.stopPropagation()}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {task.action}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        page={t.page}
        totalPages={t.totalPages}
        onPageChange={t.setPage}
        total={t.total}
        pageSize={t.pageSize}
        onPageSizeChange={t.setPageSize}
        noun="items"
      />
    </div>
  )
}

/** Where an audit entry points: a quoted job or blog title, or a person or admin named in it. */
function auditTarget(action: string): { label: string; to: string } | undefined {
  const quoted = action.match(/"([^"]+)"/)?.[1]
  if (quoted) {
    const job = jobs.find((j) => j.title === quoted)
    if (job) return { label: job.title, to: `/jobs/${job.id}` }
    const post = blogPosts.find((p) => p.title === quoted)
    if (post) return { label: post.title, to: `/blog/${post.id}` }
    if (/subscription plan/i.test(action)) return { label: quoted, to: "/subscriptions" }
    if (/support/i.test(action)) return { label: quoted, to: "/support" }
  }
  const user = users.find((u) => action.includes(u.name))
  if (user) return { label: user.name, to: `/users/${user.id}` }
  const admin = admins.find((a) => action.includes(a.name))
  if (admin) return { label: admin.name, to: "/admins" }
  return quoted ? { label: quoted, to: "/audit-log" } : undefined
}

/** "7 Jul, 09:12" */
function stamp(ts: string) {
  const [date, time] = ts.split(" ")
  return `${new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}, ${time}`
}

const ACTIVITY_SORTERS = {
  time: (r: AuditLogEntry) => r.timestamp,
  admin: (r: AuditLogEntry) => admins.find((a) => a.id === r.adminId)?.name ?? "",
}

function ActivityTable() {
  const rows = useMemo(() => auditLog, [])
  const t = useTable<AuditLogEntry>(rows, {
    getId: (r) => r.id,
    sorters: ACTIVITY_SORTERS,
    initialSort: { key: "time", dir: "desc" },
    pageSize: 10,
  })

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-body2 text-muted-foreground">
          <span className="font-semibold text-foreground">{t.total.toLocaleString()}</span> recent actions by admins
        </p>
        <Link to="/audit-log" className="text-body2 font-semibold text-foreground underline underline-offset-2">
          See full audit log
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <SortHead label="Admin" sortKey="admin" sort={t.sort} onSort={t.toggleSort} />
            <TableHead>Action</TableHead>
            <TableHead>Target</TableHead>
            <SortHead label="Time" sortKey="time" sort={t.sort} onSort={t.toggleSort} align="right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {t.pagedRows.map((e) => {
            const admin = admins.find((a) => a.id === e.adminId)
            const target = auditTarget(e.action)
            return (
              <TableRow key={e.id}>
                <TableCell className="w-56">
                  <div className="flex items-center gap-3">
                    <Avatar name={admin?.name ?? "Admin"} className="size-8 text-caption" />
                    <div className="min-w-0">
                      <p className="truncate text-body2 font-semibold text-foreground">{admin?.name ?? "Admin"}</p>
                      <p className="truncate text-caption text-muted-foreground">{admin?.role}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-[220px]">
                  <p className="truncate text-body2 text-foreground" title={e.action}>
                    {e.action}
                  </p>
                </TableCell>
                <TableCell className="max-w-[260px]">
                  {target ? (
                    <Link to={target.to} className="block truncate text-body2 font-medium text-foreground underline underline-offset-2" title={target.label}>
                      {target.label}
                    </Link>
                  ) : (
                    <span>—</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right tabular-nums">{stamp(e.timestamp)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <Pagination
        page={t.page}
        totalPages={t.totalPages}
        onPageChange={t.setPage}
        total={t.total}
        pageSize={t.pageSize}
        onPageSizeChange={t.setPageSize}
        noun="actions"
      />
    </div>
  )
}

/** Airbnb Earnings numbers: small grey label, big bold figure, nothing else. */
function Figure({ label, value, to }: { label: string; value: string | number; to?: string }) {
  const body = (
    <>
      <p className="text-body2 text-muted-foreground">{label}</p>
      <p className="mt-1 text-h3 font-bold leading-10 tracking-tight text-foreground">{value}</p>
    </>
  )
  return to ? (
    <Link to={to} className="block rounded-lg transition-opacity hover:opacity-70">
      {body}
    </Link>
  ) : (
    <div>{body}</div>
  )
}

/** Shortcuts as icon tiles, like the web app's settings cards. */
const SHORTCUTS = [
  { title: "Post a job", text: "Add a job for a poster, or as Jobs Region.", to: "/jobs/new", icon: PlusCircle },
  { title: "Job sources", text: "Pull jobs in from partner sites and post out.", to: "/job-sources", icon: Plug },
  { title: "Send an announcement", text: "Push, email or in-app messages to users.", to: "/announcements", icon: Send },
  { title: "Set promotion prices", text: "Boost, Spotlight and Pro, as the app sells them.", to: "/promotions", icon: Megaphone },
  { title: "Write a blog post", text: "Tips for job seekers and people hiring.", to: "/blog", icon: Newspaper },
  { title: "Update the Help Center", text: "Answers people see before they contact us.", to: "/support", icon: LifeBuoy },
  { title: "Marketplace rules", text: "Review windows, limits and ID types.", to: "/settings", icon: SlidersHorizontal },
  { title: "Invite an admin", text: "Give a teammate the access they need.", to: "/admins", icon: UserPlus },
]

const VIEWS = [
  { key: "action", label: "Needs your action", count: TASKS.length },
  { key: "activity", label: "Recent activity" },
] as const

type ViewKey = (typeof VIEWS)[number]["key"]

function filterSignups(preset: DatePreset, customRange: CustomRange | null) {
  const anchor = new Date(`${ANCHOR_DATE}T00:00:00`)
  switch (preset) {
    case "7d":
      return dailySignups.slice(-7)
    case "14d":
      return dailySignups.slice(-14)
    case "30d":
      return dailySignups.slice(-30)
    case "90d":
      return dailySignups.slice(-90)
    case "this_month": {
      const year = anchor.getFullYear()
      const month = anchor.getMonth()
      return dailySignups.filter((d) => {
        const dt = new Date(`${d.date}T00:00:00`)
        return dt.getFullYear() === year && dt.getMonth() === month
      })
    }
    case "last_month": {
      const prev = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1)
      const year = prev.getFullYear()
      const month = prev.getMonth()
      return dailySignups.filter((d) => {
        const dt = new Date(`${d.date}T00:00:00`)
        return dt.getFullYear() === year && dt.getMonth() === month
      })
    }
    case "custom":
      if (!customRange) return dailySignups.slice(-7)
      return dailySignups.filter((d) => d.date >= customRange.start && d.date <= customRange.end)
  }
}

function DashboardPage() {
  const [view, setView] = useState<ViewKey>("action")
  const [preset, setPreset] = useState<DatePreset>("30d")
  const [customRange, setCustomRange] = useState<CustomRange | null>(null)
  const signups = filterSignups(preset, customRange)
  const latestPro = proSubscriberTrend[proSubscriberTrend.length - 1]
  const urgent = TASKS.filter((t) => t.priority === 0).length

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${currentAdmin.name.split(" ")[0]}`}
        description={
          TASKS.length
            ? `${TASKS.length} things are waiting on the team${urgent ? `, ${urgent} of them urgent` : ""}.`
            : "Nothing is waiting on the team right now."
        }
      />

      <section>
        <h2 className="heading-section mb-6">Your marketplace</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-3 xl:grid-cols-6">
          <Figure label="Active users" value={stats.activeUsers} to="/users" />
          <Figure label="New sign-ups, 7 days" value={stats.newSignups7d} />
          <Figure label="Open reports" value={openReportCount} to="/reports" />
          <Figure label="Reported reviews" value={flaggedReviewCount} to="/reviews" />
          <Figure label="Active promotions" value={stats.activePromotions} to="/promotions" />
          <Figure label="Pro members" value={stats.activeProSubscribers} to="/subscriptions" />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="heading-card">New sign-ups</h3>
              <DateRangeDropdown
                preset={preset}
                customRange={customRange}
                onChange={(p, range) => {
                  setPreset(p)
                  if (range) setCustomRange(range)
                }}
              />
            </div>
            {signups.length > 0 ? (
              <BarChart data={signups} xLabel="Date" yLabel="Sign-ups per day" unit="sign-ups" color="var(--foreground)" />
            ) : (
              <p className="py-14 text-center text-body2 text-muted-foreground">No sign-ups in this range.</p>
            )}
          </div>
          <div>
            <h3 className="heading-card mb-4">Pro members, last 30 days</h3>
            <p className="text-h3 font-bold leading-10 tracking-tight text-foreground">{latestPro.count}</p>
            <div className="mt-4">
              <Sparkline label="Active Pro members" latest={`${latestPro.count}`} data={proSubscriberTrend.map((d) => d.count)} color="var(--brand)" />
            </div>
            <div className="mt-6 space-y-3 border-t border-border pt-6 text-body1">
              <p className="flex items-center gap-3 text-foreground">
                <BadgeCheck className="size-5" strokeWidth={1.75} /> {stats.pendingVerifications} people waiting on ID checks
              </p>
              <p className="flex items-center gap-3 text-foreground">
                <Briefcase className="size-5" strokeWidth={1.75} /> {stats.flaggedJobs} flagged job{stats.flaggedJobs === 1 ? "" : "s"}
              </p>
              <p className="flex items-center gap-3 text-foreground">
                <Flag className="size-5" strokeWidth={1.75} /> {openReportCount} reports to decide
              </p>
              <p className="flex items-center gap-3 text-foreground">
                <Star className="size-5" strokeWidth={1.75} /> {flaggedReviewCount} reviews reported
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14 border-t border-border pt-10">
        <h2 className="heading-section">Shortcuts</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SHORTCUTS.map(({ title, text, to, icon: Icon }) => (
            <Link key={to} to={to} className="flex flex-col rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-card">
              <Icon className="size-8 text-foreground" strokeWidth={1.5} />
              <p className="mt-8 text-body1 font-semibold text-foreground">{title}</p>
              <p className="mt-0.5 text-body2 text-muted-foreground">{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14 border-t border-border pt-10">
        <PillTabs options={VIEWS} value={view} onChange={setView} />
        <div className="mt-6">{view === "action" ? <ActionTable /> : <ActivityTable />}</div>
      </section>

      <div className="mt-14 rounded-xl bg-muted px-8 py-6">
        <p className="heading-card">Free to post and message, no commission</p>
        <p className="text-body1 text-muted-foreground">People pay each other directly. Promotions and Pro are the only paid extras.</p>
      </div>
    </div>
  )
}

export default DashboardPage
