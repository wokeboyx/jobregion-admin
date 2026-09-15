import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Sparkles, Wrench, Megaphone, Briefcase } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { StatusPill } from "@/components/ui/status-pill"
import { FilterBar } from "@/components/filter-bar"
import { Pagination } from "@/components/pagination"
import { EmptyState, ErrorState } from "@/components/page-state"
import { cn } from "@/lib/utils"
import { usePagination } from "@/lib/use-pagination"
import { usePreviewState } from "@/lib/preview-state"
import { jobs, jobCategories } from "@/lib/mock-data"

function JobTypeBadge({ type }: { type: "Everyday" | "Skilled" }) {
  const Icon = type === "Skilled" ? Wrench : Sparkles
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
      <Icon className="size-3" />
      {type}
    </span>
  )
}

const TYPE_OPTIONS = ["Everyday", "Skilled"]
const CATEGORY_OPTIONS = jobCategories.map((c) => c.name)
const STATUS_OPTIONS = ["Pending Review", "Open", "Filled", "Flagged", "Removed"]

const TABS = [
  { key: "all", label: "All Jobs" },
  { key: "pending", label: "Pending Review" },
] as const

type TabKey = (typeof TABS)[number]["key"]

function JobsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>("all")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All types")
  const [categoryFilter, setCategoryFilter] = useState("All categories")
  const [statusFilter, setStatusFilter] = useState("All statuses")

  const pendingCount = useMemo(() => jobs.filter((j) => j.statusLabel === "Pending Review").length, [])

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return jobs.filter((j) => {
      if (tab === "pending" && j.statusLabel !== "Pending Review") return false
      if (typeFilter !== "All types" && j.type !== typeFilter) return false
      if (categoryFilter !== "All categories" && !j.category.startsWith(categoryFilter)) return false
      if (statusFilter !== "All statuses" && j.statusLabel !== statusFilter) return false
      if (query) {
        const haystack = `${j.title} ${j.poster}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [tab, typeFilter, categoryFilter, statusFilter, search])

  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const previewRows = useMemo(() => (previewState === "no-results" ? [] : rows), [previewState, rows])
  const { page, setPage, totalPages, pagedRows } = usePagination(previewRows)

  return (
    <div>
      <div className="mb-4 flex h-9 items-center gap-1 border-b border-border px-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "relative flex items-center gap-1.5 px-1.5 py-1 text-sm",
              tab === t.key ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {t.label}
            {t.key === "pending" && <span className="text-xs text-muted-foreground">{pendingCount}</span>}
            {tab === t.key && <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-foreground" />}
          </button>
        ))}
      </div>

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : previewState === "empty" ? (
        <EmptyState icon={Briefcase} title="No jobs yet" description="Once employers post jobs, they'll show up here." />
      ) : (
        <>
          <FilterBar
            searchPlaceholder="Search by title or poster…"
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              { label: "All types", options: TYPE_OPTIONS, value: typeFilter, onChange: setTypeFilter },
              { label: "All categories", options: CATEGORY_OPTIONS, value: categoryFilter, onChange: setCategoryFilter },
              { label: "All statuses", options: STATUS_OPTIONS, value: statusFilter, onChange: setStatusFilter },
            ]}
            className="mb-4"
          />

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Poster</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date posted</TableHead>
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.map((job) => (
                  <TableRow
                    key={job.id}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className={cn(
                      "cursor-pointer",
                      job.statusLabel === "Flagged" && "bg-destructive/5",
                      job.statusLabel === "Pending Review" && "bg-warning/5",
                      job.removed && "opacity-60",
                    )}
                  >
                    <TableCell className={cn("font-medium", job.removed && "line-through")}>
                      <div className="flex items-center gap-1.5">
                        {job.title}
                        {job.promoted && <Megaphone className="size-3.5 shrink-0 text-brand-cta" />}
                      </div>
                    </TableCell>
                    <TableCell>{job.poster}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{job.category}</TableCell>
                    <TableCell>
                      <JobTypeBadge type={job.type} />
                    </TableCell>
                    <TableCell>
                      <StatusPill status={job.status} label={job.statusLabel} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{job.datePosted}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-3 text-xs font-bold" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => navigate(`/jobs/${job.id}`)}>
                          {job.statusLabel === "Pending Review" ? "Review" : "View"}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {previewRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      No jobs match these filters.
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

export default JobsPage
