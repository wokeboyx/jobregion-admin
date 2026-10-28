import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plug, Plus, Search } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { PillTabs } from "@/components/pill-tabs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState, ErrorState } from "@/components/page-state"
import { BulkAction, BulkBar, Checkbox, SelectHead, SortHead } from "@/components/data-table"
import { Pagination } from "@/components/pagination"
import { SelectMenu } from "@/components/ui/select-menu"
import { usePreviewState } from "@/lib/preview-state"
import { useTable } from "@/lib/use-table"
import { CONNECTION_LABEL, hostOf, importsJobs, jobSources, publishesJobs, runSync, type JobSource, type SourceStatus } from "@/lib/job-sources"
import { ConnectSourceDialog } from "./connect-dialog"
import { SourceLogo, SourceStatusDot } from "./parts"

type TabKey = "all" | "import" | "publish"

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-body2 text-muted-foreground">{label}</p>
      <p className="text-h3 font-bold tabular-nums tracking-tight text-foreground">{value.toLocaleString()}</p>
    </div>
  )
}

function countsText(s: JobSource) {
  const parts = []
  if (importsJobs(s)) parts.push(`${s.jobsImported.toLocaleString()} pulled in`)
  if (publishesJobs(s)) parts.push(`${s.jobsPublished.toLocaleString()} published`)
  return parts.join(" · ")
}

/**
 * Job sources: sites we pull jobs in from and sites we post Jobs Region jobs out to. Earnings-style numbers on top,
 * pill tabs to split importing from publishing, and one clean row per source.
 */
