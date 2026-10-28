import { cn } from "@/lib/utils"

/**
 * Text tabs for switching views within a page: the current one in bold with a black bar under it, the rest in muted
 * text. Sits on its own row above the search and filters. Use Tabs (full-width hairline) for sections of a detail page.
 */
function PillTabs<K extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: readonly { key: K; label: string; count?: number }[]
  value: K
  onChange: (key: K) => void
  className?: string
}) {
  return (
    <div role="tablist" className={cn("flex flex-wrap items-stretch gap-x-6 gap-y-1", className)}>
      {options.map((o) => {
        const on = o.key === value
        return (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.key)}
            className={cn(
              "relative flex items-center gap-1.5 pb-2 text-body2 transition-colors",
              on ? "font-semibold text-foreground" : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
            {o.count !== undefined && <span className="font-normal text-muted-foreground">({o.count})</span>}
            <span className={cn("absolute inset-x-0 -bottom-px h-0.5 bg-foreground transition-opacity", on ? "opacity-100" : "opacity-0")} />
          </button>
        )
      })}
    </div>
  )
}

export { PillTabs }
