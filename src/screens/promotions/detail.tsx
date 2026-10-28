import { useParams, Link } from "react-router-dom"
import { Megaphone } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Avatar } from "@/components/ui/avatar"
import { BarChart } from "@/components/bar-chart"
import { EmptyState } from "@/components/page-state"
import { cn } from "@/lib/utils"
import {
  promotions,
  getPromotionEndDate,
  getPromotionTimeRemaining,
  getPromotionStatus,
  getPromotionViewTrend,
  getPromotionPlan,
  naira,
} from "@/lib/mock-data"
import { promotionTarget, runnerOf, shortDate } from "./helpers"

/** Airbnb Earnings style number: small grey label, big bold figure. */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-body2 text-muted-foreground">{label}</p>
      <p className="mt-1 text-h3 font-bold leading-10 tracking-tight text-foreground">{value}</p>
    </div>
  )
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <p className="text-body1 text-muted-foreground">{label}</p>
      <p className="text-right text-body1 text-foreground">{value}</p>
    </div>
  )
}

function PromotionDetailPage() {
  const { id } = useParams()
  const promotion = promotions.find((p) => p.id === id)

  if (!promotion) {
    return (
      <div>
        <PageHeader title="Promotion" back={{ to: "/promotions", label: "Back to Promotions" }} />
        <EmptyState icon={Megaphone} title="Promotion not found" description="It may have been removed, or the link is wrong." />
      </div>
    )
  }

  const { status, label: statusLabel } = getPromotionStatus(promotion)
  const plan = getPromotionPlan(promotion.plan)
  const { name: runner, to: runnerTo } = runnerOf(promotion)
  const { job, label: targetLabel, to: targetTo, photo: cover } = promotionTarget(promotion)
  const trend = getPromotionViewTrend(promotion)
  const remaining = getPromotionTimeRemaining(promotion)

  return (
    <div>
      <PageHeader
        title={targetLabel}
        description={`${promotion.type} promotion · ${plan.name} plan`}
        back={{ to: "/promotions", label: "Back to Promotions" }}
      />

      <div className="relative mb-10 h-72 overflow-hidden rounded-xl bg-muted">
        <img src={cover} alt="" className="size-full object-cover" />
        <span className="absolute left-4 top-4 rounded-full bg-card/95 px-3 py-1 text-body2 font-semibold text-foreground shadow-[0_1px_4px_rgb(0_0_0/0.12)]">
          {plan.name}
        </span>
        {promotion.type === "Profile" && (
          <Avatar name={runner} className="absolute bottom-4 left-4 size-16 text-lg ring-4 ring-white" />
        )}
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <section className="pb-8">
            <h2 className="heading-section">How it's doing</h2>
            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
              <Stat label="Views" value={promotion.viewsGenerated.toLocaleString()} />
              <Stat label="Traffic growth" value={promotion.trafficGrowth} />
              <Stat label="Messages" value={promotion.messages.toLocaleString()} />
              {job ? <Stat label="Job views (lifetime)" value={job.views.toLocaleString()} /> : <Stat label="Time left" value={remaining} />}
            </div>
          </section>

          <section className="border-t border-border py-8">
            <h2 className="heading-section">Views over time</h2>
            <p className="mt-1 text-body2 text-muted-foreground">Views per day while the promotion ran.</p>
            <div className="mt-6">
              <BarChart data={trend} xLabel="Date" yLabel="Views per day" unit="views" color="var(--brand)" />
            </div>
          </section>

          <section className="border-t border-border py-8">
            <h2 className="heading-section">Run by</h2>
            {runnerTo ? (
              <Link to={runnerTo} className="mt-5 flex items-center gap-4 rounded-xl hover:opacity-80">
                <Avatar name={runner} className="size-14 text-body1" />
                <div>
                  <p className="text-body1 font-semibold text-foreground">{runner}</p>
                  <p className="text-body2 text-muted-foreground underline underline-offset-2">View profile</p>
                </div>
              </Link>
            ) : (
              <div className="mt-5 flex items-center gap-4">
                <Avatar name={runner} className="size-14 text-body1" />
                <p className="text-body1 font-semibold text-foreground">{runner}</p>
              </div>
            )}
          </section>
        </div>

        <aside>
          <div className="sticky top-28 rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <p className="heading-card">{plan.name} plan</p>
              <span className="inline-flex items-center gap-2 text-body2 text-foreground">
                <span className={cn("size-2 rounded-full", status === "success" ? "bg-success" : "bg-muted-foreground/50")} />
                {statusLabel}
              </span>
            </div>
            <p className="mt-3">
              <span className="text-h4 font-bold tracking-tight text-foreground">{naira(plan.price)}</span>
              <span className="text-muted-foreground"> paid · {plan.days} days</span>
            </p>
            <div className="mt-5 divide-y divide-border border-t border-border">
              <FactRow label="Reference" value={promotion.reference} />
              <FactRow label="Started" value={shortDate(promotion.startDate)} />
              <FactRow label="Ends" value={shortDate(getPromotionEndDate(promotion))} />
              <FactRow label="Time remaining" value={remaining} />
            </div>
            {targetTo && (
              <Link
                to={targetTo}
                className="mt-5 flex h-12 w-full items-center justify-center rounded-md border border-foreground text-body1 font-semibold text-foreground transition-colors hover:bg-muted"
              >
                {promotion.type === "Profile" ? "View profile" : "View job"}
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default PromotionDetailPage
