import { useState } from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderTree,
  Megaphone,
  CreditCard,
  Newspaper,
  LifeBuoy,
  ShieldCheck,
  History,
  ChevronDown,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { users, jobs, admins, currentAdminId } from "@/lib/mock-data"
import { Avatar } from "@/components/ui/avatar"
import { MyProfileDialog } from "@/components/my-profile-dialog"
import { LogoMark } from "./logo-mark"

const pendingVerification = users.filter((u) => u.verification === "warning").length
const jobsPendingReview = jobs.filter((j) => j.statusLabel === "Pending Review").length

const PLATFORM_ITEMS = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/users", label: "Users", icon: Users, badge: pendingVerification },
  { to: "/jobs", label: "Jobs", icon: Briefcase, badge: jobsPendingReview },
  { to: "/categories", label: "Categories", icon: FolderTree },
  { to: "/promotions", label: "Promotions", icon: Megaphone },
  { to: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { to: "/blog", label: "Blog", icon: Newspaper },
  { to: "/support", label: "Support Center", icon: LifeBuoy },
]

const ADMIN_ITEMS = [
  { to: "/admins", label: "Admin Management", icon: ShieldCheck },
  { to: "/audit-log", label: "Audit Log", icon: History },
]

const currentAdmin = admins.find((a) => a.id === currentAdminId)!

function Sidebar() {
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-card">
      <div className="flex h-16 shrink-0 items-center gap-2 px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary">
          <LogoMark className="text-sm" />
        </div>
        <span className="text-base font-semibold text-foreground">JobRegion</span>
      </div>

      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-2">
        <div className="flex flex-col gap-0.5">
          {PLATFORM_ITEMS.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-[14px] font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {!!badge && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-cta px-1 text-[10px] font-semibold text-primary-foreground">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="px-1">
            <div className="h-px w-full bg-border" />
          </div>
          <p className="pl-3 pb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Administration
          </p>
          {ADMIN_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-[14px] font-medium transition-colors",
                  isActive
                    ? "bg-brand-cta-tint text-brand-cta"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="flex h-[60px] shrink-0 flex-col">
        <div className="h-px w-full bg-border" />
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="flex flex-1 items-center gap-2 rounded-md p-3 text-left hover:bg-muted"
        >
          <Avatar name={currentAdmin.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{currentAdmin.name}</p>
            <p className="text-xs text-muted-foreground">{currentAdmin.role}</p>
          </div>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </div>

      <MyProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
    </aside>
  )
}

export { Sidebar }
