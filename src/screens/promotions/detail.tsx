import { useParams, Link } from "react-router-dom"

import { BackButton } from "@/components/back-button"
import { Card } from "@/components/ui/card"
import { StatusPill, OutlineBadge } from "@/components/ui/status-pill"
import { BarChart } from "@/components/bar-chart"
import {
  promotions,
  users,
  jobs,
  getPromotionEndDate,
  getPromotionTimeRemaining,
  getPromotionStatus,
  getPromotionViewTrend,
} from "@/lib/mock-data"

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{value}</p>
    </div>
  )
}

function userName(userId: string) {
  return users.find((u) => u.id === userId)?.name ?? "Unknown user"
}

function PromotionDetailPage() {
  const { id } = useParams()
  const promotion = promotions.find((p) => p.id === id)

  if (!promotion) {
    return (
      <div>
        <BackButton to="/promotions" label="Back to Promotions" />
        <p className="text-sm text-muted-foreground">Promotion not found.</p>
      </div>
    )
  }

  const job = promotion.jobId ? jobs.find((j) => j.id === promotion.jobId) : undefined
  const { status, label: statusLabel } = getPromotionStatus(promotion)
  const targetTo = promotion.type === "Profile" ? `/users/${promotion.runnerUserId}` : `/jobs/${promotion.jobId}`
  const targetLabel = promotion.type === "Profile" ? userName(promotion.runnerUserId) : (job?.title ?? "Unknown job")
  const trend = getPromotionViewTrend(promotion)

  return (
    <div className="mx-auto max-w-3xl">
      <BackButton to="/promotions" label="Back to Promotions" />

      <div className="mb-1 flex items-center gap-2">
        <OutlineBadge label={promotion.type} />
        <StatusPill status={status} label={statusLabel} />
      </div>
      <Link to={targetTo} className="text-lg font-semibold text-foreground hover:underline">
        {targetLabel}
      </Link>
      <p className="mb-6 mt-1 text-xs text-muted-foreground">
        Run by{" "}
        <Link to={`/users/${promotion.runnerUserId}`} className="font-medium text-foreground hover:underline">
          {userName(promotion.runnerUserId)}
        </Link>
      </p>

      <section className="mb-6 space-y-3">
        <p className="text-sm font-semibold text-foreground">Promotion details</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Plan" value={`${promotion.plan}-day plan`} />
          <InfoRow label="Started" value={promotion.startDate} />
          <InfoRow label="Ends" value={getPromotionEndDate(promotion)} />
          <InfoRow label="Time remaining" value={getPromotionTimeRemaining(promotion)} />
          <InfoRow label="Views generated" value={promotion.viewsGenerated.toLocaleString()} />
          <InfoRow label="Traffic growth" value={promotion.trafficGrowth} />
          {job && <InfoRow label="Job views (lifetime)" value={job.views.toLocaleString()} />}
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Views over time</p>
        <Card className="p-4">
          <BarChart data={trend} xLabel="Date" yLabel="Views per day" color="var(--brand-cta)" />
        </Card>
      </section>
    </div>
  )
}

export default PromotionDetailPage
