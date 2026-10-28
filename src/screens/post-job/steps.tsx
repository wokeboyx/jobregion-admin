import { useId, useMemo, useState, type ReactNode } from "react"
import {
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Check,
  Globe,
  Home,
  ExternalLink,
  ImagePlus,
  Info,
  MapPin,
  Megaphone,
  MessageCircle,
  PartyPopper,
  Search,
  ShieldCheck,
  Trash2,
  Truck,
  Wallet,
  Zap,
} from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { coverFor, jobCover } from "@/lib/photos"
import { ANCHOR_DATE, jobCategories, naira, promotionPlans } from "@/lib/mock-data"
import { Area, Chip, Field, Head, MoneyField, SelectField, Switch, Tile, WideTile } from "./choices"
import {
  ARRANGEMENTS,
  EMPLOYMENT,
  EXPERIENCE,
  FLEX,
  PARTS,
  STATES,
  addDays,
  applyUrlOf,
  budgetError,
  budgetLabel,
  categoryLabel,
  contactList,
  employers,
  fmtDate,
  isUrl,
  locationLabel,
  modeLabel,
  posterOf,
  timeLabel,
  whenLabel,
  type Draft,
  type Step,
} from "./draft"

type StepProps = { d: Draft; set: (p: Partial<Draft>) => void }

const CATEGORY_ICON: Record<string, ReactNode> = {
  "Home Services": <Home className="size-8" strokeWidth={1.5} />,
  Events: <PartyPopper className="size-8" strokeWidth={1.5} />,
  "Delivery & Logistics": <Truck className="size-8" strokeWidth={1.5} />,
}

/** Stock photos admins can pick when they have none of their own. */
const LIBRARY = Array.from(
  new Set([...["J-01", "J-02", "J-03", "J-04", "J-05", "J-06", "J-07", "J-08"].map(jobCover), ...["a", "b", "c", "d", "e", "f"].map(coverFor)]),
)

