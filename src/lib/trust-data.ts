import type { Status } from "@/components/ui/status-pill"

/*
 * Trust & safety data that mirrors the web app: people report jobs, people, chats and reviews (Report sheet), and
 * reviews come from confirmed hires (hires.ts in apps/web). The admin sees the reason, the details and the reported item.
 */

export type ReportKind = "job" | "person" | "chat" | "review"

/** The same reasons the web app's Report sheet offers, per kind of thing reported. */
export const REPORT_REASONS: Record<ReportKind, string[]> = {
  job: [
    "Asks for money to apply or for a “registration fee”",
    "Looks fake or misleading",
    "Offensive or discriminatory",
    "Illegal or unsafe work",
    "Duplicate or spam",
    "Something else",
  ],
  person: [
    "Asked me for money up front",
    "Pretending to be someone else",
    "Harassment or threats",
    "Didn’t pay for work done",
    "No-show or very unprofessional",
    "Something else",
  ],
  chat: [
    "Asked me for money up front",
    "Harassment or threats",
    "Spam or scam links",
    "Sharing someone’s private information",
    "Something else",
  ],
  review: [
    "Not about a real job",
    "Offensive language",
    "Contains private information",
    "Written by someone with a conflict of interest",
    "Something else",
  ],
}

export const REPORT_KIND_LABEL: Record<ReportKind, string> = {
  job: "Job",
  person: "Person",
  chat: "Chat",
  review: "Review",
}

export type ReportState = "Received" | "In review" | "Resolved" | "Dismissed"

export const REPORT_STATE_STATUS: Record<ReportState, Status> = {
  Received: "warning",
  "In review": "warning",
  Resolved: "success",
  Dismissed: "neutral",
}

export interface ChatLine {
  from: "reporter" | "reported"
  body: string
  time: string
}

export interface Report {
  id: string
  kind: ReportKind
  /** What was reported: a job id, a user id, or a review id. Chats point at the other person. */
  targetId: string
  targetLabel: string
  reporterId: string
  reportedUserId: string
  reason: string
  details?: string
  /** The reporter also blocked the person (web app: "Also block this person"). */
  blocked?: boolean
  date: string
  state: ReportState
  /** For chat reports: the messages around the one reported. */
  excerpt?: ChatLine[]
  resolution?: string
}

