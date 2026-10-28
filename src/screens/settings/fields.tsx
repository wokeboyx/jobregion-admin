import { useState, type ReactNode } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * One row of Airbnb's "Personal info" page: label, the current value in grey and an underlined Edit on the right.
 * Edit opens the row in place; Cancel (top right) closes it, Save (black) keeps the draft. While one row is open the
 * other rows' Edit links are greyed out, as on Airbnb.
 */
function SettingRow<T>({
  label,
  summary,
  help,
  value,
  editing,
  locked,
  onEdit,
  onDone,
  onSave,
  validate,
  children,
}: {
  label: string
  summary: ReactNode
  help?: string
  value: T
  editing: boolean
  locked: boolean
  onEdit: () => void
  onDone: () => void
  onSave: (value: T) => void
  validate?: (value: T) => string | null
  children: (draft: T, setDraft: (value: T) => void) => ReactNode
}) {
  const [draft, setDraft] = useState(value)
  const [error, setError] = useState<string | null>(null)

  const start = () => {
    setDraft(value)
    setError(null)
    onEdit()
  }

  const save = () => {
    const problem = validate?.(draft) ?? null
    if (problem) {
      setError(problem)
      return
    }
    onSave(draft)
    onDone()
  }

  return (
    <div className="border-b border-border py-6">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="heading-card">{label}</p>
          <div className="mt-1 text-body1 text-muted-foreground">{editing ? help : summary}</div>
        </div>
        <button
          type="button"
          disabled={locked && !editing}
          onClick={editing ? onDone : start}
          className="shrink-0 rounded-md text-body1 font-semibold text-foreground underline underline-offset-2 disabled:text-[#dddddd] disabled:no-underline"
        >
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>
      {editing && (
        <div className="mt-6">
          {children(draft, (next) => {
            setDraft(next)
            setError(null)
          })}
          {error && <p className="mt-3 text-body2 text-destructive">{error}</p>}
          <Button size="lg" className="mt-6" onClick={save}>
            Save
          </Button>
        </div>
      )}
    </div>
  )
}

/** A row with no editor of its own, e.g. a value managed on another page. */
function InfoRow({ label, summary, action }: { label: string; summary: ReactNode; action: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border py-6">
      <div className="min-w-0">
        <p className="heading-card">{label}</p>
        <div className="mt-1 text-body1 text-muted-foreground">{summary}</div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  )
}

function NumberField({
  value,
  onChange,
  suffix,
  min,
  max,
  label,
}: {
  value: number
  onChange: (value: number) => void
  suffix: string
  min: number
  max: number
  label: string
}) {
  return (
    <label className="relative block w-60">
      <span className="pointer-events-none absolute left-4 top-2 text-caption text-muted-foreground">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={Number.isNaN(value) ? "" : value}
        onChange={(e) => onChange(e.target.value === "" ? Number.NaN : Number(e.target.value))}
        className="h-14 w-full rounded-md border border-input bg-card px-4 pb-1.5 pt-5 text-body1 text-foreground outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-body2 text-muted-foreground">{suffix}</span>
    </label>
  )
}

function RadioList<V extends string | boolean>({
  name,
  options,
  value,
  onChange,
}: {
  name: string
  options: { value: V; label: string; description?: string }[]
  value: V
  onChange: (value: V) => void
}) {
  return (
    <div className="max-w-xl divide-y divide-border">
      {options.map((o) => (
        <label key={String(o.value)} className="flex cursor-pointer items-center justify-between gap-6 py-4">
          <span>
            <span className="block text-body1 text-foreground">{o.label}</span>
            {o.description && <span className="block text-body2 text-muted-foreground">{o.description}</span>}
          </span>
          <input
            type="radio"
            name={name}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="size-6 shrink-0 accent-foreground"
          />
        </label>
      ))}
    </div>
  )
}

/** On/off as Airbnb-style radio rows, so each choice can say what it does. */
function OnOff({
  name,
  value,
  onChange,
  on,
  off,
}: {
  name: string
  value: boolean
  onChange: (value: boolean) => void
  on: string
  off: string
}) {
  return (
    <RadioList
      name={name}
      value={value}
      onChange={onChange}
      options={[
        { value: true, label: "On", description: on },
        { value: false, label: "Off", description: off },
      ]}
    />
  )
}

function CheckList<V extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: V; label: string; description?: string }[]
  value: V[]
  onChange: (value: V[]) => void
}) {
  return (
    <div className="max-w-xl divide-y divide-border">
      {options.map((o) => {
        const checked = value.includes(o.value)
        return (
          <label key={o.value} className="flex cursor-pointer items-center justify-between gap-6 py-4">
            <span>
              <span className="block text-body1 text-foreground">{o.label}</span>
              {o.description && <span className="block text-body2 text-muted-foreground">{o.description}</span>}
            </span>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onChange(checked ? value.filter((v) => v !== o.value) : [...value, o.value])}
              className="size-6 shrink-0 rounded accent-foreground"
            />
          </label>
        )
      })}
    </div>
  )
}

function ChipsEditor({ value, onChange, placeholder }: { value: string[]; onChange: (value: string[]) => void; placeholder: string }) {
  const [text, setText] = useState("")
  const add = () => {
    const word = text.trim().toLowerCase()
    if (word && !value.includes(word)) onChange([...value, word])
    setText("")
  }

  return (
    <div className="max-w-xl">
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
          className="h-12 flex-1 rounded-md border border-input bg-card px-4 text-body2 text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
        />
        <Button variant="outline" size="lg" onClick={add} disabled={!text.trim()}>
          Add
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {value.map((word) => (
          <span key={word} className="flex h-9 items-center gap-1 rounded-full border border-input pl-4 pr-1.5 text-body2 text-foreground">
            {word}
            <button
              type="button"
              aria-label={`Remove ${word}`}
              onClick={() => onChange(value.filter((w) => w !== word))}
              className="flex size-6 items-center justify-center rounded-full hover:bg-muted"
            >
              <X className="size-3.5" strokeWidth={2.5} />
            </button>
          </span>
        ))}
        {value.length === 0 && <p className="text-body2 text-muted-foreground">No banned words yet.</p>}
      </div>
    </div>
  )
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-8 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
        checked ? "bg-foreground" : "bg-[#dddddd]",
      )}
    >
      <span
        className={cn(
          "absolute top-1 size-6 rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-[left]",
          checked ? "left-5" : "left-1",
        )}
      />
    </button>
  )
}

export { SettingRow, InfoRow, NumberField, RadioList, OnOff, CheckList, ChipsEditor, Switch }
