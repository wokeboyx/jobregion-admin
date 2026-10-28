import { hires, reviews } from "@/lib/trust-data"
import type { UserAccount } from "@/lib/mock-data"
import { postedJobsOf } from "./profiles"

export interface UserStats {
  jobsPosted: number
  hires: number
  reviews: number
  rating: number | null
  /** Time since joining, as a number and its unit, e.g. { value: 4, unit: "months" }. */
  tenure: { value: number; unit: "months" | "years" }
}

function monthsSince(date: string) {
  const joined = new Date(date)
  const now = new Date()
  const months = (now.getFullYear() - joined.getFullYear()) * 12 + (now.getMonth() - joined.getMonth())
  return Math.max(1, months)
}

/** Host-card stats (Airbnb "reviews · years hosting"), derived from the mock data without changing it. */
export function getUserStats(user: UserAccount): UserStats {
  const published = reviews.filter((r) => r.subjectId === user.id && r.state === "Published")
  const rating = published.length ? published.reduce((sum, r) => sum + r.rating, 0) / published.length : null
  const months = monthsSince(user.dateJoined)
  return {
    jobsPosted: Math.max(postedJobsOf(user.id).length, user.accountUsage?.totalJobsPosted ?? user.jobsPosted?.length ?? 0),
    hires: hires.filter((h) => h.workerId === user.id && h.state === "Confirmed").length,
    reviews: published.length,
    rating,
    tenure: months >= 12 ? { value: Math.floor(months / 12), unit: "years" } : { value: months, unit: "months" },
  }
}

export function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`
}

/** "2 reviews · 4 months on Jobs Region" style line for cards. */
export function statsLine(user: UserAccount, stats = getUserStats(user)) {
  const first = user.roles.includes("Employer") ? plural(stats.jobsPosted, "job") + " posted" : plural(stats.hires, "hire")
  const tenureWord = stats.tenure.unit === "years" ? "year" : "month"
  return [first, plural(stats.reviews, "review"), `${plural(stats.tenure.value, tenureWord)} on Jobs Region`].join(" · ")
}
