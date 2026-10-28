import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft } from "lucide-react"

/**
 * The top of every page, Airbnb hosting style: a big bold title (30px), an optional line under it, and the page's
 * actions on the right as round icon buttons or one black button. Detail pages pass `back` for the round ‹ button.
 */
function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  back?: { to: string; label: string }
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        {back && (
          <Link
            to={back.to}
            aria-label={back.label}
            className="-ml-1 mb-5 flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-shadow hover:shadow-[0_2px_4px_rgb(0_0_0/0.18)]"
          >
            <ChevronLeft className="size-4" strokeWidth={2.5} />
          </Link>
        )}
        <h1 className="heading-page">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-base text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export { PageHeader }
