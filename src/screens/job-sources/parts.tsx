import { useState, type ReactNode } from "react"
import { ArrowDownToLine, ArrowRight, ArrowUpFromLine, MessageCircle, Plus, Send, X } from "lucide-react"

import { SelectMenu } from "@/components/ui/select-menu"
import { cn } from "@/lib/utils"
import { ALL_CATEGORIES, type CategoryMapping, type JobSource, type SourceDirection, type SourceStatus } from "@/lib/job-sources"

/** The source's logo tile: brand colour with initials, or a channel icon. */
function SourceLogo({ source, size = "size-12" }: { source: Pick<JobSource, "initials" | "color" | "icon">; size?: string }) {
  const light = source.color.toLowerCase() === "#ffffff"
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center rounded-lg text-body1 font-bold", light ? "border border-border" : "text-white", size)}
      style={{ background: source.color }}
    >
      {source.icon === "whatsapp" ? (
        <MessageCircle className="size-1/2" strokeWidth={2} />
      ) : source.icon === "telegram" ? (
        <Send className="size-[45%]" strokeWidth={2} />
      ) : source.icon === "google" ? (
        <span className="bg-[conic-gradient(#ea4335_0_25%,#fbbc05_0_50%,#34a853_0_75%,#4285f4_0)] bg-clip-text text-h5 font-extrabold text-transparent">G</span>
      ) : (
        source.initials
      )}
    </span>
  )
}

const STATUS_DOT: Record<SourceStatus, string> = {
  Connected: "bg-success",
  Paused: "bg-warning",
  Error: "bg-destructive",
  "Not connected": "bg-[#b0b0b0]",
}

function SourceStatusDot({ status, className }: { status: SourceStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 whitespace-nowrap text-body2 text-foreground", className)}>
      <span className={cn("size-2 rounded-full", STATUS_DOT[status])} />
      {status}
    </span>
  )
}

function DirectionPills({ direction }: { direction: SourceDirection }) {
  const pill = (icon: ReactNode, label: string) => (
    <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-caption font-medium text-foreground [&_svg]:size-3">
      {icon}
      {label}
    </span>
  )
  return (
    <span className="flex flex-wrap gap-1.5">
      {direction !== "Publish" && pill(<ArrowDownToLine />, "Import")}
      {direction !== "Import" && pill(<ArrowUpFromLine />, "Publish")}
    </span>
  )
}

/** Small toggle switch for the rules. */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-8 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
        checked ? "bg-foreground" : "bg-[#b0b0b0]",
      )}
    >
      <span className={cn("absolute top-1 size-6 rounded-full bg-white shadow transition-[left]", checked ? "left-5" : "left-1")} />
    </button>
  )
}

/** A line with a title, a grey explanation and a switch on the right. */
function ToggleLine({ title, text, checked, onChange }: { title: string; text: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1">
        <p className="text-body1 font-semibold text-foreground">{title}</p>
        <p className="text-body2 text-muted-foreground">{text}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  )
}

/** Choice chips, one or many picked. */
function ChipGroup<T extends string>({ options, value, onChange }: { options: readonly (readonly [T, string])[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([k, l]) => (
        <button
          key={k}
          type="button"
          aria-pressed={value === k}
          onClick={() => onChange(k)}
          className={cn(
            "h-10 rounded-full border px-4 text-body2 font-medium transition-colors",
            value === k ? "border-foreground bg-foreground text-white" : "border-input bg-card text-foreground hover:border-foreground",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

function CategoryChips({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_CATEGORIES.map((c) => {
        const on = value.includes(c)
        return (
          <button
            key={c}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== c) : [...value, c])}
            className={cn(
              "h-9 rounded-full border px-3.5 text-body2 font-medium transition-colors",
              on ? "border-foreground bg-foreground text-white" : "border-input bg-card text-foreground hover:border-foreground",
            )}
          >
            {c}
          </button>
        )
      })}
    </div>
  )
}

/** Words typed with Enter or comma become removable chips (keywords, locations). */
function TagInput({ value, onChange, placeholder, label }: { value: string[]; onChange: (v: string[]) => void; placeholder: string; label: string }) {
  const [text, setText] = useState("")
  const add = () => {
    const t = text.trim().replace(/,$/, "")
    if (t && !value.includes(t)) onChange([...value, t])
    setText("")
  }
  return (
    <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-md border border-input px-3 py-2 focus-within:border-transparent focus-within:ring-2 focus-within:ring-foreground">
      {value.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-full bg-muted-strong py-1 pl-3 pr-1.5 text-body2 text-foreground">
          {v}
          <button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(value.filter((x) => x !== v))} className="rounded-full p-0.5 hover:bg-border">
            <X className="size-3.5" />
          </button>
        </span>
      ))}
      <input
        aria-label={label}
        value={text}
        placeholder={value.length ? "" : placeholder}
        onChange={(e) => setText(e.target.value)}
        onBlur={add}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            add()
          } else if (e.key === "Backspace" && !text && value.length) {
            onChange(value.slice(0, -1))
          }
        }}
        className="min-w-32 flex-1 bg-transparent text-body2 text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}

/** Their category → our category, one row per mapping. */
function CategoryMapEditor({ value, onChange }: { value: CategoryMapping[]; onChange: (v: CategoryMapping[]) => void }) {
  const update = (i: number, p: Partial<CategoryMapping>) => onChange(value.map((m, k) => (k === i ? { ...m, ...p } : m)))
  return (
    <div className="flex flex-col gap-3">
      {value.map((m, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            aria-label="Their category"
            value={m.from}
            placeholder="Their category"
            onChange={(e) => update(i, { from: e.target.value })}
            className="h-12 min-w-0 flex-1 rounded-md border border-input bg-card px-4 text-body2 text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
          />
          <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          <SelectMenu
            variant="field"
            aria-label="Our category"
            className="min-w-0 flex-1"
            value={m.to}
            placeholder="Our category"
            onChange={(to) => update(i, { to })}
            options={ALL_CATEGORIES}
          />
          <button
            type="button"
            aria-label="Remove mapping"
            onClick={() => onChange(value.filter((_, k) => k !== i))}
            className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { from: "", to: "" }])}
        className="inline-flex w-fit items-center gap-1.5 text-body2 font-semibold text-foreground underline underline-offset-2"
      >
        <Plus className="size-4" /> Add a mapping
      </button>
    </div>
  )
}

export { SourceLogo, SourceStatusDot, DirectionPills, Toggle, ToggleLine, ChipGroup, CategoryChips, TagInput, CategoryMapEditor }
