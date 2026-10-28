import type { Status } from "@/components/ui/status-pill"
import { reports, REPORT_STATE_STATUS } from "@/lib/trust-data"

export type UserRole = "Worker" | "Employer"

export interface UserDocument {
  id: string
  label: string
  type: "id" | "selfie" | "business"
  uploadedDate: string
  cover: string
}

/** Finding-work side of an account (web app: workType, workAreas, services, skills, photos, resume, pro). */
export interface SeekerProfile {
  workType: "service" | "corporate"
  /** Business name for service workers, job title for corporate ones. */
  headline: string
  /** First one is the primary category. At most three. */
  workAreas: { category: string; subSkills: string[] }[]
  yearsExperience?: string
  resumeName?: string
  /** Paid Pro membership (skill-match job alerts, Pro badge). */
  pro?: { since: string; until: string }
  jobAlerts: number
}

/** Hiring side of an account (web app: hiring { type, interests, company }). */
export interface EmployerProfile {
  type: "individual" | "business"
  /** What they hire for. */
  interests: string[]
  about?: string
  company?: { name: string; cac: string; address: string; website?: string; email: string; emailVerified: boolean }
}

export interface UserAccount {
  id: string
  name: string
  email: string
  phone: string
  location: string
  roles: UserRole[]
  bio: string
  verification: Status
  verificationLabel: string
  account: Status
  accountLabel: string
  dateJoined: string
  activity: string
  removed?: boolean
  interests: string[]
  services?: string[]
  skills?: string[]
  documents: UserDocument[]
  jobsPosted?: {
    title: string
    posted: string
    status: string
    active?: boolean
    promoted?: boolean
    promotedRange?: string
    impressions?: number
    clicks?: number
  }[]
  accountUsage?: { totalJobsPosted: number; lastActive: string }
  verificationHistory: { label: string; date: string }[]
  reviewerNote?: { label: string; date: string }
  deactivationReason?: string
  /** Set when the person has set up the finding-work side. */
  seekerProfile?: SeekerProfile
  /** Set when the person has set up the hiring side. */
  employerProfile?: EmployerProfile
}

const ID_COVER = "from-sky-200 to-sky-100"
const SELFIE_COVER = "from-amber-200 to-amber-100"
const BIZ_COVER = "from-emerald-200 to-emerald-100"

