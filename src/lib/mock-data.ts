import type { Status } from "@/components/ui/status-pill"

export type UserRole = "Worker" | "Employer"

export interface UserDocument {
  id: string
  label: string
  type: "id" | "selfie" | "business"
  uploadedDate: string
  cover: string
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
}

const ID_COVER = "from-sky-200 to-sky-100"
const SELFIE_COVER = "from-amber-200 to-amber-100"
const BIZ_COVER = "from-emerald-200 to-emerald-100"

export const users: UserAccount[] = [
  { id: "U-01", name: "Ngozi Adeyemi", email: "ngozi.adeyemi@mail.com", phone: "+234 802 555 1120", location: "Lagos, Nigeria", roles: ["Worker"], bio: "Experienced home cleaner and childcare provider available for full-day and half-day bookings across Lagos.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-06-30", activity: "0 jobs shown interest in", interests: ["Cleaning", "Childcare"], services: ["Home Deep Cleaning", "Laundry & Ironing", "Childcare (Full-day)"], skills: ["Attention to detail", "First Aid Certified", "Time management"], documents: [{ id: "DOC-U01-ID", label: "National ID (front)", type: "id", uploadedDate: "2026-06-30", cover: ID_COVER }, { id: "DOC-U01-SELFIE", label: "Selfie verification photo", type: "selfie", uploadedDate: "2026-06-30", cover: SELFIE_COVER }], verificationHistory: [{ label: "Phone OTP verified", date: "2026-06-30" }, { label: "ID uploaded — National ID", date: "2026-06-30" }, { label: "Selfie uploaded", date: "2026-06-30" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-07-01" } },
  { id: "U-02", name: "Northgate Staffing", email: "hiring@northgatestaffing.example.com", phone: "+234 803 444 2210", location: "Abuja, Nigeria", roles: ["Employer"], bio: "Recruitment and staffing agency placing warehouse and logistics talent across Abuja.", verification: "success", verificationLabel: "Verified", account: "warning", accountLabel: "Disabled", dateJoined: "2026-05-11", activity: "1 job posted", interests: ["Staffing", "Recruitment"], documents: [{ id: "DOC-U02-CAC", label: "CAC Certificate", type: "business", uploadedDate: "2026-05-12", cover: BIZ_COVER }], jobsPosted: [{ title: "Warehouse Operations Lead", posted: "2026-05-15", status: "Open", active: true, promoted: true, promotedRange: "2026-06-01 – 2026-06-30", impressions: 8400, clicks: 210 }], accountUsage: { totalJobsPosted: 1, lastActive: "2026-06-02" }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-05-11" }, { label: "Business registration uploaded", date: "2026-05-12" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-05-13" }, deactivationReason: "Account disabled by admin pending a billing dispute review." },
  { id: "U-03", name: "Grace Effiong", email: "grace.effiong@mail.com", phone: "+234 807 222 9981", location: "Uyo, Nigeria", roles: ["Worker"], bio: "Event catering specialist serving Uyo and surrounding areas.", verification: "success", verificationLabel: "Verified", account: "destructive", accountLabel: "Removed", dateJoined: "2026-04-02", activity: "0 jobs shown interest in", removed: true, interests: ["Catering"], services: ["Event Catering", "Menu Planning", "On-site Cooking"], skills: ["Food Safety Certified", "Large-batch Cooking"], documents: [{ id: "DOC-U03-ID", label: "National ID (front)", type: "id", uploadedDate: "2026-04-02", cover: ID_COVER }], verificationHistory: [{ label: "Phone OTP verified", date: "2026-04-02" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-04-03" }, deactivationReason: "Account removed at the user's request." },
  { id: "U-04", name: "Femi Ojo", email: "femi.ojo@mail.com", phone: "+234 805 118 3345", location: "Ibadan, Nigeria", roles: ["Worker"], bio: "Licensed electrician handling household repairs and rewiring jobs in Ibadan.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-06-18", activity: "1 job shown interest in", interests: ["Electrical", "Repairs"], services: ["Electrical Wiring", "Appliance Repair", "Fault Diagnosis"], skills: ["Licensed Electrician", "Circuit Design"], documents: [{ id: "DOC-U04-ID", label: "Driver's Licence", type: "id", uploadedDate: "2026-06-19", cover: ID_COVER }], verificationHistory: [{ label: "Phone OTP verified", date: "2026-06-18" }, { label: "ID uploaded — Driver's Licence", date: "2026-06-19" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-06-20" } },
  { id: "U-05", name: "Zenith Traders", email: "jobs@zenithtraders.example.com", phone: "+234 809 671 4420", location: "Port Harcourt, Nigeria", roles: ["Employer"], bio: "Retail and trading company hiring seasonal shop staff across Port Harcourt.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-06-25", activity: "0 jobs posted", interests: ["Retail", "Trading"], documents: [{ id: "DOC-U05-CAC", label: "CAC Certificate", type: "business", uploadedDate: "2026-06-25", cover: BIZ_COVER }], jobsPosted: [{ title: "Seasonal Shop Assistant (3 needed)", posted: "2026-06-28", status: "Open", active: true }, { title: "Weekend Cashier", posted: "2026-06-05", status: "Filled", active: true }], accountUsage: { totalJobsPosted: 2, lastActive: "2026-06-28" }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-06-25" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-06-26" } },
  { id: "U-06", name: "Ifeanyi Chukwu", email: "ifeanyi.chukwu@mail.com", phone: "+234 806 992 1187", location: "Enugu, Nigeria", roles: ["Worker"], bio: "Professional driver and logistics coordinator based in Enugu.", verification: "success", verificationLabel: "Verified", account: "warning", accountLabel: "Disabled", dateJoined: "2026-05-30", activity: "0 jobs shown interest in", interests: ["Driving", "Logistics"], services: ["Chauffeur Services", "Package Delivery", "Route Planning"], skills: ["Valid Driver's Licence", "Defensive Driving"], documents: [{ id: "DOC-U06-ID", label: "National ID (front)", type: "id", uploadedDate: "2026-05-30", cover: ID_COVER }], verificationHistory: [{ label: "Phone OTP verified", date: "2026-05-30" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-05-31" }, deactivationReason: "Account disabled after multiple client complaints under review." },
  { id: "U-07", name: "Bassey Umoh", email: "bassey.umoh@mail.com", phone: "+234 812 330 7765", location: "Calabar, Nigeria", roles: ["Worker"], bio: "Skilled carpenter providing custom furniture and repair work in Calabar.", verification: "success", verificationLabel: "Verified", account: "destructive", accountLabel: "Removed", dateJoined: "2026-05-02", activity: "0 jobs shown interest in", removed: true, interests: ["Carpentry"], services: ["Custom Furniture", "Cabinet Installation", "Wood Repair"], skills: ["Precision Measuring", "Power Tool Safety"], documents: [{ id: "DOC-U07-ID", label: "National ID (front)", type: "id", uploadedDate: "2026-05-02", cover: ID_COVER }], verificationHistory: [{ label: "Phone OTP verified", date: "2026-05-02" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-05-03" }, deactivationReason: "Account removed for violating platform community guidelines." },
  { id: "U-08", name: "Uche Eze", email: "uche.eze@mail.com", phone: "+234 701 556 2290", location: "Onitsha, Nigeria", roles: ["Worker"], bio: "Painter and renovation contractor serving Onitsha and nearby towns.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-06-29", activity: "0 jobs shown interest in", interests: ["Painting", "Renovation"], services: ["Interior Painting", "Wall Renovation", "Surface Prep"], skills: ["Color Matching", "Drywall Repair"], documents: [{ id: "DOC-U08-ID", label: "National ID (front)", type: "id", uploadedDate: "2026-06-29", cover: ID_COVER }], verificationHistory: [{ label: "Phone OTP verified", date: "2026-06-29" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-06-30" } },
  { id: "U-09", name: "Kwame Asante", email: "kwame.asante@mail.com", phone: "+233 24 555 8821", location: "Accra, Ghana", roles: ["Worker"], bio: "Security guard seeking shift-based opportunities in Accra.", verification: "warning", verificationLabel: "Pending", account: "success", accountLabel: "Active", dateJoined: "2026-08-19", activity: "0 jobs shown interest in", interests: ["Security"], services: ["Event Security", "Site Patrol", "Access Control"], skills: ["Conflict De-escalation", "CCTV Monitoring"], documents: [{ id: "DOC-U09-ID", label: "National ID (front)", type: "id", uploadedDate: "2026-08-20", cover: ID_COVER }, { id: "DOC-U09-SELFIE", label: "Selfie verification photo", type: "selfie", uploadedDate: "2026-08-20", cover: SELFIE_COVER }], verificationHistory: [{ label: "Phone OTP verified", date: "2026-08-19" }, { label: "ID uploaded — National ID", date: "2026-08-20" }, { label: "Selfie uploaded", date: "2026-08-20" }] },
  { id: "U-10", name: "Brightpath BPO", email: "talent@brightpathbpo.example.com", phone: "+20 2 3456 7890", location: "Cairo, Egypt", roles: ["Employer"], bio: "Business process outsourcing company hiring call center agents in Cairo.", verification: "destructive", verificationLabel: "Rejected", account: "destructive", accountLabel: "Removed", dateJoined: "2026-03-27", activity: "0 jobs posted", removed: true, interests: ["BPO", "Call Centre"], documents: [{ id: "DOC-U10-CAC", label: "CAC / Business Registration", type: "business", uploadedDate: "2026-03-28", cover: BIZ_COVER }], jobsPosted: [], accountUsage: { totalJobsPosted: 0, lastActive: "2026-03-28" }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-03-27" }, { label: "Business registration uploaded", date: "2026-03-28" }], deactivationReason: "Verification rejected: submitted business registration document could not be authenticated." },
  { id: "U-11", name: "TemiTech Logistics", email: "ops@temitechlogistics.example.com", phone: "+234 810 223 9987", location: "Kano, Nigeria", roles: ["Employer"], bio: "Last-mile delivery and logistics operator expanding into Northern Nigeria.", verification: "warning", verificationLabel: "Pending", account: "success", accountLabel: "Active", dateJoined: "2026-08-25", activity: "0 jobs posted", interests: ["Logistics", "Delivery"], documents: [{ id: "DOC-U11-CAC", label: "CAC Certificate", type: "business", uploadedDate: "2026-08-26", cover: BIZ_COVER }], jobsPosted: [], accountUsage: { totalJobsPosted: 0, lastActive: "2026-08-26" }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-08-25" }, { label: "Business registration uploaded", date: "2026-08-26" }] },
  { id: "U-12", name: "Tolu Bankole", email: "tolu.bankole@mail.com", phone: "+234 803 771 2244", location: "Lagos, Nigeria", roles: ["Worker", "Employer"], bio: "Independent contractor who takes on renovation gigs and also hires helpers for larger projects.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-05-20", activity: "2 jobs shown interest in", interests: ["Renovation", "Carpentry", "Hiring Assistants"], services: ["Renovation Contracting", "Custom Woodwork"], skills: ["Project Management", "Blueprint Reading"], documents: [{ id: "DOC-U12-ID", label: "National ID (front)", type: "id", uploadedDate: "2026-05-20", cover: ID_COVER }, { id: "DOC-U12-SELFIE", label: "Selfie verification photo", type: "selfie", uploadedDate: "2026-05-20", cover: SELFIE_COVER }], jobsPosted: [{ title: "Renovation Helper Needed (2 days)", posted: "2026-06-10", status: "Filled", active: true, promoted: false }], accountUsage: { totalJobsPosted: 1, lastActive: "2026-07-05" }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-05-20" }, { label: "ID uploaded — National ID", date: "2026-05-20" }, { label: "Selfie uploaded", date: "2026-05-20" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-05-21" } },
  { id: "U-13", name: "CleanPro Services", email: "hello@cleanproservices.example.com", phone: "+234 802 111 2233", location: "Lagos, Nigeria", roles: ["Employer"], bio: "Residential and commercial cleaning company serving Lagos households and offices.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-05-01", activity: "1 job posted", interests: ["Cleaning", "Facility Management"], documents: [{ id: "DOC-U13-CAC", label: "CAC Certificate", type: "business", uploadedDate: "2026-05-01", cover: BIZ_COVER }], jobsPosted: [{ title: "Deep House Cleaning (3-bedroom)", posted: "2026-06-20", status: "Open", active: true }], accountUsage: { totalJobsPosted: 1, lastActive: "2026-06-24" }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-05-01" }, { label: "Business registration uploaded", date: "2026-05-01" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-05-02" } },
  { id: "U-14", name: "Ade Family Home", email: "adefamilyhome@mail.com", phone: "+234 803 222 3344", location: "Lagos, Nigeria", roles: ["Employer"], bio: "Private household posting occasional home repair and maintenance jobs.", verification: "success", verificationLabel: "Verified", account: "success", accountLabel: "Active", dateJoined: "2026-04-20", activity: "1 job posted", interests: ["Home Maintenance"], documents: [{ id: "DOC-U14-ID", label: "National ID (front)", type: "id", uploadedDate: "2026-04-20", cover: ID_COVER }], jobsPosted: [{ title: "Fix Leaking Kitchen Pipe", posted: "2026-05-02", status: "Filled", active: true }], accountUsage: { totalJobsPosted: 1, lastActive: "2026-05-04" }, verificationHistory: [{ label: "Phone OTP verified", date: "2026-04-20" }, { label: "ID uploaded — National ID", date: "2026-04-20" }], reviewerNote: { label: "Reviewer approved this submission", date: "2026-04-21" } },
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
]

export function getRecommendationCount(userId: string) {
  return jobs.reduce((count, j) => count + j.recommended.filter((r) => r.userId === userId).length, 0)
}

export interface JobSubcategory {
  id: string
  name: string
}

export interface JobCategory {
  id: string
  name: string
  subcategories: JobSubcategory[]
}

export const jobCategories: JobCategory[] = [
  {
    id: "CAT-01",
    name: "Home Services",
    subcategories: [
      { id: "SUB-01", name: "Cleaning" },
      { id: "SUB-02", name: "Plumbing" },
      { id: "SUB-03", name: "Electrical" },
      { id: "SUB-04", name: "Landscaping" },
    ],
  },
  {
    id: "CAT-02",
    name: "Events",
    subcategories: [
      { id: "SUB-05", name: "Usher" },
      { id: "SUB-06", name: "DJ" },
      { id: "SUB-07", name: "Photography" },
    ],
  },
  {
    id: "CAT-03",
    name: "Delivery & Logistics",
    subcategories: [{ id: "SUB-08", name: "Moving Help" }],
  },
]

export type PromotionPlan = 7 | 14 | 30

export interface Promotion {
  id: string
  type: "Profile" | "Job"
  runnerUserId: string
  jobId?: string
  plan: PromotionPlan
  startDate: string
  viewsGenerated: number
  trafficGrowth: string
}

export const promotions: Promotion[] = [
  { id: "PR-01", type: "Job", runnerUserId: "U-15", jobId: "J-03", plan: 14, startDate: "2026-06-28", viewsGenerated: 640, trafficGrowth: "+52%" },
  { id: "PR-02", type: "Job", runnerUserId: "U-13", jobId: "J-01", plan: 7, startDate: "2026-06-13", viewsGenerated: 210, trafficGrowth: "+18%" },
  { id: "PR-03", type: "Profile", runnerUserId: "U-01", plan: 30, startDate: "2026-06-20", viewsGenerated: 480, trafficGrowth: "+65%" },
  { id: "PR-04", type: "Profile", runnerUserId: "U-12", plan: 7, startDate: "2026-07-02", viewsGenerated: 96, trafficGrowth: "+22%" },
  { id: "PR-05", type: "Profile", runnerUserId: "U-08", plan: 14, startDate: "2026-06-01", viewsGenerated: 150, trafficGrowth: "+30%" },
]

export function getPromotionEndDate(promotion: Promotion) {
  const start = new Date(`${promotion.startDate}T00:00:00`)
  const end = new Date(start)
  end.setDate(end.getDate() + promotion.plan)
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

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "PLAN-01",
    name: "Worker Pro",
    price: "₦2,500",
    billingPeriod: "Monthly",
    audience: "Worker",
    benefits: ["Priority placement in search results", "Unlimited profile promotions", "Verified badge boost"],
    status: "success",
    statusLabel: "Active",
  },
  {
    id: "PLAN-02",
    name: "Worker Pro Annual",
    price: "₦24,000",
    billingPeriod: "Yearly",
    audience: "Worker",
    benefits: ["All Worker Pro benefits", "2 months free vs. monthly billing", "Early access to new features"],
    status: "success",
    statusLabel: "Active",
  },
  {
    id: "PLAN-03",
    name: "Employer Growth",
    price: "₦8,000",
    billingPeriod: "Monthly",
    audience: "Employer",
    benefits: ["Post up to 10 jobs per month", "Priority job review", "20% discount on job promotions"],
    status: "success",
    statusLabel: "Active",
  },
  {
    id: "PLAN-04",
    name: "Employer Growth Annual",
    price: "₦80,000",
    billingPeriod: "Yearly",
    audience: "Employer",
    benefits: ["All Employer Growth benefits", "2 months free vs. monthly billing", "Dedicated account support"],
    status: "success",
    statusLabel: "Active",
  },
  {
    id: "PLAN-05",
    name: "Starter (Legacy)",
    price: "₦1,000",
    billingPeriod: "Monthly",
    audience: "Both",
    benefits: ["Basic profile boost"],
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
  { id: "SUB-02", userId: "U-12", planId: "PLAN-02", status: "success", statusLabel: "Active", startDate: "2026-05-20", nextBillingDate: "2027-05-20" },
  { id: "SUB-03", userId: "U-13", planId: "PLAN-03", status: "success", statusLabel: "Active", startDate: "2026-05-01", nextBillingDate: "2026-08-01" },
  { id: "SUB-04", userId: "U-15", planId: "PLAN-04", status: "success", statusLabel: "Active", startDate: "2026-06-15", nextBillingDate: "2027-06-15" },
  { id: "SUB-05", userId: "U-08", planId: "PLAN-05", status: "destructive", statusLabel: "Cancelled", startDate: "2026-04-01", nextBillingDate: "—" },
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
  "Promotions & Subscriptions",
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
    description: "Reviews and moderates user and job activity.",
    variant: "warning",
    permissions: { Overview: "View", Users: "Edit", "Jobs & Categories": "Edit", "Promotions & Subscriptions": "None", Blog: "None", "Support Center": "View", "Admin Management": "None" },
  },
  {
    name: "Content Manager",
    description: "Manages blog and support center content.",
    variant: "success",
    permissions: { Overview: "View", Users: "None", "Jobs & Categories": "None", "Promotions & Subscriptions": "None", Blog: "Full", "Support Center": "Full", "Admin Management": "None" },
  },
  {
    name: "Finance/Ads Manager",
    description: "Manages promotions, subscriptions, and billing.",
    variant: "outline",
    permissions: { Overview: "View", Users: "None", "Jobs & Categories": "None", "Promotions & Subscriptions": "Full", Blog: "None", "Support Center": "None", "Admin Management": "None" },
  },
  {
    name: "Support Lead",
    description: "Oversees the support center and user verification queue.",
    variant: "neutral",
    permissions: { Overview: "View", Users: "View", "Jobs & Categories": "None", "Promotions & Subscriptions": "None", Blog: "None", "Support Center": "Full", "Admin Management": "None" },
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
  type: "Job" | "Support article"
  title: string
  status: Status
  statusLabel: string
  date: string
  to: string
}

export const needsAttentionItems: NeedsAttentionItem[] = [
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
