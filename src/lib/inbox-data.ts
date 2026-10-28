/**
 * Messages people send to Jobs Region (mock). Three ways in: the website contact form (jobsregion.com/contact),
 * "Contact us" in the app's Help & support, and replies to our support emails.
 */

/** The topics on the website contact form (website `content/contact.ts`). The app's Help & support uses the same list. */
export const INBOX_TOPICS = [
  "Hiring",
  "Finding work",
  "Account and verification",
  "Safety",
  "Promotions and Pro",
  "Press and partnerships",
] as const

export type InboxTopic = (typeof INBOX_TOPICS)[number]
export type InboxChannel = "Website form" | "In-app" | "Email"
export type InboxStatus = "New" | "Open" | "Waiting on them" | "Closed"

export interface InboxMessage {
  id: string
  /** "them" is the person who wrote in; "us" is an admin replying. */
  from: "them" | "us"
  /** Admin who sent it, for our messages. */
  adminId?: string
  body: string
  /** "2026-10-22 09:14" */
  at: string
  /** Jobs or profiles an admin attached to the reply. */
  links?: { kind: "job" | "user"; id: string; label: string }[]
}

export interface InboxConversation {
  id: string
  /** Set when the person has a Jobs Region account. */
  userId?: string
  /** Guests (website form) only have a name and email. */
  guest?: { name: string; email: string }
  topic: InboxTopic
  channel: InboxChannel
  status: InboxStatus
  assignedAdminId?: string
  linkedJobId?: string
  /** Short labels the team adds, e.g. "refund", "bug". */
  tags?: string[]
  messages: InboxMessage[]
}

export const INBOX_TAGS = ["bug", "refund", "urgent", "feedback", "verification", "scam", "billing", "how-to"] as const

export const SAVED_REPLIES: { label: string; body: string }[] = [
  {
    label: "Thanks, we’re looking into it",
    body: "Thanks for getting in touch. We’re looking into this now and will get back to you within one working day.",
  },
  {
    label: "How to verify your ID",
    body: "To verify your ID, open the app and go to Profile › Verify your identity. Upload a clear photo of your NIN slip, driver’s licence or international passport, then take a selfie. Most checks are done within 24 hours.",
  },
  {
    label: "Promotions refund policy",
    body: "Promotions can be refunded in full if they haven’t started yet. Once a promotion is live we can’t refund it, but if something went wrong on our side we’ll add the missing days back for free.",
  },
  {
    label: "Report a safety problem",
    body: "Thank you for telling us. Please don’t send any money or share your bank details. We’ve flagged this account for our safety team, who review reports every day within 24 hours.",
  },
]

