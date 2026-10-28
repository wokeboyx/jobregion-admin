import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Download, History, SearchX } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { FilterBar } from "@/components/filter-bar"
import { Pagination } from "@/components/pagination"
import { SortHead } from "@/components/data-table"
import { DateRangeDropdown, type CustomRange, type DatePreset } from "@/components/date-range-dropdown"
import { EmptyState, ErrorState } from "@/components/page-state"
import { useTable, type Sorters } from "@/lib/use-table"
import { usePreviewState } from "@/lib/preview-state"
import { ANCHOR_DATE, admins } from "@/lib/mock-data"
import { AUDIT_CATEGORY_LABEL, auditRows, type AuditCategory, type AuditRow } from "./generated"

const ALL_ADMINS = "All admins"
const ALL_ACTIONS = "All actions"
const ADMIN_OPTIONS = admins.map((a) => a.name)
const CATEGORY_BY_LABEL = Object.fromEntries(Object.entries(AUDIT_CATEGORY_LABEL).map(([k, l]) => [l, k])) as Record<string, AuditCategory>
const adminById = new Map(admins.map((a) => [a.id, a]))

const SORTERS: Sorters<AuditRow> = {
  time: (r) => r.timestamp,
  admin: (r) => adminById.get(r.adminId)?.name ?? "",
}

