import { useState } from "react"
import { Search } from "lucide-react"

import { SelectMenu } from "@/components/ui/select-menu"

interface FilterDef {
  label: string
  options: string[]
  value?: string
  onChange?: (value: string) => void
}

function FilterSelect({ label, options, value, onChange }: FilterDef) {
  const [own, setOwn] = useState(label)
  const current = value ?? own
  return (
    <SelectMenu
      aria-label={label}
      value={current}
      options={[label, ...options]}
      onChange={(v) => {
        setOwn(v)
        onChange?.(v)
      }}
    />
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
      <div className="relative h-9 w-[26rem] max-w-full shrink-0">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="h-9 w-full rounded-full border border-input bg-card pl-9 pr-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
        />
      </div>
      {filters.map((f) => (
        <FilterSelect key={f.label} {...f} />
      ))}
    </div>
  )
}

export { FilterBar }
