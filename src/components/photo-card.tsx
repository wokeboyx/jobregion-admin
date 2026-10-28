import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

/**
 * Airbnb's listing card: a rounded photo, a small white label over its top-left corner, then plain text under it
 * (title in semibold, one or two grey lines, and a final line in semibold). No border, no shadow.
 */
function PhotoCard({
  to,
  photo,
  badge,
  corner,
  title,
  lines = [],
  footer,
  aspect = "aspect-[20/19]",
  className,
}: {
  to: string
  photo: string
  /** White pill over the photo, e.g. "Needs review" or "Promoted". */
  badge?: ReactNode
  /** Something in the top-right corner of the photo, e.g. a status dot or a menu. */
  corner?: ReactNode
  title: ReactNode
  lines?: ReactNode[]
  footer?: ReactNode
  aspect?: string
  className?: string
}) {
  return (
    <div className={cn("group relative", className)}>
      <Link to={to} className="block">
        <div className={cn("relative overflow-hidden rounded-xl bg-muted", aspect)}>
          <img src={photo} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          {badge && (
            <span className="absolute left-3 top-3 rounded-full bg-card/95 px-3 py-1 text-body2 font-semibold text-foreground shadow-[0_1px_4px_rgb(0_0_0/0.12)]">
              {badge}
            </span>
          )}
        </div>
        <div className="mt-3 space-y-0.5">
          <p className="line-clamp-1 text-body1 font-semibold text-foreground">{title}</p>
          {lines.map((line, i) => (
            <p key={i} className="line-clamp-1 text-body1 text-muted-foreground">
              {line}
            </p>
          ))}
          {footer && <div className="pt-1 text-body1 text-foreground">{footer}</div>}
        </div>
      </Link>
      {corner && <div className="absolute right-3 top-3">{corner}</div>}
    </div>
  )
}

export { PhotoCard }
