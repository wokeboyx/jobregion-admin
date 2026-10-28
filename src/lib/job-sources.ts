/*
 * Job sources: outside sites Jobs Region pulls jobs in from (import) or sends its own jobs out to (publish).
 * Mock data only. The arrays are mutable so the admin can connect, pause and sync sources during a session.
 */

import { jobCategories, jobs, type JobListing } from "@/lib/mock-data"

export type SourceDirection = "Import" | "Publish" | "Both"
export type ConnectionType = "API" | "Feed" | "Website" | "Webhook"
export type SourceStatus = "Connected" | "Paused" | "Error" | "Not connected"
export type SyncFrequency = "Hourly" | "Every 6 hours" | "Daily" | "Manual"
export type SourceIcon = "whatsapp" | "telegram" | "google"

export const CONNECTION_LABEL: Record<ConnectionType, string> = {
  API: "API key",
  Feed: "RSS / XML feed",
  Website: "Website",
  Webhook: "Webhook",
}

export const FREQUENCIES: SyncFrequency[] = ["Hourly", "Every 6 hours", "Daily", "Manual"]

export interface CategoryMapping {
  from: string
  to: string
}

export interface ImportRules {
  /** Their category → our category ("Home Services › Cleaning"). */
  categoryMap: CategoryMapping[]
  /** Category for anything not in the map. */
  defaultCategory: string
  keywords: string[]
  locations: string[]
  /** Imported jobs wait in the review queue, or go live at once. */
  mode: "review" | "auto"
  dedupe: boolean
  attribution: boolean
  expireDays: number
}

export interface PublishRules {
  scope: "all" | "promoted" | "categories"
  categories: string[]
  includeBudget: boolean
  linkBack: boolean
}

export interface SyncRun {
  id: string
  at: string
  result: "Success" | "Partial" | "Failed"
  /** Import: jobs seen in the feed. Publish: jobs that matched the rules. */
  found: number
  /** Import: jobs added. Publish: jobs sent out. */
  added: number
  duplicates: number
  errors: number
  note?: string
}

export interface JobSource {
  id: string
  name: string
  initials: string
  /** Logo tile colour. */
  color: string
  icon?: SourceIcon
  website: string
  direction: SourceDirection
  connection: ConnectionType
  /** Feed URL, API base URL, site URL or our webhook URL. */
  endpoint: string
  /** Last 4 characters of the key, for API connections. */
  apiKeyHint?: string
  status: SourceStatus
  errorMessage?: string
  lastSync: string
  frequency: SyncFrequency
  jobsImported: number
  jobsPublished: number
  importedThisWeek: number
  publishedThisWeek: number
  waitingReview: number
  importRules?: ImportRules
  publishRules?: PublishRules
  history: SyncRun[]
}

const run = (id: string, at: string, result: SyncRun["result"], found: number, added: number, duplicates: number, errors = 0, note?: string): SyncRun => ({
  id,
  at,
  result,
  found,
  added,
  duplicates,
  errors,
  note,
})

