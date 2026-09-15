import { useMemo, useState } from "react"
import { History } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Avatar } from "@/components/ui/avatar"
import { ModuleHeader } from "@/components/module-header"
import { FilterBar } from "@/components/filter-bar"
import { Pagination } from "@/components/pagination"
import { EmptyState, ErrorState } from "@/components/page-state"
import { usePagination } from "@/lib/use-pagination"
import { usePreviewState } from "@/lib/preview-state"
import { admins, auditLog } from "@/lib/mock-data"

const ADMIN_OPTIONS = admins.map((a) => a.name)

function AuditLogPage() {
  const [search, setSearch] = useState("")
  const [adminFilter, setAdminFilter] = useState("All admins")

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return auditLog.filter((entry) => {
      const actor = admins.find((a) => a.id === entry.adminId)
      if (adminFilter !== "All admins" && actor?.name !== adminFilter) return false
      if (query) {
        const haystack = `${actor?.name ?? ""} ${entry.action}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [search, adminFilter])

  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const previewRows = useMemo(() => (previewState === "no-results" ? [] : rows), [previewState, rows])
  const { page, setPage, totalPages, pagedRows } = usePagination(previewRows)

  return (
    <div>
      <ModuleHeader
        title="Audit log"
        description="Every action taken by an admin, most recent first."
      />

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : previewState === "empty" ? (
        <EmptyState
          icon={History}
          title="No log entries yet"
          description="Once admins start taking actions, they'll be recorded here."
        />
      ) : (
        <>
          <FilterBar
            searchPlaceholder="Search by admin or action…"
            searchValue={search}
            onSearchChange={setSearch}
            filters={[{ label: "All admins", options: ADMIN_OPTIONS, value: adminFilter, onChange: setAdminFilter }]}
            className="mb-4"
          />

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.map((entry) => {
                  const actor = admins.find((a) => a.id === entry.adminId)
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={actor?.name ?? "?"} />
                          <span className="font-medium text-foreground">{actor?.name ?? "Unknown admin"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{entry.action}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.timestamp}</TableCell>
                    </TableRow>
                  )
                })}

                {previewRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                      No log entries match these filters.
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

export default AuditLogPage
