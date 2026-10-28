import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Flag, SearchX } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { OutlineBadge } from "@/components/ui/status-pill"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { PillTabs } from "@/components/pill-tabs"
import { FilterBar } from "@/components/filter-bar"
import { Pagination } from "@/components/pagination"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { BulkAction, BulkBar, Checkbox, SelectHead, SortHead } from "@/components/data-table"
import { EmptyState, ErrorState } from "@/components/page-state"
import { useTable, type Sorters } from "@/lib/use-table"
import { usePreviewState } from "@/lib/preview-state"
import { REPORT_KIND_LABEL, type ReportKind } from "@/lib/trust-data"
import { decide, isOpen, setNavOrder, startReview, useReports, userName, type ReportRecord } from "./store"
import { ReportStatus } from "./parts"
import { formatDate } from "./format"

type TabKey = "open" | "closed" | "all"

const ALL_TYPES = "All types"
const KIND_BY_LABEL = Object.fromEntries(Object.entries(REPORT_KIND_LABEL).map(([k, l]) => [l, k])) as Record<string, ReportKind>

const SORTERS: Sorters<ReportRecord> = {
  date: (r) => r.date,
  item: (r) => r.targetLabel,
  user: (r) => userName(r.reportedUserId),
}

function ReportsPage() {
  const navigate = useNavigate()
  const all = useReports()
  const [tab, setTab] = useState<TabKey>("open")
  const [search, setSearch] = useState("")
  const [type, setType] = useState(ALL_TYPES)
  const [confirmDismiss, setConfirmDismiss] = useState(false)

  const openCount = useMemo(() => all.filter(isOpen).length, [all])

  const { state: previewState, setState: setPreviewState } = usePreviewState()

  const rows = useMemo(() => {
    if (previewState === "no-results") return []
    const query = search.trim().toLowerCase()
    const kind = KIND_BY_LABEL[type]
    return all.filter((r) => {
      if (tab === "open" && !isOpen(r)) return false
      if (tab === "closed" && isOpen(r)) return false
      if (kind && r.kind !== kind) return false
      if (query) {
        const haystack = `${r.id} ${r.targetLabel} ${r.reason} ${userName(r.reporterId)} ${userName(r.reportedUserId)}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [all, tab, search, type, previewState])

  const t = useTable(rows, { getId: (r) => r.id, sorters: SORTERS, initialSort: { key: "date", dir: "desc" } })
  const filtered = search.trim() !== "" || type !== ALL_TYPES

  const open = (id: string) => {
    // Save the order on screen so ‹ › on the report page walk the same list.
    const by = t.sort && SORTERS[t.sort.key]
    const dir = t.sort?.dir === "asc" ? 1 : -1
    const ordered = by ? [...rows].sort((a, b) => String(by(a)).localeCompare(String(by(b))) * dir) : rows
    setNavOrder(ordered.map((r) => r.id))
    navigate(`/reports/${id}`)
  }

  const selectedOpen = t.selection.rows.filter(isOpen)
  const selectedNew = t.selection.rows.filter((r) => r.state === "Received")

  const tabs = [
    { key: "open" as const, label: "Needs action", count: openCount },
    { key: "closed" as const, label: "Closed", count: all.length - openCount },
    { key: "all" as const, label: "All", count: all.length },
  ]

  return (
    <div>
      <PageHeader
        title="Reports"
        description="What people reported in the app: jobs, people, chats and reviews. Open one to check it and decide."
      />

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : previewState === "empty" ? (
        <EmptyState
          icon={Flag}
          title="No reports"
          description="When someone reports a job, a person, a chat or a review in the app, it shows up here."
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col items-stretch gap-6">
            <PillTabs options={tabs} value={tab} onChange={setTab} />
            <FilterBar
              searchPlaceholder="Search by item, reason or person"
              searchValue={search}
              onSearchChange={setSearch}
              filters={[{ label: ALL_TYPES, options: Object.values(REPORT_KIND_LABEL), value: type, onChange: setType }]}
            />
          </div>

          <div className="mb-2 flex items-center gap-3 text-body2 text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{t.total.toLocaleString()}</span> {t.total === 1 ? "report" : "reports"}
            </span>
            {filtered && (
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setType(ALL_TYPES)
                }}
                className="font-semibold text-foreground underline underline-offset-2"
              >
                Clear filters
              </button>
            )}
          </div>

          {t.total === 0 ? (
            tab === "open" && !filtered && previewState !== "no-results" ? (
              <EmptyState icon={Flag} title="You’re all caught up" description="No reports need action right now." />
            ) : (
              <EmptyState icon={SearchX} title="No matching reports" description="Try another type or search term." />
            )
          ) : (
            <>
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <SelectHead all={t.selection.allOnPage} some={t.selection.someOnPage} onToggle={t.selection.togglePage} />
                    <SortHead label="Reported item" sortKey="item" sort={t.sort} onSort={t.toggleSort} className="w-[30%]" />
                    <TableHead className="w-[22%]">Reason</TableHead>
                    <SortHead label="Reported user" sortKey="user" sort={t.sort} onSort={t.toggleSort} className="w-[17%]" />
                    <TableHead className="w-[13%]">Reported by</TableHead>
                    <SortHead label="Received" sortKey="date" sort={t.sort} onSort={t.toggleSort} className="w-28" />
                    <TableHead className="w-28">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {t.pagedRows.map((r) => (
                    <TableRow key={r.id} onClick={() => open(r.id)} className="cursor-pointer">
                      <TableCell>
                        <Checkbox checked={t.selection.isSelected(r.id)} onChange={() => t.selection.toggle(r.id)} label={`Select ${r.id}`} />
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-2.5">
                          <OutlineBadge label={REPORT_KIND_LABEL[r.kind]} className="shrink-0 text-caption" />
                          <span className={`truncate text-body2 text-foreground ${r.state === "Received" ? "font-semibold" : "font-medium"}`} title={r.targetLabel}>
                            {r.targetLabel}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="truncate text-body2" title={r.reason}>
                          {r.reason}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Avatar name={userName(r.reportedUserId)} className="size-8 text-caption" />
                          <span className="truncate text-body2 text-foreground">{userName(r.reportedUserId)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="truncate text-body2">{userName(r.reporterId)}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-body2 tabular-nums">{formatDate(r.date)}</TableCell>
                      <TableCell>
                        <ReportStatus state={r.state} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination
                page={t.page}
                totalPages={t.totalPages}
                onPageChange={t.setPage}
                total={t.total}
                pageSize={t.pageSize}
                onPageSizeChange={t.setPageSize}
                noun="reports"
              />
            </>
          )}
        </>
      )}

      <BulkBar count={t.selection.count} total={t.total} onSelectAll={t.selection.selectAll} onClear={t.selection.clear}>
        <BulkAction
          onClick={() => {
            startReview(selectedNew.map((r) => r.id))
            t.selection.clear()
          }}
        >
          Start review{selectedNew.length > 0 && ` (${selectedNew.length})`}
        </BulkAction>
        <BulkAction tone="danger" onClick={() => setConfirmDismiss(true)}>
          Dismiss{selectedOpen.length > 0 && ` (${selectedOpen.length})`}
        </BulkAction>
      </BulkBar>

      <ConfirmationDialog
        open={confirmDismiss}
        onClose={() => setConfirmDismiss(false)}
        onConfirm={() => {
          decide(
            selectedOpen.map((r) => r.id),
            { state: "Dismissed", label: "Dismissed", resolution: "No rule broken. Report dismissed." },
          )
          t.selection.clear()
        }}
        title={`Dismiss ${selectedOpen.length} ${selectedOpen.length === 1 ? "report" : "reports"}?`}
        description={
          selectedOpen.length === 0
            ? "None of the selected reports are open, so there is nothing to dismiss."
            : "They move to Closed with “No rule broken”. The people who reported them get a short update."
        }
        confirmLabel="Dismiss"
      />
    </div>
  )
}

export default ReportsPage
