import { subscribers, users, type UserRole } from "@/lib/mock-data"
import { fakePerson } from "@/lib/payments-data"

/** A Pro member row: the hand-written subscribers (real users) plus generated ones to show the table at scale. */
export interface Member {
  id: string
  /** Set when the member is a known user, so the row can open their page. */
  userId?: string
  name: string
  email: string
  roles: UserRole[]
  planId: string
  active: boolean
  startDate: string
  /** Empty when cancelled. */
  nextBillingDate: string
}

function seeded(seed: number) {
  let s = seed % 2147483647
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const ANCHOR = Date.UTC(2026, 6, 7)
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10)

function generateMembers(count: number): Member[] {
  const rand = seeded(918273)
  return Array.from({ length: count }, (_, i): Member => {
    const person = fakePerson(rand)
    const daysAgo = Math.floor(rand() * 420)
    const start = ANCHOR - daysAgo * 86400000
    const legacy = daysAgo > 300 && rand() < 0.5
    const active = !legacy && rand() > 0.14
    // Next billing: the next monthly anniversary of the start date after today.
    const startDate = new Date(start)
    const next = new Date(Date.UTC(2026, 6, startDate.getUTCDate()))
    if (next.getTime() <= ANCHOR) next.setUTCMonth(next.getUTCMonth() + 1)
    const r = rand()
    return {
      id: `MEM-${String(i + 1).padStart(3, "0")}`,
      name: person.name,
      email: person.email,
      roles: r < 0.8 ? ["Worker"] : r < 0.93 ? ["Employer"] : ["Worker", "Employer"],
      planId: legacy ? "PLAN-02" : "PLAN-01",
      active,
      startDate: iso(start),
      nextBillingDate: active ? iso(next.getTime()) : "",
    }
  })
}

export const members: Member[] = [
  ...subscribers.flatMap((s): Member[] => {
    const user = users.find((u) => u.id === s.userId)
    if (!user) return []
    const active = s.statusLabel === "Active"
    return [
      {
        id: s.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        planId: s.planId,
        active,
        startDate: s.startDate,
        nextBillingDate: active ? s.nextBillingDate : "",
      },
    ]
  }),
  ...generateMembers(300),
]
