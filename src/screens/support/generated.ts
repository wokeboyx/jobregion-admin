import type { Status } from "@/components/ui/status-pill"
import { ANCHOR_DATE, supportCategories, type SupportArticle, type SupportCategory } from "@/lib/mock-data"

/**
 * The Help Center store for the support screens: the hand-written categories and articles from mock-data first, then
 * extra categories and ~150 generated articles so the two-level layout has real volume. Generated articles have their
 * own ids and open in their own editor at /support/articles/:id. Both support screens read and write these objects.
 */

export type HelpArticle = SupportArticle & { views: number }
export type HelpCategory = Omit<SupportCategory, "articles"> & { articles: HelpArticle[] }

export const HELP_AUTHORS = ["Chiamaka Obi", "Grace Nwankwo", "Halima Yusuf", "Desmond Ajimuda"]

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

const TOPICS: Record<string, string[]> = {
  "Getting Started": ["Setting up your profile", "Choosing your work areas", "Adding a profile photo", "Signing in on a new phone", "Switching between hiring and working"],
  Verification: ["Which IDs we accept", "Taking a clear ID photo", "How long verification takes", "Verifying a business with CAC", "Updating your verified name"],
  "Promotions & Subscriptions": ["What Pro includes", "Promoting a job", "Cancelling Pro", "Getting a receipt", "Changing your plan"],
  "Payments & billing": ["Paying with a card", "Paying by bank transfer", "Refunds for promotions", "Failed payments", "Updating billing details"],
  "Account & security": ["Resetting your password", "Turning on two-step sign-in", "Deleting your account", "Changing your phone number", "Spotting fake login pages"],
  "Messages & safety": ["Blocking someone", "Reporting a message", "Meeting a provider safely", "Sharing your address", "Scams to watch out for"],
  "Jobs & applications": ["Posting a job", "Editing a live job", "Closing a job", "Applying to a job", "Why a job was removed"],
  "Reviews & ratings": ["How reviews work", "Replying to a review", "Reporting an unfair review", "When your rating appears", "Double-blind reviews explained"],
}

const EXTRA_CATEGORIES = ["Payments & billing", "Account & security", "Messages & safety", "Jobs & applications", "Reviews & ratings"]

const VARIANTS = ["", "on Android", "on iPhone", "on the website", "for companies", "for workers"]

function withViews(a: SupportArticle, rand: () => number): HelpArticle {
  return { ...a, views: a.statusLabel === "Published" ? Math.floor(rand() * 12000) + 80 : 0 }
}

function build(): HelpCategory[] {
  const rand = seeded(7)
  const base: HelpCategory[] = supportCategories.map((c) => ({ ...c, articles: c.articles.map((a) => withViews(a, rand)) }))
  const extra: HelpCategory[] = EXTRA_CATEGORIES.map((name, i) => ({
    id: `SC-${String(i + 4).padStart(2, "0")}`,
    name,
    active: name !== "Reviews & ratings",
    articles: [],
  }))
  const all = [...base, ...extra]

  for (let i = 0; i < 150; i++) {
    // Uneven spread so some categories are much bigger than others, as in a real Help Center.
    const r = rand()
    const category = all[Math.min(all.length - 1, Math.floor(r * r * all.length * 1.2))]
    const topics = TOPICS[category.name] ?? TOPICS["Getting Started"]
    const topic = topics[Math.floor(rand() * topics.length)]
    const variant = VARIANTS[Math.floor(rand() * VARIANTS.length)]
    const title = variant ? `${topic} ${variant}` : topic
    const published = rand() < 0.78
    const status: Status = published ? "success" : "warning"
    const author = HELP_AUTHORS[Math.floor(rand() * HELP_AUTHORS.length)]
    category.articles.push({
      id: `SA-${String(i + 101).padStart(3, "0")}`,
      title,
      status,
      statusLabel: published ? "Published" : "Draft",
      updated: addDays(ANCHOR_DATE, -Math.floor(rand() * 420)),
      author,
      body: `${title}.\n\nStep-by-step help from the Jobs Region support team.`,
      views: published ? Math.floor(rand() * 9000) + 40 : 0,
    })
  }
  return all
}

export const helpCategories: HelpCategory[] = build()
