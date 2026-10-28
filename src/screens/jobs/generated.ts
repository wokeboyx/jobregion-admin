/*
 * ~200 extra deterministic jobs so paging, sorting and bulk actions are visible at scale. Built from templates with a
 * seeded loop (same rows on every load). They are combined with the hand-written `jobs` in the screens, which come first,
 * and they open the normal job detail page (the detail page looks in both lists).
 */
import { jobCover } from "@/lib/photos"
import { jobs, users, type JobListing } from "@/lib/mock-data"
import type { Status } from "@/components/ui/status-pill"

const TEMPLATES: { title: string; category: string; type: JobListing["type"]; min: number; max: number }[] = [
  { title: "Weekly home cleaning", category: "Home Services › Cleaning", type: "Everyday", min: 10_000, max: 15_000 },
  { title: "Fix bathroom tap and shower", category: "Home Services › Plumbing", type: "Everyday", min: 6_000, max: 12_000 },
  { title: "Install inverter and 4 solar panels", category: "Home Services › Electrical", type: "Skilled", min: 60_000, max: 120_000 },
  { title: "Lawn mowing and hedge trimming", category: "Home Services › Landscaping", type: "Everyday", min: 8_000, max: 15_000 },
  { title: "Ushers for a church thanksgiving", category: "Events › Usher", type: "Everyday", min: 8_000, max: 10_000 },
  { title: "DJ for a 30th birthday party", category: "Events › DJ", type: "Skilled", min: 50_000, max: 90_000 },
  { title: "Photographer for a naming ceremony", category: "Events › Photography", type: "Skilled", min: 40_000, max: 70_000 },
  { title: "Help moving a 2-bedroom flat", category: "Delivery & Logistics › Moving Help", type: "Everyday", min: 25_000, max: 45_000 },
  { title: "Post-construction cleaning", category: "Home Services › Cleaning", type: "Everyday", min: 30_000, max: 50_000 },
  { title: "Rewire a shop and fit new sockets", category: "Home Services › Electrical", type: "Skilled", min: 45_000, max: 80_000 },
]

const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu", "Kano", "Benin City", "Uyo", "Abeokuta", "Jos"]
const SOURCES = [undefined, undefined, undefined, "Jobberman", "Jobberman", "MyJobMag", "Hotnigerianjobs", "NgCareers"]
const STATUSES: [Status, string][] = [
  ["success", "Open"],
  ["success", "Open"],
  ["success", "Open"],
  ["warning", "Pending Review"],
  ["warning", "Pending Review"],
  ["neutral", "Filled"],
  ["destructive", "Flagged"],
]

/** Small seeded generator (mulberry32) so the rows never change between loads. */
function seeded(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`
const pad = (n: number) => String(n).padStart(2, "0")

function build(count: number): JobListing[] {
  const rand = seeded(2026)
  const pick = <T>(list: readonly T[]) => list[Math.floor(rand() * list.length)]
  const employers = users.filter((u) => u.roles.includes("Employer") && !u.removed)
  return Array.from({ length: count }, (_, i) => {
    const t = pick(TEMPLATES)
    const city = pick(CITIES)
    const source = pick(SOURCES)
    const [status, statusLabel] = pick(STATUSES)
    const poster = pick(employers)
    const day = new Date(Date.UTC(2026, 6, 7) - Math.floor(rand() * 120) * 86400000)
    const datePosted = `${day.getUTCFullYear()}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}`
    const id = `G-${String(i + 1).padStart(3, "0")}`
    return {
      id,
      title: `${t.title} in ${city}`,
      poster: poster.name,
      posterId: poster.id,
      category: t.category,
      type: t.type,
      status,
      statusLabel,
      datePosted,
      description: `${t.title} in ${city}. Details agreed directly with the poster; payment goes straight to the person hired.`,
      recommended: [],
      images: [],
      promoted: rand() < 0.12 || undefined,
      views: Math.floor(rand() * 900),
      location: `${city}, Nigeria`,
      serviceDate: "Flexible",
      serviceTime: "Any time",
      experienceYears: t.type === "Skilled" ? 1 + Math.floor(rand() * 5) : undefined,
      budget: `${naira(t.min)} – ${naira(t.max)}`,
      source,
      sourceUrl: source ? `https://example.com/${source.toLowerCase()}/${id.toLowerCase()}` : undefined,
      applyUrl: source ? `https://example.com/${source.toLowerCase()}/${id.toLowerCase()}/apply` : undefined,
      photos: [jobCover(`J-0${1 + (i % 8)}`)],
    }
  })
}

export const generatedJobs: JobListing[] = build(200)

/** Hand-written jobs first, then the generated ones. Read at call time so newly posted jobs are included. */
export const allJobs = () => [...jobs, ...generatedJobs]

export const findJob = (id?: string) => jobs.find((j) => j.id === id) ?? generatedJobs.find((j) => j.id === id)
