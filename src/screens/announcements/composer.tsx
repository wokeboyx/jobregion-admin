import { useState, type ReactNode } from "react"
import { Bell, BriefcaseBusiness, ChevronLeft, Mail, Newspaper, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DialogTextButton } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/page-header"
import { LogoMark } from "@/components/layout/logo-mark"
import { SelectMenu } from "@/components/ui/select-menu"
import { cn } from "@/lib/utils"
import { jobCategories, jobs } from "@/lib/mock-data"
import {
  AUDIENCE_LABEL,
  CHANNEL_LABEL,
  NIGERIAN_STATES,
  type Announcement,
  type AnnouncementChannel,
  type Audience,
  type AudienceKind,
} from "@/lib/announcements-data"
import { audienceSize, audienceSummary, channelReach, estimatedReach, formatCount } from "./audience"

const PUSH_LIMIT = 120
const MESSAGE_LIMIT = 600

const CHANNELS: { key: AnnouncementChannel; icon: typeof Bell; text: string }[] = [
  { key: "push", icon: Smartphone, text: "A notification on their phone. Only the first 120 characters show." },
  { key: "inApp", icon: Bell, text: "In the bell in the app, under Notifications." },
  { key: "email", icon: Mail, text: "To the email on their account, if they allow emails." },
  { key: "newsletter", icon: Newspaper, text: "To people who signed up on the website or blog." },
]

const LINK_SUGGESTIONS = ["/pro", "/verify", "/promote", "/jobs"]

const inputClass =
  "w-full rounded-md border border-input bg-card text-body1 text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="border-t border-border py-8 first:border-t-0 first:pt-0">
      <h2 className="heading-card">{title}</h2>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "h-9 shrink-0 rounded-full border px-3.5 text-body2 font-medium transition-colors",
        on ? "border-foreground bg-muted-strong text-foreground" : "border-input text-foreground hover:border-foreground",
      )}
    >
      {children}
    </button>
  )
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn("relative h-8 w-12 shrink-0 rounded-full transition-colors", on ? "bg-foreground" : "bg-input")}
    >
      <span className={cn("absolute top-1 size-6 rounded-full bg-white shadow transition-all", on ? "left-5" : "left-1")} />
    </button>
  )
}

function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

