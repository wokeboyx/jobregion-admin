import { cn } from "@/lib/utils"

/** Underlined tabs, like the web app's top navigation: the current one in bold with a black bar under it. */
function Tabs<K extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: readonly { key: K; label: string; count?: number }[]
  value: K
  onChange: (key: K) => void
  className?: string
}) {
  return (
    <div role="tablist" className={cn("mb-6 flex items-stretch gap-7 border-b border-border", className)}>
      {tabs.map((t) => {
        const on = t.key === value
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.key)}
            className={cn(
              "relative flex items-center gap-1.5 pb-3 text-body1 transition-colors",
              on ? "font-semibold text-foreground" : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {!!t.count && (
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-caption font-bold text-white">
                {t.count}
              </span>
            )}
            <span className={cn("absolute inset-x-0 -bottom-px h-0.5 bg-foreground transition-opacity", on ? "opacity-100" : "opacity-0")} />
          </button>
        )
      })}
    </div>
  )
}

export { Tabs }