const handWritten: InboxConversation[] = [
  {
    id: "C-1042",
    userId: "U-01",
    topic: "Account and verification",
    channel: "In-app",
    status: "New",
    tags: ["verification"],
    messages: [
      { id: "m1", from: "them", body: "Hi, I uploaded my NIN slip two days ago and it still says “In review”. I can’t message job posters until it’s done. Please help.", at: "2026-10-22 09:14" },
    ],
  },
  {
    id: "C-1041",
    guest: { name: "Amaka Nwosu", email: "amaka.nwosu@gmail.com" },
    topic: "Hiring",
    channel: "Website form",
    status: "New",
    messages: [
      { id: "m1", from: "them", body: "Hello, I want to hire 3 cleaners for an office in Lekki every Saturday. Do I post one job or three? And is posting free?", at: "2026-10-22 08:02" },
    ],
  },
  {
    id: "C-1040",
    userId: "U-14",
    topic: "Safety",
    channel: "In-app",
    status: "New",
    assignedAdminId: "A-05",
    linkedJobId: "J-02",
    tags: ["scam", "urgent"],
    messages: [
      { id: "m1", from: "them", body: "Someone who responded to my plumbing job is asking me to pay ₦5,000 “transport fee” before he comes. Is this allowed?", at: "2026-10-21 21:40" },
      { id: "m2", from: "them", body: "He has sent the request 3 times now.", at: "2026-10-21 21:43" },
    ],
  },
  {
    id: "C-1039",
    userId: "U-12",
    topic: "Promotions and Pro",
    channel: "Email",
    status: "Open",
    assignedAdminId: "A-04",
    tags: ["billing"],
    messages: [
      { id: "m1", from: "them", body: "I paid for Spotlight on Monday but my job doesn’t show the Promoted badge. Reference JR-PRM-88213.", at: "2026-10-20 14:22" },
      { id: "m2", from: "us", adminId: "A-04", body: "Thanks Tolu, I can see the payment. The promotion was waiting for the job to be approved. I’ve started it now.", at: "2026-10-20 16:05" },
      { id: "m3", from: "them", body: "Thank you. Will I still get the full 7 days?", at: "2026-10-21 10:11" },
    ],
  },
  {
    id: "C-1038",
    userId: "U-04",
    topic: "Finding work",
    channel: "In-app",
    status: "Waiting on them",
    assignedAdminId: "A-02",
    messages: [
      { id: "m1", from: "them", body: "How do I get job alerts for electrical jobs in Ibadan only?", at: "2026-10-19 11:30" },
      { id: "m2", from: "us", adminId: "A-02", body: "Hi Femi, go to Profile › Job alerts, choose Electrical and set your area to Ibadan. You can also turn on push notifications so you see them first.", at: "2026-10-19 12:02" },
    ],
  },
  {
    id: "C-1037",
    guest: { name: "Kunle Adebayo", email: "kunle@techcabal.example.com" },
    topic: "Press and partnerships",
    channel: "Website form",
    status: "Open",
    assignedAdminId: "A-01",
    messages: [
      { id: "m1", from: "them", body: "Hi team, I’m writing a piece on informal work platforms in Nigeria and would love a short interview with your founder this week.", at: "2026-10-18 09:45" },
      { id: "m2", from: "us", adminId: "A-01", body: "Hi Kunle, thanks for reaching out. Could you share your questions and preferred times?", at: "2026-10-18 13:20" },
      { id: "m3", from: "them", body: "Sure. Thursday or Friday afternoon works. Questions attached in the next email.", at: "2026-10-19 08:10" },
    ],
  },
  {
    id: "C-1036",
    userId: "U-13",
    topic: "Hiring",
    channel: "Email",
    status: "Open",
    linkedJobId: "J-01",
    messages: [
      { id: "m1", from: "us", adminId: "A-05", body: "Hi CleanPro, your job “Deep House Cleaning (3-bedroom)” is now live. Reply to this email if you need anything.", at: "2026-10-17 10:00" },
      { id: "m2", from: "them", body: "Thanks. Can we edit the budget after people have already responded?", at: "2026-10-18 15:32" },
    ],
  },
  {
    id: "C-1035",
    userId: "U-06",
    topic: "Account and verification",
    channel: "In-app",
    status: "Waiting on them",
    assignedAdminId: "A-06",
    messages: [
      { id: "m1", from: "them", body: "My selfie check failed. I don’t know why.", at: "2026-10-16 18:12" },
      { id: "m2", from: "us", adminId: "A-06", body: "Hi Ifeanyi, the photo was too dark to match your ID. Please try again in good light, without a cap or glasses.", at: "2026-10-17 09:30" },
    ],
  },
  {
    id: "C-1034",
    guest: { name: "Halima Sani", email: "halima.sani@yahoo.com" },
    topic: "Finding work",
    channel: "Website form",
    status: "Closed",
    assignedAdminId: "A-03",
    messages: [
      { id: "m1", from: "them", body: "Is Jobs Region available in Kaduna? I do tailoring and want to find customers.", at: "2026-10-12 12:40" },
      { id: "m2", from: "us", adminId: "A-03", body: "Hi Halima, yes! Jobs Region works across Nigeria. Download the app, create a profile and add Tailoring as a service.", at: "2026-10-12 14:05" },
      { id: "m3", from: "them", body: "Done, thank you so much.", at: "2026-10-12 16:30" },
    ],
  },
  {
    id: "C-1033",
    userId: "U-16",
    topic: "Promotions and Pro",
    channel: "Email",
    status: "Closed",
    assignedAdminId: "A-04",
    linkedJobId: "J-04",
    messages: [
      { id: "m1", from: "them", body: "Please send a receipt for our Boost on the usher job. Our accountant needs it.", at: "2026-10-10 10:15" },
      { id: "m2", from: "us", adminId: "A-04", body: "Hi Eko Events, the receipt is attached. You can also download receipts any time from Promote › History.", at: "2026-10-10 11:02" },
    ],
  },
]

/* ---------- Generated conversations, so views, sorting and paging show real volume ---------- */

