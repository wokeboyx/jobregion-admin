import { admins, auditLog, blogPosts, jobs, promotions, subscriptionPlans, users, naira } from "@/lib/mock-data"
import { reports } from "@/lib/trust-data"

/*
 * The audit log at scale: the hand-written entries from mock-data plus ~300 generated ones, made from templates
 * with a seeded random so they look the same on every load. Each entry knows its type, target and device.
 */

export type AuditCategory = "verification" | "jobs" | "reports" | "payments" | "settings" | "team" | "content"

export const AUDIT_CATEGORY_LABEL: Record<AuditCategory, string> = {
  verification: "Verification",
  jobs: "Jobs",
  reports: "Reports",
  payments: "Payments",
  settings: "Settings",
  team: "Team",
  content: "Content",
}

export interface AuditRow {
  id: string
  adminId: string
  action: string
  category: AuditCategory
  target: { label: string; to?: string }
  device: string
  ip: string
  /** "2026-07-07 09:12" */
  timestamp: string
}

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = seeded(7077)
const pick = <T>(list: readonly T[]) => list[Math.floor(rand() * list.length)]

/** Each admin works from one or two devices, like a real team. */
const DEVICES: Record<string, { device: string; ip: string }[]> = {
  "A-01": [
    { device: "Chrome on macOS", ip: "102.89.34.12" },
    { device: "Safari on iPhone", ip: "105.112.18.77" },
  ],
  "A-02": [
    { device: "Chrome on macOS", ip: "197.210.53.40" },
    { device: "Chrome on Android", ip: "102.67.9.201" },
  ],
  "A-03": [{ device: "Edge on Windows", ip: "41.58.101.33" }],
  "A-04": [
    { device: "Firefox on Windows", ip: "154.120.88.6" },
    { device: "Safari on iPad", ip: "154.120.88.6" },
  ],
  "A-05": [{ device: "Chrome on Windows", ip: "102.88.43.119" }],
  "A-06": [{ device: "Chrome on Linux", ip: "197.149.92.15" }],
  "A-07": [{ device: "Safari on macOS", ip: "105.113.60.2" }],
  "A-08": [{ device: "Chrome on Windows", ip: "41.190.12.88" }],
}

const deviceFor = (adminId: string) => pick(DEVICES[adminId] ?? [{ device: "Chrome on Windows", ip: "102.89.0.1" }])

/** Who usually does what. */
const ACTORS: Record<AuditCategory, string[]> = {
  verification: ["A-02", "A-02", "A-05", "A-06", "A-01"],
  jobs: ["A-02", "A-02", "A-06", "A-01"],
  reports: ["A-02", "A-02", "A-06", "A-01"],
  payments: ["A-04", "A-04", "A-01"],
  settings: ["A-01"],
  team: ["A-01"],
  content: ["A-03", "A-03", "A-05", "A-01"],
}

const CATEGORY_WEIGHTS: AuditCategory[] = [
  "verification", "verification", "verification",
  "jobs", "jobs", "jobs", "jobs",
  "reports", "reports", "reports",
  "payments", "payments",
  "content", "content",
  "settings",
  "team",
]

const SETTINGS = [
  "Minimum reviews before a rating shows",
  "Days to confirm a hire",
  "Job auto-expiry after 30 days",
  "Fee warning on job posts",
  "Verification photo rules",
  "Promotion prices",
]

