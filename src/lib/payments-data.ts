import { getPromotionPlan, jobs, promotions, users, type PromotionPlanId } from "@/lib/mock-data"

/**
 * Every payment people made in the web app. Posting and messaging are free and people pay each other directly, so the
 * only money Jobs Region takes is for promotions (Boost, Spotlight, Pro) and the Jobs Region Pro membership.
 * Promotion payments line up with `promotions` and Pro payments with `subscribers` in mock-data.
 */
export type PaymentKind = "Promotion" | "Pro"
export type PaymentMethod = "Card" | "Bank transfer" | "USSD"
export type PaymentStatus = "Paid" | "Refunded" | "Failed" | "Pending"

export interface Payment {
  id: string
  reference: string
  userId: string
  kind: PaymentKind
  /** Promotions only. */
  plan?: PromotionPlanId
  promotionId?: string
  /** Promotions only: the job that was promoted. Leave out for a profile promotion. */
  jobId?: string
  jobTitle?: string
  /** Pro only: the month the membership covers, e.g. "2026-07". */
  period?: string
  /** Pro only: the legacy plan was ₦1,000. */
  planName?: string
  amount: number
  method: PaymentMethod
  cardLast4?: string
  provider: "Paystack"
  status: PaymentStatus
  date: string
  time: string
  failureReason?: string
  refundReason?: string
  refundedDate?: string
  /** Generated rows: the payer, when they aren't in `users`. */
  payerName?: string
  payerEmail?: string
}

const PRO_PRICE = 2_500

const FIRST_NAMES = ["Adaeze", "Babatunde", "Chinedu", "Damilola", "Efosa", "Funmilayo", "Gbenga", "Halima", "Ikenna", "Jumoke", "Kelechi", "Lami", "Musa", "Nkechi", "Obinna", "Precious", "Rotimi", "Sade", "Tobi", "Uchenna", "Yetunde", "Zainab", "Emeka", "Bisi", "Olumide", "Amaka", "Segun", "Hauwa", "Chioma", "Ifeoma"]
const LAST_NAMES = ["Okafor", "Adebayo", "Bello", "Eze", "Ogunleye", "Nwosu", "Ibrahim", "Okonkwo", "Balogun", "Udoh", "Lawal", "Okeke", "Danjuma", "Afolabi", "Edet", "Olawale", "Chukwu", "Yusuf", "Akande", "Obi"]
const EMAIL_HOSTS = ["gmail.com", "yahoo.com", "outlook.com"]

function seeded(seed: number) {
  let s = seed % 2147483647
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** A made-up Nigerian name and email for generated rows. */
export function fakePerson(rand: () => number) {
  const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]
  const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]
  const email = `${first}.${last}${Math.floor(rand() * 90) + 10}@${EMAIL_HOSTS[Math.floor(rand() * EMAIL_HOSTS.length)]}`.toLowerCase()
  return { name: `${first} ${last}`, email }
}

/**
 * About 400 payments over the 12 months to 2026-07-07 so the table pages and sorts at scale: one for every generated
 * promotion in mock-data, plus Pro memberships spread across the year (more in recent months, as Pro grew).
 */