function clip(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

type PreviewKey = "push" | "inApp" | "email"

function PushPreview({ title, message }: { title: string; message: string }) {
  return (
    <div className="mx-auto w-[280px] rounded-[40px] bg-[#161c24] p-2.5">
      <div className="relative h-[420px] overflow-hidden rounded-[32px] bg-[linear-gradient(160deg,#fed7aa_0%,#c2410c_55%,#431407_100%)] px-3 pt-4">
        <div className="mx-auto h-6 w-24 rounded-full bg-black" />
        <p className="mt-6 text-center text-5xl font-semibold tracking-tight text-white">9:41</p>
        <p className="mt-1 text-center text-sm font-medium text-white/80">Thursday 22 October</p>
        <div className="mt-8 rounded-2xl bg-white/85 p-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-md bg-brand text-[9px] font-bold text-white">JR</span>
            <span className="flex-1 text-caption font-semibold uppercase tracking-wide text-foreground/70">Jobs Region</span>
            <span className="text-caption text-foreground/60">now</span>
          </div>
          <p className="mt-1.5 text-body2 font-semibold leading-5 text-foreground">{title || "Your title"}</p>
          <p className="text-body2 leading-5 text-foreground">{clip(message || "Your message shows here.", PUSH_LIMIT)}</p>
        </div>
      </div>
    </div>
  )
}

function InAppPreview({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-xl border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-body1 font-semibold text-foreground">Notifications</p>
        <span className="text-xs font-semibold text-foreground underline underline-offset-2">Mark all as read</span>
      </div>
      <div className="flex items-start gap-3 bg-muted px-4 py-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <Bell className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-5 text-foreground">
            <span className="font-semibold">{title || "Your title"}</span>
            {message && <> · {message}</>}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Just now</p>
        </div>
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" />
      </div>
      {[
        { icon: BriefcaseBusiness, text: "New job near you: Weekend house cleaning (4-bedroom)", when: "2 hours ago" },
        { icon: Bell, text: "Your profile was viewed 12 times this week", when: "Yesterday" },
      ].map((n) => (
        <div key={n.text} className="flex items-start gap-3 border-t border-border px-4 py-4 opacity-60">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted-strong text-foreground">
            <n.icon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-5 text-foreground">{n.text}</p>
            <p className="mt-1 text-xs text-muted-foreground">{n.when}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmailPreview({ title, message, link, newsletter }: { title: string; message: string; link: string; newsletter: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="space-y-1 border-b border-border px-4 py-3 text-body2">
        <p className="text-muted-foreground">
          From <span className="font-semibold text-foreground">Jobs Region</span> &lt;hello@jobsregion.com&gt;
        </p>
        <p className="text-muted-foreground">
          Subject <span className="font-semibold text-foreground">{title || "Your title"}</span>
        </p>
      </div>
      <div className="bg-muted px-5 py-6">
        <div className="rounded-lg bg-card px-6 py-7">
          <LogoMark className="h-6" />
          <p className="mt-6 text-xl font-bold leading-7 text-foreground">{title || "Your title"}</p>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-foreground">{message || "Your message shows here."}</p>
          {link && (
            <span className="mt-6 inline-flex h-11 items-center rounded-[10px] bg-brand px-5 text-sm font-semibold text-white">
              Open Jobs Region
            </span>
          )}
          <p className="mt-8 border-t border-border pt-4 text-caption leading-4 text-muted-foreground">
            {newsletter ? "You signed up for the Jobs Region newsletter. " : "You get this because you have a Jobs Region account. "}
            <span className="underline">Unsubscribe</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function Composer({
  initial,
  onCancel,
  onSave,
}: {
  initial?: Announcement
  onCancel: () => void
  onSave: (a: Announcement) => void
}) {
  const [title, setTitle] = useState(initial?.title ?? "")
  const [message, setMessage] = useState(initial?.message ?? "")
  const [link, setLink] = useState(initial?.link ?? "")
  const [audienceKind, setAudienceKind] = useState<AudienceKind>(initial?.audience.kind ?? "everyone")
  const [states, setStates] = useState<string[]>(initial?.audience.states ?? [])
  const [categories, setCategories] = useState<string[]>(initial?.audience.categories ?? [])
  const [channels, setChannels] = useState<AnnouncementChannel[]>(initial?.channels ?? ["push", "inApp"])
  const [when, setWhen] = useState<"now" | "later">(initial?.status === "Scheduled" ? "later" : "now")
  const [date, setDate] = useState(initial?.status === "Scheduled" ? initial.date.split(" ")[0] : "")
  const [time, setTime] = useState(initial?.status === "Scheduled" ? initial.date.split(" ")[1] : "09:00")
  const [preview, setPreview] = useState<PreviewKey>("push")
  const [showErrors, setShowErrors] = useState(false)

  const audience: Audience = {
    kind: audienceKind,
    states: audienceKind === "state" ? states : undefined,
    categories: audienceKind === "category" ? categories : undefined,
  }
  const reach = estimatedReach(audience, channels)

  const errors = {
    title: !title.trim() ? "Add a title." : "",
    message: !message.trim() ? "Write a message." : message.length > MESSAGE_LIMIT ? `Keep it under ${MESSAGE_LIMIT} characters.` : "",
    audience:
      audienceKind === "state" && states.length === 0
        ? "Pick at least one state."
        : audienceKind === "category" && categories.length === 0
          ? "Pick at least one category."
          : "",
    channels: channels.length === 0 ? "Turn on at least one channel." : "",
    schedule: when === "later" && (!date || !time) ? "Pick a date and time." : "",
  }
  const valid = Object.values(errors).every((e) => !e)

  const build = (status: Announcement["status"]): Announcement => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, "0")
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    return {
      id: initial?.id ?? `AN-${now.getTime().toString().slice(-5)}`,
      title: title.trim() || "Untitled announcement",
      message: message.trim(),
      link: link.trim() || undefined,
      audience,
      channels,
      status,
      date: status === "Scheduled" ? `${date} ${time}` : stamp,
      delivered: status === "Sent" ? reach : undefined,
      opened: status === "Sent" ? 0 : undefined,
    }
  }

  const submit = () => {
    if (!valid) {
      setShowErrors(true)
      return
    }
    onSave(build(when === "later" ? "Scheduled" : "Sent"))
  }

  const err = (msg: string) => showErrors && msg && <p className="mt-2 text-sm text-destructive">{msg}</p>

  const previewOptions: { key: PreviewKey; label: string }[] = [
    { key: "push", label: "Push" },
    { key: "inApp", label: "In-app" },
    { key: "email", label: "Email" },
  ]

  return (
    <div className="pb-28">
      <button
        type="button"
        onClick={onCancel}
        aria-label="Back to announcements"
        className="-ml-1 mb-5 flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-shadow hover:shadow-[0_2px_4px_rgb(0_0_0/0.18)]"
      >
        <ChevronLeft className="size-4" strokeWidth={2.5} />
      </button>
      <PageHeader
        title={initial ? "Edit announcement" : "New announcement"}
        description="Write it once and send it by push, in the app, by email or in the newsletter."
      />

      <div className="grid grid-cols-[minmax(0,1fr)_400px] gap-16">
        <div>
          <Section title="Message">
            <label htmlFor="an-title" className="text-sm font-semibold text-foreground">
              Title
            </label>
            <Input
              id="an-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Verify your ID to get reviews"
              className="mt-2 text-body1"
              maxLength={80}
            />
            {err(errors.title)}

            <div className="mt-6 flex items-baseline justify-between">
              <label htmlFor="an-message" className="text-sm font-semibold text-foreground">
                Message
              </label>
              <span className={cn("text-xs", message.length > MESSAGE_LIMIT ? "text-destructive" : "text-muted-foreground")}>
                {message.length}/{MESSAGE_LIMIT}
              </span>
            </div>
            <textarea
              id="an-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Say what’s new and what they should do next, in one or two short sentences."
              className={cn(inputClass, "mt-2 h-32 resize-none p-4")}
            />
            {channels.includes("push") && message.length > PUSH_LIMIT && (
              <p className="mt-2 text-sm text-muted-foreground">
                Push shows the first {PUSH_LIMIT} characters. The rest is cut off on the phone.
              </p>
            )}
            {err(errors.message)}

            <label htmlFor="an-link" className="mt-6 block text-sm font-semibold text-foreground">
              Link <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <p className="mt-0.5 text-sm text-muted-foreground">Where people go when they tap it.</p>
            <Input id="an-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/pro" className="mt-2 text-body1" />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {LINK_SUGGESTIONS.map((l) => (
                <Chip key={l} on={link === l} onClick={() => setLink(l)}>
                  {l}
                </Chip>
              ))}
              <SelectMenu
                aria-label="Link to a job"
                placeholder="A job…"
                menuClassName="max-w-96"
                value={jobs.some((j) => link === `/jobs/${j.id}`) ? link : ""}
                onChange={(v) => v && setLink(v)}
                options={jobs.filter((j) => !j.removed).map((j) => ({ value: `/jobs/${j.id}`, label: j.title, hint: j.poster }))}
              />
            </div>
          </Section>

          <Section title="Who gets it" hint={`About ${formatCount(audienceSize(audience))} people.`}>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(AUDIENCE_LABEL) as AudienceKind[]).map((k) => (
                <Chip
                  key={k}
                  on={audienceKind === k}
                  onClick={() => {
                    setAudienceKind(k)
                    if (k === "newsletter") setChannels(["newsletter"])
                  }}
                >
                  {AUDIENCE_LABEL[k]}
                </Chip>
              ))}
            </div>

            {audienceKind === "state" && (
              <div className="mt-5 rounded-xl border border-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    States <span className="font-normal text-muted-foreground">({states.length} picked)</span>
                  </p>
                  {states.length > 0 && <DialogTextButton onClick={() => setStates([])}>Clear all</DialogTextButton>}
                </div>
                <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
                  {NIGERIAN_STATES.map((s) => (
                    <Chip key={s} on={states.includes(s)} onClick={() => setStates((xs) => toggle(xs, s))}>
                      {s}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {audienceKind === "category" && (
              <div className="mt-5 rounded-xl border border-border p-4">
                <p className="mb-3 text-sm font-semibold text-foreground">People who work in</p>
                <div className="flex flex-wrap gap-1.5">
                  {jobCategories.map((c) => (
                    <Chip key={c.id} on={categories.includes(c.id)} onClick={() => setCategories((xs) => toggle(xs, c.id))}>
                      {c.name}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
            {err(errors.audience)}
          </Section>

          <Section title="How to send it">
            <div className="divide-y divide-border">
              {CHANNELS.map((c) => (
                <div key={c.key} className="flex items-center gap-4 py-4 first:pt-0">
                  <c.icon className="size-6 shrink-0 text-foreground" strokeWidth={1.5} />
                  <div className="min-w-0 flex-1">
                    <p className="text-body1 font-semibold text-foreground">{CHANNEL_LABEL[c.key]}</p>
                    <p className="text-sm text-muted-foreground">{c.text}</p>
                  </div>
                  <Switch
                    label={CHANNEL_LABEL[c.key]}
                    on={channels.includes(c.key)}
                    onChange={() => setChannels((xs) => toggle(xs, c.key))}
                  />
                </div>
              ))}
            </div>
            {err(errors.channels)}
          </Section>

          <Section title="When">
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { key: "now", label: "Send now", text: "Goes out as soon as you press Send." },
                  { key: "later", label: "Schedule", text: "Pick a date and time (Lagos time)." },
                ] as const
              ).map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setWhen(o.key)}
                  aria-pressed={when === o.key}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    when === o.key ? "border-foreground ring-1 ring-foreground" : "border-input hover:border-foreground",
                  )}
                >
                  <p className="text-body1 font-semibold text-foreground">{o.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{o.text}</p>
                </button>
              ))}
            </div>
            {when === "later" && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="an-date" className="text-sm font-semibold text-foreground">
                    Date
                  </label>
                  <Input id="an-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2" />
                </div>
                <div>
                  <label htmlFor="an-time" className="text-sm font-semibold text-foreground">
                    Time
                  </label>
                  <Input id="an-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-2" />
                </div>
              </div>
            )}
            {err(errors.schedule)}
          </Section>
        </div>

        <aside>
          <div className="sticky top-28 rounded-xl border border-border p-6 shadow-card">
            <p className="text-sm text-muted-foreground">Estimated reach</p>
            <p className="text-h3 font-bold tracking-tight text-foreground">{formatCount(reach)}</p>
            <p className="text-sm text-muted-foreground">{audienceSummary(audience)}</p>
            {channels.length > 0 && (
              <div className="mt-4 divide-y divide-border border-t border-border text-sm">
                {channels.map((c) => (
                  <div key={c} className="flex items-center justify-between py-2.5">
                    <span className="text-muted-foreground">{CHANNEL_LABEL[c]}</span>
                    <span className="font-semibold text-foreground">{formatCount(channelReach(audience, c))}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-border pt-6">
              <div className="mb-5 flex gap-1.5">
                {previewOptions.map((p) => (
                  <Chip key={p.key} on={preview === p.key} onClick={() => setPreview(p.key)}>
                    {p.label}
                  </Chip>
                ))}
              </div>
              {preview === "push" && <PushPreview title={title} message={message} />}
              {preview === "inApp" && <InAppPreview title={title} message={message} />}
              {preview === "email" && (
                <EmailPreview
                  title={title}
                  message={message}
                  link={link}
                  newsletter={channels.includes("newsletter") && !channels.includes("email")}
                />
              )}
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-10">
          <div className="flex items-center gap-5">
            <DialogTextButton onClick={onCancel}>Cancel</DialogTextButton>
            <DialogTextButton onClick={() => onSave(build("Draft"))}>Save draft</DialogTextButton>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {when === "later" && date ? `Goes out ${date} at ${time}` : "Goes out right away"} to about {formatCount(reach)} people
            </p>
            <Button size="lg" onClick={submit}>
              {when === "later" ? "Schedule" : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Composer }
