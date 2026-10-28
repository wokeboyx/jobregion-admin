import { ANCHOR_DATE, jobs, naira, users, type JobListing, type PromotionPlanId } from "@/lib/mock-data"

export type Kind = "everyday" | "professional"
export type Step = "postAs" | "type" | "title" | "category" | "time" | "location" | "role" | "photos" | "budget" | "contact" | "review"
export type Employment = "Full time" | "Part time" | "Contract" | "Freelance"
export type Arrangement = "on_site" | "remote" | "hybrid"

export interface Draft {
  postAs?: "official" | "user"
  userId?: string
  kind?: Kind
  title: string
  description: string
  category?: string
  sub?: string
  // everyday
  timing?: "on" | "before" | "flexible"
  date: string
  partOfDay?: string
  flexWindow?: string
  place?: "in_person" | "online"
  area: string
  state: string
  // professional
  arrangement?: Arrangement
  employment?: Employment
  experience: string
  closesOn: string
  photos: string[]
  min: string
  max: string
  contact: { message: boolean; whatsapp: boolean; phone: boolean; email: boolean; apply: boolean }
  applyUrl: string
  /** One price instead of a min–max range. */
  fixed: boolean
  whatsappNumber: string
  phoneNumber: string
  emailAddress: string
  // admin only
  publish: "open" | "review"
  promote: boolean
  plan: PromotionPlanId
}

export const EMPTY: Draft = {
  title: "",
  description: "",
  date: "",
  area: "",
  state: "",
  experience: "",
  closesOn: "",
  photos: [],
  min: "",
  max: "",
  contact: { message: true, whatsapp: false, phone: false, email: false, apply: false },
  applyUrl: "",
  fixed: false,
  whatsappNumber: "",
  phoneNumber: "",
  emailAddress: "",
  publish: "open",
  promote: false,
  plan: "spotlight",
}

export const DRAFT_KEY = "jr-admin:post-draft"

export function loadDraft(): { d: Draft; step: Step } {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as { d: Draft; step: Step }
      return { d: { ...EMPTY, ...saved.d }, step: saved.step }
    }
  } catch {
    // A broken draft just starts over.
  }
  return { d: EMPTY, step: "postAs" }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // Storage can be unavailable; nothing to clear then.
  }
}

/** One question per screen. Everyday tasks ask when and where; professional roles ask for the terms. */
export const stepsFor = (k?: Kind): Step[] =>
  k === "professional"
    ? ["postAs", "type", "title", "category", "role", "photos", "budget", "contact", "review"]
    : ["postAs", "type", "title", "category", "time", "location", "photos", "budget", "contact", "review"]

export const PARTS = [
  ["morning", "Morning", "Before 10am"],
  ["midday", "Midday", "10am – 2pm"],
  ["afternoon", "Afternoon", "2pm – 6pm"],
  ["evening", "Evening", "After 6pm"],
] as const

export const FLEX = [
  ["week", "This week"],
  ["month", "This month"],
  ["no_rush", "No rush"],
] as const

export const ARRANGEMENTS: readonly (readonly [Arrangement, string])[] = [
  ["on_site", "On-site"],
  ["remote", "Remote"],
  ["hybrid", "Hybrid"],
]

export const EMPLOYMENT: readonly (readonly [Employment, string])[] = [
  ["Full time", "Full-time"],
  ["Part time", "Part-time"],
  ["Contract", "Contract"],
  ["Freelance", "Freelance"],
]

export const EXPERIENCE = ["0", "1", "2", "3", "5", "7", "10"]

export const STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
]

