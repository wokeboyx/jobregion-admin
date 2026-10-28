/**
 * Announcements sent from the admin to people on Jobs Region (mock): push notifications, in-app notifications
 * (the bell in the web app), emails, and the website newsletter.
 */

export type AnnouncementChannel = "push" | "inApp" | "email" | "newsletter"
export type AnnouncementStatus = "Sent" | "Scheduled" | "Draft"

export type AudienceKind =
  | "everyone"
  | "seekers"
  | "hiring"
  | "pro"
  | "unverified"
  | "state"
  | "category"
  | "newsletter"

export interface Audience {
  kind: AudienceKind
  /** For "state". */
  states?: string[]
  /** Category ids, for "category". */
  categories?: string[]
}

export interface Announcement {
  id: string
  title: string
  message: string
  link?: string
  audience: Audience
  channels: AnnouncementChannel[]
  status: AnnouncementStatus
  /** Sent or scheduled for, "2026-10-20 10:00". Drafts keep the last edit time. */
  date: string
  delivered?: number
  opened?: number
  clicked?: number
}

export interface ChannelStats {
  delivered: number
  opened: number
  clicked: number
}

export const CHANNEL_LABEL: Record<AnnouncementChannel, string> = {
  push: "Push",
  inApp: "In-app",
  email: "Email",
  newsletter: "Newsletter",
}

export const AUDIENCE_LABEL: Record<AudienceKind, string> = {
  everyone: "Everyone",
  seekers: "Job seekers",
  hiring: "People hiring",
  pro: "Pro members",
  unverified: "Not verified yet",
  state: "By state",
  category: "By work category",
  newsletter: "Newsletter subscribers",
}

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
]

const handWrittenAnnouncements: Announcement[] = [
  {
    id: "AN-06",
    title: "New: Spotlight promotions now shared to Telegram",
    message: "Spotlight and Pro promotions are now shared to our Telegram channel too, so more people see your job.",
    link: "/promote",
    audience: { kind: "hiring" },
    channels: ["push", "inApp", "email"],
    status: "Sent",
    date: "2026-10-20 10:00",
    delivered: 4_812,
    opened: 1_587,
    clicked: 402,
  },
  {
    id: "AN-05",
    title: "Verify your ID to get reviews",
    message: "Verified people get 3× more replies and can collect reviews. It takes 2 minutes.",
    link: "/verify",
    audience: { kind: "unverified" },
    channels: ["push", "inApp"],
    status: "Sent",
    date: "2026-10-14 09:30",
    delivered: 2_904,
    opened: 1_162,
    clicked: 371,
  },
  {
    id: "AN-04",
    title: "October on Jobs Region",
    message: "New categories, safer payments tips, and the five most-booked services in Lagos this month.",
    link: "/blog",
    audience: { kind: "newsletter" },
    channels: ["newsletter"],
    status: "Sent",
    date: "2026-10-01 08:00",
    delivered: 1_386,
    opened: 541,
    clicked: 96,
  },
  {
    id: "AN-03",
    title: "Pro is ₦2,500 this month",
    message: "Get job alerts first, a Pro badge and top placement. ₦2,500 for your first month, until 31 October.",
    link: "/pro",
    audience: { kind: "seekers" },
    channels: ["push", "inApp", "email"],
    status: "Scheduled",
    date: "2026-10-24 12:00",
  },
  {
    id: "AN-02",
    title: "Scheduled maintenance",
    message: "Jobs Region will be unavailable on Sunday from 2am to 4am while we upgrade our servers.",
    audience: { kind: "everyone" },
    channels: ["inApp", "email"],
    status: "Scheduled",
    date: "2026-10-26 18:00",
  },
  {
    id: "AN-01",
    title: "Cleaners wanted in Lagos and Abuja",
    message: "Dozens of new cleaning jobs this week near you. Turn on job alerts so you never miss one.",
    link: "/jobs?category=cleaning",
    audience: { kind: "category", categories: ["CAT-01"] },
    channels: ["push"],
    status: "Draft",
    date: "2026-10-21 16:45",
  },
]

