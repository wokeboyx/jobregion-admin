/*
 * ~200 extra deterministic users so paging, sorting and bulk actions are visible at scale. Built with a seeded loop
 * (same rows on every load) and combined with the hand-written `users`, which come first. Generated rows are real
 * accounts in the admin: they open the normal user detail page (`findUser` looks in both lists).
 */
import { users, type EmployerProfile, type SeekerProfile, type UserAccount, type UserRole } from "@/lib/mock-data"
import type { Status } from "@/components/ui/status-pill"

const FIRST = [
  "Adaeze", "Babajide", "Chinedu", "Damilola", "Ebuka", "Funmilayo", "Gbenga", "Halima", "Ikenna", "Jumoke",
  "Kelechi", "Lami", "Musa", "Nkechi", "Obinna", "Precious", "Rasheed", "Sade", "Tobi", "Usman",
  "Victoria", "Wale", "Yetunde", "Zainab", "Amaka", "Bolaji", "Chioma", "Dayo", "Efe", "Folake",
]
const LAST = [
  "Okafor", "Adebayo", "Ibrahim", "Okonkwo", "Balogun", "Eze", "Abubakar", "Nwosu", "Ogunleye", "Danjuma",
  "Akpan", "Olawale", "Chukwuma", "Afolabi", "Bello", "Etim", "Lawal", "Obi", "Salami", "Yusuf",
]
const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu", "Kano", "Benin City", "Uyo", "Abeokuta", "Jos"]
const TRADES: { category: string; services: string[]; skills: string[] }[] = [
  { category: "Cleaning", services: ["Home deep cleaning", "Office cleaning"], skills: ["Attention to detail", "Time management"] },
  { category: "Plumbing", services: ["Leak repair", "Bathroom fittings"], skills: ["Pipe fitting", "Fault finding"] },
  { category: "Electrical", services: ["House wiring", "Inverter install"], skills: ["Wiring", "Solar setup"] },
  { category: "Hair & beauty", services: ["Braids", "Bridal makeup"], skills: ["Natural hair", "Makeup"] },
  { category: "Events", services: ["Ushering", "Event photography"], skills: ["Customer service", "Photography"] },
  { category: "Carpentry", services: ["Custom furniture", "Door fitting"], skills: ["Woodwork", "Measuring"] },
  { category: "Driving", services: ["Chauffeur", "Dispatch rider"], skills: ["Route planning", "Safe driving"] },
  { category: "Tech", services: ["Website build", "Phone repair"], skills: ["React", "Troubleshooting"] },
]
const HIRE_FOR = ["Cleaner", "Plumber", "Electrician", "Driver", "Usher", "Carpenter", "Nanny", "Painter"]
const BUSINESS_SUFFIX = ["Ventures", "Enterprises", "Ltd", "Services", "Global", "Hub"]

/** Small seeded generator (mulberry32). */
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