function seeded(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const FIRST = ["Tobi", "Chioma", "Musa", "Funke", "Emeka", "Aisha", "Kelechi", "Bisi", "Yemi", "Nkem", "Dayo", "Ibrahim", "Zainab", "Uche", "Bola", "Sade", "Obinna", "Hauwa", "Segun", "Ada", "Ifeoma", "Tunde", "Rukayat", "Chidi"]
const LAST = ["Alabi", "Okafor", "Ibrahim", "Adeleke", "Obi", "Garba", "Nnamdi", "Ojo", "Adeyinka", "Eze", "Peters", "Bello", "Usman", "Okeke", "Lawal", "Balogun", "Nwachukwu", "Danjuma", "Afolabi", "Ogunleye"]
const MAIL = ["gmail.com", "yahoo.com", "outlook.com", "mail.com"]

/** An opening line, an optional follow-up from them, and how we usually answer, per topic. */
const SCRIPTS: Record<InboxTopic, { open: string; more?: string; reply: string; tags: string[] }[]> = {
  Hiring: [
    { open: "How many people can respond to one job? I posted a cleaning job yesterday and already have 40 replies.", reply: "There’s no limit. You can close the job from My jobs › Close once you’ve found someone.", tags: ["how-to"] },
    { open: "Can I post a job for a company and not my own name?", reply: "Yes. Switch to a business profile in Settings › Account type and add your CAC number.", tags: ["how-to"] },
    { open: "A worker I hired didn’t show up and isn’t answering calls.", more: "I already paid for materials.", reply: "Sorry about this. Please leave a review and report the profile so our safety team can look at it.", tags: ["urgent"] },
    { open: "Is there a way to hire the same electrician again without posting a new job?", reply: "Yes, open their profile and tap Message. You can also save them to Favourites.", tags: ["how-to", "feedback"] },
  ],
  "Finding work": [
    { open: "I’m not getting any job alerts even though alerts are turned on.", more: "I’m in Port Harcourt and do plumbing.", reply: "Thanks, we found your area was set to Lagos. I’ve changed it to Port Harcourt for you.", tags: ["bug"] },
    { open: "How do I add photos of my past work to my profile?", reply: "Go to Profile › Portfolio › Add photos. You can add up to 12.", tags: ["how-to"] },
    { open: "Why can’t I message people who posted jobs?", reply: "Messaging opens once your ID is verified. It usually takes under a day.", tags: ["verification"] },
    { open: "A poster asked me to pay a registration fee before the interview.", more: "Is that normal on Jobs Region?", reply: "No. Never pay to apply. We’ve removed the job and suspended the account.", tags: ["scam", "urgent"] },
  ],
  "Account and verification": [
    { open: "My ID was rejected but the photo was clear.", reply: "The name on the ID didn’t match your profile. Please update your name and upload again.", tags: ["verification"] },
    { open: "I changed my phone number and can’t log in.", more: "The OTP goes to my old line.", reply: "I’ve sent a login link to your email. You can change the number from Settings once you’re in.", tags: ["urgent"] },
    { open: "Please delete my account and all my data.", reply: "We’ve started the deletion. Your account will be removed within 30 days.", tags: [] },
    { open: "How long does verification take? It’s been three days.", reply: "Sorry for the wait. I’ve moved your check to the front of the queue.", tags: ["verification"] },
  ],
  Safety: [
    { open: "Someone sent me a link to ‘confirm payment’ that looks fake.", more: "They said it’s from Jobs Region.", reply: "That isn’t us. We never ask for card details by link. We’ve blocked the account.", tags: ["scam", "urgent"] },
    { open: "A customer was rude and threatening after the job.", reply: "We’re sorry. We’ve warned the account and you can block them from the chat menu.", tags: ["urgent"] },
    { open: "The person who booked me gave a different address on the day.", reply: "Please only meet at the address in the job. Report the account if anything feels off.", tags: [] },
  ],
  "Promotions and Pro": [
    { open: "I was charged twice for Boost.", more: "Both on 14 October.", reply: "You’re right, the second charge was a mistake. The refund is on its way and takes 3–5 working days.", tags: ["refund", "billing"] },
    { open: "How do I cancel Pro before it renews?", reply: "Go to Profile › Pro › Manage and tap Cancel. You keep Pro until the end of the month.", tags: ["billing", "how-to"] },
    { open: "My Spotlight job got no extra views.", reply: "Spotlight started late because the job was waiting for approval. I’ve added two free days.", tags: ["refund", "feedback"] },
    { open: "Do you have a discount for agencies posting many jobs?", reply: "We do. I’ll ask our partnerships team to email you the agency plan.", tags: ["billing"] },
  ],
  "Press and partnerships": [
    { open: "We run a training school for tilers and would like to partner with Jobs Region.", reply: "Thanks! Could you share how many graduates you have each year?", tags: [] },
    { open: "I’m a journalist with a few questions about informal work in Abuja.", reply: "Happy to help. Please send your questions and deadline.", tags: [] },
  ],
}

const CHANNELS: InboxChannel[] = ["In-app", "In-app", "Email", "Website form"]
const STATUSES: InboxStatus[] = ["New", "Open", "Open", "Waiting on them", "Waiting on them", "Closed", "Closed", "Closed"]
const AGENTS = ["A-01", "A-02", "A-03", "A-04", "A-05"]
const USER_IDS = Array.from({ length: 20 }, (_, i) => `U-${String(i + 1).padStart(2, "0")}`)
const JOB_IDS = ["J-01", "J-02", "J-03", "J-04", "J-05", "J-06", "J-07", "J-08"]

function stampFor(minutesBefore: number) {
  // Counted back from 22 Oct 2026, 10:00 (the inbox's "now").
  const d = new Date(Date.UTC(2026, 9, 22, 10, 0) - minutesBefore * 60_000)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

function generate(count: number): InboxConversation[] {
  const rand = seeded(20261022)
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)]
  return Array.from({ length: count }, (_, i): InboxConversation => {
    const topic = pick(INBOX_TOPICS)
    const script = pick(SCRIPTS[topic])
    const channel = pick(CHANNELS)
    // Newer conversations are more likely to be new or open; older ones closed.
    const ageMin = Math.round(30 + i * 260 + rand() * 240)
    const status: InboxStatus = i < 12 ? "New" : ageMin > 60 * 24 * 20 && rand() < 0.75 ? "Closed" : pick(STATUSES)
    const guest = channel === "Website form" || rand() < 0.15
    const first = pick(FIRST)
    const last = pick(LAST)
    const assigned = status === "New" ? (rand() < 0.3 ? pick(AGENTS) : undefined) : rand() < 0.9 ? pick(AGENTS) : undefined
    const messages: InboxMessage[] = [{ id: "m1", from: "them", body: script.open, at: stampFor(ageMin) }]
    if (script.more) messages.push({ id: "m2", from: "them", body: script.more, at: stampFor(ageMin - 3) })
    if (status !== "New") {
      messages.push({ id: `m${messages.length + 1}`, from: "us", adminId: assigned ?? "A-05", body: script.reply, at: stampFor(Math.max(1, ageMin - 90 - Math.round(rand() * 600))) })
      if (status === "Open" || (status === "Closed" && rand() < 0.5)) {
        messages.push({
          id: `m${messages.length + 1}`,
          from: "them",
          body: status === "Closed" ? "Thanks, that sorted it." : "Okay, thank you. One more question, how long will that take?",
          at: stampFor(Math.max(0, ageMin - 900 - Math.round(rand() * 900))),
        })
      }
    }
    const linkJob = (topic === "Hiring" || topic === "Promotions and Pro" || topic === "Safety") && rand() < 0.5
    return {
      id: `C-${1031 - i}`,
      ...(guest
        ? { guest: { name: `${first} ${last}`, email: `${first}.${last}${Math.floor(rand() * 90 + 10)}@${pick(MAIL)}`.toLowerCase() } }
        : { userId: pick(USER_IDS) }),
      topic,
      channel,
      status,
      assignedAdminId: assigned,
      linkedJobId: linkJob ? pick(JOB_IDS) : undefined,
      tags: script.tags.length ? script.tags : undefined,
      messages,
    }
  })
}

export const inboxConversations: InboxConversation[] = [...handWritten, ...generate(150)]

/** Name and email for a conversation, whether it's a user or a guest. */
export function conversationContact(c: InboxConversation, lookup: (id: string) => { name: string; email: string } | undefined) {
  if (c.userId) {
    const u = lookup(c.userId)
    if (u) return { name: u.name, email: u.email }
  }
  return c.guest ?? { name: "Unknown sender", email: "" }
}
