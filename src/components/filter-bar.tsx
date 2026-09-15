import { Search, ChevronDown } from "lucide-react"

interface FilterDef {
  label: string
  options: string[]
  value?: string
  onChange?: (value: string) => void
}

function FilterSelect({ label, options, value, onChange }: FilterDef) {
  const controlled = value !== undefined
  return (
    <div className="relative h-9 w-40 shrink-0">
      <select
        value={controlled ? value : undefined}
        defaultValue={controlled ? undefined : label}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-9 w-full appearance-none rounded-md border border-border bg-card pl-2.5 pr-8 text-sm text-foreground outline-none focus-visible:border-brand-cta"
      >
        <option value={label}>{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

function FilterBar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filters = [],
  className,
}: {
  searchPlaceholder: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: FilterDef[]
  className?: string
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      <div className="relative h-9 w-80 shrink-0">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="h-9 w-full rounded-md border border-border bg-card pl-8 pr-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-brand-cta"
        />
      </div>
      {filters.map((f) => (
        <FilterSelect key={f.label} {...f} />
      ))}
    </div>
  )
}

export { FilterBar }
