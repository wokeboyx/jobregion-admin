import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-px", className)} aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn("size-3", i < rating ? "fill-foreground text-foreground" : "fill-border text-border")} />
      ))}
    </span>
  )
}
