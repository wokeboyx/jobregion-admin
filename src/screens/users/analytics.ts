/*
 * Deterministic profile analytics for each side of an account. Every day's number is a hash of (user, metric, date),
 * so overlapping ranges agree and the same range always shows the same numbers. "Today" is the mock ANCHOR_DATE.
 */
import type { CustomRange, DatePreset } from "@/components/date-range-dropdown"
import { ANCHOR_DATE, type JobListing, type UserAccount } from "@/lib/mock-data"
import { firstResponseHours, hashOf, hiresAs, profilePromotionsOf, responsesFor, seekerOf } from "./profiles"

export interface DayCount {
  date: string
  count: number
}

export interface Range {
  start: string
  end: string
  days: number
  prevStart: string
  prevEnd: string
  /** "previous 30 days" style words for the delta line. */
  prevLabel: string
}

export interface Stat {
  label: string
  value: string
  /** Change vs the previous period as a fraction (0.12 = +12%), or null when there is nothing to compare. */
  delta: number | null
  /** For things like response time, where going down is good. */
  lowerIsBetter?: boolean
}

export interface ChartSeries {
  key: string
  label: string
  data: DayCount[]
}

const DAY = 86_400_000
const toTime = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const toIso = (t: number) => new Date(t).toISOString().slice(0, 10)
const addDays = (iso: string, n: number) => toIso(toTime(iso) + n * DAY)
const daysBetween = (a: string, b: string) => Math.round((toTime(b) - toTime(a)) / DAY) + 1

const PRESET_DAYS: Partial<Record<DatePreset, number>> = { "7d": 7, "14d": 14, "30d": 30, "90d": 90 }

export function resolveRange(preset: DatePreset, custom: CustomRange | null): Range {
  let start: string
  let end = ANCHOR_DATE
  if (preset === "custom" && custom && custom.start <= custom.end) {
    start = custom.start
    end = custom.end
  } else if (preset === "this_month") {
    start = `${ANCHOR_DATE.slice(0, 7)}-01`
  } else if (preset === "last_month") {
    end = addDays(`${ANCHOR_DATE.slice(0, 7)}-01`, -1)
    start = `${end.slice(0, 7)}-01`
  } else {
    const n = PRESET_DAYS[preset] ?? 30
    start = addDays(end, -(n - 1))
  }
  const days = daysBetween(start, end)
  const prevEnd = addDays(start, -1)
  const prevStart = addDays(prevEnd, -(days - 1))
  const prevLabel = preset === "this_month" || preset === "last_month" ? "the month before" : `previous ${days} day${days === 1 ? "" : "s"}`
  return { start, end, days, prevStart, prevEnd, prevLabel }
}

function datesIn(start: string, end: string) {
  const n = Math.max(1, daysBetween(start, end))
  return Array.from({ length: n }, (_, i) => addDays(start, i))
}

/** One number per day: base × a slow upward trend × a weekday dip × hashed noise. */
function series(seed: string, base: number, start: string, end: string): DayCount[] {
  const origin = toTime("2026-01-01")
  return datesIn(start, end).map((date) => {
    const t = toTime(date)
    const trend = 1 + (t - origin) / DAY / 300
    const dow = new Date(t).getUTCDay()
    const weekly = dow === 0 ? 0.65 : dow === 6 ? 0.8 : 1
    const noise = 0.55 + ((hashOf(`${seed}|${date}`) % 1000) / 1000) * 0.9
    return { date, count: Math.max(0, Math.round(base * trend * weekly * noise)) }
  })
}

const total = (data: DayCount[]) => data.reduce((s, d) => s + d.count, 0)
const change = (now: number, before: number) => (before === 0 ? null : (now - before) / before)

/** Long ranges read better as weekly bars. */
export function forChart(data: DayCount[]): DayCount[] {
  if (data.length <= 31) return data
  const weeks: DayCount[] = []
  for (let i = 0; i < data.length; i += 7) {
    const chunk = data.slice(i, i + 7)
    weeks.push({ date: chunk[0].date, count: total(chunk) })
  }
  return weeks
}

const fmt = (n: number) => n.toLocaleString("en-NG")
const pct = (n: number) => `${Math.round(n * 100)}%`

/* ---------- Job seeker ---------- */

export interface SourceRow {
  source: string
  views: number
  share: number
  delta: number | null
}

