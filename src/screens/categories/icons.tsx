import { createElement } from "react"

import { cn } from "@/lib/utils"
import { CATEGORY_ICONS, categoryIcon } from "./options"

/** The icon in a 40px rounded tile, used at the start of table rows and in the page header row. */
export function CategoryIconTile({ icon, className }: { icon?: string; className?: string }) {
  return (
    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground", className)}>
      {createElement(categoryIcon(icon), { className: "size-5", strokeWidth: 1.75 })}
    </span>
  )
}

/** A grid of icon buttons; the chosen one gets a black ring, like Airbnb's amenity picker. */
export function IconPicker({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  return (
    <div role="radiogroup" aria-label="Icon" className="grid grid-cols-7 gap-2">
      {Object.entries(CATEGORY_ICONS).map(([key, { icon: Icon, label }]) => {
        const on = key === value
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={label}
            title={label}
            onClick={() => onChange(key)}
            className={cn(
              "flex aspect-square items-center justify-center rounded-lg border transition-colors",
              on ? "border-foreground bg-muted outline-1 outline-foreground" : "border-input hover:border-foreground",
            )}
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </button>
        )
      })}
    </div>
  )
}