function JobSourcesPage() {
  const navigate = useNavigate()
  const [list, setList] = useState<JobSource[]>(() => [...jobSources])
  const [tab, setTab] = useState<TabKey>("all")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All statuses")
  const [connectOpen, setConnectOpen] = useState(false)
  const { state: previewState, setState: setPreviewState } = usePreviewState()

  const tabs = [
    { key: "all" as const, label: "All", count: list.length },
    { key: "import" as const, label: "Importing", count: list.filter(importsJobs).length },
    { key: "publish" as const, label: "Publishing", count: list.filter(publishesJobs).length },
  ]

  const rows = useMemo(() => {
    if (previewState === "no-results") return []
    const q = search.trim().toLowerCase()
    return list.filter((s) => {
      if (tab === "import" && !importsJobs(s)) return false
      if (tab === "publish" && !publishesJobs(s)) return false
      if (statusFilter !== "All statuses" && s.status !== statusFilter) return false
      return !q || `${s.name} ${s.website}`.toLowerCase().includes(q)
    })
  }, [list, tab, search, statusFilter, previewState])

  const t = useTable(rows, {
    getId: (s) => s.id,
    sorters: {
      name: (s) => s.name,
      jobs: (s) => s.jobsImported + s.jobsPublished,
      status: (s) => s.status,
    },
    initialSort: { key: "name", dir: "asc" },
    pageSize: 25,
  })
  const filtersActive = tab !== "all" || search !== "" || statusFilter !== "All statuses"
  const clearFilters = () => {
    setTab("all")
    setSearch("")
    setStatusFilter("All statuses")
  }
  const refresh = () => setList([...jobSources])
  const bulk = (fn: (s: JobSource) => void) => {
    t.selection.rows.forEach(fn)
    t.selection.clear()
    refresh()
  }
  const setStatus = (from: SourceStatus[], to: SourceStatus) => (s: JobSource) => {
    if (from.includes(s.status)) s.status = to
  }

  const sum = (k: "importedThisWeek" | "waitingReview" | "publishedThisWeek") => list.reduce((n, s) => n + s[k], 0)

  return (
    <div>
      <PageHeader
        title="Job sources"
        description="Pull jobs in from other job sites, and send Jobs Region jobs out to them."
        actions={
          <Button onClick={() => setConnectOpen(true)}>
            <Plus /> Connect a source
          </Button>
        }
      />

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : previewState === "empty" ? (
        <EmptyState
          icon={Plug}
          title="No sources yet"
          description="Connect a job site to pull jobs in or publish ours out."
          action={<Button onClick={() => setConnectOpen(true)}>Connect a source</Button>}
        />
      ) : (
        <>
          <div className="mb-10 grid grid-cols-2 gap-6 border-b border-border pb-8 md:grid-cols-4">
            <Stat label="Jobs imported this week" value={sum("importedThisWeek")} />
            <Stat label="Waiting in review" value={sum("waitingReview")} />
            <Stat label="Published out this week" value={sum("publishedThisWeek")} />
            <Stat label="Sources with errors" value={list.filter((s) => s.status === "Error").length} />
          </div>

          <div className="mb-4 flex flex-col items-stretch gap-6">
            <PillTabs options={tabs} value={tab} onChange={setTab} />
            <div className="flex w-full flex-wrap items-center gap-2">
              <div className="relative h-10 w-[26rem] max-w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-foreground" />
                <input
                  type="search"
                  aria-label="Search sources"
                  placeholder="Search sources"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-full border border-input bg-card pl-10 pr-4 text-body2 text-foreground outline-none placeholder:text-muted-foreground hover:border-foreground focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
                />
              </div>
              <SelectMenu
                aria-label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={["All statuses", "Connected", "Paused", "Error", "Not connected"]}
              />
            </div>
          </div>

          <p className="mb-2 text-body2 text-muted-foreground">
            {t.total.toLocaleString()} source{t.total === 1 ? "" : "s"}
            {filtersActive && (
              <button type="button" onClick={clearFilters} className="ml-3 font-semibold text-foreground underline underline-offset-2">
                Clear filters
              </button>
            )}
          </p>

          {t.total === 0 ? (
            <div className="border-t border-border py-16 text-center">
              <p className="heading-card">No matching sources</p>
              <p className="mt-1 text-body2 text-muted-foreground">Try another search or tab.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <SelectHead all={t.selection.allOnPage} some={t.selection.someOnPage} onToggle={t.selection.togglePage} />
                  <SortHead label="Source" sortKey="name" sort={t.sort} onSort={t.toggleSort} />
                  <SortHead label="Status" sortKey="status" sort={t.sort} onSort={t.toggleSort} />
                  <TableHead>Last sync</TableHead>
                  <SortHead label="Jobs" sortKey="jobs" sort={t.sort} onSort={t.toggleSort} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {t.pagedRows.map((s) => (
                  <TableRow key={s.id} onClick={() => navigate(`/job-sources/${s.id}`)} className="cursor-pointer">
                    <TableCell className="w-12">
                      <Checkbox checked={t.selection.isSelected(s.id)} onChange={() => t.selection.toggle(s.id)} label={`Select ${s.name}`} />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-3">
                        <SourceLogo source={s} size="size-10" />
                        <div className="min-w-0">
                          <p title={s.name} className="max-w-72 truncate text-body2 font-semibold text-foreground">
                            {s.name}
                          </p>
                          <p className="max-w-72 truncate text-caption text-muted-foreground">
                            {CONNECTION_LABEL[s.connection]}
                            {s.website && ` · ${hostOf(s.website)}`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <SourceStatusDot status={s.status} />
                      {s.status === "Error" && (
                        <p title={s.errorMessage} className="mt-0.5 max-w-56 truncate text-caption text-destructive">
                          {s.errorMessage}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{s.lastSync}</TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums">
                      <span className="text-foreground">{countsText(s)}</span>
                      {s.waitingReview > 0 && <p className="text-caption">{s.waitingReview} waiting in review</p>}
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
            noun="sources"
          />

          <BulkBar count={t.selection.count} total={t.total} onSelectAll={t.selection.selectAll} onClear={t.selection.clear}>
            <BulkAction
              onClick={() =>
                bulk((s) => {
                  if (s.status === "Connected" || s.status === "Error") runSync(s)
                })
              }
            >
              Sync now
            </BulkAction>
            <BulkAction onClick={() => bulk(setStatus(["Connected", "Error"], "Paused"))}>Pause</BulkAction>
            <BulkAction onClick={() => bulk(setStatus(["Paused"], "Connected"))}>Resume</BulkAction>
          </BulkBar>
        </>
      )}

      <ConnectSourceDialog open={connectOpen} onClose={() => setConnectOpen(false)} onConnected={refresh} />
    </div>
  )
}

export default JobSourcesPage
