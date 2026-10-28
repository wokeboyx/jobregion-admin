/**
 * Marketplace rules the web app reads. Defaults match the web app's mock rules (lib/mock/hires.ts, categories.ts,
 * alerts.ts, verify/id). Demo only: changes live in the admin's memory until the page reloads.
 */
export const ID_TYPES = ["NIN", "International Passport", "Voter’s Card", "Driver’s Licence"] as const
export type IdType = (typeof ID_TYPES)[number]

export const ALERT_FREQUENCIES = [
  { key: "daily", label: "Daily digest", description: "One email a day with new matching jobs" },
  { key: "weekly", label: "Weekly digest", description: "One email a week, every Monday morning" },
] as const
export type AlertFrequency = (typeof ALERT_FREQUENCIES)[number]["key"]

export type JobReviewMode = "all" | "new" | "off"
export type LinkPolicy = "warn" | "block" | "allow"

export const EMAIL_TYPES = [
  { key: "welcome", label: "Welcome", description: "Sent when someone creates an account" },
  { key: "verification", label: "Verification result", description: "When an ID or business document is approved or rejected" },
  { key: "newMessage", label: "New message", description: "When someone gets a message and hasn't opened the app for an hour" },
  { key: "hireConfirm", label: "Confirm a hire", description: "Asks both people to confirm the hire happened" },
  { key: "reviewReminder", label: "Review reminder", description: "Reminds people they can still write a review" },
  { key: "jobExpiring", label: "Job expiring", description: "Three days before a job post expires" },
  { key: "receipts", label: "Receipts", description: "After a promotion or Pro payment, and after a refund" },
  { key: "promotionReport", label: "Promotion report", description: "Weekly views and messages for running promotions" },
  { key: "productNews", label: "Product news", description: "Occasional updates about new features" },
] as const
export type EmailKey = (typeof EMAIL_TYPES)[number]["key"]

export interface MarketplaceSettings {
  hireConfirmDays: number
  reviewWindowDays: number
  doubleBlindReviews: boolean
  reviewsBeforeRating: number
  reviewNeedsVerifiedIds: boolean
  reviewReplyOnce: boolean

  idTypes: IdType[]
  selfieRequired: boolean
  phoneOtpRequired: boolean
  businessDocsRequired: boolean

  jobReview: JobReviewMode
  maxWorkAreas: number
  jobExpiryDays: number
  maxPhotosPerJob: number
  bannedWords: string[]

  freeAlertFrequencies: AlertFrequency[]
  instantAlertsProOnly: boolean

  blockHidesChats: boolean
  firstMessageLinks: LinkPolicy
  autoFlagReports: number

  emails: Record<EmailKey, boolean>
}

export const defaultSettings: MarketplaceSettings = {
  hireConfirmDays: 7,
  reviewWindowDays: 14,
  doubleBlindReviews: true,
  reviewsBeforeRating: 3,
  reviewNeedsVerifiedIds: true,
  reviewReplyOnce: true,

  idTypes: [...ID_TYPES],
  selfieRequired: true,
  phoneOtpRequired: true,
  businessDocsRequired: true,

  jobReview: "new",
  maxWorkAreas: 3,
  jobExpiryDays: 30,
  maxPhotosPerJob: 10,
  bannedWords: ["registration fee", "pay to apply", "training fee", "processing fee", "send money first"],

  freeAlertFrequencies: ["daily", "weekly"],
  instantAlertsProOnly: true,

  blockHidesChats: true,
  firstMessageLinks: "warn",
  autoFlagReports: 3,

  emails: {
    welcome: true,
    verification: true,
    newMessage: true,
    hireConfirm: true,
    reviewReminder: true,
    jobExpiring: true,
    receipts: true,
    promotionReport: true,
    productNews: false,
  },
}

export const JOB_REVIEW_OPTIONS: { value: JobReviewMode; label: string; description: string }[] = [
  { value: "all", label: "Every new job", description: "A moderator checks each job before it goes live" },
  { value: "new", label: "Only from new posters", description: "First 3 jobs from an account are checked; after that they go live" },
  { value: "off", label: "Off", description: "Jobs go live straight away and are checked if reported" },
]

export const LINK_POLICY_OPTIONS: { value: LinkPolicy; label: string; description: string }[] = [
  { value: "warn", label: "Warn", description: "Send it, with a safety note to the person receiving it" },
  { value: "block", label: "Block", description: "Remove the link and tell the sender why" },
  { value: "allow", label: "Allow", description: "Send it as it is" },
]
