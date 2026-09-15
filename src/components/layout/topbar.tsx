import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { Bell, Search, ChevronDown, LayoutPanelTop } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { RowMenu } from "@/components/row-menu"
import { MyProfileDialog } from "@/components/my-profile-dialog"
import { cn } from "@/lib/utils"
import { usePreviewState, type PreviewState } from "@/lib/preview-state"
import { admins, currentAdminId } from "@/lib/mock-data"

const currentAdmin = admins.find((a) => a.id === currentAdminId)!

const PREVIEWABLE_PATHS = new Set([
  "/users",
  "/jobs",
  "/categories",
  "/promotions",
  "/subscriptions",
  "/admins",
  "/blog",
  "/support",
  "/audit-log",
])

const PREVIEW_OPTIONS: { value: PreviewState; label: string }[] = [
  { value: "default", label: "Default view" },
  { value: "empty", label: "Empty state" },
  { value: "no-results", label: "No results" },
  { value: "error", label: "Error state" },
]

function PreviewStateMenu() {
  const { state, setState } = usePreviewState()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  const current = PREVIEW_OPTIONS.find((o) => o.value === state) ?? PREVIEW_OPTIONS[0]

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border px-3 text-sm font-medium outline-none",
          state === "default"
            ? "border-border bg-card text-foreground"
            : "border-brand-cta bg-brand-cta-tint text-brand-cta",
        )}
      >
        <LayoutPanelTop className="size-4" />
        {current.label}
        <ChevronDown className="size-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-md border border-border bg-card py-1 shadow-[0px_10px_15px_rgba(0,0,0,0.08)]">
          {PREVIEW_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                setState(o.value)
                setOpen(false)
              }}
              className={cn(
                "block w-full px-3 py-1.5 text-left text-[13px] font-medium hover:bg-muted",
                state === o.value ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const PAGE_META: Record<string, { title: string; search: string }> = {
  "/": { title: "Overview", search: "Search…" },
  "/users": { title: "Users", search: "Search users…" },
  "/jobs": { title: "Jobs", search: "Search jobs…" },
  "/categories": { title: "Categories", search: "Search categories…" },
  "/promotions": { title: "Promotions", search: "Search promotions…" },
  "/subscriptions": { title: "Subscriptions", search: "Search subscriptions…" },
  "/blog": { title: "Blog", search: "Search posts…" },
  "/support": { title: "Support Center", search: "Search articles…" },
  "/admins": { title: "Admin Management", search: "Search admins…" },
  "/audit-log": { title: "Audit Log", search: "Search the audit log…" },
}

const NOTIFICATIONS = [
  { id: 1, text: "Kwame Asante submitted a new verification request", time: "12 min ago" },
  { id: 2, text: "Job \"Professional Wedding DJ\" was flagged by a user", time: "1 hour ago" },
  { id: 3, text: "Grace Nwankwo requested a role change", time: "3 hours ago" },
]

function NotificationsMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="size-[18px]" />
        <span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-80 rounded-md border border-border bg-card py-1 shadow-[0px_10px_15px_rgba(0,0,0,0.08)]">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Notifications
          </p>
          {NOTIFICATIONS.map((n) => (
            <div key={n.id} className="border-t border-border px-3 py-2.5 hover:bg-muted">
              <p className="text-[13px] text-foreground">{n.text}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Topbar() {
  const { pathname } = useLocation()
  const section = `/${pathname.split("/")[1] ?? ""}`
  const meta = PAGE_META[pathname] ?? PAGE_META[section] ?? { title: "JobRegion Admin", search: "Search…" }
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 bg-card px-6">
      <h1 className="text-xl font-semibold text-foreground">{meta.title}</h1>

      <div className="relative h-9 w-80">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder={meta.search}
          className="h-9 w-full rounded-md border border-border bg-card pl-8 pr-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-brand-cta"
        />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {PREVIEWABLE_PATHS.has(pathname) && <PreviewStateMenu />}

        <NotificationsMenu />

        <RowMenu
          items={[
            { label: "View profile", onSelect: () => setProfileOpen(true) },
            { label: "Sign out", onSelect: () => {} },
          ]}
        >
          <div className="flex items-center gap-2 rounded-md p-1.5 hover:bg-muted">
            <Avatar name={currentAdmin.name} />
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </div>
        </RowMenu>
      </div>

      <MyProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  )
}

export { Topbar }
