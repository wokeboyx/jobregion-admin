import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FolderTree } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { PillTabs } from "@/components/pill-tabs"
import { FilterBar } from "@/components/filter-bar"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { EmptyState, ErrorState } from "@/components/page-state"
import { Pagination } from "@/components/pagination"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { BulkAction, BulkBar, Checkbox, SelectHead, SortHead } from "@/components/data-table"
import { cn } from "@/lib/utils"
import { useTable } from "@/lib/use-table"
import { usePreviewState } from "@/lib/preview-state"
import type { JobCategory } from "@/lib/mock-data"
import { AddCategoryDialog } from "./category-form"
import { CategoryIconTile } from "./icons"
import { categoryActions, subcategoryJobs, useCategories } from "./store"

type StatusKey = "all" | "active" | "hidden"

function CategoryStatus({ hidden }: { hidden?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-body2 text-foreground">
      <span className={cn("size-2 rounded-full", hidden ? "bg-muted-foreground/50" : "bg-success")} />
      {hidden ? "Hidden" : "Active"}
    </span>
  )
}

function CategoriesPage() {
  const navigate = useNavigate()
  const categories = useCategories()
  const [status, setStatus] = useState<StatusKey>("all")
  const [search, setSearch] = useState("")
  const [adding, setAdding] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null)

  const searched = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) =>
      `${c.name} ${c.description} ${c.subcategories.map((s) => s.name).join(" ")}`.toLowerCase().includes(q),
    )
  }, [categories, search])

  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const rows = useMemo(() => {
    if (previewState === "no-results") return []
    return searched.filter((c) => (status === "all" ? true : status === "hidden" ? c.hidden : !c.hidden))
  }, [searched, status, previewState])

  const t = useTable(rows, {
    getId: (c: JobCategory) => c.id,
    sorters: {
      name: (c) => c.name,
      subcategories: (c) => c.subcategories.length,
      jobs: (c) => subcategoryJobs(c),
      updated: (c) => c.updated ?? "",
    },
    pageSize: 25,
  })

  const tabs = [
    { key: "all" as const, label: "All", count: searched.length },
    { key: "active" as const, label: "Active", count: searched.filter((c) => !c.hidden).length },
    { key: "hidden" as const, label: "Hidden", count: searched.filter((c) => c.hidden).length },
  ]
  const filtered = search.trim() !== "" || status !== "all"
  const selectedIds = t.selection.rows.map((c) => c.id)

  const header = (
    <PageHeader
      title="Categories"
      description="What people pick when they post a job. Open a category to manage its subcategories."
      actions={<Button onClick={() => setAdding(true)}>Add category</Button>}
    />
  )

  if (previewState === "error")
    return (
      <div>
        {header}
        <ErrorState onRetry={() => setPreviewState("default")} />
      </div>
    )

  if (previewState === "empty" || categories.length === 0)
    return (
      <div>
        {header}
        <EmptyState
          icon={FolderTree}
          title="No categories yet"
          description="Add a category so people can file their jobs under it."
          action={<Button onClick={() => setAdding(true)}>Add category</Button>}
        />
        {adding && <AddCategoryDialog onClose={() => setAdding(false)} onSave={(d) => navigate(`/categories/${categoryActions.add(d)}`)} />}
      </div>
    )

  return (
    <div>
      {header}

      <div className="mb-6 flex flex-col items-stretch gap-6">
        <PillTabs options={tabs} value={status} onChange={setStatus} />
        <FilterBar searchPlaceholder="Search categories and subcategories" searchValue={search} onSearchChange={setSearch} />
      </div>

      <div className="mb-2 flex items-center gap-3 text-body2 text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{t.total.toLocaleString()}</span> {t.total === 1 ? "category" : "categories"}
        </span>
        {filtered && (
          <button
            type="button"
            onClick={() => {
              setSearch("")
              setStatus("all")
            }}
            className="font-semibold text-foreground underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="border-t border-border py-16 text-center">
          <p className="heading-card">No categories match</p>
          <p className="mt-1 text-body2 text-muted-foreground">Try a different search or show all categories.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SelectHead all={t.selection.allOnPage} some={t.selection.someOnPage} onToggle={t.selection.togglePage} />
              <SortHead label="Category" sortKey="name" sort={t.sort} onSort={t.toggleSort} />
              <TableHead>Description</TableHead>
              <SortHead label="Subcategories" sortKey="subcategories" sort={t.sort} onSort={t.toggleSort} align="right" />
              <SortHead label="Jobs" sortKey="jobs" sort={t.sort} onSort={t.toggleSort} align="right" />
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {t.pagedRows.map((c) => (
              <TableRow key={c.id} onClick={() => navigate(`/categories/${c.id}`)} className="cursor-pointer">
                <TableCell>
                  <Checkbox checked={t.selection.isSelected(c.id)} onChange={() => t.selection.toggle(c.id)} label={`Select ${c.name}`} />
                </TableCell>
                <TableCell>
                  <div className={cn("flex items-center gap-3", c.hidden && "opacity-60")}>
                    <CategoryIconTile icon={c.icon} />
                    <span className="whitespace-nowrap text-body2 font-semibold text-foreground">{c.name}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[260px]">
                  <span className="block truncate text-body2" title={c.description}>
                    {c.description || "No description yet"}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums text-foreground">{c.subcategories.length}</TableCell>
                <TableCell className="text-right tabular-nums text-foreground">{subcategoryJobs(c).toLocaleString()}</TableCell>
                <TableCell>
                  <CategoryStatus hidden={c.hidden} />
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
        noun="categories"
      />

      <BulkBar count={t.selection.count} total={t.total} onSelectAll={t.selection.selectAll} onClear={t.selection.clear}>
        <BulkAction onClick={() => categoryActions.setHidden(selectedIds, true)}>Hide</BulkAction>
        <BulkAction onClick={() => categoryActions.setHidden(selectedIds, false)}>Show</BulkAction>
        <BulkAction tone="danger" onClick={() => setConfirmDelete(selectedIds)}>
          Delete
        </BulkAction>
      </BulkBar>

      {adding && <AddCategoryDialog onClose={() => setAdding(false)} onSave={(d) => navigate(`/categories/${categoryActions.add(d)}`)} />}

      <ConfirmationDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        tone="destructive"
        title={`Delete ${confirmDelete?.length === 1 ? "this category" : `${confirmDelete?.length ?? 0} categories`}?`}
        description="Their subcategories go too, and people can't pick them for new jobs. Jobs already posted keep their category. To keep them for later, hide them instead."
        confirmLabel="Delete"
        onConfirm={() => {
          if (!confirmDelete) return
          categoryActions.remove(confirmDelete)
          t.selection.clear()
        }}
      />
    </div>
  )
}

export default CategoriesPage
