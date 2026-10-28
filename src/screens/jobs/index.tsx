import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Briefcase, Plus, Search } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { PillTabs } from "@/components/pill-tabs"
import { PhotoCard } from "@/components/photo-card"
import { ViewToggle, type View } from "@/components/view-toggle"
import { Button } from "@/components/ui/button"
import { SelectMenu } from "@/components/ui/select-menu"
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { BulkAction, BulkBar, Checkbox, SelectHead, SortHead } from "@/components/data-table"
import { Pagination } from "@/components/pagination"
import { EmptyState, ErrorState } from "@/components/page-state"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import type { Status } from "@/components/ui/status-pill"
import { cn } from "@/lib/utils"
import { useTable } from "@/lib/use-table"
import { usePreviewState } from "@/lib/preview-state"
import { jobCategories, type JobListing } from "@/lib/mock-data"
import { jobSources, importsJobs } from "@/lib/job-sources"
import { allJobs } from "./generated"
import { jobPhoto } from "./job-photos"

const TYPE_OPTIONS = ["Everyday", "Skilled"]
const CATEGORY_OPTIONS = jobCategories.map((c) => c.name)
const STATUS_OPTIONS = ["Pending Review", "Open", "Filled", "Flagged", "Removed"]
const ON_JOBS_REGION = "Posted on Jobs Region"
const SOURCE_OPTIONS = [ON_JOBS_REGION, ...jobSources.filter(importsJobs).map((s) => s.name)]

type TabKey = "all" | "pending" | "flagged"

const DOT: Record<Status, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  neutral: "bg-muted-foreground",
}

/** Plain-words status for display ("Pending Review" reads as "Needs review", like Airbnb's action-required label). */
function statusText(job: JobListing) {
  if (job.removed) return "Removed"
  return job.statusLabel === "Pending Review" ? "Needs review" : job.statusLabel
}

function cardBadge(job: JobListing) {
  if (job.removed) return "Removed"
  if (job.statusLabel === "Pending Review") return "Needs review"
  if (job.statusLabel === "Flagged") return "Flagged"
  if (job.promoted) return "Promoted"
  return undefined
}

/** Lowest ₦ figure in the budget text, for sorting. */
function budgetValue(job: JobListing) {
  const m = job.budget.replace(/,/g, "").match(/\d+/)
  return m ? Number(m[0]) : 0
}

function StatusDot({ job }: { job: JobListing }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-body2 text-foreground">
      <span className={cn("size-2 rounded-full", DOT[job.removed ? "destructive" : job.status])} />
      {statusText(job)}
    </span>
  )
}

function PillSelect({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <SelectMenu
      variant="pill"
      aria-label={label}
      value={value}
      onChange={onChange}
      align="right"
      options={[label, ...options].map((o) => ({ value: o, label: o === "Pending Review" ? "Needs review" : o }))}
    />
  )
}

/**
 * Jobs, built for thousands of rows: one toolbar (status tabs, search, filter pills, view toggle), a result count with
 * "Clear filters", a dense sortable table with row checkboxes and bulk Approve / Flag / Remove, and paging with totals.
 * The hand-written jobs come first, then ~200 generated ones (screens/jobs/generated.ts); all rows open their detail page.
 */
function JobsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>("all")
  const [view, setView] = useState<View>("list")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All types")
  const [categoryFilter, setCategoryFilter] = useState("All categories")
  const [statusFilter, setStatusFilter] = useState("All statuses")
  const [sourceFilter, setSourceFilter] = useState("All sources")
  const [version, setVersion] = useState(0)
  const [removeOpen, setRemoveOpen] = useState(false)

  // `version` changes after a bulk action so the mutated mock rows are read again.
  const all = useMemo(() => {
    void version
    return allJobs()
  }, [version])

  const pendingCount = all.filter((j) => j.statusLabel === "Pending Review" && !j.removed).length
  const flaggedCount = all.filter((j) => j.statusLabel === "Flagged" && !j.removed).length
  const tabs = [
    { key: "all" as const, label: "All jobs", count: all.length },
    { key: "pending" as const, label: "Needs review", count: pendingCount },
    { key: "flagged" as const, label: "Flagged", count: flaggedCount },
  ]

  const { state: previewState, setState: setPreviewState } = usePreviewState()

  const rows = useMemo(() => {
    if (previewState === "no-results") return []
    const query = search.trim().toLowerCase()
    return all.filter((j) => {
      if (tab === "pending" && (j.statusLabel !== "Pending Review" || j.removed)) return false
      if (tab === "flagged" && (j.statusLabel !== "Flagged" || j.removed)) return false
      if (typeFilter !== "All types" && j.type !== typeFilter) return false
      if (categoryFilter !== "All categories" && !j.category.startsWith(categoryFilter)) return false
      if (statusFilter !== "All statuses" && j.statusLabel !== statusFilter) return false
      if (sourceFilter === ON_JOBS_REGION && j.source) return false
      if (sourceFilter !== "All sources" && sourceFilter !== ON_JOBS_REGION && j.source !== sourceFilter) return false
      if (query && !`${j.title} ${j.poster} ${j.id}`.toLowerCase().includes(query)) return false
      return true
    })
  }, [all, tab, typeFilter, categoryFilter, statusFilter, sourceFilter, search, previewState])

  const t = useTable(rows, {
    getId: (j) => j.id,
    sorters: {
      title: (j) => j.title,
      poster: (j) => j.poster,
      budget: budgetValue,
      views: (j) => j.views,
      posted: (j) => j.datePosted,
      status: statusText,
    },
    initialSort: { key: "posted", dir: "desc" },
    pageSize: 25,
  })

  const filtersActive =
    tab !== "all" ||
    search !== "" ||
    typeFilter !== "All types" ||
    categoryFilter !== "All categories" ||
    statusFilter !== "All statuses" ||
    sourceFilter !== "All sources"
  const clearFilters = () => {
    setTab("all")
    setSearch("")
    setTypeFilter("All types")
    setCategoryFilter("All categories")
    setStatusFilter("All statuses")
    setSourceFilter("All sources")
  }

  const selected = t.selection.rows
  const pendingSelected = selected.filter((j) => j.statusLabel === "Pending Review" && !j.removed)
  const apply = (list: JobListing[], patch: Partial<JobListing>) => {
    list.forEach((j) => Object.assign(j, patch))
    t.selection.clear()
    setVersion((v) => v + 1)
  }

  return (
    <div>
      <PageHeader
        title="Jobs"
        description="Every job on Jobs Region, posted here or imported from job sources. Review new listings and act on reported ones."
        actions={
          <Button onClick={() => navigate("/jobs/new")}>
            <Plus /> Post a job
          </Button>
        }
      />

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : previewState === "empty" ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs yet"
          description="Once employers post jobs, they'll show up here."
          action={<Button onClick={() => navigate("/jobs/new")}>Post a job</Button>}
        />
      ) : (
        <>
          <div className="mb-3 flex flex-col items-stretch gap-6">
            <PillTabs options={tabs} value={tab} onChange={setTab} />
            <div className="flex w-full flex-wrap items-center gap-2">
              <div className="relative h-10 w-[26rem] max-w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-foreground" />
                <input
                  type="search"
                  aria-label="Search jobs"
                  placeholder="Search title, poster or ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-full border border-input bg-card pl-10 pr-4 text-body2 text-foreground outline-none placeholder:text-muted-foreground hover:border-foreground focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
                />
              </div>
              <PillSelect label="All types" options={TYPE_OPTIONS} value={typeFilter} onChange={setTypeFilter} />
              <PillSelect label="All categories" options={CATEGORY_OPTIONS} value={categoryFilter} onChange={setCategoryFilter} />
              <PillSelect label="All statuses" options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
              <PillSelect label="All sources" options={SOURCE_OPTIONS} value={sourceFilter} onChange={setSourceFilter} />
              <ViewToggle value={view} onChange={setView} />
            </div>
          </div>

          <p className="mb-2 text-body2 text-muted-foreground">
            <span className="font-semibold text-foreground">{t.total.toLocaleString()}</span> job{t.total === 1 ? "" : "s"}
            {filtersActive && (
              <button type="button" onClick={clearFilters} className="ml-3 font-semibold text-foreground underline underline-offset-2">
                Clear filters
              </button>
            )}
          </p>

          {t.total === 0 ? (
            <div className="border-t border-border py-16 text-center">
              <p className="heading-card">No matching jobs</p>
              <p className="mt-1 text-body2 text-muted-foreground">Try changing or removing some of your filters.</p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-border pt-6 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {t.pagedRows.map((job) => (
                <PhotoCard
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  photo={jobPhoto(job)}
                  badge={cardBadge(job)}
                  title={job.title}
                  lines={[job.source ? `Imported · ${job.source}` : job.category, job.location]}
                  footer={<span className="font-semibold">{job.budget}</span>}
                  className={cn(job.removed && "opacity-60")}
                />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <SelectHead all={t.selection.allOnPage} some={t.selection.someOnPage} onToggle={t.selection.togglePage} />
                  <SortHead label="Job" sortKey="title" sort={t.sort} onSort={t.toggleSort} />
                  <SortHead label="Poster" sortKey="poster" sort={t.sort} onSort={t.toggleSort} />
                  <SortHead label="Budget" sortKey="budget" sort={t.sort} onSort={t.toggleSort} align="right" />
                  <SortHead label="Posted" sortKey="posted" sort={t.sort} onSort={t.toggleSort} />
                  <SortHead label="Status" sortKey="status" sort={t.sort} onSort={t.toggleSort} className="last:pr-0" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {t.pagedRows.map((job) => (
                  <TableRow
                    key={job.id}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className={cn("cursor-pointer", job.removed && "opacity-60", t.selection.isSelected(job.id) && "bg-muted")}
                  >
                    <TableCell className="w-12">
                      <Checkbox checked={t.selection.isSelected(job.id)} onChange={() => t.selection.toggle(job.id)} label={`Select ${job.title}`} />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-3">
                        <img src={jobPhoto(job)} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p title={job.title} className={cn("max-w-64 truncate text-body2 font-semibold text-foreground", job.removed && "line-through")}>
                            {job.title}
                          </p>
                          <p className="max-w-64 truncate text-caption text-muted-foreground">
                            {job.category}
                            {job.promoted && " · Promoted"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p title={job.poster} className="max-w-28 truncate text-foreground">
                        {job.poster}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums text-foreground">{job.budget}</TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">{job.datePosted}</TableCell>
                    <TableCell className="last:pr-0">
                      <StatusDot job={job} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Pagination
            page={t.page}
            totalPages={t.totalPages}
            onPageChange={t.setPage}
            total={t.total}
            pageSize={t.pageSize}
            onPageSizeChange={t.setPageSize}
            noun="jobs"
          />

          <BulkBar count={t.selection.count} total={t.total} onSelectAll={t.selection.selectAll} onClear={t.selection.clear}>
            {pendingSelected.length > 0 && (
              <BulkAction onClick={() => apply(pendingSelected, { status: "success", statusLabel: "Open" })}>Approve {pendingSelected.length}</BulkAction>
            )}
            <BulkAction onClick={() => apply(selected.filter((j) => !j.removed), { status: "destructive", statusLabel: "Flagged" })}>Flag</BulkAction>
            <BulkAction tone="danger" onClick={() => setRemoveOpen(true)}>
              Remove
            </BulkAction>
          </BulkBar>

          <ConfirmationDialog
            open={removeOpen}
            onClose={() => setRemoveOpen(false)}
            onConfirm={() => apply(selected, { removed: true, status: "destructive", statusLabel: "Removed" })}
            tone="destructive"
            title={`Remove ${t.selection.count.toLocaleString()} job${t.selection.count === 1 ? "" : "s"}?`}
            description="They come off Jobs Region and posters are notified. This can't be undone."
            confirmLabel="Remove"
          />
        </>
      )}
    </div>
  )
}

export default JobsPage