/** "2026-07-07" moved by n days. */
function shift(day: string, n: number) {
  const d = new Date(`${day}T00:00:00`)
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** The first and last day a preset covers, counted from the demo's "today". No range means all time. */
function rangeFor(preset: DatePreset, custom: CustomRange | null): [string, string] | null {
  const today = ANCHOR_DATE
  const month = today.slice(0, 7)
  switch (preset) {
    case "7d":
      return [shift(today, -6), today]
    case "14d":
      return [shift(today, -13), today]
    case "30d":
      return [shift(today, -29), today]
    case "90d":
      return [shift(today, -89), today]
    case "this_month":
      return [`${month}-01`, today]
    case "last_month": {
      const lastDay = shift(`${month}-01`, -1)
      return [`${lastDay.slice(0, 7)}-01`, lastDay]
    }
    case "custom":
      return custom ? [custom.start, custom.end] : null
  }
}

/** "2026-07-07 09:12" → "7 Jul 2026" and "09:12" */
function splitTime(ts: string) {
  const [day, time] = ts.split(" ")
  const date = new Date(`${day}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  return { date, time }
}

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function exportCsv(rows: AuditRow[]) {
  const header = ["Date and time", "Admin", "Role", "Type", "Action", "Target", "Device", "IP address"]
  const lines = rows.map((r) => {
    const admin = adminById.get(r.adminId)
    return [r.timestamp, admin?.name ?? "Unknown admin", admin?.role ?? "", AUDIT_CATEGORY_LABEL[r.category], r.action, r.target.label, r.device, r.ip]
      .map(csvCell)
      .join(",")
  })
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `audit-log-${ANCHOR_DATE}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function AuditLogPage() {
  const [search, setSearch] = useState("")
  const [admin, setAdmin] = useState(ALL_ADMINS)
  const [action, setAction] = useState(ALL_ACTIONS)
  const [preset, setPreset] = useState<DatePreset>("custom")
  const [customRange, setCustomRange] = useState<CustomRange | null>(null)

  const { state: previewState, setState: setPreviewState } = usePreviewState()

  const rows = useMemo(() => {
    if (previewState === "no-results") return []
    const query = search.trim().toLowerCase()
    const category = CATEGORY_BY_LABEL[action]
    const range = rangeFor(preset, customRange)
    return auditRows.filter((r) => {
      const actor = adminById.get(r.adminId)
      if (admin !== ALL_ADMINS && actor?.name !== admin) return false
      if (category && r.category !== category) return false
      if (range) {
        const day = r.timestamp.slice(0, 10)
        if (day < range[0] || day > range[1]) return false
      }
      if (query) {
        const haystack = `${actor?.name ?? ""} ${r.action} ${r.target.label} ${r.ip} ${r.device}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [search, admin, action, preset, customRange, previewState])

  const t = useTable(rows, { getId: (r) => r.id, sorters: SORTERS, initialSort: { key: "time", dir: "desc" }, pageSize: 50 })

  const filtered = search.trim() !== "" || admin !== ALL_ADMINS || action !== ALL_ACTIONS || rangeFor(preset, customRange) !== null
  const clearFilters = () => {
    setSearch("")
    setAdmin(ALL_ADMINS)
    setAction(ALL_ACTIONS)
    setPreset("custom")
    setCustomRange(null)
  }

  const exportRows = () => {
    // Export what's on screen: all filtered rows in the current sort, not only this page.
    const by = t.sort && SORTERS[t.sort.key]
    const dir = t.sort?.dir === "asc" ? 1 : -1
    exportCsv(by ? [...rows].sort((a, b) => String(by(a)).localeCompare(String(by(b))) * dir) : rows)
  }

  return (
    <div>
      <PageHeader
        title="Audit log"
        description="Everything admins have done: who, what, on which item, and from where."
        actions={
          previewState !== "error" && previewState !== "empty" ? (
            <Button variant="outline" onClick={exportRows} disabled={rows.length === 0}>
              <Download />
              Export CSV
            </Button>
          ) : undefined
        }
      />

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : previewState === "empty" ? (
        <EmptyState icon={History} title="No activity yet" description="When admins take actions, you’ll see them here." />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <FilterBar
              searchPlaceholder="Search by admin, action, item or IP"
              searchValue={search}
              onSearchChange={setSearch}
              filters={[
                { label: ALL_ADMINS, options: ADMIN_OPTIONS, value: admin, onChange: setAdmin },
                { label: ALL_ACTIONS, options: Object.values(AUDIT_CATEGORY_LABEL), value: action, onChange: setAction },
              ]}
            />
            <DateRangeDropdown
              preset={preset}
              customRange={customRange}
              onChange={(p, range) => {
                setPreset(p)
                setCustomRange(range ?? null)
              }}
            />
          </div>

          <div className="mb-2 flex items-center gap-3 text-body2 text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{t.total.toLocaleString()}</span> {t.total === 1 ? "entry" : "entries"}
            </span>
            {filtered && (
              <button type="button" onClick={clearFilters} className="font-semibold text-foreground underline underline-offset-2">
                Clear filters
              </button>
            )}
          </div>

          {t.total === 0 ? (
            <EmptyState icon={SearchX} title="No matching activity" description="Try another admin, type, date range or search term." />
          ) : (
            <>
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <SortHead label="Admin" sortKey="admin" sort={t.sort} onSort={t.toggleSort} className="w-[20%]" />
                    <TableHead className="w-[24%]">Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead className="w-[17%]">IP and device</TableHead>
                    <SortHead label="Date and time" sortKey="time" sort={t.sort} onSort={t.toggleSort} align="right" className="w-36" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {t.pagedRows.map((r) => {
                    const actor = adminById.get(r.adminId)
                    const name = actor?.name ?? "Unknown admin"
                    const { date, time } = splitTime(r.timestamp)
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="py-2.5">
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar name={name} className="size-8 text-caption" />
                            <div className="min-w-0">
                              <p className="truncate text-body2 font-semibold text-foreground">{name}</p>
                              {actor && <p className="truncate text-caption text-muted-foreground">{actor.role}</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <p className="truncate text-body2 text-foreground" title={r.action}>
                            {r.action}
                          </p>
                          <p className="text-caption text-muted-foreground">{AUDIT_CATEGORY_LABEL[r.category]}</p>
                        </TableCell>
                        <TableCell className="py-2.5">
                          {r.target.to ? (
                            <Link to={r.target.to} className="block truncate text-body2 font-medium text-foreground underline-offset-2 hover:underline" title={r.target.label}>
                              {r.target.label}
                            </Link>
                          ) : (
                            <p className="truncate text-body2 text-foreground" title={r.target.label}>
                              {r.target.label}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="py-2.5">
                          <p className="truncate font-mono text-caption text-foreground">{r.ip}</p>
                          <p className="truncate text-caption text-muted-foreground">{r.device}</p>
                        </TableCell>
                        <TableCell className="py-2.5 text-right">
                          <time dateTime={r.timestamp.replace(" ", "T")} className="block whitespace-nowrap text-body2 tabular-nums text-foreground">
                            {date}
                          </time>
                          <span className="text-caption tabular-nums text-muted-foreground">{time}</span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              <Pagination
                page={t.page}
                totalPages={t.totalPages}
                onPageChange={t.setPage}
                total={t.total}
                pageSize={t.pageSize}
                onPageSizeChange={t.setPageSize}
                noun="entries"
              />
            </>
          )}
        </>
      )}
    </div>
  )
}

export default AuditLogPage