export function addDays(n: number, from: string = ANCHOR_DATE) {
  const d = new Date(`${from}T00:00:00`)
  d.setDate(d.getDate() + n)
  const pad = (x: number) => String(x).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const fmtDate = (d: string) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""

export const employers = () => users.filter((u) => u.roles.includes("Employer") && !u.removed)

export function posterOf(d: Draft) {
  return d.postAs === "user" ? users.find((u) => u.id === d.userId) : undefined
}

export function budgetLabel(d: Draft) {
  const min = Number(d.min || 0)
  const max = d.fixed ? min : Number(d.max || 0)
  return min === max ? naira(min) : `${naira(min)} – ${naira(max)}`
}

export function categoryLabel(d: Draft) {
  return d.sub ? `${d.category} › ${d.sub}` : (d.category ?? "")
}

export function whenLabel(d: Draft) {
  if (d.timing === "flexible") return d.flexWindow ? `Flexible, ${FLEX.find((f) => f[0] === d.flexWindow)?.[1].toLowerCase()}` : "Flexible"
  if (!d.date) return ""
  return `${d.timing === "before" ? "Before" : "On"} ${fmtDate(d.date)}`
}

export function timeLabel(d: Draft) {
  const part = PARTS.find((p) => p[0] === d.partOfDay)
  return part ? `${part[1]} (${part[2]})` : "Any time"
}

export function modeLabel(d: Draft) {
  if (d.kind === "professional") return ARRANGEMENTS.find((a) => a[0] === d.arrangement)?.[1] ?? ""
  return d.place === "online" ? "Online" : "In person"
}

export function locationLabel(d: Draft) {
  if (d.kind === "professional") return d.arrangement === "remote" ? "Remote" : `${d.state}, Nigeria`
  if (d.place === "online") return "Online"
  return `${d.area.trim() ? `${d.area.trim()}, ` : ""}${d.state}, Nigeria`
}

export const isUrl = (s: string) => /^https?:\/\/[^\s/.]+\.[^\s]+$/i.test(s.trim())

/** Everyday jobs: in-app message (always), WhatsApp, phone. Professional jobs add email and an apply link. */
export function contactList(d: Draft) {
  const pro = d.kind === "professional"
  return [
    (!pro || d.contact.message) && "In-app message",
    d.contact.whatsapp && "WhatsApp",
    d.contact.phone && "Phone",
    pro && d.contact.email && "Email",
    pro && d.contact.apply && "Apply link",
  ].filter(Boolean) as string[]
}

export const applyUrlOf = (d: Draft) => (d.kind === "professional" && d.contact.apply && isUrl(d.applyUrl) ? d.applyUrl.trim() : undefined)

const digits = (s: string) => s.replace(/\D/g, "").length

export function contactValid(d: Draft) {
  const pro = d.kind === "professional"
  return (
    contactList(d).length > 0 &&
    (!d.contact.whatsapp || digits(d.whatsappNumber) >= 10) &&
    (!d.contact.phone || digits(d.phoneNumber) >= 10) &&
    (!pro || !d.contact.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.emailAddress.trim())) &&
    (!pro || !d.contact.apply || isUrl(d.applyUrl))
  )
}

export function budgetError(d: Draft) {
  return !d.fixed && d.min && d.max && Number(d.max) < Number(d.min) ? "The maximum can't be less than the minimum" : undefined
}

export function isValid(step: Step, d: Draft) {
  switch (step) {
    case "postAs":
      return d.postAs === "official" || (d.postAs === "user" && !!d.userId)
    case "type":
      return !!d.kind
    case "title":
      return d.title.trim().length >= 5 && d.description.trim().length >= 20
    case "category":
      return !!d.category
    case "time":
      return d.timing === "flexible" || (!!d.timing && !!d.date)
    case "location":
      return d.place === "online" || (d.place === "in_person" && !!d.state)
    case "role":
      return !!d.employment && !!d.arrangement && (d.arrangement === "remote" || !!d.state) && d.experience !== ""
    case "budget":
      return d.fixed ? Number(d.min) > 0 : Number(d.min) > 0 && Number(d.max) > 0 && !budgetError(d)
    case "contact":
      return contactValid(d)
    default:
      return true
  }
}

function nextJobId() {
  const max = jobs.reduce((m, j) => Math.max(m, Number(j.id.replace(/\D/g, "")) || 0), 0)
  return `J-${String(max + 1).padStart(2, "0")}`
}

/** Turns the answers into a JobListing and adds it to the mock jobs. Returns the new id. */
export function publishJob(d: Draft): string {
  const poster = posterOf(d)
  const pro = d.kind === "professional"
  const open = d.publish === "open"
  const job: JobListing = {
    id: nextJobId(),
    title: d.title.trim(),
    poster: poster?.name ?? "Jobs Region",
    posterId: poster?.id ?? "",
    official: poster ? undefined : true,
    category: categoryLabel(d),
    type: pro ? "Skilled" : "Everyday",
    status: open ? "success" : "warning",
    statusLabel: open ? "Open" : "Pending Review",
    datePosted: ANCHOR_DATE,
    description: d.description.trim(),
    recommended: [],
    images: [],
    promoted: d.promote || undefined,
    views: 0,
    location: locationLabel(d),
    serviceDate: pro ? (d.closesOn ? `Closes ${d.closesOn}` : "Open until filled") : whenLabel(d),
    serviceTime: pro ? (d.employment ?? "") : timeLabel(d),
    experienceYears: pro ? Number(d.experience) : undefined,
    budget: budgetLabel(d),
    photos: d.photos.length ? d.photos : undefined,
    mode: modeLabel(d),
    contactMethods: contactList(d),
    applyUrl: applyUrlOf(d),
  }
  jobs.push(job)
  return job.id
}
