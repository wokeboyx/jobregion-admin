import { useState } from "react"

import { cn } from "@/lib/utils"
import { naira } from "@/lib/mock-data"

/**
 * Monthly revenue bars on white, Airbnb Earnings style. The shared BarChart labels its tooltip "signups" and its axis by
 * day, so money by month gets this small chart instead: one bar per month, the amount over the hovered bar.
 */
function RevenueChart({ data }: { data: { date: string; count: number }[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(...data.map((d) => d.count), 1)
  const active = hover ?? data.length - 1

  return (
    <div>
      <div className="flex h-48 items-end gap-3 border-b border-border">
        {data.map((d, i) => (
          <div
            key={d.date}
            className="relative flex h-full flex-1 flex-col items-center justify-end"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            {active === i && (
              <span className="mb-2 whitespace-nowrap text-body2 font-semibold text-foreground">{naira(d.count)}</span>
            )}
            <div
              className={cn(
                "w-full max-w-16 rounded-t-md transition-colors",
                active === i ? "bg-foreground" : "bg-muted-strong",
              )}
              style={{ height: `${Math.max((d.count / max) * 80, 2)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3">
        {data.map((d, i) => (
          <span
            key={d.date}
            className={cn("flex-1 text-center text-caption", active === i ? "font-semibold text-foreground" : "text-muted-foreground")}
          >
            {new Date(`${d.date}T00:00:00`).toLocaleDateString("en-GB", { month: "short" })}
          </span>
        ))}
      </div>
    </div>
  )
}

export { RevenueChart }
