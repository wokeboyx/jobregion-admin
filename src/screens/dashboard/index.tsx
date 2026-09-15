import { useState, type ComponentType } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UserCheck, Briefcase, Users, Megaphone, CreditCard, Newspaper, LifeBuoy, ArrowRight, UserPlus } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { StatusPill } from "@/components/ui/status-pill"
import { Sparkline } from "@/components/sparkline-chart"
import { BarChart } from "@/components/bar-chart"
import { DateRangeDropdown, type DatePreset, type CustomRange } from "@/components/date-range-dropdown"
import { cn } from "@/lib/utils"
import {
  stats,
  dailySignups,
  proSubscriberTrend,
  pendingVerificationUsers,
  needsAttentionItems,
  ANCHOR_DATE,
} from "@/lib/mock-data"

type Icon = ComponentType<{ className?: string }>

function IconCircle({ icon: Icon }: { icon: Icon }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-cta-tint">
      <Icon className="size-5 text-brand-cta" />
    </div>
  )
}

function MetricCard({ icon: Icon, value, label }: { icon: Icon; value: number; label: string }) {
  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="truncate text-sm text-muted-foreground">{label}</p>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </div>
      <p className="text-3xl font-semibold leading-none text-foreground">{value}</p>
    </Card>
  )
}

function QuickLinkCard({ icon, label, to }: { icon: Icon; label: string; to: string }) {
  return (
    <Link to={to}>
      <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-muted">
        <IconCircle icon={icon} />
        <p className="flex-1 truncate text-sm font-medium text-foreground">{label}</p>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
      </Card>
    </Link>
  )
}

const KEY_METRICS = [
  { icon: UserCheck, value: stats.pendingVerifications, label: "Pending verification" },
  { icon: Briefcase, value: stats.flaggedJobs, label: "Flagged jobs" },
  { icon: Megaphone, value: stats.activePromotions, label: "Active promotions" },
  { icon: Users, value: stats.activeUsers, label: "Total active users" },
]

const QUICK_ACTIONS = [
  { icon: CreditCard, label: "Add subscription plan", to: "/subscriptions" },
  { icon: Newspaper, label: "Write a blog post", to: "/blog" },
  { icon: LifeBuoy, label: "Add support article", to: "/support" },
  { icon: UserPlus, label: "Invite admin", to: "/admins" },
]

const TABS = [
  { key: "pending", label: "Pending Verification" },
  { key: "attention", label: "Needs Attention" },
  { key: "analytics", label: "Analytics" },
] as const

type TabKey = (typeof TABS)[number]["key"]

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

function ViewLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="text-xs font-bold text-foreground"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      View
    </button>
  )
}

function PendingVerificationTab() {
  const navigate = useNavigate()

  if (pendingVerificationUsers.length === 0) {
    return <p className="px-1 py-6 text-sm text-muted-foreground">No users are pending verification.</p>
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Date joined</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingVerificationUsers.map((user) => (
            <TableRow key={user.id} onClick={() => navigate(`/users/${user.id}`)} className="cursor-pointer">
              <TableCell className="font-medium text-foreground">{user.name}</TableCell>
              <TableCell>{user.roles.join(", ")}</TableCell>
              <TableCell>{user.location}</TableCell>
              <TableCell className="text-muted-foreground">{user.dateJoined}</TableCell>
              <TableCell>
                <StatusPill status={user.verification} label={user.verificationLabel} />
              </TableCell>
              <TableCell>
                <ViewLink onClick={() => navigate(`/users/${user.id}`)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

function NeedsAttentionTab() {
  const navigate = useNavigate()

  if (needsAttentionItems.length === 0) {
    return <p className="px-1 py-6 text-sm text-muted-foreground">Nothing needs attention right now.</p>
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {needsAttentionItems.map((item) => (
            <TableRow key={item.id} onClick={() => navigate(item.to)} className="cursor-pointer">
              <TableCell className="text-muted-foreground">{item.type}</TableCell>
              <TableCell className="font-medium text-foreground">{item.title}</TableCell>
              <TableCell>
                <StatusPill status={item.status} label={item.statusLabel} />
              </TableCell>
              <TableCell className="text-muted-foreground">{item.date}</TableCell>
              <TableCell>
                <ViewLink onClick={() => navigate(item.to)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

function AnalyticsTab() {
  const [preset, setPreset] = useState<DatePreset>("7d")
  const [customRange, setCustomRange] = useState<CustomRange | null>(null)
  const signups = filterSignups(preset, customRange)
  const latestPro = proSubscriberTrend[proSubscriberTrend.length - 1]

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">New user signups</p>
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
          <BarChart data={signups} xLabel="Date" yLabel="Signups per day" />
        ) : (
          <p className="py-14 text-center text-sm text-muted-foreground">No signups in this range.</p>
        )}
      </Card>

      <Card className="p-4">
        <p className="mb-4 text-sm font-semibold text-foreground">Active Pro subscribers</p>
        <Sparkline
          label="Active Pro subscribers"
          latest={`${latestPro.count}`}
          data={proSubscriberTrend.map((d) => d.count)}
          color="var(--success)"
        />
      </Card>
    </div>
  )
}

function DashboardPage() {
  const [tab, setTab] = useState<TabKey>("pending")

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Key metrics</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KEY_METRICS.map((s) => (
            <MetricCard key={s.label} {...s} />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Quick actions</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {QUICK_ACTIONS.map((a) => (
            <QuickLinkCard key={a.label} {...a} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex h-9 items-center gap-1 border-b border-border px-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative px-1.5 py-1 text-sm",
                tab === t.key ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {t.label}
              {tab === t.key && <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-foreground" />}
            </button>
          ))}
        </div>

        {tab === "pending" && <PendingVerificationTab />}
        {tab === "attention" && <NeedsAttentionTab />}
        {tab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  )
}

export default DashboardPage