export const jobSources: JobSource[] = [
  {
    id: "jobberman",
    name: "Jobberman",
    initials: "Jb",
    color: "#0b7b3e",
    website: "https://www.jobberman.com",
    direction: "Import",
    connection: "API",
    endpoint: "https://api.jobberman.com/v2/partner/jobs",
    apiKeyHint: "9f2c",
    status: "Connected",
    lastSync: "Today, 09:00",
    frequency: "Hourly",
    jobsImported: 412,
    jobsPublished: 0,
    importedThisWeek: 38,
    publishedThisWeek: 0,
    waitingReview: 6,
    importRules: {
      categoryMap: [
        { from: "Cleaning & Housekeeping", to: "Home Services › Cleaning" },
        { from: "Electrical Engineering", to: "Home Services › Electrical" },
        { from: "Events & Hospitality", to: "Events › Usher" },
        { from: "Logistics", to: "Delivery & Logistics › Moving Help" },
      ],
      defaultCategory: "Home Services",
      keywords: [],
      locations: ["Lagos", "Abuja", "Port Harcourt"],
      mode: "review",
      dedupe: true,
      attribution: true,
      expireDays: 30,
    },
    history: [
      run("S-JB-6", "Today, 09:00", "Success", 14, 9, 5),
      run("S-JB-5", "Today, 08:00", "Success", 11, 7, 4),
      run("S-JB-4", "Today, 07:00", "Partial", 12, 6, 4, 2, "2 jobs had no location and were skipped"),
      run("S-JB-3", "Today, 06:00", "Success", 6, 4, 2),
      run("S-JB-2", "Yesterday, 23:00", "Success", 3, 3, 0),
    ],
  },
  {
    id: "myjobmag",
    name: "MyJobMag",
    initials: "MJ",
    color: "#1d4ed8",
    website: "https://www.myjobmag.com",
    direction: "Import",
    connection: "Feed",
    endpoint: "https://www.myjobmag.com/feeds/jobs.xml",
    status: "Connected",
    lastSync: "Today, 06:00",
    frequency: "Every 6 hours",
    jobsImported: 236,
    jobsPublished: 0,
    importedThisWeek: 21,
    publishedThisWeek: 0,
    waitingReview: 4,
    importRules: {
      categoryMap: [
        { from: "Admin / Office", to: "Events › Usher" },
        { from: "Photography", to: "Events › Photography" },
        { from: "Driving", to: "Delivery & Logistics › Moving Help" },
      ],
      defaultCategory: "Home Services",
      keywords: ["urgent", "immediate start"],
      locations: [],
      mode: "review",
      dedupe: true,
      attribution: true,
      expireDays: 21,
    },
    history: [
      run("S-MJ-4", "Today, 06:00", "Success", 18, 11, 7),
      run("S-MJ-3", "Today, 00:00", "Success", 9, 5, 4),
      run("S-MJ-2", "Yesterday, 18:00", "Success", 7, 5, 2),
      run("S-MJ-1", "Yesterday, 12:00", "Success", 10, 6, 4),
    ],
  },
  {
    id: "hotnigerianjobs",
    name: "Hotnigerianjobs",
    initials: "HN",
    color: "#dc2626",
    website: "https://www.hotnigerianjobs.com",
    direction: "Import",
    connection: "Feed",
    endpoint: "https://www.hotnigerianjobs.com/feed/rss.xml",
    status: "Paused",
    lastSync: "3 Jul, 18:00",
    frequency: "Daily",
    jobsImported: 98,
    jobsPublished: 0,
    importedThisWeek: 0,
    publishedThisWeek: 0,
    waitingReview: 0,
    importRules: {
      categoryMap: [{ from: "Artisan", to: "Home Services › Plumbing" }],
      defaultCategory: "Home Services",
      keywords: [],
      locations: ["Lagos"],
      mode: "review",
      dedupe: true,
      attribution: true,
      expireDays: 14,
    },
    history: [
      run("S-HN-2", "3 Jul, 18:00", "Partial", 40, 12, 26, 2, "Many duplicates of Jobberman listings. Paused to check the rules."),
      run("S-HN-1", "2 Jul, 18:00", "Success", 22, 15, 7),
    ],
  },
  {
    id: "jobsite-ng",
    name: "NgCareers",
    initials: "NC",
    color: "#7c3aed",
    website: "https://www.ngcareers.com",
    direction: "Import",
    connection: "Website",
    endpoint: "https://www.ngcareers.com/jobs",
    status: "Error",
    errorMessage: "The site returned 403 Forbidden. Their robots.txt now blocks /jobs, so we stopped pulling from it.",
    lastSync: "Yesterday, 12:00",
    frequency: "Daily",
    jobsImported: 57,
    jobsPublished: 0,
    importedThisWeek: 3,
    publishedThisWeek: 0,
    waitingReview: 1,
    importRules: {
      categoryMap: [],
      defaultCategory: "Home Services",
      keywords: [],
      locations: [],
      mode: "review",
      dedupe: true,
      attribution: true,
      expireDays: 14,
    },
    history: [
      run("S-NC-2", "Yesterday, 12:00", "Failed", 0, 0, 0, 1, "403 Forbidden"),
      run("S-NC-1", "5 Jul, 12:00", "Success", 8, 3, 5),
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn Jobs",
    initials: "in",
    color: "#0a66c2",
    website: "https://www.linkedin.com/jobs",
    direction: "Publish",
    connection: "API",
    endpoint: "https://api.linkedin.com/v2/simpleJobPostings",
    apiKeyHint: "a71d",
    status: "Connected",
    lastSync: "Today, 08:30",
    frequency: "Every 6 hours",
    jobsImported: 0,
    jobsPublished: 184,
    importedThisWeek: 0,
    publishedThisWeek: 17,
    waitingReview: 0,
    publishRules: { scope: "categories", categories: ["Home Services › Electrical", "Events › Photography", "Events › DJ"], includeBudget: true, linkBack: true },
    history: [
      run("S-LI-3", "Today, 08:30", "Success", 6, 6, 0),
      run("S-LI-2", "Today, 02:30", "Success", 4, 4, 0),
      run("S-LI-1", "Yesterday, 20:30", "Success", 7, 7, 0),
    ],
  },
  {
    id: "indeed",
    name: "Indeed",
    initials: "id",
    color: "#2557a7",
    website: "https://ng.indeed.com",
    direction: "Publish",
    connection: "Feed",
    endpoint: "https://jobsregion.ng/feeds/indeed.xml",
    status: "Not connected",
    lastSync: "Never",
    frequency: "Daily",
    jobsImported: 0,
    jobsPublished: 0,
    importedThisWeek: 0,
    publishedThisWeek: 0,
    waitingReview: 0,
    publishRules: { scope: "all", categories: [], includeBudget: true, linkBack: true },
    history: [],
  },
  {
    id: "google-for-jobs",
    name: "Google for Jobs",
    initials: "G",
    color: "#ffffff",
    icon: "google",
    website: "https://developers.google.com/search/docs/appearance/structured-data/job-posting",
    direction: "Publish",
    connection: "Website",
    endpoint: "https://jobsregion.ng/jobs (JobPosting structured data)",
    status: "Connected",
    lastSync: "Today, 07:00",
    frequency: "Daily",
    jobsImported: 0,
    jobsPublished: 1240,
    importedThisWeek: 0,
    publishedThisWeek: 96,
    waitingReview: 0,
    publishRules: { scope: "all", categories: [], includeBudget: true, linkBack: true },
    history: [
      run("S-GO-2", "Today, 07:00", "Success", 96, 94, 0, 2, "2 jobs had no budget and were sent without one"),
      run("S-GO-1", "Yesterday, 07:00", "Success", 88, 88, 0),
    ],
  },
  {
    id: "whatsapp-channel",
    name: "Jobs Region WhatsApp channel",
    initials: "WA",
    color: "#25d366",
    icon: "whatsapp",
    website: "https://whatsapp.com/channel/jobsregion",
    direction: "Publish",
    connection: "Webhook",
    endpoint: "https://hooks.jobsregion.ng/out/whatsapp-channel",
    status: "Connected",
    lastSync: "Today, 10:00",
    frequency: "Hourly",
    jobsImported: 0,
    jobsPublished: 322,
    importedThisWeek: 0,
    publishedThisWeek: 24,
    waitingReview: 0,
    publishRules: { scope: "promoted", categories: [], includeBudget: true, linkBack: true },
    history: [
      run("S-WA-2", "Today, 10:00", "Success", 3, 3, 0),
      run("S-WA-1", "Today, 09:00", "Success", 2, 2, 0),
    ],
  },
  {
    id: "telegram-channel",
    name: "Jobs Region Telegram channel",
    initials: "TG",
    color: "#229ed9",
    icon: "telegram",
    website: "https://t.me/jobsregion",
    direction: "Publish",
    connection: "Webhook",
    endpoint: "https://hooks.jobsregion.ng/out/telegram-channel",
    status: "Connected",
    lastSync: "Today, 10:00",
    frequency: "Hourly",
    jobsImported: 0,
    jobsPublished: 301,
    importedThisWeek: 0,
    publishedThisWeek: 22,
    waitingReview: 0,
    publishRules: { scope: "promoted", categories: [], includeBudget: true, linkBack: true },
    history: [
      run("S-TG-2", "Today, 10:00", "Success", 3, 3, 0),
      run("S-TG-1", "Today, 09:00", "Partial", 2, 1, 0, 1, "Telegram rate limit; retried next hour"),
    ],
  },
]

export const importsJobs = (s: JobSource) => s.direction !== "Publish"
export const publishesJobs = (s: JobSource) => s.direction !== "Import"

export function getJobSource(id: string) {
  return jobSources.find((s) => s.id === id)
}

export function jobSourceByName(name: string) {
  return jobSources.find((s) => s.name === name)
}

export const defaultImportRules = (): ImportRules => ({
  categoryMap: [],
  defaultCategory: "Home Services",
  keywords: [],
  locations: [],
  mode: "review",
  dedupe: true,
  attribution: true,
  expireDays: 30,
})

export const defaultPublishRules = (): PublishRules => ({ scope: "all", categories: [], includeBudget: true, linkBack: true })

/** Every category as stored on jobs ("Home Services › Cleaning"), for mapping and publish rules. */
export const ALL_CATEGORIES = jobCategories.flatMap((c) => [c.name, ...c.subcategories.map((s) => `${c.name} › ${s.name}`)])

export function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "")
  } catch {
    return url
  }
}

