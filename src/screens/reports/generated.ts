import { jobs, users } from "@/lib/mock-data"
import { REPORT_REASONS, type ChatLine, type Report, type ReportKind, type ReportState } from "@/lib/trust-data"
import { allReviews } from "@/screens/reviews/generated"

/*
 * ~80 extra reports, made from templates with a seeded random so the list looks the same on every load.
 * They sit after the hand-written reports from trust-data and show what the queue looks like at scale.
 */

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = seeded(20260707)
const pick = <T>(list: readonly T[]) => list[Math.floor(rand() * list.length)]

const ANCHOR = new Date("2026-07-07T00:00:00")
const daysAgo = (n: number) => {
  const d = new Date(ANCHOR)
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

const ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const usedIds = new Set<string>()
function reportId() {
  let id = ""
  do id = `RP-${Array.from({ length: 5 }, () => pick(ID_CHARS.split(""))).join("")}`
  while (usedIds.has(id))
  usedIds.add(id)
  return id
}

const userName = (id: string) => users.find((u) => u.id === id)?.name ?? "Unknown user"

const DETAILS: Record<ReportKind, string[]> = {
  job: [
    "The pay in the post is very different from what they told me on the phone.",
    "They asked for a ₦3,000 “form fee” before the interview.",
    "Same job posted three times this week with different photos.",
    "The address in the job doesn’t exist.",
    "Job asks people to bring their own tools and pay for transport, then refunds nothing.",
  ],
  person: [
    "Took the deposit and stopped answering calls.",
    "Kept calling me late at night after I said no.",
    "Uses a different name on WhatsApp than on the profile.",
    "Did half the job and left. Still wants full payment.",
    "Sent rude messages to my staff.",
  ],
  chat: [
    "Sent me a link to “verify my account” that asked for my bank PIN.",
    "Kept messaging after I declined, getting more aggressive.",
    "Shared my phone number and address in a group without asking.",
    "Asked me to pay for a uniform before starting.",
  ],
  review: [
    "This person never worked for us. The review is made up.",
    "The review uses insulting words about my family.",
    "The review shows my home address.",
    "This is my competitor writing about me.",
  ],
}

const CHAT_SCRIPTS: ChatLine[][] = [
  [
    { from: "reporter", body: "Hello, is the job still available?", time: "10:02 AM" },
    { from: "reported", body: "Yes. Pay ₦5,000 registration first and I’ll send the address.", time: "10:05 AM" },
    { from: "reporter", body: "Registration for what exactly?", time: "10:07 AM" },
    { from: "reported", body: "Everyone pays it. No payment, no job.", time: "10:09 AM" },
  ],
  [
    { from: "reported", body: "Why haven’t you replied? I sent 6 messages.", time: "9:41 PM" },
    { from: "reporter", body: "I said I’m not interested, please stop.", time: "9:44 PM" },
    { from: "reported", body: "You will regret wasting my time.", time: "9:46 PM" },
  ],
  [
    { from: "reporter", body: "Good morning, I saw your post for a cleaner.", time: "8:15 AM" },
    { from: "reported", body: "Confirm your payment details here: jr-pay.help/verify", time: "8:21 AM" },
    { from: "reported", body: "Use your card PIN to confirm. It’s safe.", time: "8:22 AM" },
  ],
  [
    { from: "reported", body: "I’ve posted your number in our riders group so they can call you.", time: "2:30 PM" },
    { from: "reporter", body: "I didn’t agree to that. Please take it down.", time: "2:34 PM" },
  ],
]

const ADMIN_NAMES = ["Desmond Ajimuda", "Aisha Bello", "Emeka Diallo"]

const OUTCOMES: Record<ReportKind, string[]> = {
  job: ["Job removed. Poster warned.", "Poster warned and asked to edit the job.", "Job removed for asking for fees."],
  person: ["Account suspended for 30 days.", "User warned about conduct.", "Account suspended pending ID check."],
  chat: ["Account suspended for messages sent in chat.", "User warned about messages."],
  review: ["Review removed from the profile.", "Review edited out of the rating."],
}

const DISMISSALS = [
  "No rule broken. Report dismissed.",
  "Confirmed hire on file. Review stays up.",
  "Disagreement about price, not a policy issue.",
  "Reporter withdrew the complaint.",
]

const workers = users.filter((u) => u.roles.includes("Worker"))
const posters = users.filter((u) => u.roles.includes("Employer"))

export interface ReportExtra {
  /** Who handled it, for the timeline. */
  handledBy?: string
  reviewStarted?: string
  decidedOn?: string
}

function makeReport(i: number): Report & ReportExtra {
  const kind = pick<ReportKind>(["job", "job", "job", "person", "person", "chat", "chat", "review"])
  const age = Math.floor(Math.pow(rand(), 1.6) * 120)
  const date = daysAgo(age)
  const open = age < 12 ? rand() < 0.85 : rand() < 0.08
  const state: ReportState = open
    ? rand() < 0.6
      ? "Received"
      : "In review"
    : rand() < 0.62
      ? "Resolved"
      : "Dismissed"

  let targetId: string
  let targetLabel: string
  let reportedUserId: string
  let reporterId: string
  let excerpt: ChatLine[] | undefined

  if (kind === "job") {
    const job = pick(jobs)
    targetId = job.id
    targetLabel = job.title
    reportedUserId = job.posterId
    reporterId = pick(workers.filter((u) => u.id !== reportedUserId)).id
  } else if (kind === "review") {
    const review = pick(allReviews)
    targetId = review.id
    targetLabel = `Review of ${userName(review.subjectId)} by ${userName(review.authorId)}`
    reportedUserId = review.authorId
    reporterId = review.subjectId
  } else {
    const reported = pick(rand() < 0.5 ? posters : workers)
    reportedUserId = reported.id
    targetId = reported.id
    targetLabel = kind === "chat" ? `Chat with ${reported.name}` : reported.name
    reporterId = pick(users.filter((u) => u.id !== reported.id)).id
    if (kind === "chat") excerpt = pick(CHAT_SCRIPTS)
  }

  const handledBy = state === "Received" ? undefined : pick(ADMIN_NAMES)
  const reviewStarted = state === "Received" ? undefined : daysAgo(Math.max(0, age - 1))
  const decidedOn = state === "Resolved" || state === "Dismissed" ? daysAgo(Math.max(0, age - 2 - (i % 3))) : undefined

  return {
    id: reportId(),
    kind,
    targetId,
    targetLabel,
    reporterId,
    reportedUserId,
    reason: pick(REPORT_REASONS[kind]),
    details: rand() < 0.8 ? pick(DETAILS[kind]) : undefined,
    blocked: kind !== "job" && rand() < 0.3,
    date,
    state,
    excerpt,
    resolution: state === "Resolved" ? pick(OUTCOMES[kind]) : state === "Dismissed" ? pick(DISMISSALS) : undefined,
    handledBy,
    reviewStarted,
    decidedOn,
  }
}

export const generatedReports: (Report & ReportExtra)[] = Array.from({ length: 80 }, (_, i) => makeReport(i))
