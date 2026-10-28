import { coverFor, jobCover } from "@/lib/photos"
import { getPromotionPlan, jobs, users, type Promotion, type PromotionPlanConfig } from "@/lib/mock-data"

/** Who ran the promotion: a known user, or the name stored on a generated row. */
export function runnerOf(p: Promotion) {
  const user = users.find((u) => u.id === p.runnerUserId)
  return { name: user?.name ?? p.runnerName ?? "Unknown user", to: user ? `/users/${user.id}` : undefined }
}

/** What was promoted: the job (title, link, cover photo) or the person's profile. */
export function promotionTarget(p: Promotion) {
  const job = p.jobId ? jobs.find((j) => j.id === p.jobId) : undefined
  const runner = runnerOf(p)
  if (p.type === "Profile") return { job, label: runner.name, to: runner.to, photo: coverFor(p.runnerUserId) }
  return {
    job,
    label: job?.title ?? p.title ?? "Unknown job",
    to: job ? `/jobs/${job.id}` : undefined,
    photo: p.jobId ? jobCover(p.jobId) : coverFor(p.id),
  }
}

/** Promotions point at plans by id; look in the admin's current plans first so renamed and new plans show up. */
export function planFor(plans: PromotionPlanConfig[], id: string) {
  return plans.find((p) => p.id === id) ?? getPromotionPlan(id)
}

export function shortDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

/** "Shared to WhatsApp, Telegram and social media". */
export function channelsLine(plan: PromotionPlanConfig) {
  const list = (plan.channels ?? []).map((c) => (c === "Social media" ? "social media" : c))
  if (list.length === 0) return ""
  const joined = list.length === 1 ? list[0] : `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`
  return `Shared to Jobs Region ${joined}`
}

export const PROMOTES_LABEL: Record<PromotionPlanConfig["promotes"], string> = {
  Both: "Jobs and profiles",
  Jobs: "Jobs only",
  Profiles: "Profiles only",
}
