import { useId, type ComponentProps, type ReactNode } from "react"

import { SelectMenu } from "@/components/ui/select-menu"
import { cn } from "@/lib/utils"

const SELECTED = "bg-muted outline-2 -outline-offset-2 outline-foreground"
const IDLE = "outline-1 -outline-offset-1 outline-input hover:outline-2 hover:-outline-offset-2 hover:outline-foreground"

/** The big centred question at the top of each screen. */
function Head({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="heading-page">{title}</h1>
      {children && <p className="text-h6 leading-7 text-muted-foreground">{children}</p>}
    </div>
  )
}

/** A wide choice: words on the left, a big icon on the right (Airbnb's "What type of place will guests have?"). */
function WideTile({ on, onClick, title, icon, children }: { on: boolean; onClick: () => void; title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      className={cn("flex w-full items-center gap-6 rounded-xl p-6 text-left transition-colors", on ? SELECTED : IDLE)}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="heading-card">{title}</span>
        <span className="text-body1 leading-6 text-muted-foreground">{children}</span>
      </span>
      <span className="shrink-0 text-foreground">{icon}</span>
    </button>
  )
}

/** A square choice tile: icon on top, label under it (Airbnb's amenities picker). */
function Tile({ on, onClick, icon, label, sub }: { on: boolean; onClick: () => void; icon?: ReactNode; label: string; sub?: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      className={cn("flex min-h-[104px] flex-col items-start justify-between gap-3 rounded-xl p-4 text-left transition-colors", on ? SELECTED : IDLE)}
    >
      {icon && <span className="text-foreground">{icon}</span>}
      <span>
        <span className="block text-body1 font-semibold text-foreground">{label}</span>
        {sub && <span className="block text-body2 text-muted-foreground">{sub}</span>}
      </span>
    </button>
  )
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "h-10 rounded-full border px-4 text-body2 font-medium transition-colors",
        on ? "border-foreground bg-foreground text-white" : "border-input bg-card text-foreground hover:border-foreground",
      )}
    >
      {children}
    </button>
  )
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
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

/** Airbnb's floating-label outlined field. */
function Field({ label, helper, error, className, ...props }: ComponentProps<"input"> & { label: string; helper?: string; error?: string }) {
  const id = useId()
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={cn(
          "flex flex-col rounded-lg border px-4 pb-2.5 pt-2 focus-within:border-transparent focus-within:ring-2",
          error ? "border-destructive focus-within:ring-destructive" : "border-input focus-within:ring-foreground",
        )}
      >
        <span className="text-caption text-muted-foreground">{label}</span>
        <input id={id} {...props} className="w-full bg-transparent text-body1 text-foreground outline-none placeholder:text-muted-foreground" />
      </label>
      {(error || helper) && <p className={cn("mt-1.5 text-caption", error ? "text-destructive" : "text-muted-foreground")}>{error ?? helper}</p>}
    </div>
  )
}

function Area({ label, helper, ...props }: ComponentProps<"textarea"> & { label: string; helper?: string }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="flex flex-col rounded-lg border border-input px-4 pb-2.5 pt-2 focus-within:border-transparent focus-within:ring-2 focus-within:ring-foreground">
        <span className="text-caption text-muted-foreground">{label}</span>
        <textarea id={id} {...props} className="w-full resize-none bg-transparent text-body1 leading-6 text-foreground outline-none placeholder:text-muted-foreground" />
      </label>
      {helper && <p className="mt-1.5 text-caption text-muted-foreground">{helper}</p>}
    </div>
  )
}

function SelectField({ label, value, options, onChange, placeholder = "Choose" }: { label: string; value: string; options: readonly (string | readonly [string, string])[]; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-body2 font-semibold text-foreground">{label}</span>
      <SelectMenu
        variant="field"
        aria-label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        options={options.map((o) => (typeof o === "string" ? o : { value: o[0], label: o[1] }))}
      />
    </div>
  )
}

/**
 * A large outlined ₦ field (Airbnb's "Now, set your price", built for any size of number): a caption label, ₦ and the
 * amount with thousands separators as you type. The input fills the field and the text shrinks for long figures, so
 * ₦12,500,000 still fits.
 */
function MoneyField({ label, value, onChange, invalid, autoFocus }: { label: string; value: string; onChange: (v: string) => void; invalid?: boolean; autoFocus?: boolean }) {
  const id = useId()
  const shown = value ? Number(value).toLocaleString("en-NG") : ""
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-w-0 cursor-text flex-col gap-1 rounded-xl border px-5 py-4 transition-shadow focus-within:border-transparent focus-within:ring-2",
        invalid ? "border-destructive focus-within:ring-destructive" : "border-input focus-within:ring-foreground",
      )}
    >
      <span className="text-caption font-semibold text-muted-foreground">{label}</span>
      <span className={cn("flex min-w-0 items-baseline gap-1 font-bold tracking-tight text-foreground", shown.length > 11 ? "text-h5" : "text-h4")}>
        <span aria-hidden>₦</span>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          autoFocus={autoFocus}
          value={shown}
          placeholder="0"
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 12))}
          className="w-full min-w-0 bg-transparent tabular-nums outline-none placeholder:text-input"
        />
      </span>
    </label>
  )
}

export { Head, WideTile, Tile, Chip, Switch, Field, Area, SelectField, MoneyField }