function seeded(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const pad = (n: number) => String(n).padStart(2, "0")
/** Days before 22 Oct 2026 as "2026-10-12"; negative goes into the future. */
function dayBefore(days: number) {
  const d = new Date(Date.UTC(2026, 9, 22) - days * 86_400_000)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

const TEMPLATES: Omit<Announcement, "id" | "status" | "date">[] = [
  { title: "New jobs near you this week", message: "Fresh jobs in your area are waiting. Open Jobs Region to see who’s hiring.", link: "/jobs", audience: { kind: "seekers" }, channels: ["push", "inApp"] },
  { title: "Tips for writing a great job post", message: "Clear titles and a fair budget get 2× more replies. Here’s a 3-step checklist.", link: "/blog", audience: { kind: "hiring" }, channels: ["inApp", "email"] },
  { title: "Your monthly Jobs Region roundup", message: "Top categories, new features and stories from people working on Jobs Region.", link: "/blog", audience: { kind: "newsletter" }, channels: ["newsletter"] },
  { title: "Stay safe: never pay to apply", message: "No real job asks for a registration fee. Report anyone who does, and we’ll act within 24 hours.", link: "/safety", audience: { kind: "everyone" }, channels: ["push", "inApp", "email"] },
  { title: "Finish verifying your ID", message: "You’re one step away. Verified people get more replies and can collect reviews.", link: "/verify", audience: { kind: "unverified" }, channels: ["push", "email"] },
  { title: "Pro members: early job alerts are live", message: "You now see new jobs 30 minutes before everyone else. Turn on alerts to use it.", link: "/pro", audience: { kind: "pro" }, channels: ["push", "inApp"] },
  { title: "Lots of new jobs in Lagos", message: "Over 300 jobs were posted in Lagos this week. Cleaning, plumbing and events lead the way.", link: "/jobs?state=lagos", audience: { kind: "state", states: ["Lagos"] }, channels: ["push"] },
  { title: "Electricians wanted in Abuja and Kano", message: "Dozens of rewiring and installation jobs need skilled hands this week.", link: "/jobs?category=electrical", audience: { kind: "state", states: ["FCT Abuja", "Kano"] }, channels: ["push", "inApp"] },
  { title: "Boost your job for ₦1,000 this weekend", message: "Get your job seen by up to 5× more people. Weekend price ends Sunday night.", link: "/promote", audience: { kind: "hiring" }, channels: ["push", "inApp", "email"] },
  { title: "New: save jobs to view later", message: "Tap the heart on any job to save it. Find saved jobs under Profile › Saved.", audience: { kind: "seekers" }, channels: ["inApp"] },
  { title: "We’ve updated our terms", message: "We’ve made our terms of use easier to read. Nothing changes about how you use Jobs Region.", link: "/terms", audience: { kind: "everyone" }, channels: ["email", "inApp"] },
  { title: "Event season is here", message: "Ushers, caterers, DJs and decorators are in demand for December. Update your profile now.", link: "/jobs?category=events", audience: { kind: "category", categories: ["CAT-01"] }, channels: ["push", "email"] },
  { title: "Rate the people you worked with", message: "Reviews help everyone hire with confidence. It takes 30 seconds.", audience: { kind: "everyone" }, channels: ["push", "inApp"] },
  { title: "How to price a job fairly", message: "Our new guide shows typical rates for 20 common jobs across Nigeria.", link: "/blog", audience: { kind: "newsletter" }, channels: ["newsletter", "email"] },
]

const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"]
const OPEN_RATE: Record<AnnouncementChannel, number> = { push: 0.34, inApp: 0.46, email: 0.27, newsletter: 0.38 }
const CHANNEL_SHARE: Record<AnnouncementChannel, number> = { push: 0.62, inApp: 1, email: 0.88, newsletter: 1 }

function generateAnnouncements(count: number): Announcement[] {
  const rand = seeded(424242)
  return Array.from({ length: count }, (_, i): Announcement => {
    const t = TEMPLATES[i % TEMPLATES.length]
    // A couple scheduled ahead, a few drafts, the rest sent over the past year.
    const status: Announcement["status"] = i < 2 ? "Scheduled" : i % 9 === 4 ? "Draft" : "Sent"
    const days = status === "Scheduled" ? -(3 + i * 4) : 3 + i * 10 + Math.floor(rand() * 6)
    const date = `${dayBefore(days)} ${pad(8 + Math.floor(rand() * 10))}:${rand() < 0.5 ? "00" : "30"}`
    const title = t.audience.kind === "newsletter" && t.title.includes("roundup") ? `${MONTHS[(11 - Math.floor(days / 30) + 12) % 12]} on Jobs Region` : t.title
    const base: Announcement = { ...t, title, id: `AN-${String(100 - i).padStart(3, "0")}`, status, date }
    if (status !== "Sent") return base
    // Newsletter-only sends can't reach more than the ~1,800 subscribers.
    const delivered = Math.round(t.audience.kind === "newsletter" ? 1_150 + rand() * 650 : 1_200 + rand() * 14_000)
    const openRate = t.channels.reduce((sum, c) => sum + OPEN_RATE[c], 0) / t.channels.length + (rand() - 0.5) * 0.12
    const opened = Math.round(delivered * openRate)
    const clicked = Math.round(opened * (0.12 + rand() * 0.25))
    return { ...base, delivered, opened, clicked }
  })
}

export const announcements: Announcement[] = [...handWrittenAnnouncements, ...generateAnnouncements(34)]

/** Delivered, opened and clicked on each channel, split from the totals (stable for a given announcement). */
export function channelStats(a: Announcement): Partial<Record<AnnouncementChannel, ChannelStats>> {
  if (a.delivered === undefined) return {}
  const rand = seeded([...a.id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7))
  const totalRate = a.delivered ? (a.opened ?? 0) / a.delivered : 0
  const clickShare = a.opened ? (a.clicked ?? 0) / a.opened : 0
  const mean = a.channels.reduce((sum, c) => sum + OPEN_RATE[c], 0) / (a.channels.length || 1)
  const out: Partial<Record<AnnouncementChannel, ChannelStats>> = {}
  for (const c of a.channels) {
    const delivered = Math.round(a.delivered * CHANNEL_SHARE[c] * (0.92 + rand() * 0.08))
    const rate = Math.min(0.95, totalRate * (OPEN_RATE[c] / mean))
    const opened = Math.round(delivered * rate)
    out[c] = { delivered, opened, clicked: Math.round(opened * clickShare * (0.8 + rand() * 0.4)) }
  }
  return out
}

export type SubscriberSource = "Website footer" | "Blog"

export interface NewsletterSubscriber {
  id: string
  email: string
  source: SubscriberSource
  date: string
  status: "Subscribed" | "Unsubscribed"
}

const handWrittenSubscribers: NewsletterSubscriber[] = [
  { id: "NS-12", email: "tobi.alabi@gmail.com", source: "Website footer", date: "2026-10-21", status: "Subscribed" },
  { id: "NS-11", email: "chioma.okafor@yahoo.com", source: "Blog", date: "2026-10-20", status: "Subscribed" },
  { id: "NS-10", email: "musa.ibrahim@outlook.com", source: "Website footer", date: "2026-10-18", status: "Subscribed" },
  { id: "NS-09", email: "funke.adeleke@gmail.com", source: "Blog", date: "2026-10-15", status: "Unsubscribed" },
  { id: "NS-08", email: "emeka.obi@gmail.com", source: "Website footer", date: "2026-10-12", status: "Subscribed" },
  { id: "NS-07", email: "aisha.garba@gmail.com", source: "Website footer", date: "2026-10-09", status: "Subscribed" },
  { id: "NS-06", email: "kelechi.nnamdi@mail.com", source: "Blog", date: "2026-10-04", status: "Subscribed" },
  { id: "NS-05", email: "bisi.ojo@gmail.com", source: "Website footer", date: "2026-09-28", status: "Unsubscribed" },
  { id: "NS-04", email: "hello@lagoshomes.example.com", source: "Blog", date: "2026-09-22", status: "Subscribed" },
  { id: "NS-03", email: "yemi.adeyinka@gmail.com", source: "Website footer", date: "2026-09-15", status: "Subscribed" },
  { id: "NS-02", email: "nkem.eze@yahoo.com", source: "Website footer", date: "2026-09-08", status: "Subscribed" },
  { id: "NS-01", email: "dayo.peters@gmail.com", source: "Blog", date: "2026-09-01", status: "Subscribed" },
]

const SUB_FIRST = ["tobi", "chioma", "musa", "funke", "emeka", "aisha", "kelechi", "bisi", "yemi", "nkem", "dayo", "ibrahim", "zainab", "uche", "bola", "sade", "obinna", "hauwa", "segun", "ada", "ifeoma", "tunde", "rukayat", "chidi", "ngozi", "femi", "amina", "kunle", "blessing", "victor"]
const SUB_LAST = ["alabi", "okafor", "ibrahim", "adeleke", "obi", "garba", "nnamdi", "ojo", "adeyinka", "eze", "peters", "bello", "usman", "okeke", "lawal", "balogun", "nwachukwu", "danjuma", "afolabi", "ogunleye", "yusuf", "edet", "akpan", "mohammed"]
const SUB_MAIL = ["gmail.com", "gmail.com", "gmail.com", "yahoo.com", "outlook.com", "mail.com", "icloud.com"]

function generateSubscribers(count: number): NewsletterSubscriber[] {
  const rand = seeded(1386)
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)]
  return Array.from({ length: count }, (_, i): NewsletterSubscriber => {
    const sep = pick([".", "_", ""])
    const num = rand() < 0.45 ? String(Math.floor(rand() * 990) + 10) : ""
    return {
      id: `NS-${String(i + 13).padStart(4, "0")}`,
      email: `${pick(SUB_FIRST)}${sep}${pick(SUB_LAST)}${num}@${pick(SUB_MAIL)}`,
      source: rand() < 0.68 ? "Website footer" : "Blog",
      // Oldest first after the hand-written ones: up to ~14 months back from 1 Sep 2026.
      date: dayBefore(51 + Math.floor((i / count) * 420 + rand() * 6)),
      status: rand() < 0.09 ? "Unsubscribed" : "Subscribed",
    }
  })
}

export const newsletterSubscribers: NewsletterSubscriber[] = [...handWrittenSubscribers, ...generateSubscribers(1_990)]
