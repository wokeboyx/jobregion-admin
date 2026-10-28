import { useSyncExternalStore } from "react"

import { admins, currentAdminId, users, ANCHOR_DATE } from "@/lib/mock-data"
import { reports as baseReports, type Report, type ReportKind, type ReportState } from "@/lib/trust-data"
import { generatedReports, type ReportExtra } from "./generated"

/*
 * A tiny module-level store for reports, so a decision made on /reports/:id shows straight away on /reports.
 * Mock only: it lives for the session and resets on reload.
 */

export interface TimelineEvent {
  label: string
  date: string
  by?: string
  note?: string
  tone?: "neutral" | "success" | "danger"
}

export interface ReportRecord extends Report {
  timeline: TimelineEvent[]
  /** The admin's note for the audit log, saved with the decision. */
  note?: string
}

const me = admins.find((a) => a.id === currentAdminId)?.name ?? "You"

export const userName = (id: string) => users.find((u) => u.id === id)?.name ?? "Unknown user"

export const isOpen = (r: Pick<Report, "state">) => r.state === "Received" || r.state === "In review"

function initialTimeline(r: Report & ReportExtra): TimelineEvent[] {
  const events: TimelineEvent[] = [{ label: "Report received", date: r.date, by: userName(r.reporterId), note: r.blocked ? "The reporter also blocked this person." : undefined }]
  if (r.state !== "Received") events.push({ label: "Review started", date: r.reviewStarted ?? r.date, by: r.handledBy ?? me })
  if (r.state === "Resolved" || r.state === "Dismissed") {
    events.push({
      label: r.state === "Resolved" ? "Action taken" : "Dismissed",
      date: r.decidedOn ?? r.reviewStarted ?? r.date,
      by: r.handledBy ?? me,
      note: r.resolution,
      tone: r.state === "Resolved" ? "danger" : "neutral",
    })
  }
  return events
}

let state: ReportRecord[] = [...baseReports, ...generatedReports]
  .map((r) => ({ ...r, timeline: initialTimeline(r) }))
  .sort((a, b) => b.date.localeCompare(a.date))

const listeners = new Set<() => void>()
const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
const emit = () => listeners.forEach((fn) => fn())

function patch(ids: string[], change: (r: ReportRecord) => ReportRecord) {
  const set = new Set(ids)
  state = state.map((r) => (set.has(r.id) ? change(r) : r))
  emit()
}

export function useReports() {
  return useSyncExternalStore(subscribe, () => state)
}

/** Moves new reports into review. Reports already in review or closed are left alone. */
export function startReview(ids: string[]) {
  patch(ids, (r) =>
    r.state !== "Received" ? r : { ...r, state: "In review", timeline: [...r.timeline, { label: "Review started", date: ANCHOR_DATE, by: me }] },
  )
}

/** Closes open reports with an outcome. */
export function decide(ids: string[], outcome: { state: Extract<ReportState, "Resolved" | "Dismissed">; label: string; resolution: string; note?: string }) {
  patch(ids, (r) => {
    if (!isOpen(r)) return r
    const note = outcome.note?.trim() || undefined
    return {
      ...r,
      state: outcome.state,
      resolution: outcome.resolution,
      note: note ?? r.note,
      timeline: [
        ...r.timeline,
        ...(r.state === "Received" ? [{ label: "Review started", date: ANCHOR_DATE, by: me }] : []),
        {
          label: outcome.label,
          date: ANCHOR_DATE,
          by: me,
          note: note ? `${outcome.resolution} ${note}` : outcome.resolution,
          tone: outcome.state === "Resolved" ? ("danger" as const) : ("neutral" as const),
        },
      ],
    }
  })
}

/** The action that deals with the problem itself, per kind of report. */
export const ENFORCE: Record<ReportKind, { label: string; done: string; title: string; description: string }> = {
  job: {
    label: "Remove job",
    done: "Job removed.",
    title: "Remove this job",
    description: "The job comes off Jobs Region and the poster gets an email with the reason you pick.",
  },
  person: {
    label: "Suspend account",
    done: "Account suspended.",
    title: "Suspend this account",
    description: "They can’t sign in, post or message until an admin lifts the suspension.",
  },
  chat: {
    label: "Suspend account",
    done: "Account suspended for messages sent in chat.",
    title: "Suspend this account",
    description: "They can’t sign in, post or message until an admin lifts the suspension.",
  },
  review: {
    label: "Remove review",
    done: "Review removed from the profile.",
    title: "Remove this review",
    description: "It comes off the profile and stops counting towards the rating. Both people get an email.",
  },
}

/* ---------- Order for the previous / next arrows on the report page ---------- */

let navOrder: string[] = []

/** The list page saves the order the admin was looking at, so ‹ › on the report page walk the same list. */
export function setNavOrder(ids: string[]) {
  navOrder = ids
}

export function getNavOrder(all: ReportRecord[], id: string) {
  return navOrder.includes(id) ? navOrder : all.map((r) => r.id)
}
