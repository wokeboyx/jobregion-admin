import { useEffect, useRef, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { Check } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { cn } from "@/lib/utils"
import { subscriptionPlans } from "@/lib/mock-data"
import {
  ALERT_FREQUENCIES,
  EMAIL_TYPES,
  ID_TYPES,
  JOB_REVIEW_OPTIONS,
  LINK_POLICY_OPTIONS,
  defaultSettings,
  type MarketplaceSettings,
} from "@/lib/settings-data"
import { CheckList, ChipsEditor, InfoRow, NumberField, OnOff, RadioList, SettingRow, Switch } from "./fields"

const SECTIONS = [
  { id: "hires", label: "Hires & reviews" },
  { id: "verification", label: "Verification" },
  { id: "jobs", label: "Jobs" },
  { id: "alerts", label: "Job alerts & Pro" },
  { id: "safety", label: "Messaging & safety" },
  { id: "notifications", label: "Notifications" },
] as const

type SectionId = (typeof SECTIONS)[number]["id"]
type Key = keyof MarketplaceSettings
type NumberKey = { [K in Key]: MarketplaceSettings[K] extends number ? K : never }[Key]

const onOff = (v: boolean) => (v ? "On" : "Off")
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`

function numberRule(min: number, max: number) {
  return (v: number) => (Number.isInteger(v) && v >= min && v <= max ? null : `Enter a whole number from ${min} to ${max}.`)
}

function Section({ id, title, description, children }: { id: SectionId; title: string; description: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 pb-14">
      <h2 className="heading-section">{title}</h2>
      <p className="mt-1 max-w-2xl text-body1 text-muted-foreground">{description}</p>
      <div className="mt-2">{children}</div>
    </section>
  )
}

/** The black "Saved" pill Airbnb shows at the bottom of the screen after a change. */
function SavedToast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div
      role="status"
      className="fixed bottom-8 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-5 py-3 text-body2 font-semibold text-white shadow-dropdown animate-[rise_.25s_cubic-bezier(.2,.8,.2,1)]"
    >
      <Check className="size-4" strokeWidth={2.5} />
      {message}
    </div>
  )
}

function SettingsPage() {
  const [settings, setSettings] = useState<MarketplaceSettings>(defaultSettings)
  const [editing, setEditing] = useState<Key | null>(null)
  const [active, setActive] = useState<SectionId>("hires")
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const onScroll = () => {
      let current: SectionId = SECTIONS[0].id
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top < 160) current = s.id
      }
      // At the very bottom the last short sections can't reach the top, so pick the last one.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = SECTIONS[SECTIONS.length - 1].id
      setActive(current)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const flash = (message: string) => {
    setToast(message)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 2500)
  }

  const save = <K extends Key>(key: K, value: MarketplaceSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }))
    flash("Saved")
  }

  /** The props every editable row shares: its value, whether it is open, and Save. */
  const row = <K extends Key>(key: K) => ({
    value: settings[key],
    editing: editing === key,
    locked: editing !== null,
    onEdit: () => setEditing(key),
    onDone: () => setEditing(null),
    onSave: (v: MarketplaceSettings[K]) => save(key, v),
  })

  const numberRow = (key: NumberKey, o: {
    label: string
    help: string
    unit: [string, string]
    fieldLabel: string
    min: number
    max: number
  }) => (
    <SettingRow
      label={o.label}
      help={o.help}
      summary={plural(settings[key], o.unit[0])}
      validate={numberRule(o.min, o.max)}
      {...row(key)}
    >
      {(draft, set) => (
        <NumberField label={o.fieldLabel} value={draft} onChange={set} suffix={draft === 1 ? o.unit[0] : o.unit[1]} min={o.min} max={o.max} />
      )}
    </SettingRow>
  )

  const pro = subscriptionPlans.find((p) => p.status === "success") ?? subscriptionPlans[0]
  const emailsOn = EMAIL_TYPES.filter((e) => settings.emails[e.key]).length

  return (
    <div>
      <PageHeader
        title="Marketplace rules"
        description="The rules the Jobs Region app follows for hires, reviews, verification, jobs, alerts and safety. Changes apply straight away."
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[220px_minmax(0,1fr)] xl:gap-20">
        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="sticky top-28 space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
                    setActive(s.id)
                  }}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-body1 transition-colors hover:bg-muted",
                    active === s.id ? "bg-muted font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl">
          <Section id="hires" title="Hires & reviews" description="Reviews only come from real, confirmed hires between verified people.">
            {numberRow("hireConfirmDays", {
              label: "Time to confirm a hire",
              help: "After a hire is marked, the other person has this long to confirm it happened.",
              unit: ["day", "days"],
              fieldLabel: "Days",
              min: 1,
              max: 30,
            })}
            {numberRow("reviewWindowDays", {
              label: "Time to write a review",
              help: "Counted from when the hire is confirmed. After this the review window closes.",
              unit: ["day", "days"],
              fieldLabel: "Days",
              min: 1,
              max: 60,
            })}
            <SettingRow
              label="Double-blind reviews"
              help="Neither person sees the other's review until both have written one or the window closes."
              summary={onOff(settings.doubleBlindReviews)}
              {...row("doubleBlindReviews")}
            >
              {(draft, set) => (
                <OnOff name="doubleBlindReviews" value={draft} onChange={set} on="Reviews stay hidden until both are in" off="Reviews show as soon as they're written" />
              )}
            </SettingRow>
            {numberRow("reviewsBeforeRating", {
              label: "Reviews before a rating shows",
              help: "Until someone has this many reviews, their profile says “New” instead of a star rating.",
              unit: ["review", "reviews"],
              fieldLabel: "Reviews",
              min: 1,
              max: 10,
            })}
            <SettingRow
              label="Both people must be ID-verified to review"
              help="Stops fake accounts leaving reviews."
              summary={settings.reviewNeedsVerifiedIds ? "On · both need a verified ID" : "Off · anyone with a confirmed hire"}
              {...row("reviewNeedsVerifiedIds")}
            >
              {(draft, set) => (
                <OnOff name="reviewNeedsVerifiedIds" value={draft} onChange={set} on="Only verified people can write and get reviews" off="Anyone with a confirmed hire can review" />
              )}
            </SettingRow>
            <SettingRow
              label="Reply to a review"
              help="The reviewed person can post one public reply under each review."
              summary={settings.reviewReplyOnce ? "On · one reply per review" : "Off"}
              {...row("reviewReplyOnce")}
            >
              {(draft, set) => <OnOff name="reviewReplyOnce" value={draft} onChange={set} on="One public reply per review" off="No replies" />}
            </SettingRow>
          </Section>

          <Section id="verification" title="Verification" description="What people send us before they get the verified tick.">
            <SettingRow
              label="Accepted ID types"
              help="People choose one of these on the Verify your ID screen."
              summary={settings.idTypes.length ? settings.idTypes.join(", ") : "None"}
              validate={(v) => (v.length ? null : "Choose at least one ID type.")}
              {...row("idTypes")}
            >
              {(draft, set) => <CheckList options={ID_TYPES.map((t) => ({ value: t, label: t }))} value={draft} onChange={set} />}
            </SettingRow>
            <SettingRow
              label="Selfie"
              help="A live selfie we compare with the ID photo."
              summary={settings.selfieRequired ? "Required" : "Not required"}
              {...row("selfieRequired")}
            >
              {(draft, set) => <OnOff name="selfieRequired" value={draft} onChange={set} on="Required with every ID" off="ID only" />}
            </SettingRow>
            <SettingRow
              label="Phone number check"
              help="A one-time code by SMS when someone signs up."
              summary={settings.phoneOtpRequired ? "Required" : "Not required"}
              {...row("phoneOtpRequired")}
            >
              {(draft, set) => <OnOff name="phoneOtpRequired" value={draft} onChange={set} on="Everyone confirms their phone with a code" off="Phone number isn't checked" />}
            </SettingRow>
            <SettingRow
              label="Business documents for companies"
              help="Companies upload their CAC certificate before they get the verified tick."
              summary={settings.businessDocsRequired ? "Required · CAC certificate" : "Not required"}
              {...row("businessDocsRequired")}
            >
              {(draft, set) => <OnOff name="businessDocsRequired" value={draft} onChange={set} on="CAC certificate required" off="Companies verify like individuals" />}
            </SettingRow>
          </Section>

          <Section id="jobs" title="Jobs" description="How jobs are checked, how long they stay up and what they can contain.">
            <SettingRow
              label="Review new jobs first"
              help="Jobs waiting for review show up in Jobs › Needs review."
              summary={JOB_REVIEW_OPTIONS.find((o) => o.value === settings.jobReview)?.label}
              {...row("jobReview")}
            >
              {(draft, set) => <RadioList name="jobReview" options={JOB_REVIEW_OPTIONS} value={draft} onChange={set} />}
            </SettingRow>
            {numberRow("maxWorkAreas", {
              label: "Work areas per worker",
              help: "How many categories a worker can pick on their profile.",
              unit: ["area", "areas"],
              fieldLabel: "Most areas",
              min: 1,
              max: 10,
            })}
            {numberRow("jobExpiryDays", {
              label: "Jobs expire after",
              help: "Open jobs close automatically. The poster gets an email 3 days before.",
              unit: ["day", "days"],
              fieldLabel: "Days",
              min: 7,
              max: 90,
            })}
            {numberRow("maxPhotosPerJob", {
              label: "Photos per job",
              help: "The most photos a poster can add to one job.",
              unit: ["photo", "photos"],
              fieldLabel: "Most photos",
              min: 1,
              max: 20,
            })}
            <SettingRow
              label="Banned words"
              help="Jobs and messages with these words are held for review. Use them for common scams."
              summary={settings.bannedWords.length ? `${plural(settings.bannedWords.length, "word")} · ${settings.bannedWords.slice(0, 3).join(", ")}${settings.bannedWords.length > 3 ? "…" : ""}` : "None"}
              {...row("bannedWords")}
            >
              {(draft, set) => <ChipsEditor value={draft} onChange={set} placeholder="Add a word or phrase, e.g. registration fee" />}
            </SettingRow>
          </Section>

          <Section id="alerts" title="Job alerts & Pro" description="Alerts are free. Instant alerts are one of the Pro perks.">
            <SettingRow
              label="Free alert options"
              help="What everyone can choose in Notifications › Job alerts."
              summary={ALERT_FREQUENCIES.filter((f) => settings.freeAlertFrequencies.includes(f.key)).map((f) => f.label).join(", ") || "None"}
              validate={(v) => (v.length ? null : "Keep at least one free option.")}
              {...row("freeAlertFrequencies")}
            >
              {(draft, set) => (
                <CheckList options={ALERT_FREQUENCIES.map((f) => ({ value: f.key, label: f.label, description: f.description }))} value={draft} onChange={set} />
              )}
            </SettingRow>
            <SettingRow
              label="Instant alerts"
              help="A push and email the moment a matching job is posted."
              summary={settings.instantAlertsProOnly ? "Pro members only" : "Everyone"}
              {...row("instantAlertsProOnly")}
            >
              {(draft, set) => (
                <RadioList
                  name="instantAlertsProOnly"
                  value={draft}
                  onChange={set}
                  options={[
                    { value: true, label: "Pro members only", description: "Free members get daily or weekly digests" },
                    { value: false, label: "Everyone", description: "Instant alerts stop being a Pro perk" },
                  ]}
                />
              )}
            </SettingRow>
            <InfoRow
              label="Jobs Region Pro"
              summary={`${pro.price} a month · ${plural(pro.benefits.length, "perk")}`}
              action={
                <Link to="/subscriptions" className="text-body1 font-semibold text-foreground underline underline-offset-2">
                  Manage
                </Link>
              }
            />
          </Section>

          <Section id="safety" title="Messaging & safety" description="Messaging is free. These rules keep people safe while they talk.">
            <SettingRow
              label="Blocking hides the chat"
              help="When someone blocks a person, the conversation disappears from both inboxes."
              summary={onOff(settings.blockHidesChats)}
              {...row("blockHidesChats")}
            >
              {(draft, set) => <OnOff name="blockHidesChats" value={draft} onChange={set} on="Chat is hidden for both people" off="Chat stays, but no new messages" />}
            </SettingRow>
            <SettingRow
              label="Links in a first message from a new account"
              help="Accounts under 7 days old. Scammers often send links straight away."
              summary={LINK_POLICY_OPTIONS.find((o) => o.value === settings.firstMessageLinks)?.label}
              {...row("firstMessageLinks")}
            >
              {(draft, set) => <RadioList name="firstMessageLinks" options={LINK_POLICY_OPTIONS} value={draft} onChange={set} />}
            </SettingRow>
            {numberRow("autoFlagReports", {
              label: "Auto-flag after reports",
              help: "A job or account is flagged for the team once it gets this many reports from different people.",
              unit: ["report", "reports"],
              fieldLabel: "Reports",
              min: 1,
              max: 20,
            })}
          </Section>

          <Section
            id="notifications"
            title="Notifications"
            description={`Emails Jobs Region sends. ${emailsOn} of ${EMAIL_TYPES.length} are on. People can still turn most of them off for themselves.`}
          >
            {EMAIL_TYPES.map((e) => (
              <div key={e.key} className="flex items-center justify-between gap-6 border-b border-border py-6">
                <div className="min-w-0">
                  <p className="heading-card">{e.label}</p>
                  <p className="mt-1 text-body1 text-muted-foreground">{e.description}</p>
                </div>
                <Switch
                  label={e.label}
                  checked={settings.emails[e.key]}
                  onChange={(on) => save("emails", { ...settings.emails, [e.key]: on })}
                />
              </div>
            ))}
          </Section>
        </div>
      </div>

      <SavedToast message={toast} />
    </div>
  )
}

export default SettingsPage
