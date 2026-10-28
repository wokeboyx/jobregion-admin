import { ChevronLeft, ChevronRight } from "lucide-react"

import { SelectMenu } from "@/components/ui/select-menu"
import { cn } from "@/lib/utils"

const PAGE_SIZES = [10, 25, 50, 100]

function PageButton({ page, active, onSelect }: { page: number; active?: boolean; onSelect: (page: number) => void }) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={() => onSelect(page)}
      className={cn(
        "flex size-9 items-center justify-center rounded-full text-sm transition-colors",
        active ? "bg-foreground font-semibold text-white" : "text-foreground hover:bg-muted",
      )}
    >
      {page}
    </button>
  )
}

/**
 * Pager for long lists: "1–25 of 1,240" and rows per page on the left (when `total` is given), page numbers with
 * round ‹ › arrows on the right, like Airbnb's search results.
 */
function Pagination({
  page,
  totalPages,
  onPageChange,
  total,
  pageSize,
  onPageSizeChange,
  noun = "results",
}: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  total?: number
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  noun?: string
}) {
  const showLeadEllipsis = page > 3 && totalPages > 5
  const showTrailEllipsis = page < totalPages - 2 && totalPages > 5

  const middlePages =
    totalPages <= 5
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : page <= 2
        ? [2, 3]
        : page >= totalPages - 1
          ? [totalPages - 2, totalPages - 1]
          : [page - 1, page, page + 1]

  const from = total === undefined || pageSize === undefined ? 0 : total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = total === undefined || pageSize === undefined ? 0 : Math.min(total, page * pageSize)

  const arrow = "flex size-9 items-center justify-center rounded-full border border-input text-foreground transition-colors hover:border-foreground disabled:pointer-events-none disabled:opacity-30"

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border py-4">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {total !== undefined && pageSize !== undefined && (
          <span>
            <span className="font-semibold text-foreground">
              {from.toLocaleString()}–{to.toLocaleString()}
            </span>{" "}
            of {total.toLocaleString()} {noun}
          </span>
        )}
        {pageSize !== undefined && onPageSizeChange && (
          <span className="flex items-center gap-2">
            Rows per page
            <SelectMenu
              aria-label="Rows per page"
              value={String(pageSize)}
              onChange={(v) => onPageSizeChange(Number(v))}
              options={PAGE_SIZES.map(String)}
              menuClassName="min-w-24"
            />
          </span>
        )}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pages" className="flex items-center gap-1">
          <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onPageChange(page - 1)} className={arrow}>
            <ChevronLeft className="size-4" />
          </button>
          <PageButton page={1} active={page === 1} onSelect={onPageChange} />
          {showLeadEllipsis && <span className="flex size-9 items-center justify-center text-muted-foreground">…</span>}
          {middlePages
            .filter((p) => p > 1 && p < totalPages)
            .map((p) => (
              <PageButton key={p} page={p} active={p === page} onSelect={onPageChange} />
            ))}
          {showTrailEllipsis && <span className="flex size-9 items-center justify-center text-muted-foreground">…</span>}
          <PageButton page={totalPages} active={page === totalPages} onSelect={onPageChange} />
          <button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => onPageChange(page + 1)} className={arrow}>
            <ChevronRight className="size-4" />
          </button>
        </nav>
      )}
    </div>
  )
}

export { Pagination }
