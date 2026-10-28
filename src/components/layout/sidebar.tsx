import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Flag,
  Star,
  FolderTree,
  Megaphone,
  Crown,
  Newspaper,
  LifeBuoy,
  ShieldCheck,
  History,
  Inbox,
  Plug,
  Wallet,
  Send,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { users, jobs } from "@/lib/mock-data"
import { openReportCount, flaggedReviewCount } from "@/lib/trust-data"

const pendingVerification = users.filter((u) => u.verification === "warning").length
const jobsPendingReview = jobs.filter((j) => j.statusLabel === "Pending Review").length

type Item = { to: string; label: string; icon: LucideIcon; end?: boolean; count?: number }

/** Every admin section, grouped like the web app's Airbnb-style settings list. */
const GROUPS: { title?: string; items: Item[] }[] = [
  {
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/users", label: "Users", icon: Users, count: pendingVerification },
      { to: "/jobs", label: "Jobs", icon: Briefcase, count: jobsPendingReview },
      { to: "/reports", label: "Reports", icon: Flag, count: openReportCount },
      { to: "/inbox", label: "Inbox", icon: Inbox },
    ],
  },
  {
    title: "Marketplace",
    items: [
      { to: "/reviews", label: "Reviews & hires", icon: Star, count: flaggedReviewCount },
      { to: "/categories", label: "Categories", icon: FolderTree },
      { to: "/job-sources", label: "Job sources", icon: Plug },
    ],
  },
  {
    title: "Money",
    items: [
      { to: "/payments", label: "Payments", icon: Wallet },
      { to: "/promotions", label: "Promotions", icon: Megaphone },
      { to: "/subscriptions", label: "Pro membership", icon: Crown },
    ],
  },
  {
    title: "Content",
    items: [
      { to: "/blog", label: "Blog", icon: Newspaper },
      { to: "/support", label: "Help Center", icon: LifeBuoy },
      { to: "/announcements", label: "Announcements", icon: Send },
    ],
  },
  {
    title: "Team",
    items: [
      { to: "/admins", label: "Admins and roles", icon: ShieldCheck },
      { to: "/audit-log", label: "Audit log", icon: History },
      { to: "/settings", label: "Marketplace rules", icon: SlidersHorizontal },
    ],
  },
]

/** Plain rows with big icons, the current one on a grey pill in bold; counts in brand orange. */
function Sidebar() {
  return (
    <aside className="sticky top-20 h-[calc(100vh-80px)] w-[272px] shrink-0 overflow-y-auto border-r border-border bg-card px-4 py-6">
      <nav aria-label="Admin" className="flex flex-col gap-5">
        {GROUPS.map((group, i) => (
          <div key={group.title ?? i} className="flex flex-col gap-0.5">
            {group.title && <p className="px-4 pb-2 text-xs font-semibold text-muted-foreground">{group.title}</p>}
            {group.items.map(({ to, label, icon: Icon, end, count }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-4 rounded-md px-4 py-2.5 text-body1 text-foreground transition-colors",
                    isActive ? "bg-muted-strong font-semibold" : "hover:bg-muted",
                  )
                }
              >
                <Icon className="size-5 shrink-0" strokeWidth={1.75} />
                <span className="flex-1">{label}</span>
                {!!count && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-caption font-bold text-white">
                    {count}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}

export { Sidebar }
