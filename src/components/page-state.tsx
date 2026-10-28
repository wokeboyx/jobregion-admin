import type { ComponentType, ReactNode } from "react"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-brand-cta-tint">
        <Icon className="size-6 text-brand" />
      </div>
      <div className="space-y-1">
        <p className="heading-card">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <AlertCircle className="size-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Couldn&rsquo;t load this page</p>
        <p className="text-sm text-muted-foreground">Something went wrong while fetching this data. Try again.</p>
      </div>
      <Button size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}

export { EmptyState, ErrorState }