/** Jobs Region jobs a publishing source would send out under its rules. */
export function eligibleJobs(s: JobSource): JobListing[] {
  const r = s.publishRules
  if (!r) return []
  return jobs.filter((j) => {
    if (j.removed || j.statusLabel !== "Open" || j.source) return false
    if (r.scope === "promoted") return !!j.promoted
    if (r.scope === "categories") return r.categories.some((c) => j.category === c || j.category.startsWith(`${c} ›`))
    return true
  })
}

/** Simulates one sync run and records it on the source. */
export function runSync(s: JobSource): SyncRun {
  const n = s.history.length
  let entry: SyncRun
  if (importsJobs(s)) {
    const found = 4 + ((n * 7) % 11)
    const duplicates = s.importRules?.dedupe ? found % 4 : 0
    const added = found - duplicates
    entry = run(`S-${s.id}-${n + 1}-${Date.now()}`, "Just now", "Success", found, added, duplicates)
    s.jobsImported += added
    s.importedThisWeek += added
    if (s.importRules?.mode !== "auto") s.waitingReview += added
  } else {
    const found = eligibleJobs(s).length
    entry = run(`S-${s.id}-${n + 1}-${Date.now()}`, "Just now", "Success", found, found, 0)
    s.jobsPublished += found
    s.publishedThisWeek += found
  }
  s.history = [entry, ...s.history]
  s.lastSync = "Just now"
  s.status = "Connected"
  s.errorMessage = undefined
  return entry
}

/** Approved imported jobs leave the source's review queue. */
export function markReviewed(s: JobSource, count: number) {
  s.waitingReview = Math.max(0, s.waitingReview - count)
}
