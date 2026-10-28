import type { ReactNode } from "react"
import { Check, Send } from "lucide-react"

import { cn } from "@/lib/utils"
import { naira, type PromotionPlanConfig } from "@/lib/mock-data"
import { channelsLine, PROMOTES_LABEL } from "./helpers"

/** A plan as the web app's Promote page shows it, Airbnb pricing style. */
function PricingCard({ plan, footer, className }: { plan: PromotionPlanConfig; footer?: ReactNode; className?: string }) {
  const perks = plan.perks.filter((p) => p.trim())
  const channels = channelsLine(plan)
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl bg-card p-7",
        plan.popular ? "border-2 border-foreground" : "border border-border",
        className,
      )}
    >
      {plan.popular && (
        <span className="absolute -top-3.5 left-7 rounded-full bg-foreground px-3 py-1 text-caption font-semibold text-white">Most popular</span>
      )}
      <div className="flex items-start justify-between gap-2">
        <p className="heading-card break-words">{plan.name || "Untitled plan"}</p>
        {!plan.active && (
          <span className="inline-flex shrink-0 items-center gap-1.5 text-body2 text-muted-foreground">
            <span className="size-2 rounded-full bg-muted-foreground/50" />
            Paused
          </span>
        )}
      </div>
      <p className="mt-0.5 text-caption text-muted-foreground">For {PROMOTES_LABEL[plan.promotes].toLowerCase()}</p>
      <p className={cn("mt-4", !plan.active && "opacity-50")}>
        <span className="text-h3 font-bold leading-none tracking-tight text-foreground">{naira(plan.price || 0)}</span>
        <span className="text-body1 text-muted-foreground">
          {" "}
          / {plan.days || 0} {plan.days === 1 ? "day" : "days"}
        </span>
      </p>
      {plan.reach && <p className="mt-2 text-body2 font-semibold text-foreground">{plan.reach}</p>}
      {(perks.length > 0 || channels) && (
        <ul className={cn("mt-6 space-y-3 border-t border-border pt-6", !plan.active && "opacity-50")}>
          {perks.map((perk, i) => (
            <li key={`${perk}-${i}`} className="flex items-start gap-3 text-body2 text-foreground">
              <Check className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} />
              {perk}
            </li>
          ))}
          {channels && (
            <li className="flex items-start gap-3 text-body2 text-foreground">
              <Send className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
              {channels}
            </li>
          )}
        </ul>
      )}
      {footer && <div className="mt-auto pt-7">{footer}</div>}
    </div>
  )
}

export { PricingCard }
