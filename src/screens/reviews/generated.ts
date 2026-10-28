import { jobs, users } from "@/lib/mock-data"
import {
  hires as baseHires,
  reviews as baseReviews,
  REVIEW_ASPECTS,
  type Hire,
  type HireState,
  type Review,
  type ReviewState,
} from "@/lib/trust-data"

/*
 * Extra hires and reviews made from templates with a seeded random, so paging and sorting have something to chew
 * on. The hand-written rows from trust-data come first. Every generated review belongs to a confirmed hire.
 */

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = seeded(4242)
const pick = <T>(list: readonly T[]) => list[Math.floor(rand() * list.length)]
const clamp = (n: number) => Math.max(1, Math.min(5, n))

const ANCHOR = new Date("2026-07-07T00:00:00")
const daysAgo = (n: number) => {
  const d = new Date(ANCHOR)
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

const workers = users.filter((u) => u.roles.includes("Worker"))

/** Rating text by who is reviewed and how it went. */
const TEXTS: Record<"worker" | "poster", Record<"good" | "ok" | "bad", string[]>> = {
  worker: {
    good: [
      "Arrived early, worked neatly and cleaned up after. Highly recommended.",
      "Very professional and honest about what the job needed. Will hire again.",
      "Did exactly what we agreed, on time and on budget.",
      "Great attitude and great work. Our guests noticed.",
      "Quick, careful and friendly. Explained everything before starting.",
    ],
    ok: [
      "Good work overall, but came later than agreed.",
      "Job done, though we had to remind them about a few things.",
      "Decent work. Communication could be better.",
    ],
    bad: [
      "Left the job half done and stopped picking calls.",
      "Very late and the finish was poor. Had to call someone else.",
      "Rude to my staff and asked for more money midway.",
    ],
  },
  poster: {
    good: [
      "Clear instructions and paid the same day. A pleasure to work for.",
      "Respectful and organised. The job was exactly as described.",
      "Paid as agreed and even provided lunch. Would work with them again.",
      "Easy to reach and quick to answer questions.",
    ],
    ok: [
      "Paid in the end, but a few days late.",
      "The job was bigger than the post said, but they were fair about it.",
      "Fine overall. Instructions changed a couple of times.",
    ],
    bad: [
      "Still waiting for the balance two weeks later.",
      "The job was nothing like the description and they shouted at us.",
      "Cancelled on the day after I had already travelled there.",
    ],
  },
}

const REPLIES = [
  "Thank you so much! Happy to help any time.",
  "Thanks for the kind words.",
  "Sorry about the delay. Traffic on the day was terrible.",
  "We paid as soon as the work was checked. Thanks for your patience.",
  "We don’t agree with this, but thank you for the feedback.",
]

const HIRE_COUNT = 64

function makeHire(i: number): Hire {
  const job = pick(jobs)
  const worker = pick(workers.filter((w) => w.id !== job.posterId))
  const age = 4 + Math.floor(rand() * 200)
  // Mostly confirmed; a few still waiting, declined or expired, like a real week.
  const roll = i % 20
  const state: HireState = roll === 3 ? "Awaiting confirmation" : roll === 9 ? "Declined" : roll === 14 ? "Expired" : "Confirmed"
  const realAge = state === "Awaiting confirmation" ? Math.floor(rand() * 6) : age
  return {
    id: `H-${String(i + 100).padStart(3, "0")}`,
    jobId: job.id,
    jobTitle: job.title,
    posterId: job.posterId,
    workerId: worker.id,
    claimedBy: rand() < 0.5 ? "poster" : "worker",
    state,
    date: daysAgo(realAge),
    confirmedDate: state === "Confirmed" ? daysAgo(Math.max(0, realAge - 1)) : undefined,
  }
}

export const generatedHires: Hire[] = Array.from({ length: HIRE_COUNT }, (_, i) => makeHire(i))

let reviewSeq = 100

function makeReview(hire: Hire, about: "worker" | "poster"): Review {
  const r = rand()
  const rating = r < 0.55 ? 5 : r < 0.8 ? 4 : r < 0.9 ? 3 : r < 0.95 ? 2 : 1
  const band = rating >= 4 ? "good" : rating === 3 ? "ok" : "bad"
  const aspects = Object.fromEntries(
    REVIEW_ASPECTS[about].map((a) => [a, clamp(rating + (rand() < 0.25 ? -1 : rand() < 0.15 ? 1 : 0))]),
  )
  const age = Math.max(0, Math.round((ANCHOR.getTime() - new Date(`${hire.confirmedDate ?? hire.date}T00:00:00`).getTime()) / 86_400_000) - 1 - Math.floor(rand() * 4))
  const reportCount = rating <= 2 ? (rand() < 0.5 ? 1 + Math.floor(rand() * 3) : 0) : rand() < 0.04 ? 1 : 0
  const state: ReviewState = age < 6 && rand() < 0.5 ? "Hidden until both review" : rand() < 0.04 ? "Removed" : "Published"
  reviewSeq += 1
  return {
    id: `RV-${reviewSeq}`,
    hireId: hire.id,
    authorId: about === "worker" ? hire.posterId : hire.workerId,
    subjectId: about === "worker" ? hire.workerId : hire.posterId,
    about,
    rating,
    aspects,
    text: pick(TEXTS[about][band]),
    date: daysAgo(age),
    state,
    reply: rand() < 0.22 ? pick(REPLIES) : undefined,
    reportCount: state === "Removed" ? 0 : reportCount,
  }
}

export const generatedReviews: Review[] = generatedHires
  .filter((h) => h.state === "Confirmed")
  .flatMap((h) => [makeReview(h, "worker"), makeReview(h, "poster")])

export const allHires: Hire[] = [...baseHires, ...generatedHires]
export const allReviews: Review[] = [...baseReviews, ...generatedReviews]