export const reports: Report[] = [
  {
    id: "RP-7KQ2M",
    kind: "job",
    targetId: "J-05",
    targetLabel: "Professional Wedding DJ",
    reporterId: "U-04",
    reportedUserId: "U-17",
    reason: "Asks for money to apply or for a “registration fee”",
    details: "They asked me to pay ₦5,000 to be “shortlisted” before they would share the event details.",
    date: "2026-07-06",
    state: "Received",
  },
  {
    id: "RP-3XD8A",
    kind: "chat",
    targetId: "U-11",
    targetLabel: "Chat with TemiTech Logistics",
    reporterId: "U-06",
    reportedUserId: "U-11",
    reason: "Spam or scam links",
    details: "Sent a link that asked for my BVN to “confirm my payment account”.",
    blocked: true,
    date: "2026-07-06",
    state: "Received",
    excerpt: [
      { from: "reporter", body: "Good afternoon, I’m interested in the dispatch rider role.", time: "1:12 PM" },
      { from: "reported", body: "Great. Before we proceed, verify your payment account here: bit.ly/tt-pay-verify", time: "1:20 PM" },
      { from: "reported", body: "You’ll need your BVN. It’s standard for all our riders.", time: "1:21 PM" },
      { from: "reporter", body: "Why do you need my BVN before an interview?", time: "1:30 PM" },
    ],
  },
  {
    id: "RP-9PL4C",
    kind: "person",
    targetId: "U-08",
    targetLabel: "Uche Eze",
    reporterId: "U-14",
    reportedUserId: "U-08",
    reason: "No-show or very unprofessional",
    details: "Agreed to paint two rooms on Saturday, didn’t show up and stopped replying.",
    date: "2026-07-05",
    state: "In review",
  },
  {
    id: "RP-5VN1H",
    kind: "review",
    targetId: "RV-06",
    targetLabel: "Review of Bassey Umoh by Adeola Residences",
    reporterId: "U-07",
    reportedUserId: "U-19",
    reason: "Offensive language",
    details: "The review insults me personally and has nothing to do with the work.",
    date: "2026-07-04",
    state: "Received",
  },
  {
    id: "RP-2HT6B",
    kind: "person",
    targetId: "U-10",
    targetLabel: "Brightpath BPO",
    reporterId: "U-09",
    reportedUserId: "U-10",
    reason: "Pretending to be someone else",
    details: "Claims to be a recruiter for a bank but the company details don’t match.",
    date: "2026-07-03",
    state: "In review",
  },
  {
    id: "RP-8CW3R",
    kind: "job",
    targetId: "J-06",
    targetLabel: "Office Relocation Movers",
    reporterId: "U-06",
    reportedUserId: "U-18",
    reason: "Duplicate or spam",
    date: "2026-06-30",
    state: "Resolved",
    resolution: "Job removed. Poster warned about duplicate posts.",
  },
  {
    id: "RP-4ME7Y",
    kind: "review",
    targetId: "RV-03",
    targetLabel: "Review of CleanPro Services by Ngozi Adeyemi",
    reporterId: "U-13",
    reportedUserId: "U-01",
    reason: "Not about a real job",
    date: "2026-06-27",
    state: "Dismissed",
    resolution: "Confirmed hire on file for this job. Review stays up.",
  },
]

export const openReportCount = reports.filter((r) => r.state === "Received" || r.state === "In review").length

/* ---------- Hires and reviews ---------- */

/** What each side rates (web app ASPECTS). The poster rates the worker; the worker rates the poster. */
export const REVIEW_ASPECTS = {
  worker: ["Quality of work", "Punctuality", "Communication"],
  poster: ["Clear job description", "Paid as agreed", "Respectful"],
} as const

export type HireState = "Awaiting confirmation" | "Confirmed" | "Declined" | "Expired"

export const HIRE_STATE_STATUS: Record<HireState, Status> = {
  "Awaiting confirmation": "warning",
  Confirmed: "success",
  Declined: "destructive",
  Expired: "neutral",
}

export interface Hire {
  id: string
  jobId: string
  jobTitle: string
  posterId: string
  workerId: string
  /** Who said the hire happened; the other side has 7 days to confirm. */
  claimedBy: "poster" | "worker"
  state: HireState
  date: string
  confirmedDate?: string
}

export const hires: Hire[] = [
  { id: "H-01", jobId: "J-01", jobTitle: "Deep House Cleaning (3-bedroom)", posterId: "U-13", workerId: "U-01", claimedBy: "poster", state: "Confirmed", date: "2026-06-18", confirmedDate: "2026-06-19" },
  { id: "H-02", jobId: "J-02", jobTitle: "Fix Leaking Kitchen Pipe", posterId: "U-14", workerId: "U-04", claimedBy: "worker", state: "Confirmed", date: "2026-05-06", confirmedDate: "2026-05-07" },
  { id: "H-03", jobId: "J-03", jobTitle: "Licensed Electrician for Full Rewiring", posterId: "U-15", workerId: "U-04", claimedBy: "poster", state: "Awaiting confirmation", date: "2026-07-05" },
  { id: "H-04", jobId: "J-04", jobTitle: "Wedding Usher Team (4 needed)", posterId: "U-16", workerId: "U-03", claimedBy: "worker", state: "Confirmed", date: "2026-07-01", confirmedDate: "2026-07-02" },
  { id: "H-05", jobId: "J-07", jobTitle: "Garden Landscaping for New Build", posterId: "U-19", workerId: "U-07", claimedBy: "poster", state: "Confirmed", date: "2026-06-24", confirmedDate: "2026-06-25" },
  { id: "H-06", jobId: "J-08", jobTitle: "Professional Photographer for Product Shoot", posterId: "U-20", workerId: "U-12", claimedBy: "worker", state: "Declined", date: "2026-06-29" },
  { id: "H-07", jobId: "J-06", jobTitle: "Office Relocation Movers", posterId: "U-18", workerId: "U-06", claimedBy: "worker", state: "Expired", date: "2026-06-10" },
]

