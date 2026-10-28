import { ANCHOR_DATE, adminRoles, admins, type AdminAccount } from "@/lib/mock-data"

/**
 * Admin accounts for the admins screen: the hand-written admins from mock-data first, then generated teammates so
 * sorting, paging and bulk actions have something to work on.
 */

const FIRST = ["Ngozi", "Ifeoma", "Kunle", "Bisi", "Musa", "Zainab", "Obinna", "Funke", "Yemi", "Chidi", "Amaka", "Sani", "Tolu", "Kemi", "Uche", "Hauwa"]
const LAST = ["Okafor", "Adeyemi", "Ibrahim", "Eze", "Balogun", "Nnamdi", "Abubakar", "Ogunleye", "Okeke", "Lawal", "Danjuma", "Afolabi"]

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

function generateAdmins(count: number): AdminAccount[] {
  const rand = seeded(11)
  // Super Admin stays rare: generated teammates get one of the other roles.
  const roles = adminRoles.filter((r) => r.name !== "Super Admin")
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST[i % FIRST.length]
    const last = LAST[Math.floor(rand() * LAST.length)]
    const role = roles[Math.floor(rand() * roles.length)]
    const r = rand()
    const state = r < 0.78 ? "Active" : r < 0.88 ? "Invited" : r < 0.95 ? "Suspended" : "Removed"
    const added = addDays(ANCHOR_DATE, -Math.floor(rand() * 400) - 5)
    const lastActive = state === "Invited" ? "Never" : addDays(ANCHOR_DATE, -Math.floor(rand() * (state === "Active" ? 20 : 120)))
    return {
      id: `A-${String(i + 101).padStart(3, "0")}`,
      name: `${first} ${last}`,
      email: `${first}.${last}${i}@jobregion.example.com`.toLowerCase(),
      role: role.name,
      roleVariant: role.variant,
      status: state === "Active" ? "success" : state === "Invited" ? "neutral" : state === "Suspended" ? "warning" : "destructive",
      statusLabel: state,
      dateAdded: added,
      lastActive: lastActive < added && lastActive !== "Never" ? added : lastActive,
      removed: state === "Removed" || undefined,
    }
  })
}

export const allAdmins: AdminAccount[] = [...admins, ...generateAdmins(40)]