export const users: UserAccount[] = [
  { id: "U-01", name: "Ngozi Adeyemi", email: "ngozi.adeyemi@mail.com", phone: "+234 802 555 1120", location: "Lagos, Nigeria", roles: ["Worker"], bio: "Experienced home cleaner and childcare provider available for full-day and half-day bookings across Lagos.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-06-30", activity: "0 jobs shown interest in", interests: ["Cleaning", "Childcare"], services: ["Home Deep Cleaning", "Laundry & Ironing", "Childcare (Full-day)"], skills: ["Attention to detail", "First Aid Certified", "Time management"], documents: [{ id: "DOC-U01-ID", label: "National ID (front)", type: "id", uploadedDate: "2026-06-30", cover: ID_COVER }, { id: "DOC-U01-SELFIE", label: "Selfie verification photo", type: "selfie", uploadedDate: "2026-06-30", cover: SELFIE_COVER }], seekerProfile: { workType: "service", headline: "Ngozi Home Care", workAreas: [{ category: "Cleaning", subSkills: ["Deep cleaning", "Laundry"] }, { category: "Childcare", subSkills: ["Full-day nanny"] }], yearsExperience: "6–9 years", resumeName: "Ngozi Adeyemi CV.pdf", pro: { since: "2026-06-15", until: "2026-12-15" }, jobAlerts: 3 }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-06-30" }, { label: "ID uploaded — National ID", date: "2026-06-30" }, { label: "Selfie uploaded", date: "2026-06-30" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-07-01" } },
  { id: "U-02", name: "Northgate Staffing", email: "hiring@northgatestaffing.example.com", phone: "+234 803 444 2210", location: "Abuja, Nigeria", roles: ["Employer"], bio: "Recruitment and staffing agency placing warehouse and logistics talent across Abuja.", verification: "success", verificationLabel: "Verified", account: "warning", accountLabel: "Disabled", dateJoined: "2026-05-11", activity: "1 job posted", interests: ["Staffing", "Recruitment"], documents: [{ id: "DOC-U02-CAC", label: "CAC Certificate", type: "business", uploadedDate: "2026-05-12", cover: BIZ_COVER }], jobsPosted: [{ title: "Warehouse Operations Lead", posted: "2026-05-15", status: "Open", active: true, promoted: true, promotedRange: "2026-06-01 – 2026-06-30", impressions: 8400, clicks: 210 }], accountUsage: { totalJobsPosted: 1, lastActive: "2026-06-02" }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-05-11" }, { label: "Business registration uploaded", date: "2026-05-12" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-05-13" }, deactivationReason: "Account disabled by admin pending a billing dispute review." },
  { id: "U-03", name: "Grace Effiong", email: "grace.effiong@mail.com", phone: "+234 807 222 9981", location: "Uyo, Nigeria", roles: ["Worker"], bio: "Event catering specialist serving Uyo and surrounding areas.", verification: "success", verificationLabel: "Verified", account: "destructive", accountLabel: "Removed", dateJoined: "2026-04-02", activity: "0 jobs shown interest in", removed: true, interests: ["Catering"], services: ["Event Catering", "Menu Planning", "On-site Cooking"], skills: ["Food Safety Certified", "Large-batch Cooking"], documents: [{ id: "DOC-U03-ID", label: "National ID (front)", type: "id", uploadedDate: "2026-04-02", cover: ID_COVER }], verificationHistory: [{ label: "Phone OTP verified", date: "2026-04-02" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-04-03" }, deactivationReason: "Account removed at the user's request." },
  { id: "U-04", name: "Femi Ojo", email: "femi.ojo@mail.com", phone: "+234 805 118 3345", location: "Ibadan, Nigeria", roles: ["Worker"], bio: "Licensed electrician handling household repairs and rewiring jobs in Ibadan.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-06-18", activity: "1 job shown interest in", interests: ["Electrical", "Repairs"], services: ["Electrical Wiring", "Appliance Repair", "Fault Diagnosis"], skills: ["Licensed Electrician", "Circuit Design"], documents: [{ id: "DOC-U04-ID", label: "Driver's Licence", type: "id", uploadedDate: "2026-06-19", cover: ID_COVER }], verificationHistory: [{ label: "Phone OTP verified", date: "2026-06-18" }, { label: "ID uploaded — Driver's Licence", date: "2026-06-19" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-06-20" } },
  { id: "U-05", name: "Zenith Traders", email: "jobs@zenithtraders.example.com", phone: "+234 809 671 4420", location: "Port Harcourt, Nigeria", roles: ["Employer"], bio: "Retail and trading company hiring seasonal shop staff across Port Harcourt.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-06-25", activity: "0 jobs posted", interests: ["Retail", "Trading"], documents: [{ id: "DOC-U05-CAC", label: "CAC Certificate", type: "business", uploadedDate: "2026-06-25", cover: BIZ_COVER }], jobsPosted: [{ title: "Seasonal Shop Assistant (3 needed)", posted: "2026-06-28", status: "Open", active: true }, { title: "Weekend Cashier", posted: "2026-06-05", status: "Filled", active: true }], accountUsage: { totalJobsPosted: 2, lastActive: "2026-06-28" }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-06-25" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-06-26" } },
  { id: "U-06", name: "Ifeanyi Chukwu", email: "ifeanyi.chukwu@mail.com", phone: "+234 806 992 1187", location: "Enugu, Nigeria", roles: ["Worker"], bio: "Professional driver and logistics coordinator based in Enugu.", verification: "success", verificationLabel: "Verified", account: "warning", accountLabel: "Disabled", dateJoined: "2026-05-30", activity: "0 jobs shown interest in", interests: ["Driving", "Logistics"], services: ["Chauffeur Services", "Package Delivery", "Route Planning"], skills: ["Valid Driver's Licence", "Defensive Driving"], documents: [{ id: "DOC-U06-ID", label: "National ID (front)", type: "id", uploadedDate: "2026-05-30", cover: ID_COVER }], verificationHistory: [{ label: "Phone OTP verified", date: "2026-05-30" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-05-31" }, deactivationReason: "Account disabled after multiple client complaints under review." },
  { id: "U-07", name: "Bassey Umoh", email: "bassey.umoh@mail.com", phone: "+234 812 330 7765", location: "Calabar, Nigeria", roles: ["Worker"], bio: "Skilled carpenter providing custom furniture and repair work in Calabar.", verification: "success", verificationLabel: "Verified", account: "destructive", accountLabel: "Removed", dateJoined: "2026-05-02", activity: "0 jobs shown interest in", removed: true, interests: ["Carpentry"], services: ["Custom Furniture", "Cabinet Installation", "Wood Repair"], skills: ["Precision Measuring", "Power Tool Safety"], documents: [{ id: "DOC-U07-ID", label: "National ID (front)", type: "id", uploadedDate: "2026-05-02", cover: ID_COVER }], verificationHistory: [{ label: "Phone OTP verified", date: "2026-05-02" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-05-03" }, deactivationReason: "Account removed for violating platform community guidelines." },
  { id: "U-08", name: "Uche Eze", email: "uche.eze@mail.com", phone: "+234 701 556 2290", location: "Onitsha, Nigeria", roles: ["Worker", "Employer"], bio: "Painter and renovation contractor serving Onitsha and nearby towns.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-06-29", activity: "0 jobs shown interest in", interests: ["Painting", "Renovation"], services: ["Interior Painting", "Wall Renovation", "Surface Prep"], skills: ["Color Matching", "Drywall Repair"], documents: [{ id: "DOC-U08-ID", label: "National ID (front)", type: "id", uploadedDate: "2026-06-29", cover: ID_COVER }], seekerProfile: { workType: "service", headline: "Uche Paints", workAreas: [{ category: "Painting", subSkills: ["Interior painting", "Wall renovation"] }], yearsExperience: "3–5 years", jobAlerts: 2 }, employerProfile: { type: "individual", interests: ["Painter's assistant", "Cleaner"], about: "I hire helpers for bigger painting jobs." }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-06-29" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-06-30" } },
  { id: "U-09", name: "Kwame Asante", email: "kwame.asante@mail.com", phone: "+233 24 555 8821", location: "Accra, Ghana", roles: ["Worker"], bio: "Security guard seeking shift-based opportunities in Accra.", verification: "warning", verificationLabel: "Pending", account: "success", accountLabel: "Active", dateJoined: "2026-08-19", activity: "0 jobs shown interest in", interests: ["Security"], services: ["Event Security", "Site Patrol", "Access Control"], skills: ["Conflict De-escalation", "CCTV Monitoring"], documents: [{ id: "DOC-U09-ID", label: "National ID (front)", type: "id", uploadedDate: "2026-08-20", cover: ID_COVER }, { id: "DOC-U09-SELFIE", label: "Selfie verification photo", type: "selfie", uploadedDate: "2026-08-20", cover: SELFIE_COVER }], verificationHistory: [{ label: "Phone OTP verified", date: "2026-08-19" }, { label: "ID uploaded — National ID", date: "2026-08-20" }, { label: "Selfie uploaded", date: "2026-08-20" }] },
  { id: "U-10", name: "Brightpath BPO", email: "talent@brightpathbpo.example.com", phone: "+20 2 3456 7890", location: "Cairo, Egypt", roles: ["Employer"], bio: "Business process outsourcing company hiring call center agents in Cairo.", verification: "destructive", verificationLabel: "Rejected", account: "destructive", accountLabel: "Removed", dateJoined: "2026-03-27", activity: "0 jobs posted", removed: true, interests: ["BPO", "Call Centre"], documents: [{ id: "DOC-U10-CAC", label: "CAC / Business Registration", type: "business", uploadedDate: "2026-03-28", cover: BIZ_COVER }], jobsPosted: [], accountUsage: { totalJobsPosted: 0, lastActive: "2026-03-28" }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-03-27" }, { label: "Business registration uploaded", date: "2026-03-28" }], deactivationReason: "Verification rejected: submitted business registration document could not be authenticated." },
  { id: "U-11", name: "TemiTech Logistics", email: "ops@temitechlogistics.example.com", phone: "+234 810 223 9987", location: "Kano, Nigeria", roles: ["Employer"], bio: "Last-mile delivery and logistics operator expanding into Northern Nigeria.", verification: "warning", verificationLabel: "Pending", account: "success", accountLabel: "Active", dateJoined: "2026-08-25", activity: "0 jobs posted", interests: ["Logistics", "Delivery"], documents: [{ id: "DOC-U11-CAC", label: "CAC Certificate", type: "business", uploadedDate: "2026-08-26", cover: BIZ_COVER }], jobsPosted: [], accountUsage: { totalJobsPosted: 0, lastActive: "2026-08-26" }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-08-25" }, { label: "Business registration uploaded", date: "2026-08-26" }] },
  { id: "U-12", name: "Tolu Bankole", email: "tolu.bankole@mail.com", phone: "+234 803 771 2244", location: "Lagos, Nigeria", roles: ["Worker", "Employer"], bio: "Independent contractor who takes on renovation gigs and also hires helpers for larger projects.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-05-20", activity: "2 jobs shown interest in", interests: ["Renovation", "Carpentry", "Hiring Assistants"], services: ["Renovation Contracting", "Custom Woodwork"], skills: ["Project Management", "Blueprint Reading"], documents: [{ id: "DOC-U12-ID", label: "National ID (front)", type: "id", uploadedDate: "2026-05-20", cover: ID_COVER }, { id: "DOC-U12-SELFIE", label: "Selfie verification photo", type: "selfie", uploadedDate: "2026-05-20", cover: SELFIE_COVER }], jobsPosted: [{ title: "Renovation Helper Needed (2 days)", posted: "2026-06-10", status: "Filled", active: true, promoted: false }], accountUsage: { totalJobsPosted: 1, lastActive: "2026-07-05" }, seekerProfile: { workType: "service", headline: "Bankole Renovations", workAreas: [{ category: "Renovation", subSkills: ["Tiling", "Painting", "Plastering"] }, { category: "Carpentry", subSkills: ["Custom woodwork", "Cabinet fitting"] }], yearsExperience: "6–9 years", resumeName: "Tolu Bankole CV.pdf", pro: { since: "2026-06-01", until: "2026-09-01" }, jobAlerts: 4 }, employerProfile: { type: "business", interests: ["Labourer", "Painter", "Tiler", "Electrician"], about: "Small renovation outfit in Lagos. We hire helpers and tradespeople for bigger jobs.", company: { name: "Bankole Renovations Ltd", cac: "RC-1784520", address: "12 Adeniran Ogunsanya St, Surulere, Lagos", website: "https://bankolerenovations.example.com", email: "hire@bankolerenovations.example.com", emailVerified: true } }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-05-20" }, { label: "ID uploaded — National ID", date: "2026-05-20" }, { label: "Selfie uploaded", date: "2026-05-20" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-05-21" } },
  { id: "U-13", name: "CleanPro Services", email: "hello@cleanproservices.example.com", phone: "+234 802 111 2233", location: "Lagos, Nigeria", roles: ["Employer"], bio: "Residential and commercial cleaning company serving Lagos households and offices.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-05-01", activity: "1 job posted", interests: ["Cleaning", "Facility Management"], documents: [{ id: "DOC-U13-CAC", label: "CAC Certificate", type: "business", uploadedDate: "2026-05-01", cover: BIZ_COVER }], jobsPosted: [{ title: "Deep House Cleaning (3-bedroom)", posted: "2026-06-20", status: "Open", active: true }], accountUsage: { totalJobsPosted: 1, lastActive: "2026-06-24" }, employerProfile: { type: "business", interests: ["Cleaner", "Laundry attendant"], company: { name: "CleanPro Services Ltd", cac: "RC-1502231", address: "4 Admiralty Way, Lekki Phase 1, Lagos", website: "https://cleanproservices.example.com", email: "hello@cleanproservices.example.com", emailVerified: true } }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-05-01" }, { label: "Business registration uploaded", date: "2026-05-01" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-05-02" } },
  { id: "U-14", name: "Ade Family Home", email: "adefamilyhome@mail.com", phone: "+234 803 222 3344", location: "Lagos, Nigeria", roles: ["Employer"], bio: "Private household posting occasional home repair and maintenance jobs.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-04-20", activity: "1 job posted", interests: ["Home Maintenance"], documents: [{ id: "DOC-U14-ID", label: "National ID (front)", type: "id", uploadedDate: "2026-04-20", cover: ID_COVER }], jobsPosted: [{ title: "Fix Leaking Kitchen Pipe", posted: "2026-05-02", status: "Filled", active: true }], accountUsage: { totalJobsPosted: 1, lastActive: "2026-05-04" }, employerProfile: { type: "individual", interests: ["Plumber", "Electrician", "Handyman"], about: "Family home in Ikeja. We post repair jobs now and then." }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-04-20" }, { label: "ID uploaded — National ID", date: "2026-04-20" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-04-21" } },
  { id: "U-15", name: "GreenBuild Ltd", email: "projects@greenbuildltd.example.com", phone: "+234 805 333 4455", location: "Port Harcourt, Nigeria", roles: ["Employer"], bio: "Construction and property development firm hiring licensed tradespeople for residential builds.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-06-15", activity: "1 job posted", interests: ["Construction", "Skilled Trades"], documents: [{ id: "DOC-U15-CAC", label: "CAC Certificate", type: "business", uploadedDate: "2026-06-15", cover: BIZ_COVER }], jobsPosted: [{ title: "Licensed Electrician for Full Rewiring", posted: "2026-07-01", status: "Open", active: true, promoted: true }], accountUsage: { totalJobsPosted: 1, lastActive: "2026-07-01" }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-06-15" }, { label: "Business registration uploaded", date: "2026-06-15" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-06-16" } },
  { id: "U-16", name: "Eko Events Co.", email: "bookings@ekoevents.example.com", phone: "+234 807 444 5566", location: "Lagos, Nigeria", roles: ["Employer"], bio: "Event planning and staffing agency organizing weddings and corporate events across Lagos.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-06-01", activity: "1 job posted", interests: ["Events", "Staffing"], documents: [{ id: "DOC-U16-CAC", label: "CAC Certificate", type: "business", uploadedDate: "2026-06-01", cover: BIZ_COVER }], jobsPosted: [{ title: "Wedding Usher Team (4 needed)", posted: "2026-06-28", status: "Open", active: true }], accountUsage: { totalJobsPosted: 1, lastActive: "2026-06-29" }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-06-01" }, { label: "Business registration uploaded", date: "2026-06-01" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-06-02" } },
  { id: "U-17", name: "Chika Wedding Planners", email: "chika@chikaweddingplanners.example.com", phone: "+234 809 555 6677", location: "Lagos, Nigeria", roles: ["Employer"], bio: "Boutique wedding planning studio coordinating vendors for full-service weddings.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-05-20", activity: "1 job posted", interests: ["Events", "Weddings"], documents: [{ id: "DOC-U17-CAC", label: "CAC Certificate", type: "business", uploadedDate: "2026-05-20", cover: BIZ_COVER }], jobsPosted: [{ title: "Professional Wedding DJ", posted: "2026-06-15", status: "Flagged", active: true }], accountUsage: { totalJobsPosted: 1, lastActive: "2026-06-16" }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-05-20" }, { label: "Business registration uploaded", date: "2026-05-20" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-05-21" } },
  { id: "U-18", name: "ShiftEasy Movers", email: "dispatch@shifteasymovers.example.com", phone: "+234 810 666 7788", location: "Abuja, Nigeria", roles: ["Employer"], bio: "Moving and relocation company handling residential and office moves in Abuja.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-04-01", activity: "1 job posted", interests: ["Logistics", "Moving"], documents: [{ id: "DOC-U18-CAC", label: "CAC Certificate", type: "business", uploadedDate: "2026-04-01", cover: BIZ_COVER }], jobsPosted: [{ title: "Office Relocation Movers", posted: "2026-04-18", status: "Removed", active: false }], accountUsage: { totalJobsPosted: 1, lastActive: "2026-04-19" }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-04-01" }, { label: "Business registration uploaded", date: "2026-04-01" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-04-02" } },
  { id: "U-19", name: "Adeola Residences", email: "info@adeolaresidences.example.com", phone: "+234 812 777 8899", location: "Ibadan, Nigeria", roles: ["Employer"], bio: "Private residential estate hiring contractors for landscaping and property upkeep.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-06-30", activity: "1 job posted", interests: ["Property Maintenance"], documents: [{ id: "DOC-U19-ID", label: "National ID (front)", type: "id", uploadedDate: "2026-06-30", cover: ID_COVER }], jobsPosted: [{ title: "Garden Landscaping for New Build", posted: "2026-07-05", status: "Pending Review", active: true }], accountUsage: { totalJobsPosted: 1, lastActive: "2026-07-05" }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-06-30" }, { label: "ID uploaded — National ID", date: "2026-06-30" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-07-01" } },
  { id: "U-20", name: "Naija Threads Apparel", email: "studio@naijathreads.example.com", phone: "+234 813 888 9900", location: "Lagos, Nigeria", roles: ["Employer"], bio: "E-commerce clothing brand hiring creative freelancers for product content.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-07-01", activity: "1 job posted", interests: ["Fashion", "E-commerce"], documents: [{ id: "DOC-U20-CAC", label: "CAC Certificate", type: "business", uploadedDate: "2026-07-01", cover: BIZ_COVER }], jobsPosted: [{ title: "Professional Photographer for Product Shoot", posted: "2026-07-06", status: "Pending Review", active: true }], accountUsage: { totalJobsPosted: 1, lastActive: "2026-07-06" }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-07-01" }, { label: "Business registration uploaded", date: "2026-07-01" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-07-02" } },
]

export type UserBucket = "pending" | "deactivated" | "active"

export function getUserBucket(user: UserAccount): UserBucket {
  if (user.verification === "warning") return "pending"
  if (user.account !== "success" || user.verification === "destructive") return "deactivated"
  return "active"
}

export interface JobImage {
  id: string
  label: string
  cover: string
}

export interface JobListing {
  id: string
  title: string
  poster: string
  posterId: string
  category: string
  type: "Everyday" | "Skilled"
  status: Status
  statusLabel: string
  datePosted: string
  removed?: boolean
  description: string
  recommended: { userId: string }[]
  images: JobImage[]
  promoted?: boolean
  views: number
  location: string
  serviceDate: string
  serviceTime: string
  experienceYears?: number
  budget: string
  /** Name of the job source this job was imported from (see lib/job-sources). Missing means posted on Jobs Region. */
  source?: string
  /** Link to the original listing on the source site. */
  sourceUrl?: string
  /** Posted by the Jobs Region team itself (no user account). */
  official?: boolean
  /** Photo URLs added when the job was posted; the first is the cover. */
  photos?: string[]
  /** Where the work happens: In person, Online, On-site, Remote, Hybrid. */
  mode?: string
  /** How people can reach the poster: In-app message, WhatsApp, Phone, Email, Apply link. */
  contactMethods?: string[]
  /** Professional jobs (and imported ones): where to apply, e.g. a careers page or ATS link. */
  applyUrl?: string
}

export const jobs: JobListing[] = [
  { id: "J-01", title: "Deep House Cleaning (3-bedroom)", poster: "CleanPro Services", posterId: "U-13", category: "Home Services › Cleaning", type: "Everyday", status: "success", statusLabel: "Open", datePosted: "2026-06-20", description: "Looking for a reliable cleaner to do a full deep clean of a 3-bedroom apartment ahead of a move-in inspection. Must bring own supplies.", recommended: [{ userId: "U-01" }, { userId: "U-07" }], images: [{ id: "IMG-J01-1", label: "Living room — before", cover: "from-stone-200 to-stone-100" }, { id: "IMG-J01-2", label: "Kitchen — before", cover: "from-stone-300 to-stone-200" }], views: 340, location: "Lagos, Nigeria", serviceDate: "2026-06-25", serviceTime: "9:00 AM – 1:00 PM", budget: "₦12,000 – ₦18,000" },
  { id: "J-02", title: "Fix Leaking Kitchen Pipe", poster: "Ade Family Home", posterId: "U-14", category: "Home Services › Plumbing", type: "Everyday", status: "neutral", statusLabel: "Filled", datePosted: "2026-05-02", description: "Kitchen sink pipe has been leaking for a week. Need someone to inspect and fix, ideally same week.", recommended: [{ userId: "U-08" }, { userId: "U-06" }], images: [], views: 210, location: "Lagos, Nigeria", serviceDate: "2026-05-05", serviceTime: "Flexible", budget: "₦8,000" },
  { id: "J-03", title: "Licensed Electrician for Full Rewiring", poster: "GreenBuild Ltd", posterId: "U-15", category: "Home Services › Electrical", type: "Skilled", status: "success", statusLabel: "Open", datePosted: "2026-07-01", description: "Full rewiring job for a 4-unit residential building. Must hold a valid electrical contractor licence.", recommended: [{ userId: "U-04" }, { userId: "U-12" }], images: [], promoted: true, views: 640, location: "Port Harcourt, Nigeria", serviceDate: "2026-07-10", serviceTime: "8:00 AM – 5:00 PM", experienceYears: 5, budget: "₦150,000 – ₦200,000" },
  { id: "J-04", title: "Wedding Usher Team (4 needed)", poster: "Eko Events Co.", posterId: "U-16", category: "Events › Usher", type: "Everyday", status: "success", statusLabel: "Open", datePosted: "2026-06-28", description: "Need a team of 4 ushers for a wedding reception on 2026-07-12. Uniform provided.", recommended: [{ userId: "U-01" }, { userId: "U-06" }], images: [], views: 512, location: "Lagos, Nigeria", serviceDate: "2026-07-12", serviceTime: "2:00 PM – 8:00 PM", budget: "₦10,000 per usher" },
  { id: "J-05", title: "Professional Wedding DJ", poster: "Chika Wedding Planners", posterId: "U-17", category: "Events › DJ", type: "Skilled", status: "destructive", statusLabel: "Flagged", datePosted: "2026-06-15", description: "Experienced wedding DJ needed for a 200-guest reception. Own equipment required.", recommended: [{ userId: "U-01" }, { userId: "U-08" }], images: [], views: 298, location: "Lagos, Nigeria", serviceDate: "2026-07-20", serviceTime: "6:00 PM – 11:00 PM", experienceYears: 3, budget: "₦80,000" },
  { id: "J-06", title: "Office Relocation Movers", poster: "ShiftEasy Movers", posterId: "U-18", category: "Delivery & Logistics › Moving Help", type: "Everyday", status: "destructive", statusLabel: "Removed", datePosted: "2026-04-18", removed: true, description: "Full office relocation, 3rd floor walk-up, no elevator. Heavy furniture involved.", recommended: [{ userId: "U-07" }, { userId: "U-12" }], images: [], views: 96, location: "Abuja, Nigeria", serviceDate: "2026-04-20", serviceTime: "8:00 AM – 3:00 PM", budget: "₦45,000" },
  { id: "J-07", title: "Garden Landscaping for New Build", poster: "Adeola Residences", posterId: "U-19", category: "Home Services › Landscaping", type: "Everyday", status: "warning", statusLabel: "Pending Review", datePosted: "2026-07-05", description: "Need landscaping done for a newly built 4-bedroom duplex, including lawn setup and flower beds.", recommended: [{ userId: "U-08" }, { userId: "U-01" }], images: [{ id: "IMG-J07-1", label: "Front yard reference", cover: "from-lime-200 to-lime-100" }], views: 40, location: "Ibadan, Nigeria", serviceDate: "2026-07-18", serviceTime: "7:00 AM – 12:00 PM", budget: "₦30,000" },
  { id: "J-08", title: "Professional Photographer for Product Shoot", poster: "Naija Threads Apparel", posterId: "U-20", category: "Events › Photography", type: "Skilled", status: "warning", statusLabel: "Pending Review", datePosted: "2026-07-06", description: "Looking for a photographer experienced in product photography for an e-commerce clothing shoot.", recommended: [], images: [], views: 25, location: "Lagos, Nigeria", serviceDate: "2026-07-14", serviceTime: "10:00 AM – 4:00 PM", experienceYears: 2, budget: "₦60,000" },
  { id: "J-09", title: "Office Cleaner (Monday to Friday)", poster: "Northgate Staffing", posterId: "U-02", category: "Home Services › Cleaning", type: "Everyday", status: "warning", statusLabel: "Pending Review", datePosted: "2026-07-07", description: "Daily cleaning of a 2-floor office in Wuse 2: floors, restrooms and the kitchen area. 7am to 11am on weekdays. Cleaning supplies provided.", recommended: [{ userId: "U-01" }], images: [], views: 12, location: "Abuja, Nigeria", serviceDate: "2026-07-14", serviceTime: "7:00 AM – 11:00 AM", budget: "₦70,000 – ₦90,000", source: "Jobberman", sourceUrl: "https://www.jobberman.com/listings/office-cleaner-abuja-4f2k9", applyUrl: "https://www.jobberman.com/listings/office-cleaner-abuja-4f2k9/apply", mode: "In person" },
  { id: "J-10", title: "Event Photographer for Corporate Dinner", poster: "Zenith Traders", posterId: "U-05", category: "Events › Photography", type: "Skilled", status: "warning", statusLabel: "Pending Review", datePosted: "2026-07-06", description: "Photographer needed to cover a 150-guest end-of-year dinner in GRA. Edited photos within 5 days. Bring your own lighting.", recommended: [], images: [], views: 8, location: "Port Harcourt, Nigeria", serviceDate: "2026-07-25", serviceTime: "6:00 PM – 10:00 PM", experienceYears: 2, budget: "₦120,000 – ₦180,000", source: "MyJobMag", sourceUrl: "https://www.myjobmag.com/job/event-photographer-port-harcourt-88213", applyUrl: "https://careers.zenithtraders.example.com/apply/event-photographer", mode: "On-site" },
]

export function getRecommendationCount(userId: string) {
  return jobs.reduce((count, j) => count + j.recommended.filter((r) => r.userId === userId).length, 0)
}

export interface JobSubcategory {
  id: string
  name: string
  /** One short line so the team knows what belongs here. */
  description?: string
  /** Jobs posted in this subcategory, all time. */
  jobCount?: number
  /** Hidden subcategories stay on old jobs but can't be picked for new ones. */
  hidden?: boolean
}

export interface JobCategory {
  id: string
  name: string
  /** One short line so the team knows what belongs here. */
  description: string
  /** A lucide icon key, see `screens/categories/icons.tsx`. */
  icon?: string
  /** Jobs posted in this category, all time. */
  jobCount?: number
  /** Hidden categories stay on old jobs but can't be picked for new ones. */
  hidden?: boolean
  updated?: string
  subcategories: JobSubcategory[]
}

type SubcategoryRow = [name: string, description: string, jobs: number, hidden?: boolean]

function jobCategory(id: string, name: string, icon: string, description: string, updated: string, subs: SubcategoryRow[], hidden = false): JobCategory {
  const subcategories = subs.map(([sub, desc, count, subHidden], i) => ({
    id: `${id.replace("CAT", "SUB")}-${i + 1}`,
    name: sub,
    description: desc,
    jobCount: count,
    hidden: subHidden,
  }))
  const jobCount = subcategories.reduce((n, s) => n + s.jobCount, 0)
  return { id, name, icon, description, updated, hidden, jobCount, subcategories }
}

export const jobCategories: JobCategory[] = [
  jobCategory("CAT-01", "Home Services", "house", "Repairs, cleaning and upkeep in and around the home.", "2026-07-02", [
    ["Cleaning", "One-off and regular cleaning of homes and flats.", 412],
    ["Plumbing", "Leaks, blocked drains, water heaters and new fittings.", 236],
    ["Electrical", "Wiring, sockets, fittings and fault finding by licensed electricians.", 198],
    ["Landscaping", "Lawns, flower beds, hedges and compound upkeep.", 74],
    ["Painting", "Interior and exterior painting and screeding.", 151],
    ["Fumigation", "Pest control for homes, shops and offices.", 63],
    ["AC & fridge repair", "Servicing and repair of air conditioners, fridges and freezers.", 142],
    ["Generator repair", "Servicing and fixing petrol and diesel generators.", 97],
  ]),
  jobCategory("CAT-02", "Events", "party-popper", "People and services for weddings, parties and corporate events.", "2026-06-28", [
    ["Usher", "Ushers and hostesses to welcome and seat guests.", 188],
    ["DJ", "DJs with their own sound for parties and receptions.", 121],
    ["Photography", "Event, wedding and product photographers.", 164],
    ["MC & hype man", "Comperes and hype men to run the programme.", 58],
    ["Decoration", "Venue decor, balloons, flowers and stage setup.", 92],
    ["Videography", "Event coverage, highlight reels and live streaming.", 71],
    ["Event planning", "Planners and coordinators who run the day end to end.", 44],
  ]),
  jobCategory("CAT-03", "Delivery & Logistics", "truck", "Moving goods: dispatch riders, movers, haulage and warehouse help.", "2026-06-20", [
    ["Moving Help", "Packing, loading and moving homes and offices.", 96],
    ["Dispatch rider", "Bike riders for parcels and same-day delivery.", 274],
    ["Haulage", "Trucks and drivers for heavy or long-distance loads.", 38],
    ["Warehouse help", "Loading, sorting and stock counts in warehouses.", 67],
  ]),
  jobCategory("CAT-04", "Beauty & Personal Care", "scissors", "Hair, nails, makeup and grooming, at a salon or at home.", "2026-07-05", [
    ["Hair stylist", "Braids, weaves, wigs, locs and natural hair care.", 356],
    ["Barber", "Haircuts, shaves and beard grooming.", 142],
    ["Makeup artist", "Bridal, event and photoshoot makeup.", 189],
    ["Nail tech", "Manicures, pedicures, acrylics and gel.", 117],
    ["Lashes & brows", "Lash extensions, brow shaping and microblading.", 54],
    ["Spa & massage", "Massage, facials and spa treatments.", 41],
  ]),
  jobCategory("CAT-05", "Tech & IT", "laptop", "Software, websites, devices and IT support for people and businesses.", "2026-06-30", [
    ["Web development", "Websites, online stores and web apps.", 132],
    ["Phone & laptop repair", "Screens, batteries, charging ports and software fixes.", 208],
    ["IT support", "Office networks, printers and computer setup.", 76],
    ["CCTV installation", "Cameras, DVRs and remote viewing setup.", 89],
    ["Data analysis", "Spreadsheets, dashboards and reports.", 29],
  ]),
  jobCategory("CAT-06", "Driving & Transport", "car", "Drivers for private cars, company fleets, buses and ride-hailing.", "2026-06-25", [
    ["Private driver", "Personal and family drivers, live-in or daily.", 221],
    ["Company driver", "Drivers for staff buses and company cars.", 134],
    ["Ride-hailing", "Drivers for Uber, Bolt and InDrive cars.", 167],
    ["Truck driver", "Licensed drivers for trucks and tankers.", 52],
    ["Bus driver", "Drivers for school and interstate buses.", 33],
  ]),
  jobCategory("CAT-07", "Education & Tutoring", "graduation-cap", "Home lessons, exam prep and teaching roles in schools.", "2026-06-18", [
    ["Home tutor", "After-school lessons at home for primary and secondary pupils.", 248],
    ["WAEC & JAMB prep", "Exam coaching for WAEC, NECO and JAMB.", 113],
    ["Language lessons", "French, Yoruba, Igbo, Hausa and English lessons.", 47],
    ["Music lessons", "Piano, guitar, drums and voice.", 36],
    ["School teacher", "Full-time teaching roles in schools.", 154],
    ["Coding classes", "Coding and robotics for children and adults.", 22],
  ]),
  jobCategory("CAT-08", "Healthcare", "stethoscope", "Nurses, carers and health workers for homes, clinics and hospitals.", "2026-06-10", [
    ["Nursing", "Registered nurses for clinics, hospitals and home visits.", 98],
    ["Elderly care", "Caregivers for older people at home.", 86],
    ["Pharmacy assistant", "Counter and dispensing help in pharmacies.", 64],
    ["Lab technician", "Medical lab scientists and technicians.", 27],
    ["Physiotherapy", "Physiotherapists for clinics and home sessions.", 19],
  ]),
  jobCategory("CAT-09", "Construction", "hard-hat", "Building work on site: masons, tilers, welders and labourers.", "2026-07-01", [
    ["Bricklaying & masonry", "Block work, plastering and foundations.", 176],
    ["Tiling", "Floor and wall tiling, interlocking stones.", 143],
    ["Welding & fabrication", "Gates, burglary proofs, railings and steel work.", 129],
    ["Carpentry", "Roofing timber, doors, wardrobes and furniture.", 118],
    ["POP ceilings", "POP and suspended ceilings and cornices.", 84],
    ["Roofing", "New roofs, repairs and gutters.", 61],
    ["Site labourer", "General help on building sites.", 203],
  ]),
  jobCategory("CAT-10", "Fashion & Tailoring", "shirt", "Making and altering clothes, from native wear to uniforms.", "2026-06-22", [
    ["Tailor", "Sewing and fitting for men and women.", 197],
    ["Fashion designer", "Custom designs, bridal and ready-to-wear.", 88],
    ["Aso-ebi & native wear", "Agbada, buba, kaftans and aso-ebi orders.", 104],
    ["Alterations", "Taking in, letting out and quick fixes.", 46],
    ["Shoe making & repair", "Cobblers and shoemakers.", 31],
  ]),
  jobCategory("CAT-11", "Agriculture", "sprout", "Farm work, animal care and agro-processing.", "2026-05-30", [
    ["Farm hand", "Planting, weeding and harvest help.", 92],
    ["Poultry", "Caring for layers and broilers.", 57],
    ["Fish farming", "Pond care and catfish farming.", 34],
    ["Agro-processing", "Garri, palm oil and grain processing.", 26],
    ["Farm manager", "Running day-to-day farm operations.", 12],
  ]),
  jobCategory("CAT-12", "Hospitality & Food", "utensils-crossed", "Hotels, restaurants and catering: cooks, waiters and front desk.", "2026-06-27", [
    ["Cook & chef", "Cooks and chefs for restaurants and kitchens.", 167],
    ["Catering", "Food for events, parties and offices.", 139],
    ["Waiter & bar staff", "Waiters, bartenders and mixologists.", 112],
    ["Hotel front desk", "Receptionists and guest service staff.", 58],
    ["Baking & small chops", "Cakes, pastries and small chops.", 94],
  ]),
  jobCategory("CAT-13", "Security", "shield", "Guards and security staff for homes, estates, shops and events.", "2026-06-12", [
    ["Security guard", "Gatemen and guards for homes and offices.", 211],
    ["Estate security", "Patrol and gate staff for estates.", 47],
    ["Event security", "Bouncers and crowd control for events.", 39],
    ["CCTV operator", "Watching cameras in control rooms.", 14],
  ]),
  jobCategory("CAT-14", "Domestic Staff", "baby", "Live-in or live-out help: nannies, housekeepers and home cooks.", "2026-07-04", [
    ["Nanny", "Childcare at home, live-in or daily.", 189],
    ["Housekeeper", "Cleaning, laundry and running the home.", 164],
    ["Home cook", "Daily cooking for families.", 71],
    ["Gardener", "Compound and garden upkeep.", 28],
  ]),
  jobCategory("CAT-15", "Creative & Media", "camera", "Content, design and media work for brands and people.", "2026-06-15", [
    ["Graphic design", "Logos, flyers, social posts and branding.", 146],
    ["Video editing", "Editing reels, YouTube videos and adverts.", 87],
    ["Social media management", "Running pages, posting and replying to comments.", 122],
    ["Content writing", "Blog posts, captions and copy.", 53],
    ["Voice-over", "Voice for adverts, jingles and videos.", 18],
  ]),
  jobCategory("CAT-16", "Finance & Admin", "calculator", "Office roles: bookkeeping, admin, HR and customer service.", "2026-06-05", [
    ["Bookkeeping & accounting", "Books, payroll and monthly accounts.", 94],
    ["Admin assistant", "Front office, filing and scheduling.", 128],
    ["HR & recruitment", "Hiring, onboarding and staff records.", 41],
    ["Customer service", "Call centre, chat and walk-in support.", 106],
    ["Data entry", "Typing, records and spreadsheets.", 63],
  ]),
  jobCategory("CAT-17", "Sales & Marketing", "megaphone", "Selling and promoting products in shops, markets and online.", "2026-06-24", [
    ["Sales rep", "Field and office sales roles.", 173],
    ["Shop attendant", "Running the counter in shops and boutiques.", 158],
    ["POS agent", "POS operators and mobile money agents.", 86],
    ["Digital marketing", "Ads, SEO and online campaigns.", 49],
  ]),
  jobCategory("CAT-18", "Auto & Mechanics", "wrench", "Fixing and caring for cars, bikes and tricycles.", "2026-06-08", [
    ["Mechanic", "Engine, brakes and general car repair.", 152],
    ["Auto electrician", "Car wiring, AC and electronics.", 54],
    ["Panel beater & sprayer", "Body work and paint.", 37],
    ["Vulcaniser", "Tyres, wheel balancing and alignment.", 44],
    ["Car wash", "Car wash and detailing staff.", 66],
  ]),
  jobCategory("CAT-19", "Cleaning & Laundry", "sparkles", "Commercial cleaning, laundry and dry-cleaning.", "2026-06-03", [
    ["Office cleaning", "Daily or weekly cleaning of offices and shops.", 141],
    ["Laundry & ironing", "Wash, dry and iron, picked up or at home.", 97],
    ["Post-construction cleaning", "Cleaning new or renovated buildings.", 45],
    ["Upholstery cleaning", "Sofas, rugs and mattresses.", 23],
  ]),
  jobCategory("CAT-20", "Manufacturing", "factory", "Production line, packing and machine work in factories.", "2026-05-21", [
    ["Machine operator", "Running production machines.", 58],
    ["Packer", "Packing and labelling goods.", 77],
    ["Quality control", "Checking goods before they ship.", 21],
    ["Factory supervisor", "Leading a shift on the factory floor.", 15],
  ]),
  jobCategory("CAT-21", "Solar & Energy", "zap", "Solar, inverters, power and gas services.", "2026-06-29", [
    ["Solar installation", "Panels, batteries and inverters for homes and shops.", 118],
    ["Inverter repair", "Fixing inverters and battery banks.", 49],
    ["Gas plant attendant", "Cooking gas refilling and sales.", 32],
    ["Oil & gas technician", "Field technicians for oil and gas sites.", 11, true],
  ]),
  jobCategory("CAT-22", "Real Estate & Property", "building", "Agents, caretakers and facility managers for property.", "2026-05-26", [
    ["Property agent", "Letting and selling houses, flats and land.", 84],
    ["Facility manager", "Running buildings, estates and offices.", 29],
    ["Caretaker", "Live-in caretakers for properties.", 36],
    ["Surveyor", "Land survey and building plans.", 12],
  ]),
  jobCategory("CAT-23", "Fitness & Wellness", "dumbbell", "Personal trainers, gym staff and wellness coaches.", "2026-05-18", [
    ["Personal trainer", "One-to-one training at home or the gym.", 47],
    ["Gym instructor", "Classes and floor staff in gyms.", 22],
    ["Dietitian", "Meal plans and nutrition advice.", 9],
  ]),
  jobCategory("CAT-24", "Legal & Consulting", "scale", "Lawyers, consultants and business registration help.", "2026-05-12", [
    ["Lawyer", "Tenancy, contracts and legal advice.", 26],
    ["CAC registration", "Business name and company registration.", 38],
    ["Business consultant", "Plans, pitch decks and strategy.", 14],
  ]),
  jobCategory("CAT-25", "Pet Care", "paw-print", "Pet sitting, dog walking, grooming and vet help.", "2026-04-30", [
    ["Pet sitter", "Looking after pets while owners are away.", 8],
    ["Dog walker", "Daily walks for dogs.", 5],
    ["Pet grooming", "Bathing, clipping and grooming.", 4],
  ], true),
]

/** Promotion plans as sold in the web app (Promote page). Prices, lengths and perks are set here and read by the app. */
export type PromotionPlanId = string

export type PromotionChannel = "WhatsApp" | "Telegram" | "Social media"

export interface PromotionPlanConfig {
  id: PromotionPlanId
  name: string
  days: number
  price: number
  reach: string
  perks: string[]
  popular?: boolean
  active: boolean
  /** What the plan can be bought for. */
  promotes: "Jobs" | "Profiles" | "Both"
  /** Jobs Region channels the promoted job or profile is also shared to. */
  channels?: PromotionChannel[]
}

export const promotionPlans: PromotionPlanConfig[] = [
  { id: "boost", name: "Boost", days: 3, price: 2_000, reach: "Up to 2× more views", perks: ["Shown above regular results", "Promoted badge"], active: true, promotes: "Both", channels: [] },
  { id: "spotlight", name: "Spotlight", days: 7, price: 4_500, reach: "Up to 5× more views", perks: ["Top of results in your state", "Promoted badge"], popular: true, active: true, promotes: "Both", channels: ["WhatsApp", "Telegram"] },
  { id: "pro", name: "Pro", days: 30, price: 15_000, reach: "Up to 10× more views", perks: ["Top of results across Nigeria", "Promoted badge", "Weekly performance email"], active: true, promotes: "Both", channels: ["WhatsApp", "Telegram", "Social media"] },
]

/** Promotions keep the plan id they were bought on; a plan removed later reads as "Removed plan". */
export function getPromotionPlan(id: PromotionPlanId): PromotionPlanConfig {
  return promotionPlans.find((p) => p.id === id) ?? { id, name: "Removed plan", days: 7, price: 0, reach: "", perks: [], active: false, promotes: "Both" }
}

export const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`

export interface Promotion {
  id: string
  type: "Profile" | "Job"
  runnerUserId: string
  jobId?: string
  plan: PromotionPlanId
  reference: string
  messages: number
  startDate: string
  viewsGenerated: number
  trafficGrowth: string
  /** Generated rows: who ran it, when they aren't in `users`. */
  runnerName?: string
  /** Generated rows: the promoted job's title, when it isn't in `jobs`. */
  title?: string
}

const PROMO_FIRST_NAMES = ["Adaeze", "Babatunde", "Chinedu", "Damilola", "Efosa", "Funmilayo", "Gbenga", "Halima", "Ikenna", "Jumoke", "Kelechi", "Lami", "Musa", "Nkechi", "Obinna", "Precious", "Rotimi", "Sade", "Tobi", "Uchenna", "Yetunde", "Zainab", "Emeka", "Bisi", "Olumide", "Amaka"]
const PROMO_LAST_NAMES = ["Okafor", "Adebayo", "Bello", "Eze", "Ogunleye", "Nwosu", "Ibrahim", "Okonkwo", "Balogun", "Udoh", "Lawal", "Okeke", "Danjuma", "Afolabi", "Edet", "Olawale", "Chukwu", "Yusuf", "Akande", "Obi"]
const PROMO_JOB_TITLES = ["Live-in nanny for twins", "Weekend barber for busy salon", "Solar panel installation (5kVA)", "Bridal makeup for Saturday wedding", "Dispatch rider with own bike", "Home tutor for JSS3 maths", "Tiler for 3-bedroom flat", "Security guard for estate gate", "Caterer for 150-guest party", "Driver for family in Lekki", "Tailor for aso-ebi orders", "Office cleaner (weekdays)", "Generator mechanic needed", "Social media manager for boutique", "POP ceiling for new duplex", "Shop attendant, Wuse market", "Graphic designer for church flyers", "Housekeeper, live-out", "AC servicing for 6 units", "Event DJ with sound", "Poultry farm hand", "Bookkeeper, part-time", "Welder for gate and railings", "Photographer for product shoot"]

/** Extra promotions so the list shows paging and sorting at scale. Dates count back from 2026-07-07 (ANCHOR_DATE). */
function generatePromotions(count: number): Promotion[] {
  const rand = seededRandom(20260707)
  const pick = <T>(list: T[]) => list[Math.floor(rand() * list.length)]
  const anchor = Date.UTC(2026, 6, 7)
  const refChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  return Array.from({ length: count }, (_, i): Promotion => {
    const plan = pick(["boost", "boost", "boost", "spotlight", "spotlight", "pro"])
    const isJob = rand() < 0.65
    const daysAgo = rand() < 0.3 ? Math.floor(rand() * 20) : 20 + Math.floor(rand() * 160)
    const scale = plan === "pro" ? 900 : plan === "spotlight" ? 380 : 150
    const views = Math.round(scale * (0.4 + rand() * 1.4))
    const n = String(i + 1).padStart(3, "0")
    return {
      id: `PR-G${n}`,
      type: isJob ? "Job" : "Profile",
      runnerUserId: `GU-${n}`,
      runnerName: `${pick(PROMO_FIRST_NAMES)} ${pick(PROMO_LAST_NAMES)}`,
      title: isJob ? pick(PROMO_JOB_TITLES) : undefined,
      plan,
      reference: `JR-${Array.from({ length: 6 }, () => refChars[Math.floor(rand() * refChars.length)]).join("")}`,
      startDate: new Date(anchor - daysAgo * 86400000).toISOString().slice(0, 10),
      viewsGenerated: views,
      messages: Math.round(views * (0.005 + rand() * 0.03)),
      trafficGrowth: `+${8 + Math.floor(rand() * 70)}%`,
    }
  })
}

export const promotions: Promotion[] = [
  { id: "PR-01", type: "Job", runnerUserId: "U-15", jobId: "J-03", plan: "spotlight", reference: "JR-8F3K2Q", startDate: "2026-07-03", viewsGenerated: 640, messages: 9, trafficGrowth: "+52%" },
  { id: "PR-02", type: "Job", runnerUserId: "U-13", jobId: "J-01", plan: "boost", reference: "JR-4TQ8LM", startDate: "2026-06-13", viewsGenerated: 210, messages: 3, trafficGrowth: "+18%" },
  { id: "PR-03", type: "Profile", runnerUserId: "U-01", plan: "pro", reference: "JR-2M9X7A", startDate: "2026-06-20", viewsGenerated: 480, messages: 12, trafficGrowth: "+65%" },
  { id: "PR-04", type: "Profile", runnerUserId: "U-12", plan: "spotlight", reference: "JR-7HD3VW", startDate: "2026-07-02", viewsGenerated: 96, messages: 2, trafficGrowth: "+22%" },
  { id: "PR-05", type: "Profile", runnerUserId: "U-08", plan: "boost", reference: "JR-9KC1ZP", startDate: "2026-06-01", viewsGenerated: 150, messages: 1, trafficGrowth: "+30%" },
  ...generatePromotions(150),
]

export function getPromotionEndDate(promotion: Promotion) {
  const start = new Date(`${promotion.startDate}T00:00:00`)
  const end = new Date(start)
  end.setDate(end.getDate() + getPromotionPlan(promotion.plan).days)
  return end.toISOString().slice(0, 10)
}

export function getPromotionTimeRemaining(promotion: Promotion, anchorISO: string = ANCHOR_DATE) {
  const end = new Date(`${getPromotionEndDate(promotion)}T00:00:00`)
  const anchor = new Date(`${anchorISO}T00:00:00`)
  const diffDays = Math.round((end.getTime() - anchor.getTime()) / 86400000)
  if (diffDays <= 0) return "Ended"
  if (diffDays === 1) return "1 day left"
  return `${diffDays} days left`
}

export function getPromotionStatus(promotion: Promotion): { status: Status; label: string } {
  return getPromotionTimeRemaining(promotion) === "Ended"
    ? { status: "neutral", label: "Ended" }
    : { status: "success", label: "Active" }
}

export function getPromotionViewTrend(promotion: Promotion): DailyMetric[] {
  const today = new Date(`${ANCHOR_DATE}T00:00:00`)
  const end = new Date(`${getPromotionEndDate(promotion)}T00:00:00`)
  const displayEnd = end < today ? end : today
  const start = new Date(`${promotion.startDate}T00:00:00`)
  const days = Math.max(1, Math.round((displayEnd.getTime() - start.getTime()) / 86400000) + 1)
  const dates = lastNDates(days, displayEnd.toISOString().slice(0, 10))
  const rand = seededRandom(seedFromString(promotion.id))
  const base = promotion.viewsGenerated / days
  return dates.map((date) => ({ date, count: Math.max(0, Math.round(base * (0.5 + rand()))) }))
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: string
  billingPeriod: "Monthly" | "Yearly"
  audience: "Worker" | "Employer" | "Both"
  benefits: string[]
  status: Status
  statusLabel: string
}

/** Jobs Region Pro is the one membership in the web app (job seekers). Price, length and perks come from here. */
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "PLAN-01",
    name: "Jobs Region Pro",
    price: "₦2,500",
    billingPeriod: "Monthly",
    audience: "Worker",
    benefits: [
      "Instant job alerts for jobs matching your skills",
      "Pro badge on your profile and every message",
      "Shown first to hirers in Find people",
      "See who viewed your profile",
    ],
    status: "success",
    statusLabel: "Active",
  },
  {
    id: "PLAN-02",
    name: "Worker Pro (Legacy)",
    price: "₦1,000",
    billingPeriod: "Monthly",
    audience: "Worker",
    benefits: ["Priority placement in search results"],
    status: "neutral",
    statusLabel: "Archived",
  },
]

export interface Subscriber {
  id: string
  userId: string
  planId: string
  status: Status
  statusLabel: string
  startDate: string
  nextBillingDate: string
}

export const subscribers: Subscriber[] = [
  { id: "SUB-01", userId: "U-01", planId: "PLAN-01", status: "success", statusLabel: "Active", startDate: "2026-06-01", nextBillingDate: "2026-08-01" },
  { id: "SUB-02", userId: "U-12", planId: "PLAN-01", status: "success", statusLabel: "Active", startDate: "2026-05-20", nextBillingDate: "2027-05-20" },
  { id: "SUB-03", userId: "U-13", planId: "PLAN-01", status: "success", statusLabel: "Active", startDate: "2026-05-01", nextBillingDate: "2026-08-01" },
  { id: "SUB-04", userId: "U-15", planId: "PLAN-01", status: "success", statusLabel: "Active", startDate: "2026-06-15", nextBillingDate: "2027-06-15" },
  { id: "SUB-05", userId: "U-08", planId: "PLAN-02", status: "destructive", statusLabel: "Cancelled", startDate: "2026-04-01", nextBillingDate: "—" },
]

export interface AdminAccount {
  id: string
  name: string
  email: string
  role: string
  roleVariant: Status | "outline"
  status: Status
  statusLabel: string
  dateAdded: string
  lastActive: string
  isSelf?: boolean
  removed?: boolean
}

export const PERMISSION_MODULES = [
  "Overview",
  "Users",
  "Jobs & Categories",
  "Promotions & Pro",
  "Trust & Safety",
  "Blog",
  "Support Center",
  "Admin Management",
] as const

const fullAccess = Object.fromEntries(PERMISSION_MODULES.map((m) => [m, "Full" as const]))

export interface AdminRole {
  name: string
  description: string
  variant: Status | "outline"
  permissions: Record<string, "None" | "View" | "Edit" | "Full">
}

export const adminRoles: AdminRole[] = [
  {
    name: "Super Admin",
    description: "Full access to every module.",
    variant: "destructive",
    permissions: fullAccess,
  },
  {
    name: "Moderator",
    description: "Moderates users, jobs, reports and reviews.",
    variant: "warning",
    permissions: { Overview: "View", Users: "Edit", "Jobs & Categories": "Edit", "Trust & Safety": "Full", "Promotions & Pro": "None", Blog: "None", "Support Center": "View", "Admin Management": "None" },
  },
  {
    name: "Content Manager",
    description: "Manages blog and support center content.",
    variant: "success",
    permissions: { Overview: "View", Users: "None", "Jobs & Categories": "None", "Trust & Safety": "None", "Promotions & Pro": "None", Blog: "Full", "Support Center": "Full", "Admin Management": "None" },
  },
  {
    name: "Finance/Ads Manager",
    description: "Manages promotion plans, Pro membership, and billing.",
    variant: "outline",
    permissions: { Overview: "View", Users: "None", "Jobs & Categories": "None", "Trust & Safety": "None", "Promotions & Pro": "Full", Blog: "None", "Support Center": "None", "Admin Management": "None" },
  },
  {
    name: "Support Lead",
    description: "Oversees the support center and user verification queue.",
    variant: "neutral",
    permissions: { Overview: "View", Users: "View", "Jobs & Categories": "None", "Trust & Safety": "View", "Promotions & Pro": "None", Blog: "None", "Support Center": "Full", "Admin Management": "None" },
  },
]

export const currentAdminId = "A-02"

export const admins: AdminAccount[] = [
  { id: "A-01", name: "Aisha Bello", email: "aisha.bello@jobregion.example.com", role: "Super Admin", roleVariant: "destructive", status: "success", statusLabel: "Active", dateAdded: "2025-09-01", lastActive: "2026-07-07" },
  { id: "A-02", name: "Desmond Ajimuda", email: "mudadesmond@gmail.com", role: "Moderator", roleVariant: "warning", status: "success", statusLabel: "Active", dateAdded: "2025-10-12", lastActive: "2026-07-07", isSelf: true },
  { id: "A-03", name: "Chiamaka Obi", email: "chiamaka.obi@jobregion.example.com", role: "Content Manager", roleVariant: "success", status: "success", statusLabel: "Active", dateAdded: "2025-11-20", lastActive: "2026-07-06" },
  { id: "A-04", name: "Tunde Bakare", email: "tunde.bakare@jobregion.example.com", role: "Finance/Ads Manager", roleVariant: "outline", status: "success", statusLabel: "Active", dateAdded: "2025-12-05", lastActive: "2026-07-05" },
  { id: "A-05", name: "Grace Nwankwo", email: "grace.nwankwo@jobregion.example.com", role: "Support Lead", roleVariant: "neutral", status: "success", statusLabel: "Active", dateAdded: "2026-01-15", lastActive: "2026-07-04" },
  { id: "A-06", name: "Emeka Diallo", email: "emeka.diallo@jobregion.example.com", role: "Moderator", roleVariant: "warning", status: "warning", statusLabel: "Suspended", dateAdded: "2026-02-02", lastActive: "2026-05-18" },
  { id: "A-07", name: "Halima Yusuf", email: "halima.yusuf@jobregion.example.com", role: "Content Manager", roleVariant: "success", status: "neutral", statusLabel: "Invited", dateAdded: "2026-07-05", lastActive: "Never" },
  { id: "A-08", name: "Segun Adewale", email: "segun.adewale@jobregion.example.com", role: "Finance/Ads Manager", roleVariant: "outline", status: "destructive", statusLabel: "Removed", dateAdded: "2025-08-10", lastActive: "2026-03-01", removed: true },
]

export interface AuditLogEntry {
  id: string
  adminId: string
  action: string
  timestamp: string
}

export const auditLog: AuditLogEntry[] = [
  { id: "LOG-01", adminId: "A-02", action: "Approved verification for Kwame Asante", timestamp: "2026-07-07 09:12" },
  { id: "LOG-02", adminId: "A-01", action: "Changed Emeka Diallo's role to Moderator", timestamp: "2026-07-06 17:05" },
  { id: "LOG-03", adminId: "A-01", action: "Suspended admin Emeka Diallo", timestamp: "2026-07-06 17:02" },
  { id: "LOG-04", adminId: "A-02", action: "Flagged job listing \"Professional Wedding DJ\"", timestamp: "2026-07-06 14:30" },
  { id: "LOG-05", adminId: "A-04", action: "Created subscription plan \"Employer Growth Annual\"", timestamp: "2026-07-05 11:40" },
  { id: "LOG-06", adminId: "A-03", action: "Published blog post \"Welcome to the New JobRegion App\"", timestamp: "2026-07-04 16:15" },
  { id: "LOG-07", adminId: "A-05", action: "Published support article \"What to do if your verification is rejected\"", timestamp: "2026-07-03 10:20" },
  { id: "LOG-08", adminId: "A-01", action: "Invited admin Halima Yusuf", timestamp: "2026-07-02 09:00" },
  { id: "LOG-09", adminId: "A-04", action: "Approved job \"Licensed Electrician for Full Rewiring\" for promotion", timestamp: "2026-07-01 13:55" },
  { id: "LOG-10", adminId: "A-02", action: "Disabled account for Ifeanyi Chukwu", timestamp: "2026-06-30 15:22" },
  { id: "LOG-11", adminId: "A-03", action: "Archived blog post \"2025 Year in Review\"", timestamp: "2026-06-29 12:08" },
  { id: "LOG-12", adminId: "A-05", action: "Deactivated support category \"Promotions & Subscriptions\"", timestamp: "2026-06-28 09:44" },
  { id: "LOG-13", adminId: "A-04", action: "Cancelled subscription for Uche Eze", timestamp: "2026-06-27 16:50" },
  { id: "LOG-14", adminId: "A-01", action: "Removed admin Segun Adewale", timestamp: "2026-03-01 08:30" },
]

export interface BlogPost {
  id: string
  title: string
  author: string
  status: Status
  statusLabel: string
  category: string
  tags: string[]
  date: string
  views: number
  cover: string
  coverImageUrl?: string
  body: string
}

export const BLOG_CATEGORIES = ["Guides", "Career Tips", "Platform Updates", "Announcements", "Product"]

export const blogPosts: BlogPost[] = [
  { id: "BP-01", title: "5 Things to Check Before You Hire a Provider", author: "Chiamaka Obi", status: "warning", statusLabel: "Draft", category: "Guides", tags: ["Hiring", "Guides"], date: "Not scheduled", views: 0, cover: "from-stone-300 to-stone-200", body: "Before you hire anyone through JobRegion, run through this checklist: verified badge, reviews from past clients, response time, clear pricing, and whether they carry their own tools. A little diligence up front saves a lot of back-and-forth later." },
  { id: "BP-02", title: "How JobRegion Matches You With the Right Talent", author: "Aisha Bello", status: "warning", statusLabel: "Scheduled", category: "Platform Updates", tags: ["Product", "Platform Updates"], date: "2026-07-15", views: 0, cover: "from-amber-300 to-amber-100", body: "Our matching engine looks at category, location radius, past completion rate, and responsiveness to surface the providers most likely to say yes and show up. Here's a behind-the-scenes look at how it works." },
  { id: "BP-03", title: "Pricing a Job Fairly: A Quick Guide", author: "Chiamaka Obi", status: "success", statusLabel: "Published", category: "Career Tips", tags: ["Career Tips", "Pricing"], date: "2026-06-20", views: 4820, cover: "from-emerald-300 to-emerald-100", body: "Underpricing a job gets you fewer serious applicants, not more. This guide walks through how to benchmark against similar listings in your region and category so you post a rate that actually gets filled." },
  { id: "BP-04", title: "The Complete Guide to Building a Standout Worker Profile", author: "Grace Nwankwo", status: "success", statusLabel: "Published", category: "Guides", tags: ["Career Tips", "Guides", "+1"], date: "2026-05-10", views: 15230, cover: "from-yellow-300 to-yellow-100", body: "Your profile is the first thing an employer sees. We cover photo guidelines, how to write a bio that gets read, which certifications to highlight, and why completing every section boosts your search ranking." },
  { id: "BP-05", title: "Welcome to the New JobRegion App", author: "Aisha Bello", status: "success", statusLabel: "Published", category: "Platform Updates", tags: ["Platform Updates"], date: "2026-07-01", views: 980, cover: "from-lime-300 to-lime-100", body: "We rebuilt the mobile app from the ground up: faster search, in-app messaging, and push notifications the moment someone applies to your job. Here's what's new and how to get started." },
  { id: "BP-06", title: "2025 Year in Review", author: "Aisha Bello", status: "neutral", statusLabel: "Archived", category: "Platform Updates", tags: ["Platform Updates"], date: "2025-12-30", views: 22100, cover: "from-neutral-400 to-neutral-300", body: "2025 in numbers: jobs posted, workers verified, and the regions that grew fastest. Thank you to everyone who trusted JobRegion this year." },
  { id: "BP-07", title: "A Note From the JobRegion Team", author: "Chiamaka Obi", status: "success", statusLabel: "Published", category: "Announcements", tags: ["Announcements"], date: "2026-04-15", views: 3100, cover: "", body: "A short note on where we're headed next, and a thank you to the community that's made JobRegion what it is." },
  { id: "BP-08", title: "Career Tips: Standing Out in a Competitive Market", author: "Grace Nwankwo", status: "success", statusLabel: "Published", category: "Career Tips", tags: ["Career Tips"], date: "2026-06-01", views: 6790, cover: "from-orange-300 to-orange-100", body: "With more workers joining every week, standing out matters more than ever. Respond fast, keep your calendar updated, and ask satisfied clients for a review — it's the single biggest lever on your ranking." },
]

export interface SupportArticle {
  id: string
  title: string
  status: Status
  statusLabel: string
  updated: string
  author: string
  body: string
}

export interface SupportCategory {
  id: string
  name: string
  active: boolean
  articles: SupportArticle[]
}

export const supportCategories: SupportCategory[] = [
  {
    id: "SC-01",
    name: "Getting Started",
    active: true,
    articles: [
      { id: "SA-01", title: "Creating your JobRegion account", status: "success", statusLabel: "Published", updated: "2026-06-02", author: "Chiamaka Obi", body: "Download the app or visit jobregion.com, tap Sign up, and enter your phone number. We'll text you a one-time code — enter it to confirm your number and you're in." },
      { id: "SA-02", title: "Finding your first job or provider", status: "success", statusLabel: "Published", updated: "2026-06-10", author: "Chiamaka Obi", body: "Use the search bar to filter by category and location. Tap any listing to see full details, then apply or message directly from the listing page." },
      { id: "SA-03", title: "Understanding your dashboard", status: "warning", statusLabel: "Draft", updated: "2026-07-01", author: "Chiamaka Obi", body: "Your dashboard shows active applications, saved listings, and messages in one place. We'll expand this article once the redesigned dashboard ships." },
      { id: "SA-04", title: "A Complete Walkthrough of Every JobRegion Feature", status: "success", statusLabel: "Published", updated: "2026-04-18", author: "Chiamaka Obi", body: "A full tour: search, messaging, verification, reviews, subscriptions, and the mobile app — everything in one long-form walkthrough." },
    ],
  },
  {
    id: "SC-02",
    name: "Verification",
    active: true,
    articles: [
      { id: "SA-05", title: "Why verification matters", status: "success", statusLabel: "Published", updated: "2026-05-20", author: "Grace Nwankwo", body: "Verified accounts get more responses and rank higher in search. Verification confirms your phone number and identity so the other side knows who they're dealing with." },
      { id: "SA-06", title: "What to do if your verification is rejected", status: "success", statusLabel: "Published", updated: "2026-06-28", author: "Grace Nwankwo", body: "If your verification was rejected, check the reason in your notifications, fix the flagged issue (usually a blurry ID photo), and resubmit — there's no limit on attempts." },
    ],
  },
  {
    id: "SC-03",
    name: "Promotions & Subscriptions",
    active: true,
    articles: [],
  },
]

export const ANCHOR_DATE = "2026-07-07"

export function timeAgo(dateISO: string, anchorISO: string = ANCHOR_DATE) {
  const date = new Date(`${dateISO}T00:00:00`)
  const anchor = new Date(`${anchorISO}T00:00:00`)
  const diffDays = Math.round((anchor.getTime() - date.getTime()) / 86400000)
  if (diffDays <= 0) return "Today"
  if (diffDays === 1) return "1 day ago"
  if (diffDays < 30) return `${diffDays} days ago`
  const months = Math.floor(diffDays / 30)
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`
  const years = Math.floor(months / 12)
  return `${years} year${years > 1 ? "s" : ""} ago`
}

function lastNDates(n: number, anchorISO: string) {
  const anchor = new Date(`${anchorISO}T00:00:00`)
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(anchor)
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().slice(0, 10)
  })
}