function generatePayments(): Payment[] {
  const rand = seeded(424242)
  const anchor = Date.UTC(2026, 6, 7)
  const refChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const ref = (prefix: string) => `${prefix}${Array.from({ length: 5 }, () => refChars[Math.floor(rand() * refChars.length)]).join("")}`
  const methods: PaymentMethod[] = ["Card", "Card", "Card", "Bank transfer", "USSD"]
  const time = () => `${String(7 + Math.floor(rand() * 15)).padStart(2, "0")}:${String(Math.floor(rand() * 60)).padStart(2, "0")}`
  const outcome = (date: string, daysAgo: number): Partial<Payment> => {
    const r = rand()
    if (daysAgo < 3 && r < 0.15) return { status: "Pending" }
    if (r < 0.04) return { status: "Failed", failureReason: rand() < 0.5 ? "Card declined by the bank" : "Not enough money in the account" }
    if (r < 0.08) return { status: "Refunded", refundReason: rand() < 0.5 ? "Asked for a refund within 24 hours" : "Charged twice for the same thing", refundedDate: date }
    return {}
  }

  const fromPromotions = promotions
    .filter((p) => p.id.startsWith("PR-G"))
    .map((p, i): Payment => {
      const method = methods[Math.floor(rand() * methods.length)]
      const daysAgo = Math.round((anchor - Date.UTC(+p.startDate.slice(0, 4), +p.startDate.slice(5, 7) - 1, +p.startDate.slice(8, 10))) / 86400000)
      return {
        id: `PAY-G${String(i + 1).padStart(3, "0")}`,
        reference: p.reference,
        userId: p.runnerUserId,
        payerName: p.runnerName,
        payerEmail: `${(p.runnerName ?? "member").toLowerCase().replace(" ", ".")}@gmail.com`,
        kind: "Promotion",
        plan: p.plan,
        promotionId: p.id,
        jobTitle: p.title,
        amount: getPromotionPlan(p.plan).price,
        method,
        cardLast4: method === "Card" ? String(1000 + Math.floor(rand() * 9000)) : undefined,
        provider: "Paystack",
        status: "Paid",
        date: p.startDate,
        time: time(),
        ...outcome(p.startDate, daysAgo),
      }
    })

  const pro = Array.from({ length: 230 }, (_, i): Payment => {
    // Square root skews dates towards recent months.
    const daysAgo = 364 - Math.floor(Math.sqrt(rand()) * 364)
    const date = new Date(anchor - daysAgo * 86400000).toISOString().slice(0, 10)
    const person = fakePerson(rand)
    const method = methods[Math.floor(rand() * methods.length)]
    return {
      id: `PAY-P${String(i + 1).padStart(3, "0")}`,
      reference: ref("JR-P"),
      userId: `GP-${String(i + 1).padStart(3, "0")}`,
      payerName: person.name,
      payerEmail: person.email,
      kind: "Pro",
      period: date.slice(0, 7),
      planName: "Jobs Region Pro",
      amount: PRO_PRICE,
      method,
      cardLast4: method === "Card" ? String(1000 + Math.floor(rand() * 9000)) : undefined,
      provider: "Paystack",
      status: "Paid",
      date,
      time: time(),
      ...outcome(date, daysAgo),
    }
  })

  return [...fromPromotions, ...pro]
}

function fromPromotion(
  promotionId: string,
  extra: Pick<Payment, "id" | "method" | "time"> & Partial<Payment>,
): Payment {
  const p = promotions.find((x) => x.id === promotionId)!
  return {
    reference: p.reference,
    userId: p.runnerUserId,
    kind: "Promotion",
    plan: p.plan,
    promotionId: p.id,
    jobId: p.jobId,
    amount: getPromotionPlan(p.plan).price,
    provider: "Paystack",
    status: "Paid",
    date: p.startDate,
    ...extra,
  }
}

function pro(id: string, reference: string, userId: string, date: string, method: PaymentMethod, extra: Partial<Payment> = {}): Payment {
  return {
    id,
    reference,
    userId,
    kind: "Pro",
    period: date.slice(0, 7),
    planName: "Jobs Region Pro",
    amount: PRO_PRICE,
    method,
    provider: "Paystack",
    status: "Paid",
    date,
    time: "06:00",
    ...extra,
  }
}