export function seekerAnalytics(user: UserAccount, range: Range) {
  const seeker = seekerOf(user)
  const promos = profilePromotionsOf(user)
  const boost = (seeker?.pro ? 1.4 : 1) * (promos.length ? 1.3 : 1)
  const base = (4 + (hashOf(`${user.id}-views`) % 14)) * boost

  const views = series(`${user.id}|views`, base, range.start, range.end)
  const viewsPrev = series(`${user.id}|views`, base, range.prevStart, range.prevEnd)
  const search = series(`${user.id}|search`, base * 5.5, range.start, range.end)
  const searchPrev = series(`${user.id}|search`, base * 5.5, range.prevStart, range.prevEnd)
  const messages = series(`${user.id}|messages`, Math.max(0.6, base * 0.18), range.start, range.end)
  const messagesPrev = series(`${user.id}|messages`, Math.max(0.6, base * 0.18), range.prevStart, range.prevEnd)

  const rate = 0.08 + (hashOf(`${user.id}-rate`) % 14) / 100
  const wobble = (seed: string) => 0.85 + (hashOf(seed) % 30) / 100
  const hireRate = rate * wobble(`${user.id}|${range.start}`)
  const hireRatePrev = rate * wobble(`${user.id}|${range.prevStart}`)

  const v = total(views)
  const vp = total(viewsPrev)
  const stats: Stat[] = [
    { label: "Profile views", value: fmt(v), delta: change(v, vp) },
    { label: "Search appearances", value: fmt(total(search)), delta: change(total(search), total(searchPrev)) },
    { label: "Messages received", value: fmt(total(messages)), delta: change(total(messages), total(messagesPrev)) },
    { label: "Hire rate", value: pct(hireRate), delta: change(hireRate, hireRatePrev) },
  ]

  // Where the views came from: Find people search, their promotions, and direct links / shares.
  const promoShare = promos.length ? 0.22 + (hashOf(`${user.id}-ps`) % 10) / 100 : 0.03
  const findShare = 0.48 + (hashOf(`${user.id}-fs`) % 15) / 100
  const shares: [string, number][] = [
    ["Find people", findShare],
    ["Promotions", promoShare],
    ["Direct", 1 - findShare - promoShare],
  ]
  const tilt = (i: number, seed: string) => 0.9 + (hashOf(`${seed}-${i}`) % 20) / 100
  const sources: SourceRow[] = shares.map(([source, share], i) => {
    const now = Math.round(v * share * tilt(i, range.start))
    const before = Math.round(vp * share * tilt(i, range.prevStart))
    return { source, views: now, share: 0, delta: change(now, before) }
  })
  const sourceTotal = sources.reduce((s, r) => s + r.views, 0) || 1
  sources.forEach((r) => (r.share = r.views / sourceTotal))

  const charts: ChartSeries[] = [
    { key: "views", label: "Profile views", data: views },
    { key: "search", label: "Search appearances", data: search },
    { key: "messages", label: "Messages", data: messages },
  ]
  return { stats, charts, sources }
}

/* ---------- Employer ---------- */

export interface JobBreakdownRow {
  job: JobListing
  views: number
  responses: number
  firstResponse: number
  hires: number
}

export function employerAnalytics(user: UserAccount, posted: JobListing[], range: Range) {
  const allViews = posted.reduce((s, j) => s + j.views, 0)
  const base = Math.max(3, allViews / 90)
  const responseRate = 0.05 + (hashOf(`${user.id}-rr`) % 6) / 100

  const views = series(`${user.id}|jobviews`, base, range.start, range.end)
  const viewsPrev = series(`${user.id}|jobviews`, base, range.prevStart, range.prevEnd)
  const responses = series(`${user.id}|responses`, Math.max(0.5, base * responseRate), range.start, range.end)
  const responsesPrev = series(`${user.id}|responses`, Math.max(0.5, base * responseRate), range.prevStart, range.prevEnd)

  // Jobs live during each period (posted on or before its end), at least one so the per-job number is defined.
  const liveIn = (end: string) => Math.max(1, posted.filter((j) => j.datePosted <= end).length)
  const r = total(responses)
  const rp = total(responsesPrev)
  const perJob = r / liveIn(range.end)
  const perJobPrev = rp / liveIn(range.prevEnd)

  const avgHours = posted.length ? posted.reduce((s, j) => s + firstResponseHours(j), 0) / posted.length : 6
  const hoursIn = (seed: string) => avgHours * (0.8 + (hashOf(seed) % 40) / 100)
  const hours = hoursIn(`${user.id}|${range.start}`)
  const hoursPrev = hoursIn(`${user.id}|${range.prevStart}`)

  const hireShare = 0.1 + (hashOf(`${user.id}-hs`) % 8) / 100
  const recorded = hiresAs(user.id, "employer").filter((h) => h.date >= range.start && h.date <= range.end).length
  const hiresNow = Math.max(recorded, Math.round(r * hireShare))
  const hiresPrev = Math.round(rp * hireShare)

  const stats: Stat[] = [
    { label: "Job views", value: fmt(total(views)), delta: change(total(views), total(viewsPrev)) },
    { label: "Responses per job", value: perJob.toFixed(1), delta: change(perJob, perJobPrev) },
    { label: "Time to first response", value: `${hours.toFixed(1)} h`, delta: change(hours, hoursPrev), lowerIsBetter: true },
    { label: "Hires", value: fmt(hiresNow), delta: change(hiresNow, hiresPrev) },
  ]

  // Split the period's totals across jobs by how many lifetime views each job has.
  const weight = allViews || 1
  const jobRows: JobBreakdownRow[] = posted
    .map((job) => {
      const w = (job.views || 1) / weight
      const jobResponses = Math.round(r * w) || Math.min(1, responsesFor(job))
      return {
        job,
        views: Math.round(total(views) * w),
        responses: jobResponses,
        firstResponse: firstResponseHours(job),
        hires: Math.round(jobResponses * hireShare),
      }
    })
    .sort((a, b) => b.views - a.views)

  const charts: ChartSeries[] = [
    { key: "views", label: "Job views", data: views },
    { key: "responses", label: "Responses", data: responses },
  ]
  return { stats, charts, jobRows }
}
