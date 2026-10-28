import { Bell, Mail, Newspaper, Smartphone } from "lucide-react"

import { jobCategories, users } from "@/lib/mock-data"
import {
  AUDIENCE_LABEL,
  CHANNEL_LABEL,
  newsletterSubscribers,
  type NewsletterSubscriber,
  type Announcement,
  type AnnouncementChannel,
  type Audience,
} from "@/lib/announcements-data"

/** Mock users stand in for the real base: each one counts for this many people on Jobs Region. */
const SCALE = 640
/** Rough share of people who can be reached on each channel. */
const CHANNEL_REACH: Record<AnnouncementChannel, number> = { push: 0.62, inApp: 1, email: 0.88, newsletter: 1 }

const CITY_STATE: Record<string, string> = {
  Lagos: "Lagos",
  Abuja: "FCT Abuja",
  Uyo: "Akwa Ibom",
  Ibadan: "Oyo",
  "Port Harcourt": "Rivers",
  Enugu: "Enugu",
  Calabar: "Cross River",
  Onitsha: "Anambra",
  Kano: "Kano",
}

const active = users.filter((u) => !u.removed)
const subscribedCount = newsletterSubscribers.filter((s) => s.status === "Subscribed").length

function stateOf(location: string) {
  return CITY_STATE[location.split(",")[0]?.trim() ?? ""]
}

/** How many people the audience covers, before channels. */
export function audienceSize(a: Audience) {
  const n = (count: number) => Math.round(count * SCALE)
  switch (a.kind) {
    case "everyone":
      return n(active.length)
    case "seekers":
      return n(active.filter((u) => u.roles.includes("Worker")).length)
    case "hiring":
      return n(active.filter((u) => u.roles.includes("Employer")).length)
    case "pro":
      return n(active.filter((u) => u.roles.includes("Worker")).length * 0.08)
    case "unverified":
      return n(active.filter((u) => u.verification !== "success").length + active.length * 0.18)
    case "state": {
      const states = a.states ?? []
      // Every state has some people even if no mock user lives there.
      return n(states.reduce((sum, s) => sum + active.filter((u) => stateOf(u.location) === s).length + 0.15, 0))
    }
    case "category":
      return n((a.categories ?? []).length * active.length * 0.3)
    case "newsletter":
      return subscribedCount
  }
}

/** People reached on at least one of the chosen channels (the best-reaching channel wins). */
export function estimatedReach(a: Audience, channels: AnnouncementChannel[]) {
  if (channels.length === 0) return 0
  const best = Math.max(...channels.map((c) => CHANNEL_REACH[c]))
  return Math.round(audienceSize(a) * best)
}

export function channelReach(a: Audience, channel: AnnouncementChannel) {
  return Math.round(audienceSize(a) * CHANNEL_REACH[channel])
}

export function audienceSummary(a: Audience) {
  if (a.kind === "state") {
    const s = a.states ?? []
    if (s.length === 0) return "No states picked"
    return s.length <= 2 ? `People in ${s.join(" and ")}` : `People in ${s.slice(0, 2).join(", ")} +${s.length - 2} more`
  }
  if (a.kind === "category") {
    const names = (a.categories ?? []).map((id) => jobCategories.find((c) => c.id === id)?.name ?? id)
    if (names.length === 0) return "No categories picked"
    return `Works in ${names.join(", ")}`
  }
  return AUDIENCE_LABEL[a.kind]
}

export const channelList = (a: Announcement) => a.channels.map((c) => CHANNEL_LABEL[c])

export const formatCount = (n: number) => n.toLocaleString("en-NG")

/** Percentage with one decimal: pct(37, 120) → 30.8 */
export const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 1000) / 10 : 0)

/** "20 Oct, 10:00" */
export function formatDateTime(at: string) {
  const [date, time] = at.split(" ")
  const d = new Date(`${date}T00:00:00`)
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}, ${time}`
}

export function exportSubscribersCsv(rows: NewsletterSubscriber[]) {
  const lines = [["Email", "Source", "Signed up", "Status"], ...rows.map((s) => [s.email, s.source, s.date, s.status])]
  const csv = lines.map((l) => l.map((v) => `"${v.replaceAll("\"", "\"\"")}"`).join(",")).join("\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const a = document.createElement("a")
  a.href = url
  a.download = "jobs-region-newsletter-subscribers.csv"
  a.click()
  URL.revokeObjectURL(url)
}

export const CHANNEL_ICON: Record<AnnouncementChannel, typeof Bell> = {
  push: Smartphone,
  inApp: Bell,
  email: Mail,
  newsletter: Newspaper,
}

export const CHANNEL_ORDER: AnnouncementChannel[] = ["push", "inApp", "email", "newsletter"]
