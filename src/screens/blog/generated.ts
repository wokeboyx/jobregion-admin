import type { Status } from "@/components/ui/status-pill"
import { ANCHOR_DATE, BLOG_CATEGORIES, blogPosts, type BlogPost } from "@/lib/mock-data"

/**
 * Blog posts for the blog screens: the hand-written posts from mock-data first, then ~112 generated ones so paging,
 * sorting and bulk actions have something to work on. Generated posts are full posts with their own ids, so each one
 * opens in its own editor at /blog/:id. Both blog screens read and write this one array.
 */

export const BLOG_AUTHORS = ["Chiamaka Obi", "Aisha Bello", "Grace Nwankwo", "Halima Yusuf", "Tunde Bakare"]

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TITLES: Record<string, string[]> = {
  Guides: [
    "How to write a job post that gets replies",
    "Hiring a plumber in Lagos: what to ask first",
    "A simple checklist for hiring a cleaner",
    "How to compare quotes from three providers",
    "Getting your first job done on Jobs Region",
    "What a verified badge really tells you",
    "How to brief a carpenter so the job goes right",
    "Hiring for a one-day event without stress",
  ],
  "Career Tips": [
    "How to price your work in Abuja",
    "Five photos every tradesperson should post",
    "Turning one-off jobs into repeat clients",
    "Writing a bio that gets you hired",
    "How to ask for a review without being awkward",
    "Answering messages fast: why it matters",
    "Growing from side hustle to full-time trade",
    "Keeping your calendar up to date pays off",
  ],
  "Platform Updates": [
    "New: instant job alerts for Pro members",
    "Messaging gets read receipts",
    "Faster search across every state",
    "Better photo uploads on Android",
    "Saved searches now sync across devices",
    "Verification is now twice as fast",
    "New filters for jobs near you",
    "Dark mode lands in the app",
  ],
  Announcements: [
    "Jobs Region now covers Port Harcourt",
    "Meet the new support team",
    "Our community guidelines, refreshed",
    "Thank you for 100,000 jobs posted",
    "Holiday support hours",
    "We're hiring: join the Jobs Region team",
  ],
  Product: [
    "Behind the scenes: how matching works",
    "Why we built double-blind reviews",
    "Designing for slow networks",
    "How we fight scam job posts",
    "What we learned from 1,000 user calls",
    "Building the new job alerts",
  ],
}

const STATUSES: { label: string; status: Status; weight: number }[] = [
  { label: "Published", status: "success", weight: 0.64 },
  { label: "Draft", status: "warning", weight: 0.16 },
  { label: "Scheduled", status: "warning", weight: 0.08 },
  { label: "Archived", status: "neutral", weight: 0.12 },
]

function pickStatus(r: number) {
  let acc = 0
  for (const s of STATUSES) {
    acc += s.weight
    if (r < acc) return s
  }
  return STATUSES[0]
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function generatePosts(count: number): BlogPost[] {
  const rand = seeded(42)
  return Array.from({ length: count }, (_, i) => {
    const category = BLOG_CATEGORIES[Math.floor(rand() * BLOG_CATEGORIES.length)]
    const titles = TITLES[category] ?? TITLES.Guides
    const base = titles[Math.floor(rand() * titles.length)]
    const part = Math.floor(i / 8)
    const title = part > 0 ? `${base} (part ${part + 1})` : base
    const s = pickStatus(rand())
    const author = BLOG_AUTHORS[Math.floor(rand() * BLOG_AUTHORS.length)]
    const daysAgo = Math.floor(rand() * 540) + 1
    const date =
      s.label === "Draft" ? "Not scheduled" : s.label === "Scheduled" ? addDays(ANCHOR_DATE, Math.floor(rand() * 30) + 1) : addDays(ANCHOR_DATE, -daysAgo)
    const views =
      s.label === "Published" ? Math.floor(rand() * 18000) + 120 : s.label === "Archived" ? Math.floor(rand() * 9000) + 400 : 0
    return {
      id: `BP-${String(i + 101).padStart(3, "0")}`,
      title,
      author,
      status: s.status,
      statusLabel: s.label,
      category,
      tags: [category],
      date,
      views,
      cover: "",
      body: `${title}.\n\nA short ${category.toLowerCase()} piece from the Jobs Region team, written by ${author}.`,
    }
  })
}

export const blogStore: BlogPost[] = [...blogPosts, ...generatePosts(112)]
