import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMenuAlign } from "@/lib/use-menu-align"

export type SelectOption = string | { value: string; label: string; hint?: string }

const toOption = (o: SelectOption) => (typeof o === "string" ? { value: o, label: o } : o)

/**
 * Our own dropdown instead of the browser's <select>: a trigger button and an Airbnb-style floating list (white,
 * rounded, soft shadow) with a check on the current option. Works with the keyboard: ↑/↓ to move, Enter to pick,
 * Escape to close, and typing a letter jumps to the first option that starts with it.
 *
 * - `variant="pill"` is the round filter chip used in filter rows.
 * - `variant="field"` is the 48px outlined field used in forms and dialogs.
 */
function SelectMenu({
  value,
  onChange,
  options,
  placeholder = "Select",
  variant = "pill",
  align = "left",
  className,
  menuClassName,
  disabled,
  invalid,
  "aria-label": ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  variant?: "pill" | "field"
  align?: "left" | "right"
  className?: string
  menuClassName?: string
  disabled?: boolean
  invalid?: boolean
  "aria-label"?: string
}) {
  const items = options.map(toOption)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const { menuRef: listRef, side } = useMenuAlign<HTMLUListElement>(open, align)
  const listId = useId()
  const selected = items.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" })
  }, [open, active])

  const openMenu = () => {
    if (disabled) return
    setActive(Math.max(0, items.findIndex((o) => o.value === value)))
    setOpen(true)
  }

  const pick = (v: string) => {
    onChange(v)
    setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (disabled) return
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault()
        openMenu()
      }
      return
    }
    if (e.key === "Escape") {
      e.preventDefault()
      e.stopPropagation()
      setOpen(false)
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((i) => Math.min(items.length - 1, i + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (items[active]) pick(items[active].value)
    } else if (e.key === "Tab") {
      setOpen(false)
    } else if (e.key.length === 1) {
      const i = items.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()))
      if (i >= 0) setActive(i)
    }
  }

  return (
    <div ref={ref} className={cn("relative", variant === "field" ? "w-full" : "w-fit", className)}>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={cn(
          "flex w-full items-center justify-between gap-2 bg-card text-left text-foreground outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          variant === "pill"
            ? cn(
                "h-9 whitespace-nowrap rounded-full border px-3.5 text-sm font-medium hover:border-foreground focus-visible:ring-2 focus-visible:ring-foreground",
                open ? "border-foreground" : "border-input",
              )
            : cn(
                "h-12 rounded-md border px-4 text-sm",
                invalid ? "border-destructive" : open ? "border-transparent ring-2 ring-foreground" : "border-input",
                "focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground",
              ),
        )}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className={cn(
            "absolute top-full z-50 mt-2 max-h-80 min-w-full overflow-y-auto rounded-xl bg-card py-2 shadow-dropdown animate-[rise_.15s_ease-out]",
            variant === "pill" && "w-max min-w-56 max-w-[min(20rem,calc(100vw-1rem))]",
            side === "right" ? "right-0" : "left-0",
            menuClassName,
          )}
        >
          {items.map((o, i) => {
            const isSelected = o.value === value
            return (
              <li
                key={o.value}
                role="option"
                data-index={i}
                aria-selected={isSelected}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(o.value)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-4 px-4 py-2.5 text-sm text-foreground",
                  i === active && "bg-muted",
                  isSelected && "font-semibold",
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate">{o.label}</span>
                  {o.hint && <span className="block text-xs font-normal text-muted-foreground">{o.hint}</span>}
                </span>
                {isSelected && <Check className="size-4 shrink-0" strokeWidth={2.5} />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export { SelectMenu }