export const payments: Payment[] = [
  fromPromotion("PR-01", { id: "PAY-01", method: "Card", cardLast4: "4081", time: "10:42" }),
  fromPromotion("PR-04", { id: "PAY-02", method: "Bank transfer", time: "16:05" }),
  fromPromotion("PR-03", { id: "PAY-03", method: "Card", cardLast4: "1129", time: "08:17" }),
  fromPromotion("PR-02", { id: "PAY-04", method: "USSD", time: "12:30" }),
  fromPromotion("PR-05", { id: "PAY-05", method: "Card", cardLast4: "7765", time: "19:58" }),
  pro("PAY-06", "JR-P7N4XC", "U-01", "2026-07-01", "Card", { cardLast4: "1129" }),
  pro("PAY-07", "JR-P3B8RT", "U-01", "2026-06-01", "Card", { cardLast4: "1129" }),
  pro("PAY-08", "JR-P6W2KD", "U-13", "2026-07-01", "Bank transfer"),
  pro("PAY-09", "JR-P9H5LM", "U-13", "2026-06-01", "Bank transfer"),
  pro("PAY-10", "JR-P2Q7VA", "U-13", "2026-05-01", "Card", { cardLast4: "3302" }),
  pro("PAY-11", "JR-P4D1ZS", "U-12", "2026-06-20", "USSD"),
  pro("PAY-12", "JR-P8F6NE", "U-12", "2026-05-20", "USSD"),
  pro("PAY-13", "JR-P5K3TY", "U-15", "2026-06-15", "Card", { cardLast4: "4081" }),
  pro("PAY-14", "JR-P1M9GU", "U-08", "2026-04-01", "Card", {
    cardLast4: "7765",
    planName: "Worker Pro (Legacy)",
    amount: 1_000,
    status: "Refunded",
    refundReason: "Cancelled on the day it renewed",
    refundedDate: "2026-04-01",
  }),
  {
    id: "PAY-15",
    reference: "JR-6RX2JB",
    userId: "U-05",
    kind: "Promotion",
    plan: "boost",
    jobTitle: "Weekend Cashier",
    amount: 2_000,
    method: "Card",
    cardLast4: "5512",
    provider: "Paystack",
    status: "Refunded",
    date: "2026-06-06",
    time: "09:12",
    refundReason: "The job was filled the same day",
    refundedDate: "2026-06-07",
  },
  {
    id: "PAY-16",
    reference: "JR-3VL8QW",
    userId: "U-04",
    kind: "Promotion",
    plan: "boost",
    amount: 2_000,
    method: "Card",
    cardLast4: "0094",
    provider: "Paystack",
    status: "Failed",
    date: "2026-07-05",
    time: "21:44",
    failureReason: "Card declined by the bank",
  },
  {
    id: "PAY-17",
    reference: "JR-5ZT4HN",
    userId: "U-16",
    kind: "Promotion",
    plan: "spotlight",
    jobId: "J-04",
    amount: 4_500,
    method: "Bank transfer",
    provider: "Paystack",
    status: "Pending",
    date: "2026-07-06",
    time: "18:20",
  },
  {
    id: "PAY-18",
    reference: "JR-2TW6PY",
    userId: "U-02",
    kind: "Promotion",
    plan: "pro",
    jobTitle: "Warehouse Operations Lead",
    amount: 15_000,
    method: "Card",
    cardLast4: "6620",
    provider: "Paystack",
    status: "Paid",
    date: "2026-06-01",
    time: "11:03",
  },
  {
    id: "PAY-19",
    reference: "JR-9QM3LE",
    userId: "U-17",
    kind: "Promotion",
    plan: "boost",
    amount: 2_000,
    method: "Card",
    cardLast4: "2048",
    provider: "Paystack",
    status: "Paid",
    date: "2026-04-22",
    time: "14:36",
  },
  {
    id: "PAY-20",
    reference: "JR-8KD2MW",
    userId: "U-16",
    kind: "Promotion",
    plan: "pro",
    amount: 15_000,
    method: "Bank transfer",
    provider: "Paystack",
    status: "Paid",
    date: "2026-03-10",
    time: "10:00",
  },
  {
    id: "PAY-21",
    reference: "JR-4HB7SC",
    userId: "U-11",
    kind: "Promotion",
    plan: "spotlight",
    amount: 4_500,
    method: "USSD",
    provider: "Paystack",
    status: "Paid",
    date: "2026-02-18",
    time: "13:25",
  },
  ...generatePayments(),
]

/** Who paid: a known user (`known`, so the name can link to their page), or the payer stored on a generated row. */
export function paymentUser(p: Payment): { id: string; name: string; email: string; known: boolean } | undefined {
  const user = users.find((u) => u.id === p.userId)
  if (user) return { id: user.id, name: user.name, email: user.email, known: true }
  if (p.payerName) return { id: p.userId, name: p.payerName, email: p.payerEmail ?? "", known: false }
  return undefined
}

export function paymentJobTitle(p: Payment) {
  if (p.jobTitle) return p.jobTitle
  if (p.jobId) return jobs.find((j) => j.id === p.jobId)?.title
  return undefined
}

export function monthName(period: string, opts: Intl.DateTimeFormatOptions = { month: "long" }) {
  return new Date(`${period}-01T00:00:00`).toLocaleDateString("en-GB", opts)
}

/** What was bought, in the words the receipt uses: `Spotlight promotion for "Wedding Usher Team"`, `Pro membership – July`. */
export function paymentTitle(p: Payment) {
  if (p.kind === "Pro") return `${p.planName === "Jobs Region Pro" ? "Pro" : (p.planName ?? "Pro")} membership – ${monthName(p.period ?? p.date.slice(0, 7))}`
  const plan = getPromotionPlan(p.plan ?? "boost")
  const job = paymentJobTitle(p)
  return job ? `${plan.name} promotion for “${job}”` : `${plan.name} promotion for profile`
}

export function paidWith(p: Payment) {
  if (p.method === "Card") return `Card •••• ${p.cardLast4 ?? "0000"}`
  if (p.method === "USSD") return "USSD (*737#)"
  return "Bank transfer"
}