export function PostAsStep({ d, set }: StepProps) {
  const [query, setQuery] = useState("")
  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return employers().filter((u) => !q || `${u.name} ${u.email} ${u.location}`.toLowerCase().includes(q))
  }, [query])
  return (
    <>
      <Head title="Who is posting this job?">Post it as Jobs Region, or on behalf of an employer who asked for help.</Head>
      <div role="radiogroup" aria-label="Post as" className="flex flex-col gap-3">
        <WideTile
          on={d.postAs === "official"}
          onClick={() => set({ postAs: "official", userId: undefined })}
          title="Jobs Region"
          icon={<ShieldCheck className="size-9" strokeWidth={1.5} />}
        >
          An official listing from the Jobs Region team, with the verified tick. Replies come to the team inbox.
        </WideTile>
        <WideTile
          on={d.postAs === "user"}
          onClick={() => set({ postAs: "user" })}
          title="On behalf of a user"
          icon={<Briefcase className="size-9" strokeWidth={1.5} />}
        >
          The job shows under their account and they get the messages, as if they posted it.
        </WideTile>
      </div>
      {d.postAs === "user" && (
        <section className="flex animate-[rise_.2s_ease-out] flex-col gap-3 border-t border-border pt-6">
          <h2 className="heading-card">Choose the employer</h2>
          <div className="relative h-12">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-foreground" />
            <input
              type="search"
              aria-label="Search employers"
              placeholder="Search by name, email or city"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-4 text-body1 text-foreground outline-none placeholder:text-muted-foreground hover:border-foreground focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
            />
          </div>
          <ul role="radiogroup" aria-label="Employer" className="max-h-[360px] divide-y divide-border overflow-y-auto">
            {list.length === 0 && <li className="py-6 text-center text-body1 text-muted-foreground">No employers match "{query}".</li>}
            {list.map((u) => {
              const on = d.userId === u.id
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => set({ userId: u.id, phoneNumber: u.phone, whatsappNumber: u.phone, emailAddress: u.email })}
                    className={cn("flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left transition-colors", on ? "bg-muted" : "hover:bg-muted")}
                  >
                    <Avatar name={u.name} className="size-11 text-body2" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-body1 font-semibold text-foreground">
                        {u.name}
                        {u.verification === "success" && <BadgeCheck className="size-4" />}
                      </span>
                      <span className="block truncate text-body2 text-muted-foreground">
                        {u.location} · {u.email}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border",
                        on ? "border-foreground bg-foreground text-white" : "border-input",
                      )}
                    >
                      {on && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </>
  )
}

export function TypeStep({ d, set }: StepProps) {
  return (
    <>
      <Head title="What type of job is this?">It decides what we ask next.</Head>
      <div role="radiogroup" aria-label="Job type" className="flex flex-col gap-3">
        <WideTile
          on={d.kind === "everyday"}
          onClick={() => set({ kind: "everyday" })}
          title="Everyday task"
          icon={<Home className="size-9" strokeWidth={1.5} />}
        >
          Hands-on or creative work people book directly: repairs, cleaning, events, beauty and daily needs.
        </WideTile>
        <WideTile
          on={d.kind === "professional"}
          onClick={() => set({ kind: "professional" })}
          title="Skilled / professional work"
          icon={<Briefcase className="size-9" strokeWidth={1.5} />}
        >
          Roles that usually need a CV, work experience or a professional background.
        </WideTile>
      </div>
    </>
  )
}

export function TitleStep({ d, set }: StepProps) {
  const pro = d.kind === "professional"
  return (
    <>
      <Head title={pro ? "Give the role a title" : "What needs doing?"}>Short titles work best. Then say what the job involves.</Head>
      <Field label="Job title" value={d.title} maxLength={70} onChange={(e) => set({ title: e.target.value })} helper={`${d.title.length}/70 characters`} />
      <Area
        label={pro ? "Describe the role" : "Describe this job"}
        rows={7}
        value={d.description}
        maxLength={2000}
        onChange={(e) => set({ description: e.target.value })}
        helper={
          d.description.trim().length < 20
            ? "At least 20 characters. Say what needs doing and anything to bring."
            : `${d.description.length}/2000 characters`
        }
      />
    </>
  )
}

export function CategoryStep({ d, set }: StepProps) {
  const picked = jobCategories.find((c) => c.name === d.category)
  return (
    <>
      <Head title="Which of these best describes the job?">So the right people see it, and so we can recommend people who match.</Head>
      <div role="radiogroup" aria-label="Category" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {jobCategories.map((c) => (
          <Tile
            key={c.id}
            on={d.category === c.name}
            onClick={() => set({ category: c.name, sub: undefined })}
            icon={CATEGORY_ICON[c.name] ?? <Briefcase className="size-8" strokeWidth={1.5} />}
            label={c.name}
          />
        ))}
      </div>
      {picked && picked.subcategories.length > 0 && (
        <section className="flex animate-[rise_.2s_ease-out] flex-col gap-3 border-t border-border pt-6">
          <h2 className="heading-card">More specifically (optional)</h2>
          <div className="flex flex-wrap gap-2">
            {picked.subcategories.map((s) => (
              <Chip key={s.id} on={d.sub === s.name} onClick={() => set({ sub: d.sub === s.name ? undefined : s.name })}>
                {s.name}
              </Chip>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function DateInput({ label, value, onChange, min }: { label: string; value: string; onChange: (v: string) => void; min?: string }) {
  const id = useId()
  return (
    <label htmlFor={id} className="flex flex-col rounded-lg border border-input px-4 pb-2.5 pt-2 focus-within:border-transparent focus-within:ring-2 focus-within:ring-foreground">
      <span className="text-caption text-muted-foreground">{label}</span>
      <input id={id} type="date" value={value} min={min} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent text-body1 text-foreground outline-none" />
    </label>
  )
}

export function TimeStep({ d, set }: StepProps) {
  const tabs = [
    ["on", "On a date"],
    ["before", "Before a date"],
    ["flexible", "I'm flexible"],
  ] as const
  const quick = [
    ["Today", ANCHOR_DATE],
    ["Tomorrow", addDays(1)],
    ["This weekend", addDays(4)],
  ] as const
  return (
    <>
      <Head title="When is it needed?">Pick a day and a time, or say it's flexible.</Head>
      <div role="tablist" aria-label="When" className="flex rounded-full bg-[#ebebeb] p-1">
        {tabs.map(([k, l]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={d.timing === k}
            onClick={() => set({ timing: k })}
            className={cn(
              "h-11 flex-1 rounded-full px-2 text-body1 font-semibold transition-colors",
              d.timing === k ? "bg-white text-foreground shadow-[0_1px_4px_rgb(0_0_0/0.12)]" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {l}
          </button>
        ))}
      </div>
      {(d.timing === "on" || d.timing === "before") && (
        <div className="flex animate-[rise_.2s_ease-out] flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {quick.map(([l, v]) => (
                <Chip key={l} on={d.date === v} onClick={() => set({ date: v })}>
                  {l}
                </Chip>
              ))}
            </div>
            <DateInput label={d.timing === "on" ? "Date" : "Latest date"} value={d.date} min={ANCHOR_DATE} onChange={(date) => set({ date })} />
          </div>
          <section className="flex flex-col gap-3">
            <h2 className="heading-section">What time?</h2>
            <div role="radiogroup" aria-label="Time of day" className="grid grid-cols-2 gap-3">
              {PARTS.map(([k, l, t]) => (
                <Tile key={k} on={d.partOfDay === k} onClick={() => set({ partOfDay: k })} label={l} sub={t} />
              ))}
            </div>
            <div>
              <Chip on={!d.partOfDay} onClick={() => set({ partOfDay: undefined })}>
                Any time
              </Chip>
            </div>
          </section>
        </div>
      )}
      {d.timing === "flexible" && (
        <section className="flex animate-[rise_.2s_ease-out] flex-col gap-3">
          <h2 className="heading-section">Roughly when?</h2>
          <div className="flex flex-wrap gap-2">
            {FLEX.map(([k, l]) => (
              <Chip key={k} on={d.flexWindow === k} onClick={() => set({ flexWindow: d.flexWindow === k ? undefined : k })}>
                {l}
              </Chip>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

export function LocationStep({ d, set }: StepProps) {
  return (
    <>
      <Head title="Where is the work?">Only the area shows on the job, so nearby people know if they can reach it.</Head>
      <div role="radiogroup" aria-label="Location" className="grid grid-cols-2 gap-3">
        <Tile on={d.place === "in_person"} onClick={() => set({ place: "in_person" })} icon={<MapPin className="size-8" strokeWidth={1.5} />} label="In person" sub="They come to a place" />
        <Tile on={d.place === "online"} onClick={() => set({ place: "online" })} icon={<Globe className="size-8" strokeWidth={1.5} />} label="Online" sub="From anywhere" />
      </div>
      {d.place === "in_person" && (
        <div className="flex animate-[rise_.2s_ease-out] flex-col gap-3">
          <Field label="Street address or area (optional)" placeholder="e.g. Lekki Phase 1" value={d.area} onChange={(e) => set({ area: e.target.value })} />
          <SelectField label="State" value={d.state} options={STATES} onChange={(state) => set({ state })} />
        </div>
      )}
    </>
  )
}

function ChoiceRow<T extends string>({ label, options, value, onChange, cols = "sm:grid-cols-4" }: { label: string; options: readonly (readonly [T, string])[]; value?: T; onChange: (v: T) => void; cols?: string }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="heading-card mb-3">{label}</legend>
      <div role="radiogroup" aria-label={label} className={cn("grid grid-cols-2 gap-3", cols)}>
        {options.map(([k, l]) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={value === k}
            onClick={() => onChange(k)}
            className={cn(
              "flex h-14 items-center justify-center rounded-xl px-3 text-body1 font-semibold text-foreground transition-colors",
              value === k ? "bg-muted outline-2 -outline-offset-2 outline-foreground" : "outline-1 -outline-offset-1 outline-input hover:outline-foreground",
            )}
          >
            {l}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function RoleStep({ d, set }: StepProps) {
  return (
    <>
      <Head title="Tell us about the role">The terms people look at first.</Head>
      <SelectField
        label="Years of experience required"
        value={d.experience}
        options={EXPERIENCE.map((y) => [y, y === "0" ? "No experience needed" : `${y}+ year${y === "1" ? "" : "s"}`] as const)}
        onChange={(experience) => set({ experience })}
      />
      <ChoiceRow label="Employment type" options={EMPLOYMENT} value={d.employment} onChange={(employment) => set({ employment })} />
      <ChoiceRow label="Work arrangement" options={ARRANGEMENTS} value={d.arrangement} onChange={(arrangement) => set({ arrangement })} cols="sm:grid-cols-3" />
      {d.arrangement && d.arrangement !== "remote" && <SelectField label="State" value={d.state} options={STATES} onChange={(state) => set({ state })} />}
      <section className="flex flex-col gap-3">
        <h2 className="heading-card">Post closing date (optional)</h2>
        <p className="-mt-2 text-body2 text-muted-foreground">
          {d.closesOn ? `We take the post down on ${fmtDate(d.closesOn)}.` : "Leave it empty to keep it open until filled."}
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["In 2 weeks", addDays(14)],
              ["In 30 days", addDays(30)],
              ["In 60 days", addDays(60)],
            ] as const
          ).map(([l, v]) => (
            <Chip key={l} on={d.closesOn === v} onClick={() => set({ closesOn: d.closesOn === v ? "" : v })}>
              {l}
            </Chip>
          ))}
        </div>
        <DateInput label="Closing date" value={d.closesOn} min={addDays(1)} onChange={(closesOn) => set({ closesOn })} />
      </section>
    </>
  )
}

export function PhotosStep({ d, set }: StepProps) {
  const id = useId()
  const full = d.photos.length >= 4
  const toggle = (url: string) =>
    set({ photos: d.photos.includes(url) ? d.photos.filter((p) => p !== url) : full ? d.photos : [...d.photos, url] })
  return (
    <>
      <Head title="Add photos (optional)">Photos help people understand what needs doing. Add up to 4. The first photo is the cover.</Head>
      <div className="grid grid-cols-2 gap-3">
        {d.photos.map((p, k) => (
          <div key={p} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
            <img src={p} alt={`Photo ${k + 1}`} className="size-full object-cover" />
            {k === 0 ? (
              <span className="absolute left-2 top-2 rounded-full bg-white px-2.5 py-0.5 text-caption font-semibold text-foreground shadow-dropdown">Cover photo</span>
            ) : (
              <button
                type="button"
                onClick={() => set({ photos: [p, ...d.photos.filter((_, x) => x !== k)] })}
                className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-0.5 text-caption font-semibold text-foreground shadow-dropdown hover:bg-white"
              >
                Make cover
              </button>
            )}
            <button
              type="button"
              aria-label={`Remove photo ${k + 1}`}
              onClick={() => set({ photos: d.photos.filter((_, x) => x !== k) })}
              className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-destructive shadow-dropdown hover:bg-white"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        {!full && (
          <label
            htmlFor={id}
            className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#b0b0b0] text-body1 font-semibold text-foreground hover:border-solid hover:border-foreground focus-within:ring-2 focus-within:ring-foreground"
          >
            <ImagePlus className="size-8" strokeWidth={1.5} />
            Upload photos
            <input
              id={id}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []).slice(0, 4 - d.photos.length)
                e.target.value = ""
                set({ photos: [...d.photos, ...files.map((f) => URL.createObjectURL(f))] })
              }}
            />
          </label>
        )}
      </div>
      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="heading-card">Or pick from the photo library</h2>
        <div className="grid grid-cols-4 gap-2">
          {LIBRARY.map((url) => {
            const on = d.photos.includes(url)
            return (
              <button
                key={url}
                type="button"
                aria-pressed={on}
                disabled={!on && full}
                onClick={() => toggle(url)}
                className={cn("relative aspect-square overflow-hidden rounded-lg disabled:opacity-40", on && "ring-2 ring-foreground ring-offset-2")}
              >
                <img src={url} alt="" className="size-full object-cover" />
                {on && (
                  <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-foreground text-white">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>
    </>
  )
}

const PRESETS = [
  ["₦5k", 5_000],
  ["₦20k", 20_000],
  ["₦50k", 50_000],
  ["₦100k", 100_000],
  ["₦500k", 500_000],
  ["₦1m+", 1_000_000],
] as const

export function BudgetStep({ d, set }: StepProps) {
  const pro = d.kind === "professional"
  const error = budgetError(d)
  /** A preset fills the minimum (or the fixed price) and, for a range, the next preset up as the maximum. */
  const preset = (i: number) => {
    const min = String(PRESETS[i][1])
    if (d.fixed) return set({ min, max: min })
    set({ min, max: i < PRESETS.length - 1 ? String(PRESETS[i + 1][1]) : "" })
  }
  return (
    <>
      <Head title={pro ? "What does the role pay?" : "What's the budget?"}>
        {d.fixed ? "One price for the whole job." : "A range works best."} They agree the final price with the person they hire and pay them directly.
      </Head>
      <div className="flex items-start gap-4 rounded-xl border border-border p-4">
        <div className="flex-1">
          <p className="text-body1 font-semibold text-foreground">Fixed price</p>
          <p className="text-body2 text-muted-foreground">Use one amount instead of a range.</p>
        </div>
        <Switch checked={d.fixed} onChange={(fixed) => set({ fixed, max: fixed ? d.min : d.max })} label="Fixed price" />
      </div>
      {d.fixed ? (
        <MoneyField label="Price" value={d.min} onChange={(min) => set({ min, max: min })} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MoneyField label="Minimum" value={d.min} onChange={(min) => set({ min })} />
          <MoneyField label="Maximum" value={d.max} onChange={(max) => set({ max })} invalid={!!error} />
        </div>
      )}
      <div>
        <p className="mb-2 text-caption font-semibold text-muted-foreground">Quick start</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(([l, v], i) => (
            <Chip key={l} on={d.min === String(v)} onClick={() => preset(i)}>
              {l}
            </Chip>
          ))}
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-body2 text-destructive">
          {error}
        </p>
      ) : (
        <p className="text-body2 text-muted-foreground">
          {pro ? "Per month for full-time roles, or for the whole contract." : "For the whole job, including any materials."} No fees: Jobs Region takes nothing.
        </p>
      )}
    </>
  )
}

export function ContactStep({ d, set }: StepProps) {
  const everyday = d.kind !== "professional"
  const setContact = (p: Partial<Draft["contact"]>) => set({ contact: { ...d.contact, ...p } })
  const none = !contactList(d).length
  const badUrl = d.contact.apply && !!d.applyUrl.trim() && !isUrl(d.applyUrl)
  const row = (title: string, text: string, on: boolean, onChange: ((v: boolean) => void) | undefined, field?: ReactNode) => (
    <li className="py-5">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <p className="heading-card">{title}</p>
          <p className="text-body2 leading-5 text-muted-foreground">{text}</p>
        </div>
        {onChange ? (
          <Switch checked={on} onChange={onChange} label={title} />
        ) : (
          <span className="rounded-full bg-muted-strong px-2 text-caption font-bold leading-5 text-muted-foreground">Always on</span>
        )}
      </div>
      {on && field && <div className="mt-4 animate-[rise_.2s_ease-out]">{field}</div>}
    </li>
  )
  return (
    <>
      <Head title="How should people get in touch?">
        {everyday
          ? "Messages keep the chat on Jobs Region. You can also show a WhatsApp or phone number."
          : "Send applicants to a careers page, let them message here, or show a number or email."}
      </Head>
      <ul className="divide-y divide-border border-y border-border">
        {row(
          "In-app message",
          everyday ? "Everyday jobs always take messages, so details can be agreed safely and both sides can review each other." : "Applicants chat in the app. Needed to mark someone as hired and leave reviews.",
          everyday || d.contact.message,
          everyday ? undefined : (message) => setContact({ message }),
        )}
        {row(
          "WhatsApp",
          "Shows a WhatsApp button on the job. Anyone who taps it sees the number.",
          d.contact.whatsapp,
          (whatsapp) => setContact({ whatsapp }),
          <Field label="WhatsApp number" type="tel" placeholder="+234 800 000 0000" value={d.whatsappNumber} onChange={(e) => set({ whatsappNumber: e.target.value })} />,
        )}
        {row(
          "Phone call",
          "Shows a Call button with this number.",
          d.contact.phone,
          (phone) => setContact({ phone }),
          <Field label="Phone number" type="tel" placeholder="+234 800 000 0000" value={d.phoneNumber} onChange={(e) => set({ phoneNumber: e.target.value })} />,
        )}
        {!everyday &&
          row(
            "Email",
            "Applicants can send a CV or questions by email.",
            d.contact.email,
            (email) => setContact({ email }),
            <Field label="Email address" type="email" placeholder="hiring@company.com" value={d.emailAddress} onChange={(e) => set({ emailAddress: e.target.value })} />,
          )}
        {!everyday &&
          row(
            "Apply link",
            "Adds an Apply button that opens the company's careers page or hiring system (ATS).",
            d.contact.apply,
            (apply) => setContact({ apply }),
            <Field
              label="Link to apply"
              type="url"
              placeholder="https://company.com/careers/role"
              value={d.applyUrl}
              onChange={(e) => set({ applyUrl: e.target.value })}
              error={badUrl ? "Enter a full link starting with https://" : undefined}
            />,
          )}
      </ul>
      {none && (
        <p role="alert" className="text-body2 text-destructive">
          Turn on at least one way to get in touch.
        </p>
      )}
    </>
  )
}

function ReviewRow({ icon, children, onEdit }: { icon: ReactNode; children: ReactNode; onEdit: () => void }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <span className="mt-0.5 text-foreground">{icon}</span>
      <span className="flex-1 text-body1 text-foreground">{children}</span>
      <button type="button" onClick={onEdit} className="text-body2 font-semibold text-foreground underline underline-offset-4 hover:text-muted-foreground">
        Edit
      </button>
    </li>
  )
}

export function ReviewStep({ d, set, go }: StepProps & { go: (s: Step) => void }) {
  const poster = posterOf(d)
  const pro = d.kind === "professional"
  const icon = "size-[18px]"
  return (
    <>
      <Head title="Review and publish">Check the details, then choose how it goes live.</Head>
      <article className="flex flex-col gap-3 rounded-2xl border border-input p-6 shadow-card">
        {d.photos[0] && <img src={d.photos[0]} alt="" className="mb-2 aspect-[16/9] w-full rounded-xl object-cover" />}
        <div className="flex items-start gap-3">
          <h2 className="heading-card flex-1">{d.title}</h2>
          <button type="button" onClick={() => go("title")} className="text-body2 font-semibold text-foreground underline underline-offset-4 hover:text-muted-foreground">
            Edit
          </button>
        </div>
        <p className="line-clamp-4 text-body2 leading-6 text-muted-foreground">{d.description}</p>
        <ul className="divide-y divide-border border-t border-border">
          <ReviewRow icon={poster ? <Avatar name={poster.name} className="size-5 text-caption" /> : <ShieldCheck className={icon} />} onEdit={() => go("postAs")}>
            Posted as <b className="font-semibold">{poster ? poster.name : "Jobs Region (official)"}</b>
          </ReviewRow>
          <ReviewRow icon={<Briefcase className={icon} />} onEdit={() => go("category")}>
            {pro ? "Skilled / professional" : "Everyday task"} · {categoryLabel(d)}
          </ReviewRow>
          {pro ? (
            <ReviewRow icon={<CalendarDays className={icon} />} onEdit={() => go("role")}>
              {d.employment}, {d.experience === "0" ? "no experience needed" : `${d.experience}+ years`}. {d.closesOn ? `Closes ${fmtDate(d.closesOn)}` : "Open until filled"}
            </ReviewRow>
          ) : (
            <ReviewRow icon={<CalendarDays className={icon} />} onEdit={() => go("time")}>
              {whenLabel(d)}
              {d.timing !== "flexible" && `, ${timeLabel(d).toLowerCase()}`}
            </ReviewRow>
          )}
          <ReviewRow icon={<MapPin className={icon} />} onEdit={() => go(pro ? "role" : "location")}>
            {modeLabel(d)}
            {locationLabel(d) !== modeLabel(d) && ` · ${locationLabel(d)}`}
          </ReviewRow>
          <ReviewRow icon={<ImagePlus className={icon} />} onEdit={() => go("photos")}>
            {d.photos.length ? `${d.photos.length} photo${d.photos.length > 1 ? "s" : ""}` : "No photos"}
          </ReviewRow>
          <ReviewRow icon={<MessageCircle className={icon} />} onEdit={() => go("contact")}>
            {contactList(d).join(", ")}
          </ReviewRow>
          {applyUrlOf(d) && (
            <ReviewRow icon={<ExternalLink className={icon} />} onEdit={() => go("contact")}>
              <span className="block truncate" title={applyUrlOf(d)}>
                Apply at {applyUrlOf(d)}
              </span>
            </ReviewRow>
          )}
          <ReviewRow icon={<Wallet className={icon} />} onEdit={() => go("budget")}>
            <b className="font-semibold">{budgetLabel(d)}</b>
          </ReviewRow>
        </ul>
      </article>

      <section className="flex flex-col gap-3">
        <h2 className="heading-section">How should it go live?</h2>
        <div role="radiogroup" aria-label="Publishing" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Tile on={d.publish === "open"} onClick={() => set({ publish: "open" })} icon={<Zap className="size-7" strokeWidth={1.5} />} label="Publish now" sub="Goes live as Open straight away" />
          <Tile
            on={d.publish === "review"}
            onClick={() => set({ publish: "review" })}
            icon={<ShieldCheck className="size-7" strokeWidth={1.5} />}
            label="Send to review queue"
            sub="Waits as Needs review for a second admin"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <div className="flex items-start gap-4">
          <Megaphone className="mt-0.5 size-6 shrink-0" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="heading-card">Promote it</p>
            <p className="text-body2 text-muted-foreground">
              Free for posts made by admins.{d.publish === "review" && " The promotion starts once the job is approved."}
            </p>
          </div>
          <Switch checked={d.promote} onChange={(promote) => set({ promote })} label="Promote it" />
        </div>
        {d.promote && (
          <div role="radiogroup" aria-label="Promotion plan" className="grid animate-[rise_.2s_ease-out] grid-cols-1 gap-3 sm:grid-cols-3">
            {promotionPlans
              .filter((p) => p.active)
              .map((p) => {
                const on = d.plan === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => set({ plan: p.id })}
                    className={cn(
                      "flex flex-col gap-1 rounded-xl p-4 text-left transition-colors",
                      on ? "bg-muted outline-2 -outline-offset-2 outline-foreground" : "outline-1 -outline-offset-1 outline-input hover:outline-foreground",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-body1 font-semibold text-foreground">{p.name}</span>
                      {p.popular && <span className="rounded-full bg-foreground px-2 text-caption font-bold leading-5 text-white">Popular</span>}
                    </span>
                    <span className="text-body2 text-muted-foreground">
                      {p.days} days · {p.reach}
                    </span>
                    <span className="mt-1 text-body2">
                      <span className="text-muted-foreground line-through">{naira(p.price)}</span> <b className="font-semibold text-foreground">Free</b>
                    </span>
                  </button>
                )
              })}
          </div>
        )}
      </section>

      <p className="flex items-start gap-2 text-body2 text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        {poster ? `${poster.name} gets an email that Jobs Region posted this job for them.` : "Replies go to the Jobs Region team inbox."}
      </p>
    </>
  )
}
