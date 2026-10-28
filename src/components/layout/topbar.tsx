import { useEffect, useRef, useState, type ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { Bell, Menu, LayoutPanelTop, LogOut, UserRound } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { MyProfileDialog } from "@/components/my-profile-dialog"
import { cn } from "@/lib/utils"
import { usePreviewState, type PreviewState } from "@/lib/preview-state"
import { admins, currentAdminId } from "@/lib/mock-data"
import { LogoMark } from "./logo-mark"

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
  "/reports",
  "/reviews",
  "/job-sources",
  "/payments",
  "/announcements",
  "/inbox",
])

const PREVIEW_OPTIONS: { value: PreviewState; label: string }[] = [
  { value: "default", label: "Default view" },
  { value: "empty", label: "Empty state" },
  { value: "no-results", label: "No results" },
  { value: "error", label: "Error state" },
]

const NOTIFICATIONS = [
  { id: 1, text: "Kwame Asante submitted ID and selfie for verification", time: "12 min ago", unread: true, to: "/users/U-09" },
  { id: 2, text: "“Professional Wedding DJ” was reported: asks for a registration fee", time: "1 hour ago", unread: true, to: "/reports" },
  { id: 3, text: "A review of Bassey Umoh was reported for offensive language", time: "2 hours ago", unread: false, to: "/reviews" },
  { id: 4, text: "Grace Nwankwo requested a role change", time: "3 hours ago", unread: false, to: "/admins" },
]

/** A dropdown that closes on outside click and Escape. */
function Popover({
  trigger,
  children,
  className,
}: {
  trigger: (open: boolean, toggle: () => void) => ReactNode
  children: (close: () => void) => ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      {trigger(open, () => setOpen((o) => !o))}
      {open && (
        <div className={cn("absolute right-0 top-full z-50 mt-2 rounded-xl bg-card py-2 shadow-dropdown", className)}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

function PreviewStateMenu() {
  const { state, setState } = usePreviewState()
  const current = PREVIEW_OPTIONS.find((o) => o.value === state) ?? PREVIEW_OPTIONS[0]
  return (
    <Popover
      className="w-48"
      trigger={(_, toggle) => (
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm font-medium transition-colors",
            state === "default" ? "text-muted-foreground hover:bg-muted hover:text-foreground" : "bg-muted-strong text-foreground",
          )}
        >
          <LayoutPanelTop className="size-4" />
          {current.label}
        </button>
      )}
    >
      {(close) =>
        PREVIEW_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => {
              setState(o.value)
              close()
            }}
            className={cn(
              "block w-full px-4 py-2.5 text-left text-sm hover:bg-muted",
              state === o.value ? "font-semibold text-foreground" : "text-foreground",
            )}
          >
            {o.label}
          </button>
        ))
      }
    </Popover>
  )
}

function Topbar() {
  const { pathname } = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 h-20 border-b border-border bg-card">
      <div className="flex h-20 items-center justify-between gap-6 px-6">
        <Link to="/" aria-label="Jobs Region Admin, Dashboard" className="flex w-fit items-center gap-2.5">
          <LogoMark className="h-8 w-auto" />
          <span className="rounded-full border border-border px-2 py-0.5 text-caption font-semibold text-muted-foreground">Admin</span>
        </Link>

        <div className="flex items-center justify-end gap-1">
          {PREVIEWABLE_PATHS.has(pathname) && <PreviewStateMenu />}

          <Popover
            className="w-[380px]"
            trigger={(_, toggle) => (
              <button
                type="button"
                aria-label="Notifications"
                onClick={toggle}
                className="relative flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
              >
                <Bell className="size-5" strokeWidth={1.75} />
                <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-card bg-brand" />
              </button>
            )}
          >
            {(close) => (
              <>
                <p className="px-5 pb-2 pt-2 text-base font-semibold text-foreground">Notifications</p>
                {NOTIFICATIONS.map((n) => (
                  <Link key={n.id} to={n.to} onClick={close} className="flex gap-3 px-5 py-3 hover:bg-muted">
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.unread ? "bg-brand" : "bg-transparent")} />
                    <span>
                      <span className={cn("block text-sm text-foreground", n.unread && "font-semibold")}>{n.text}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{n.time}</span>
                    </span>
                  </Link>
                ))}
              </>
            )}
          </Popover>

          <Popover
            className="w-60"
            trigger={(_, toggle) => (
              <button
                type="button"
                onClick={toggle}
                aria-label="Account menu"
                className="ml-1 flex items-center gap-2.5 rounded-full border border-border py-1.5 pl-3.5 pr-1.5 transition-shadow hover:shadow-[0_2px_4px_rgb(0_0_0/0.18)]"
              >
                <Menu className="size-4 text-foreground" />
                <Avatar name={currentAdmin.name} className="size-8" />
              </button>
            )}
          >
            {(close) => (
              <>
                <div className="px-4 pb-3 pt-1">
                  <p className="text-sm font-semibold text-foreground">{currentAdmin.name}</p>
                  <p className="text-xs text-muted-foreground">{currentAdmin.role}</p>
                </div>
                <div className="border-t border-border pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(true)
                      close()
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted"
                  >
                    <UserRound className="size-[18px]" strokeWidth={1.75} />
                    Your profile
                  </button>
                  <button type="button" onClick={close} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted">
                    <LogOut className="size-[18px]" strokeWidth={1.75} />
                    Log out
                  </button>
                </div>
              </>
            )}
          </Popover>
        </div>
      </div>

      <MyProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  )
}

export { Topbar }
