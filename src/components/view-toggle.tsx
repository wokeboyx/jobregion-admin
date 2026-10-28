import { LayoutGrid, List } from "lucide-react"

import { cn } from "@/lib/utils"

export type View = "grid" | "list"

/** Airbnb hosting's Listings switch between photo grid and list: two round icon buttons, the current one filled grey. */
function ViewToggle({ value, onChange }: { value: View; onChange: (view: View) => void }) {
  const button = (view: View, label: string, Icon: typeof List) => (
    <button
      type="button"
      aria-label={label}
      aria-pressed={value === view}
      onClick={() => onChange(view)}
      className={cn(
        "flex size-10 items-center justify-center rounded-full transition-colors",
        value === view ? "bg-muted-strong text-foreground" : "text-foreground hover:bg-muted",
      )}
    >
      <Icon className="size-[18px]" strokeWidth={1.75} />
    </button>
  )
  return (
    <div className="ml-auto flex items-center gap-1">
      {button("list", "List view", List)}
      {button("grid", "Grid view", LayoutGrid)}
    </div>
  )
}

export { ViewToggle }
