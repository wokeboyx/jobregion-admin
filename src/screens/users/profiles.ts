/*
 * The two sides of one account, as in the web app's "switch sides": a job seeker profile (finding work) and an
 * employer profile (hiring). Users with `seekerProfile` / `employerProfile` in the mock data use those; older entries
 * get one derived from their roles so every Worker has a seeker side and every Employer an employer side.
 */
import { hires, reviews } from "@/lib/trust-data"
import {
  getPromotionEndDate,
  getPromotionPlan,
  getPromotionStatus,
  promotions,
  type EmployerProfile,
  type JobListing,
  type SeekerProfile,
  type UserAccount,
} from "@/lib/mock-data"
import { WORK_PHOTOS, coverFor, jobCover, jobGallery } from "@/lib/photos"
import type { Status } from "@/components/ui/status-pill"
import { allJobs } from "@/screens/jobs/generated"

export type Side = "seeker" | "employer"

/** Small stable hash so derived numbers never change between loads. */
export function hashOf(text: string) {
  // FNV-1a with a final avalanche, so neighbouring dates give unrelated numbers.
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193)
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  return (h ^ (h >>> 16)) >>> 0
}

export function seekerOf(user: UserAccount): SeekerProfile | null {
  if (user.seekerProfile) return user.seekerProfile
  if (!user.roles.includes("Worker")) return null
  return {
    workType: "service",
    headline: user.services?.[0] ?? user.name,
    workAreas: user.interests.slice(0, 3).map((category, i) => ({
      category,
      subSkills: i === 0 ? (user.services ?? []).slice(0, 3) : [],
    })),
    jobAlerts: hashOf(user.id) % 4,
  }
}

export function employerOf(user: UserAccount): EmployerProfile | null {
  if (user.employerProfile) return user.employerProfile
  if (!user.roles.includes("Employer")) return null
  const business = user.documents.some((d) => d.type === "business") || /ltd|services|co\.|staffing|traders|bpo|logistics/i.test(user.name)
  return {
    type: business ? "business" : "individual",
    interests: user.interests,
    about: user.bio,
    company: business
      ? {
          name: user.name,
          cac: `RC-${1_400_000 + (hashOf(user.id) % 500_000)}`,
          address: user.location,
          email: user.email,
          emailVerified: user.verification === "success",
        }
      : undefined,
  }
}

export function sidesOf(user: UserAccount): Side[] {
  return [...(seekerOf(user) ? (["seeker"] as const) : []), ...(employerOf(user) ? (["employer"] as const) : [])]
}

/** Work photos that fit the person's trade; the beauty demo photos when nothing closer fits. */
export function workPhotosFor(seeker: SeekerProfile) {
  const text = seeker.workAreas.map((a) => `${a.category} ${a.subSkills.join(" ")}`).join(" ").toLowerCase()
  const photos: string[] = []
  if (/renovat|paint|tiling|plaster|build/.test(text)) photos.push(...jobGallery("J-07"))
  if (/carpent|wood|furniture|cabinet/.test(text)) photos.push(jobGallery("J-06")[1])
  if (/clean|laundry|childcare/.test(text)) photos.push(...jobGallery("J-01"))
  if (/electric|wiring|solar/.test(text)) photos.push(...jobGallery("J-03"))
  if (/plumb/.test(text)) photos.push(...jobGallery("J-02"))
  if (/event|usher|photo|dj/.test(text)) photos.push(...jobGallery("J-08"))
  const unique = [...new Set(photos)]
  return unique.length > 0 ? unique : WORK_PHOTOS
}

/** Every job this person posted (hand-written and generated), newest first. */
export function postedJobsOf(userId: string): JobListing[] {
  return allJobs()
    .filter((j) => j.posterId === userId)
    .sort((a, b) => b.datePosted.localeCompare(a.datePosted))
}

/** How many people replied to a job (applied or messaged); not stored on jobs, so derived from views. */
export function responsesFor(job: JobListing) {
  const rate = 0.03 + (hashOf(job.id) % 7) / 100
  return Math.round(job.views * rate) + job.recommended.length
}

