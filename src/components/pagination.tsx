import { cn } from "@/lib/utils"

function PageButton({ page, active, onSelect }: { page: number; active?: boolean; onSelect: (page: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(page)}
      className={cn(
        "flex size-10 items-center justify-center rounded-full text-sm transition-colors",
        active ? "bg-primary font-medium text-primary-foreground" : "text-[#667085] hover:bg-muted",
      )}
    >
      {page}
    </button>
  )
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const showLeadEllipsis = page > 3
  const showTrailEllipsis = page < totalPages - 2

  const middlePages =
    page <= 2
      ? [2, 3]
      : page >= totalPages - 1
        ? [totalPages - 2, totalPages - 1]
        : [page - 1, page, page + 1]

  return (
    <div className="flex items-center justify-between border-t border-border pt-3 pb-4 px-6">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-md border border-[#d0d5dd] bg-card px-3.5 py-2.5 text-sm text-[#344054] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] disabled:opacity-50"
      >
        Previous
      </button>

      <div className="flex items-center gap-0.5">
        <PageButton page={1} active={page === 1} onSelect={onPageChange} />

        {showLeadEllipsis && <span className="flex size-8 items-center justify-center text-[#667085]">···</span>}

        {middlePages
          .filter((p) => p > 1 && p < totalPages)
          .map((p) => (
            <PageButton key={p} page={p} active={p === page} onSelect={onPageChange} />
          ))}

        {showTrailEllipsis && <span className="flex size-8 items-center justify-center text-[#667085]">···</span>}

        {totalPages > 1 && <PageButton page={totalPages} active={page === totalPages} onSelect={onPageChange} />}
      </div>

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-md border border-[#d0d5dd] bg-card px-3.5 py-2.5 text-sm text-[#344054] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] disabled:opacity-50"
      >
        Next
      </button>
    </div>
  )
}

export { Pagination }