export type ReviewState = "Published" | "Hidden until both review" | "Removed"

export const REVIEW_STATE_STATUS: Record<ReviewState, Status> = {
  Published: "success",
  "Hidden until both review": "neutral",
  Removed: "destructive",
}

export interface Review {
  id: string
  hireId: string
  authorId: string
  subjectId: string
  /** Which side is being reviewed, which decides the aspects. */
  about: "worker" | "poster"
  rating: number
  aspects: Record<string, number>
  text: string
  date: string
  state: ReviewState
  reply?: string
  reportCount: number
}

export const reviews: Review[] = [
  {
    id: "RV-01",
    hireId: "H-01",
    authorId: "U-13",
    subjectId: "U-01",
    about: "worker",
    rating: 5,
    aspects: { "Quality of work": 5, Punctuality: 5, Communication: 5 },
    text: "Ngozi was on time, thorough and left the place spotless. Will book again for our weekly clients.",
    date: "2026-06-20",
    state: "Published",
    reply: "Thank you! It was a pleasure working with your team.",
    reportCount: 0,
  },
  {
    id: "RV-02",
    hireId: "H-02",
    authorId: "U-14",
    subjectId: "U-04",
    about: "worker",
    rating: 4,
    aspects: { "Quality of work": 5, Punctuality: 3, Communication: 4 },
    text: "Fixed the leak properly. Came about an hour late but called ahead to let us know.",
    date: "2026-05-09",
    state: "Published",
    reportCount: 0,
  },
  {
    id: "RV-03",
    hireId: "H-01",
    authorId: "U-01",
    subjectId: "U-13",
    about: "poster",
    rating: 3,
    aspects: { "Clear job description": 2, "Paid as agreed": 5, Respectful: 3 },
    text: "Paid on time, but the job was a 4-bedroom, not 3 as posted. Took twice as long.",
    date: "2026-06-21",
    state: "Published",
    reportCount: 1,
  },
  {
    id: "RV-04",
    hireId: "H-04",
    authorId: "U-16",
    subjectId: "U-03",
    about: "worker",
    rating: 5,
    aspects: { "Quality of work": 5, Punctuality: 5, Communication: 5 },
    text: "Grace led the usher team brilliantly. Guests kept complimenting them.",
    date: "2026-07-03",
    state: "Hidden until both review",
    reportCount: 0,
  },
  {
    id: "RV-05",
    hireId: "H-05",
    authorId: "U-07",
    subjectId: "U-19",
    about: "poster",
    rating: 2,
    aspects: { "Clear job description": 3, "Paid as agreed": 1, Respectful: 2 },
    text: "Final payment came two weeks late and only after many reminders.",
    date: "2026-06-28",
    state: "Published",
    reportCount: 0,
  },
  {
    id: "RV-06",
    hireId: "H-05",
    authorId: "U-19",
    subjectId: "U-07",
    about: "worker",
    rating: 1,
    aspects: { "Quality of work": 2, Punctuality: 1, Communication: 1 },
    text: "Lazy and useless. Typical of people from his side of town. Avoid at all costs.",
    date: "2026-06-29",
    state: "Published",
    reportCount: 2,
  },
]

export const flaggedReviewCount = reviews.filter((r) => r.reportCount > 0 && r.state !== "Removed").length

/** A rating is only shown on a profile after 3 published reviews (web app rule 6). */
export const MIN_REVIEWS_FOR_RATING = 3
