import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { BulkAction, BulkBar, Checkbox, SelectHead, SortHead } from "@/components/data-table"
import { Pagination } from "@/components/pagination"
import { cn } from "@/lib/utils"
import { useTable } from "@/lib/use-table"
import type { NewsletterSubscriber } from "@/lib/announcements-data"
import { exportSubscribersCsv } from "./audience"

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

const SORTERS = {
  email: (s: NewsletterSubscriber) => s.email,
  source: (s: NewsletterSubscriber) => s.source,
  date: (s: NewsletterSubscriber) => s.date,
  status: (s: NewsletterSubscriber) => s.status,
}

/** Newsletter subscribers: sortable, pageable, with bulk Unsubscribe and Export. `rows` must be memoised. */
function SubscribersTable({ rows, onUnsubscribe }: { rows: NewsletterSubscriber[]; onUnsubscribe: (ids: string[]) => void }) {
  const t = useTable(rows, { getId: (s) => s.id, sorters: SORTERS, initialSort: { key: "date", dir: "desc" }, pageSize: 25 })

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <SelectHead all={t.selection.allOnPage} some={t.selection.someOnPage} onToggle={t.selection.togglePage} />
            <SortHead label="Email" sortKey="email" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Signed up from" sortKey="source" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Signed up" sortKey="date" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Status" sortKey="status" sort={t.sort} onSort={t.toggleSort} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {t.pagedRows.map((s) => {
            const on = t.selection.isSelected(s.id)
            return (
              <TableRow key={s.id} onClick={() => t.selection.toggle(s.id)} className={cn("cursor-pointer", on && "bg-muted")}>
                <TableCell className="w-12">
                  <Checkbox checked={on} onChange={() => t.selection.toggle(s.id)} label={`Select ${s.email}`} />
                </TableCell>
                <TableCell className="max-w-[360px]">
                  <p className="truncate text-body2 font-semibold text-foreground" title={s.email}>
                    {s.email}
                  </p>
                </TableCell>
                <TableCell className="text-foreground">{s.source}</TableCell>
                <TableCell className="whitespace-nowrap tabular-nums">{formatDate(s.date)}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap text-foreground">
                    <span className={cn("size-2 rounded-full", s.status === "Subscribed" ? "bg-success" : "bg-muted-foreground")} />
                    {s.status}
                  </span>
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
        noun="subscribers"
      />

      <BulkBar count={t.selection.count} total={t.total} onSelectAll={t.selection.selectAll} onClear={t.selection.clear}>
        <BulkAction onClick={() => exportSubscribersCsv(t.selection.rows)}>Export</BulkAction>
        <BulkAction
          tone="danger"
          onClick={() => {
            onUnsubscribe(t.selection.rows.map((s) => s.id))
            t.selection.clear()
          }}
        >
          Unsubscribe
        </BulkAction>
      </BulkBar>
    </>
  )
}

export { SubscribersTable }