const pad = (n: number) => String(n).padStart(2, "0")
const isoDay = (t: number) => {
  const d = new Date(t)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

function build(count: number): UserAccount[] {
  const rand = seeded(4242)
  const pick = <T>(list: readonly T[]) => list[Math.floor(rand() * list.length)]
  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST)
    const last = pick(LAST)
    const name = `${first} ${last}`
    const city = pick(CITIES)
    const trade = pick(TRADES)
    const roll = rand()
    const roles: UserRole[] = roll < 0.55 ? ["Worker"] : roll < 0.8 ? ["Employer"] : ["Worker", "Employer"]
    const v = rand()
    const [verification, verificationLabel]: [Status, string] =
      v < 0.72 ? ["success", "Verified"] : v < 0.92 ? ["warning", "Pending"] : ["destructive", "Rejected"]
    const a = rand()
    const [account, accountLabel]: [Status, string] =
      verificationLabel === "Rejected" && a < 0.5
        ? ["destructive", "Removed"]
        : a < 0.9
          ? ["success", "Active"]
          : ["warning", "Disabled"]
    const joinedT = Date.UTC(2026, 6, 7) - Math.floor(rand() * 300) * 86_400_000
    const dateJoined = isoDay(joinedT)
    const id = `U-G${String(i + 1).padStart(3, "0")}`
    const isWorker = roles.includes("Worker")
    const isEmployer = roles.includes("Employer")
    const business = isEmployer && rand() < 0.4
    const company = `${last} ${pick(BUSINESS_SUFFIX)}`
    const email = `${first}.${last}${i}@mail.com`.toLowerCase()

    const seekerProfile: SeekerProfile | undefined = isWorker
      ? {
          workType: trade.category === "Tech" ? "corporate" : "service",
          headline: trade.category === "Tech" ? trade.services[0] : `${first}'s ${trade.category.toLowerCase()}`,
          workAreas: [{ category: trade.category, subSkills: trade.services }],
          yearsExperience: pick(["0–2 years", "3–5 years", "6–9 years", "10+ years"]),
          resumeName: rand() < 0.5 ? `${name} CV.pdf` : undefined,
          pro: rand() < 0.15 ? { since: dateJoined, until: "2026-12-31" } : undefined,
          jobAlerts: Math.floor(rand() * 5),
        }
      : undefined
    const employerProfile: EmployerProfile | undefined = isEmployer
      ? {
          type: business ? "business" : "individual",
          interests: [pick(HIRE_FOR), pick(HIRE_FOR)].filter((x, j, arr) => arr.indexOf(x) === j),
          company: business
            ? {
                name: company,
                cac: `RC-${1_200_000 + Math.floor(rand() * 600_000)}`,
                address: `${1 + Math.floor(rand() * 80)} ${pick(LAST)} Street, ${city}`,
                email: `hire@${last.toLowerCase()}${i}.example.com`,
                emailVerified: rand() < 0.8,
              }
            : undefined,
        }
      : undefined

    const docs: UserAccount["documents"] = [
      { id: `DOC-${id}-ID`, label: "National ID (front)", type: "id", uploadedDate: dateJoined, cover: "from-sky-200 to-sky-100" },
      { id: `DOC-${id}-SELFIE`, label: "Selfie verification photo", type: "selfie", uploadedDate: dateJoined, cover: "from-amber-200 to-amber-100" },
      ...(business
        ? [{ id: `DOC-${id}-CAC`, label: "CAC certificate", type: "business" as const, uploadedDate: dateJoined, cover: "from-emerald-200 to-emerald-100" }]
        : []),
    ]

    const activity = isEmployer && !isWorker ? `${Math.floor(rand() * 6)} jobs posted` : `${Math.floor(rand() * 9)} jobs shown interest in`

    return {
      id,
      name,
      email,
      phone: `+234 80${Math.floor(rand() * 10)} ${100 + Math.floor(rand() * 900)} ${1000 + Math.floor(rand() * 9000)}`,
      location: `${city}, Nigeria`,
      roles,
      bio: isWorker
        ? `${trade.category} professional in ${city}, available for short and long jobs.`
        : `Hires ${employerProfile?.interests.join(" and ").toLowerCase()} in ${city}.`,
      verification,
      verificationLabel,
      account,
      accountLabel,
      dateJoined,
      activity,
      removed: accountLabel === "Removed" || undefined,
      interests: isWorker ? [trade.category] : (employerProfile?.interests ?? []),
      services: isWorker ? trade.services : undefined,
      skills: isWorker ? trade.skills : undefined,
      documents: docs,
      verificationHistory: [
        { label: "Phone OTP verified", date: dateJoined },
        { label: "ID uploaded — National ID", date: dateJoined },
        { label: "Selfie uploaded", date: dateJoined },
      ],
      reviewerNote: verificationLabel === "Verified" ? { label: "Reviewer approved this submission", date: dateJoined } : undefined,
      deactivationReason: accountLabel === "Disabled" ? "Disabled after repeated no-shows reported by posters." : undefined,
      seekerProfile,
      employerProfile,
    }
  })
}

export const generatedUsers: UserAccount[] = build(200)

/** Hand-written users first, then the generated ones. */
export const allUsers = () => [...users, ...generatedUsers]

export const findUser = (id?: string) => users.find((u) => u.id === id) ?? generatedUsers.find((u) => u.id === id)
