import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Megaphone } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { StatusPill, OutlineBadge } from "@/components/ui/status-pill"
import { FilterBar } from "@/components/filter-bar"
import { Pagination } from "@/components/pagination"
import { EmptyState, ErrorState } from "@/components/page-state"
import { usePagination } from "@/lib/use-pagination"
import { usePreviewState } from "@/lib/preview-state"
import {
  promotions,
  users,
  jobs,
  getPromotionEndDate,
  getPromotionTimeRemaining,
  getPromotionStatus,
} from "@/lib/mock-data"

const TYPE_OPTIONS = ["Profile", "Job"]
const STATUS_OPTIONS = ["Active", "Ended"]

function userName(userId: string) {
  return users.find((u) => u.id === userId)?.name ?? "Unknown user"
}

function PromotionsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All types")
  const [statusFilter, setStatusFilter] = useState("All statuses")

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return promotions.filter((p) => {
      if (typeFilter !== "All types" && p.type !== typeFilter) return false
      const { label: statusLabel } = getPromotionStatus(p)
      if (statusFilter !== "All statuses" && statusLabel !== statusFilter) return false
      if (query) {
        const job = p.jobId ? jobs.find((j) => j.id === p.jobId) : undefined
        const haystack = `${userName(p.runnerUserId)} ${job?.title ?? ""}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [search, typeFilter, statusFilter])

  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const previewRows = useMemo(() => (previewState === "no-results" ? [] : rows), [previewState, rows])
  const { page, setPage, totalPages, pagedRows } = usePagination(previewRows)

  return (
    <div>
      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : previewState === "empty" ? (
        <EmptyState
          icon={Megaphone}
          title="No promotions yet"
          description="When a worker or employer boosts a profile or job, it'll show up here."
        />
      ) : (
        <>
          <FilterBar
            searchPlaceholder="Search by user or job title…"
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              { label: "All types", options: TYPE_OPTIONS, value: typeFilter, onChange: setTypeFilter },
              { label: "All statuses", options: STATUS_OPTIONS, value: statusFilter, onChange: setStatusFilter },
            ]}
            className="mb-4"
          />

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Promoted</TableHead>
                  <TableHead>Run by</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Time remaining</TableHead>
                  <TableHead className="text-right">Views generated</TableHead>
                  <TableHead>Traffic growth</TableHead>
                  <TableHead className="text-right">Job views</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.map((p) => {
                  const job = p.jobId ? jobs.find((j) => j.id === p.jobId) : undefined
                  const { status, label: statusLabel } = getPromotionStatus(p)
                  const targetTo = p.type === "Profile" ? `/users/${p.runnerUserId}` : `/jobs/${p.jobId}`
                  const targetLabel = p.type === "Profile" ? userName(p.runnerUserId) : (job?.title ?? "Unknown job")

                  return (
                    <TableRow key={p.id} onClick={() => navigate(`/promotions/${p.id}`)} className="cursor-pointer">
                      <TableCell>
                        <OutlineBadge label={p.type} />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Link to={targetTo} className="font-medium text-foreground hover:underline">
                          {targetLabel}
                        </Link>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Link to={`/users/${p.runnerUserId}`} className="text-foreground hover:underline">
                          {userName(p.runnerUserId)}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.plan}-day plan</TableCell>
                      <TableCell className="text-muted-foreground">{p.startDate}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {getPromotionTimeRemaining(p)}
                        <span className="block text-xs text-muted-foreground/70">Ends {getPromotionEndDate(p)}</span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {p.viewsGenerated.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-success">{p.trafficGrowth}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {job ? job.views.toLocaleString() : "—"}
                      </TableCell>
                      <TableCell>
                        <StatusPill status={status} label={statusLabel} />
                      </TableCell>
                    </TableRow>
                  )
                })}

                {previewRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                      No promotions match these filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <div className="mt-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  )
}

export default PromotionsPage