/** Hours until the first reply came in, for the per-job breakdown. */
export function firstResponseHours(job: JobListing) {
  return 1 + (hashOf(`${job.id}-first`) % 30)
}

export function reviewsAbout(userId: string, side: Side) {
  return reviews.filter((r) => r.subjectId === userId && r.about === (side === "seeker" ? "worker" : "poster"))
}

export function hiresAs(userId: string, side: Side) {
  return hires.filter((h) => (side === "seeker" ? h.workerId === userId : h.posterId === userId))
}

export interface PromotionRow {
  id: string
  title: string
  photo: string
  plan: string
  dates: string
  status: Status
  statusLabel: string
  views: number
  messages?: number
  /** Where the row opens: the promotion record when there is one, otherwise the job. */
  to?: string
}

export function profilePromotionsOf(user: UserAccount, photo?: string): PromotionRow[] {
  return promotions
    .filter((p) => p.type === "Profile" && p.runnerUserId === user.id)
    .map((p) => {
      const s = getPromotionStatus(p)
      return {
        id: p.id,
        title: `${user.name}'s profile`,
        photo: photo ?? coverFor(user.id),
        plan: getPromotionPlan(p.plan).name,
        dates: `${p.startDate} – ${getPromotionEndDate(p)}`,
        status: s.status,
        statusLabel: s.label,
        views: p.viewsGenerated,
        messages: p.messages,
        to: `/promotions/${p.id}`,
      }
    })
}

export function jobPromotionsOf(user: UserAccount, posted: JobListing[]): PromotionRow[] {
  const records = promotions.filter((p) => p.type === "Job" && p.runnerUserId === user.id)
  const rows: PromotionRow[] = records.map((p) => {
    const job = posted.find((j) => j.id === p.jobId)
    const s = getPromotionStatus(p)
    return {
      id: p.id,
      title: job?.title ?? "Job promotion",
      photo: jobCover(p.jobId ?? p.id),
      plan: getPromotionPlan(p.plan).name,
      dates: `${p.startDate} – ${getPromotionEndDate(p)}`,
      status: s.status,
      statusLabel: s.label,
      views: p.viewsGenerated,
      messages: p.messages,
      to: `/promotions/${p.id}`,
    }
  })
  const covered = new Set(records.map((p) => p.jobId))
  // Promoted jobs without a promotion record (e.g. generated jobs) still count as promotions they ran.
  posted
    .filter((j) => j.promoted && !covered.has(j.id))
    .forEach((j) => {
      const plans = ["Boost", "Spotlight", "Pro"]
      rows.push({
        id: `JP-${j.id}`,
        title: j.title,
        photo: j.photos?.[0] ?? jobCover(j.id),
        plan: plans[hashOf(j.id) % plans.length],
        dates: `From ${j.datePosted}`,
        status: j.statusLabel === "Open" ? "success" : "neutral",
        statusLabel: j.statusLabel === "Open" ? "Active" : "Ended",
        views: Math.round(j.views * 0.45),
        to: `/jobs/${j.id}`,
      })
    })
  // Older hand-written entries on the account itself.
  const legacy = user.jobsPosted ?? []
  legacy
    .filter((j) => j.promoted && !posted.some((p) => p.title === j.title && covered.has(p.id)))
    .forEach((j) => {
      const job = posted.find((p) => p.title === j.title)
      if (job && rows.some((r) => r.to === `/jobs/${job.id}`)) return
      rows.push({
        id: `LP-${j.title}`,
        title: j.title,
        photo: job ? jobCover(job.id) : coverFor(j.title),
        plan: "Promotion",
        dates: j.promotedRange ?? `From ${j.posted}`,
        status: "neutral",
        statusLabel: j.promotedRange ? "Ended" : "Active",
        views: j.impressions ?? 0,
        messages: j.clicks,
        to: job ? `/jobs/${job.id}` : undefined,
      })
    })
  return rows
}
