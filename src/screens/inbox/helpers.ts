import { Globe, Mail, Smartphone } from "lucide-react"

import type { Status } from "@/components/ui/status-pill"
import { admins, currentAdminId, users } from "@/lib/mock-data"
import { conversationContact, type InboxChannel, type InboxConversation, type InboxStatus } from "@/lib/inbox-data"

/** The inbox's "now": the mock conversations are dated around 22 Oct 2026. */
export const TODAY = "2026-10-22"

export const STATUS_PILL: Record<InboxStatus, Status> = {
  New: "warning",
  Open: "success",
  "Waiting on them": "neutral",
  Closed: "neutral",
}

export const CHANNEL_ICON: Record<InboxChannel, typeof Globe> = {
  "Website form": Globe,
  "In-app": Smartphone,
  Email: Mail,
}

export const lookupUser = (id: string) => users.find((u) => u.id === id)
export const contactOf = (c: InboxConversation) => conversationContact(c, lookupUser)
export const adminName = (id?: string) => admins.find((a) => a.id === id)?.name ?? "Jobs Region"
export const lastMessage = (c: InboxConversation) => c.messages[c.messages.length - 1]
export const lastAt = (c: InboxConversation) => lastMessage(c)?.at ?? ""

export const assignableAdmins = admins
  .filter((a) => !a.removed && a.status !== "destructive")
  .map((a) => ({ value: a.id, label: a.id === currentAdminId ? `${a.name} (you)` : a.name, hint: a.role }))

/** Who the person is, for matching their other conversations: account id or guest email. */
export const personKey = (c: InboxConversation) => c.userId ?? c.guest?.email ?? c.id

const daysBetween = (from: string, to: string) =>
  Math.round((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 86_400_000)

/** "09:14" for today, "Yesterday", otherwise "18 Oct", like Airbnb's inbox. */
export function listTime(at: string) {
  const [date, time] = at.split(" ")
  if (date === TODAY) return time
  if (daysBetween(date, TODAY) === 1) return "Yesterday"
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

/** Day divider in a thread: "Today", "Yesterday", "Monday 20 October". */
export function dayLabel(date: string) {
  const diff = daysBetween(date, TODAY)
  if (diff <= 0) return "Today"
  if (diff === 1) return "Yesterday"
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
}

export function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export function nowStamp() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