function makeAction(category: AuditCategory): Pick<AuditRow, "action" | "target"> {
  switch (category) {
    case "verification": {
      const u = pick(users)
      return {
        action: pick(["Approved verification", "Approved verification", "Rejected verification", "Asked for a clearer ID photo"]),
        target: { label: u.name, to: `/users/${u.id}` },
      }
    }
    case "jobs": {
      const j = pick(jobs)
      return {
        action: pick(["Approved job", "Approved job", "Removed job", "Flagged job", "Changed job category", "Restored job"]),
        target: { label: j.title, to: `/jobs/${j.id}` },
      }
    }
    case "reports": {
      const r = pick(reports)
      return {
        action: pick(["Started review of report", "Dismissed report", "Warned user after report", "Suspended account after report"]),
        target: { label: `${r.id} · ${r.targetLabel}`, to: `/reports/${r.id}` },
      }
    }
    case "payments": {
      const kind = rand()
      if (kind < 0.4) {
        const p = pick(promotions)
        return { action: pick(["Approved promotion", "Ended promotion early"]), target: { label: `Promotion ${p.reference}`, to: `/promotions/${p.id}` } }
      }
      const u = pick(users)
      if (kind < 0.7) return { action: `Refunded ${naira(pick([2500, 5000, 7500, 15000]))}`, target: { label: u.name, to: "/payments" } }
      const plan = pick(subscriptionPlans)
      return { action: pick(["Cancelled subscription", "Extended Pro by 30 days"]), target: { label: `${u.name} · ${plan.name}`, to: "/subscriptions" } }
    }
    case "settings":
      return { action: "Changed setting", target: { label: pick(SETTINGS), to: "/settings" } }
    case "team": {
      const a = pick(admins.filter((x) => x.id !== "A-01"))
      return { action: pick(["Invited admin", "Changed admin role", "Reset admin password", "Suspended admin"]), target: { label: a.name, to: "/admins" } }
    }
    case "content": {
      const b = pick(blogPosts)
      return {
        action: pick(["Published blog post", "Edited blog post", "Archived blog post", "Sent announcement"]),
        target: { label: b.title, to: `/blog/${b.id}` },
      }
    }
  }
}

const ANCHOR = new Date("2026-07-07T21:00:00")
const pad = (n: number) => String(n).padStart(2, "0")

function makeTimestamp() {
  const d = new Date(ANCHOR)
  d.setDate(d.getDate() - Math.floor(Math.pow(rand(), 1.3) * 150))
  d.setHours(7 + Math.floor(rand() * 14), Math.floor(rand() * 60))
  if (d > ANCHOR) d.setTime(ANCHOR.getTime() - 3_600_000)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Sorts the hand-written entries into a type by their wording. */
function categoryOf(action: string): AuditCategory {
  const a = action.toLowerCase()
  if (a.includes("blog") || a.includes("support")) return "content"
  if (a.includes("verification")) return "verification"
  if (a.includes("admin") || a.includes("role")) return "team"
  if (a.includes("subscription") || a.includes("promotion")) return "payments"
  if (a.includes("job")) return "jobs"
  if (a.includes("disabled account") || a.includes("report")) return "reports"
  return "settings"
}

/** Pulls a quoted title or a trailing name out of a hand-written action, so it can sit in the Target column. */
function splitTarget(action: string): { action: string; target: string } {
  const quoted = action.match(/^(.*?)\s*"(.+)"(.*)$/)
  if (quoted) return { action: `${quoted[1]}${quoted[3]}`.trim(), target: quoted[2] }
  const named = action.match(/^(.*?\b(?:for|admin))\s+(.+)$/)
  if (named) return { action: named[1].replace(/\s+for$/, ""), target: named[2] }
  const possessive = action.match(/^(Changed) (.+?)'s (.+)$/)
  if (possessive) return { action: `${possessive[1]} ${possessive[3]}`, target: possessive[2] }
  return { action, target: "—" }
}

function linkFor(label: string, category: AuditCategory): string | undefined {
  const user = users.find((u) => u.name === label)
  if (user) return `/users/${user.id}`
  const job = jobs.find((j) => j.title === label)
  if (job) return `/jobs/${job.id}`
  const post = blogPosts.find((b) => b.title === label)
  if (post) return `/blog/${post.id}`
  if (category === "team") return "/admins"
  if (category === "payments") return "/subscriptions"
  return undefined
}

const handWritten: AuditRow[] = auditLog.map((e) => {
  const category = categoryOf(e.action)
  const { action, target } = splitTarget(e.action)
  return { ...e, action, category, target: { label: target, to: linkFor(target, category) }, ...deviceFor(e.adminId) }
})

const generated: AuditRow[] = Array.from({ length: 300 }, (_, i) => {
  const category = pick(CATEGORY_WEIGHTS)
  const adminId = pick(ACTORS[category])
  return { id: `LOG-${1000 + i}`, adminId, category, ...makeAction(category), ...deviceFor(adminId), timestamp: makeTimestamp() }
})

export const auditRows: AuditRow[] = [...handWritten, ...generated].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