function seedFromString(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return hash || 1
}

function seededRandom(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const PRO_SUBSCRIBER_COUNTS_30D = [
  58, 59, 60, 60, 61, 62, 63, 63, 64, 65, 66, 67, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 82, 83, 85, 86,
]

export interface DailyMetric {
  date: string
  count: number
}

function generateSignupSeries(days: number, anchorISO: string): DailyMetric[] {
  const rand = seededRandom(7)
  let base = 2.2
  return lastNDates(days, anchorISO).map((date) => {
    base = Math.max(1, base + (rand() - 0.42) * 0.5)
    return { date, count: Math.max(1, Math.round(base + rand() * 2.5)) }
  })
}

export const dailySignups: DailyMetric[] = generateSignupSeries(120, ANCHOR_DATE)

export const proSubscriberTrend: DailyMetric[] = lastNDates(30, ANCHOR_DATE).map((date, i) => ({
  date,
  count: PRO_SUBSCRIBER_COUNTS_30D[i],
}))

export function getProfileViewTrend(userId: string, days = 30): DailyMetric[] {
  const rand = seededRandom(seedFromString(userId))
  let base = 3 + rand() * 5
  return lastNDates(days, ANCHOR_DATE).map((date) => {
    base = Math.max(1, base + (rand() - 0.45) * 2)
    return { date, count: Math.round(base) }
  })
}

export function getProfileViewSummary(userId: string) {
  const trend = getProfileViewTrend(userId, 30)
  const total = trend.reduce((sum, d) => sum + d.count, 0)
  const thisWeek = trend.slice(-7).reduce((sum, d) => sum + d.count, 0)
  return { total, thisWeek, lastViewed: trend[trend.length - 1].date, trend }
}

const COVER_GRADIENTS = [
  "from-violet-300 via-fuchsia-200 to-orange-200",
  "from-sky-300 via-cyan-200 to-emerald-200",
  "from-rose-300 via-orange-200 to-amber-200",
  "from-indigo-300 via-purple-200 to-pink-200",
  "from-emerald-300 via-teal-200 to-sky-200",
]

export function getCoverGradient(seed: string) {
  return COVER_GRADIENTS[seedFromString(seed) % COVER_GRADIENTS.length]
}

export const stats = {
  pendingVerifications: users.filter((u) => u.verification === "warning").length,
  flaggedJobs: jobs.filter((j) => j.statusLabel === "Flagged").length,
  newSignups7d: dailySignups.slice(-7).reduce((sum, d) => sum + d.count, 0),
  activePromotions: promotions.filter((p) => getPromotionStatus(p).status === "success").length,
  activeUsers: users.filter((u) => getUserBucket(u) === "active").length,
  activeProSubscribers: proSubscriberTrend[proSubscriberTrend.length - 1].count,
  publishedBlogPosts: blogPosts.filter((p) => p.statusLabel === "Published").length,
  supportArticlesNeedingReview: supportCategories.flatMap((c) => c.articles).filter((a) => a.statusLabel === "Draft").length + 3,
  activeAdmins: admins.filter((a) => a.status === "success").length,
}

export const pendingVerificationUsers: UserAccount[] = users
  .filter((u) => u.verification === "warning")
  .slice(0, 10)

export interface NeedsAttentionItem {
  id: string
  type: "Job" | "Support article" | "Report"
  title: string
  status: Status
  statusLabel: string
  date: string
  to: string
}

export const needsAttentionItems: NeedsAttentionItem[] = [
  ...reports
    .filter((r) => r.state === "Received" || r.state === "In review")
    .map((r): NeedsAttentionItem => ({
      id: r.id,
      type: "Report",
      title: `${r.targetLabel}: ${r.reason}`,
      status: REPORT_STATE_STATUS[r.state],
      statusLabel: r.state,
      date: r.date,
      to: "/reports",
    })),
  ...jobs
    .filter((j) => j.statusLabel === "Flagged" || j.statusLabel === "Pending Review")
    .map((j): NeedsAttentionItem => ({
      id: j.id,
      type: "Job",
      title: j.title,
      status: j.status,
      statusLabel: j.statusLabel,
      date: j.datePosted,
      to: `/jobs/${j.id}`,
    })),
  ...supportCategories
    .flatMap((c) => c.articles)
    .filter((a) => a.statusLabel === "Draft")
    .map((a): NeedsAttentionItem => ({
      id: a.id,
      type: "Support article",
      title: a.title,
      status: a.status,
      statusLabel: a.statusLabel,
      date: a.updated,
      to: `/support/articles/${a.id}`,
    })),
].slice(0, 10)
