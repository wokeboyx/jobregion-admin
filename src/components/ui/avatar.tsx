import { cn } from "@/lib/utils"

const PALETTE = [
  { bg: "bg-[#c2d6ff]", text: "text-primary", border: false },
  { bg: "bg-primary", text: "text-white/70", border: false },
  { bg: "bg-brand-cta", text: "text-white/80", border: false },
  { bg: "bg-[#78716c]", text: "text-white/70", border: false },
]

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")
}

function hueIndex(name: string) {
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return sum % PALETTE.length
}

function Avatar({ name, className }: { name: string; className?: string }) {
  const swatch = PALETTE[hueIndex(name)]
  return (
    <div
      data-slot="avatar"
      className={cn(
        "flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-medium uppercase",
        swatch.bg,
        swatch.text,
        swatch.border && "border border-border",
        className,
      )}
    >
      {initials(name)}
    </div>
  )
}

export { Avatar }
