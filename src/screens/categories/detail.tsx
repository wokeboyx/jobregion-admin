import { useMemo, useState, type ReactNode } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FolderTree, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/page-header"
import { FilterBar } from "@/components/filter-bar"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { EmptyState, ErrorState } from "@/components/page-state"
import { Pagination } from "@/components/pagination"
import { RowMenu } from "@/components/row-menu"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { BulkAction, BulkBar, Checkbox, SelectHead, SortHead } from "@/components/data-table"
import { cn } from "@/lib/utils"
import { useTable } from "@/lib/use-table"
import { usePreviewState } from "@/lib/preview-state"
import type { JobCategory, JobSubcategory } from "@/lib/mock-data"
import { SubcategoryDialog } from "./category-form"
import { CategoryIconTile, IconPicker } from "./icons"
import { CATEGORY_ICONS, textareaClass } from "./options"
import { categoryActions, subcategoryJobs, useCategories } from "./store"

type Field = "name" | "description" | "icon" | "visibility"

/**
 * Airbnb's "Personal info" row: label and current value on the left, an underlined Edit on the right. Editing opens
 * the row in place with Save and Cancel, and the other rows wait until you're done.
 */
function EditableRow({
  label,
  value,
  editing,
  locked,
  onEdit,
  onCancel,
  onSave,
  children,
}: {
  label: string
  value: ReactNode
  editing: boolean
  locked: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  children: ReactNode
}) {
  return (
    <div className={cn("border-b border-border py-6", locked && "opacity-40")}>
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-body1 font-medium text-foreground">{label}</p>
          {!editing && <div className="mt-1 text-body2 text-muted-foreground">{value}</div>}
        </div>
        <button
          type="button"
          disabled={locked}
          onClick={editing ? onCancel : onEdit}
          className="shrink-0 rounded-md px-1 text-body2 font-semibold text-foreground underline underline-offset-2 hover:bg-muted disabled:pointer-events-none"
        >
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>
      {editing && (
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            onSave()
          }}
        >
          {children}
          <Button type="submit" size="lg">
            Save
          </Button>
        </form>
      )}
    </div>
  )
}

function CategoryDetails({ category }: { category: JobCategory }) {
  const [editing, setEditing] = useState<Field | null>(null)
  const [name, setName] = useState(category.name)
  const [description, setDescription] = useState(category.description)
  const [icon, setIcon] = useState(category.icon ?? "briefcase")
  const [hidden, setHidden] = useState(!!category.hidden)

  const start = (field: Field) => {
    setName(category.name)
    setDescription(category.description)
    setIcon(category.icon ?? "briefcase")
    setHidden(!!category.hidden)
    setEditing(field)
  }
  const save = (patch: Partial<JobCategory>) => {
    categoryActions.update(category.id, patch)
    setEditing(null)
  }
  const row = (field: Field) => ({
    editing: editing === field,
    locked: editing !== null && editing !== field,
    onEdit: () => start(field),
    onCancel: () => setEditing(null),
  })

  return (
    <section>
      <h2 className="heading-section">Category details</h2>
      <p className="mt-1 text-body2 text-muted-foreground">What people see when they post or search for a job.</p>
      <div className="mt-2">
        <EditableRow label="Name" value={category.name} {...row("name")} onSave={() => name.trim() && save({ name: name.trim() })}>
          <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus aria-label="Name" />
        </EditableRow>
        <EditableRow
          label="Description"
          value={category.description || "Not added yet"}
          {...row("description")}
          onSave={() => save({ description: description.trim() })}
        >
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={120}
            aria-label="Description"
            autoFocus
            className={textareaClass}
          />
          <p className="text-caption text-muted-foreground">One line so the team knows what belongs here. {description.length}/120</p>
        </EditableRow>
        <EditableRow
          label="Icon"
          value={
            <span className="flex items-center gap-2">
              <CategoryIconTile icon={category.icon} className="size-8" />
              {CATEGORY_ICONS[category.icon ?? "briefcase"]?.label ?? "Briefcase"}
            </span>
          }
          {...row("icon")}
          onSave={() => save({ icon })}
        >
          <div className="max-w-md">
            <IconPicker value={icon} onChange={setIcon} />
          </div>
        </EditableRow>
        <EditableRow
          label="Visibility"
          value={category.hidden ? "Hidden: people can't pick it for new jobs" : "Active: people can pick it when they post a job"}
          {...row("visibility")}
          onSave={() => save({ hidden })}
        >
          <div className="space-y-2">
            {[
              { on: false, title: "Active", text: "People can pick it when they post a job." },
              { on: true, title: "Hidden", text: "Jobs already in it stay, but no one can pick it for new jobs." },
            ].map((o) => (
              <label
                key={o.title}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4",
                  hidden === o.on ? "border-foreground outline-1 outline-foreground" : "border-input hover:border-foreground",
                )}
              >
                <input type="radio" name="visibility" checked={hidden === o.on} onChange={() => setHidden(o.on)} className="mt-1 accent-foreground" />
                <span>
                  <span className="block text-body2 font-semibold text-foreground">{o.title}</span>
                  <span className="block text-body2 text-muted-foreground">{o.text}</span>
                </span>
              </label>
            ))}
          </div>
        </EditableRow>
      </div>
    </section>
  )
}

type SubDialog = { mode: "add" } | { mode: "edit"; sub: JobSubcategory }

function SubcategoriesSection({ category }: { category: JobCategory }) {
  const [search, setSearch] = useState("")
  const [dialog, setDialog] = useState<SubDialog | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null)
  const { state: previewState } = usePreviewState()

  const rows = useMemo(() => {
    if (previewState === "no-results") return []
    const q = search.trim().toLowerCase()
    if (!q) return category.subcategories
    return category.subcategories.filter((s) => `${s.name} ${s.description ?? ""}`.toLowerCase().includes(q))
  }, [category.subcategories, search, previewState])

  const t = useTable(rows, {
    getId: (s: JobSubcategory) => s.id,
    sorters: { name: (s) => s.name, jobs: (s) => s.jobCount ?? 0, status: (s) => (s.hidden ? 1 : 0) },
    pageSize: 25,
  })
  const selectedIds = t.selection.rows.map((s) => s.id)
  const hiddenCount = category.subcategories.filter((s) => s.hidden).length

  return (
    <section className="mt-4 border-t border-border pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="heading-section">Subcategories</h2>
          <p className="mt-1 text-body2 text-muted-foreground">
            {category.subcategories.length} in {category.name}
            {hiddenCount > 0 && ` · ${hiddenCount} hidden`} · {subcategoryJobs(category).toLocaleString()} jobs posted
          </p>
        </div>
        <Button variant="outline" onClick={() => setDialog({ mode: "add" })}>
          <Plus />
          Add subcategory
        </Button>
      </div>

      {category.subcategories.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={FolderTree}
            title="No subcategories yet"
            description="Add subcategories so people can say exactly what kind of work it is."
            action={<Button onClick={() => setDialog({ mode: "add" })}>Add subcategory</Button>}
          />
        </div>
      ) : (
        <>
          <div className="mb-2 mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-body2 text-muted-foreground">
              <span className="font-semibold text-foreground">{t.total.toLocaleString()}</span> {t.total === 1 ? "subcategory" : "subcategories"}
              {search && (
                <button type="button" onClick={() => setSearch("")} className="ml-3 font-semibold text-foreground underline underline-offset-2">
                  Clear search
                </button>
              )}
            </p>
            <FilterBar searchPlaceholder="Search subcategories" searchValue={search} onSearchChange={setSearch} />
          </div>

          {rows.length === 0 ? (
            <div className="border-t border-border py-16 text-center">
              <p className="heading-card">No subcategories match</p>
              <p className="mt-1 text-body2 text-muted-foreground">Try a different search.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <SelectHead all={t.selection.allOnPage} some={t.selection.someOnPage} onToggle={t.selection.togglePage} />
                  <SortHead label="Name" sortKey="name" sort={t.sort} onSort={t.toggleSort} />
                  <TableHead>Description</TableHead>
                  <SortHead label="Jobs" sortKey="jobs" sort={t.sort} onSort={t.toggleSort} align="right" />
                  <SortHead label="Status" sortKey="status" sort={t.sort} onSort={t.toggleSort} />
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {t.pagedRows.map((s) => (
                  <TableRow key={s.id} onClick={() => setDialog({ mode: "edit", sub: s })} className="cursor-pointer">
                    <TableCell>
                      <Checkbox checked={t.selection.isSelected(s.id)} onChange={() => t.selection.toggle(s.id)} label={`Select ${s.name}`} />
                    </TableCell>
                    <TableCell className={cn("whitespace-nowrap text-body2 font-semibold text-foreground", s.hidden && "opacity-60")}>{s.name}</TableCell>
                    <TableCell className="max-w-[480px]">
                      <span className="block truncate" title={s.description}>
                        {s.description || "No description yet"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-foreground">{(s.jobCount ?? 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2 whitespace-nowrap text-foreground">
                        <span className={cn("size-2 rounded-full", s.hidden ? "bg-muted-foreground/50" : "bg-success")} />
                        {s.hidden ? "Hidden" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <RowMenu
                        items={[
                          { label: "Edit", onSelect: () => setDialog({ mode: "edit", sub: s }) },
                          {
                            label: s.hidden ? "Show" : "Hide",
                            onSelect: () => categoryActions.updateSubcategories(category.id, [s.id], { hidden: !s.hidden }),
                          },
                          { label: "Delete", destructive: true, onSelect: () => setConfirmDelete([s.id]) },
                        ]}
                      />
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
            noun="subcategories"
          />
        </>
      )}

      <BulkBar count={t.selection.count} total={t.total} onSelectAll={t.selection.selectAll} onClear={t.selection.clear}>
        <BulkAction onClick={() => categoryActions.updateSubcategories(category.id, selectedIds, { hidden: true })}>Hide</BulkAction>
        <BulkAction onClick={() => categoryActions.updateSubcategories(category.id, selectedIds, { hidden: false })}>Show</BulkAction>
        <BulkAction tone="danger" onClick={() => setConfirmDelete(selectedIds)}>
          Delete
        </BulkAction>
      </BulkBar>

      {dialog && (
        <SubcategoryDialog
          initial={dialog.mode === "edit" ? { name: dialog.sub.name, description: dialog.sub.description ?? "" } : undefined}
          onClose={() => setDialog(null)}
          onSave={(draft) =>
            dialog.mode === "edit"
              ? categoryActions.updateSubcategories(category.id, [dialog.sub.id], draft)
              : categoryActions.addSubcategory(category.id, draft)
          }
        />
      )}

      <ConfirmationDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        tone="destructive"
        title={`Delete ${confirmDelete?.length === 1 ? "this subcategory" : `${confirmDelete?.length ?? 0} subcategories`}?`}
        description="People can't pick them for new jobs any more. Jobs already posted keep them. To keep them for later, hide them instead."
        confirmLabel="Delete"
        onConfirm={() => {
          if (!confirmDelete) return
          categoryActions.removeSubcategories(category.id, confirmDelete)
          t.selection.clear()
        }}
      />
    </section>
  )
}

function CategoryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const categories = useCategories()
  const category = categories.find((c) => c.id === id)
  const [deleting, setDeleting] = useState(false)
  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const back = { to: "/categories", label: "Back to categories" }

  if (!category) {
    return (
      <div>
        <PageHeader title="Category" back={back} />
        <EmptyState icon={FolderTree} title="Category not found" description="It may have been deleted, or the link is wrong." />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-4">
            <CategoryIconTile icon={category.icon} className="size-12" />
            {category.name}
          </span>
        }
        description={category.description}
        back={back}
        actions={
          <Button variant="destructive" onClick={() => setDeleting(true)}>
            Delete category
          </Button>
        }
      />

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : (
        <div className="max-w-5xl">
          <CategoryDetails key={category.id} category={category} />
          <SubcategoriesSection key={`subs-${category.id}`} category={category} />
        </div>
      )}

      <ConfirmationDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        tone="destructive"
        title={`Delete ${category.name}?`}
        description={`Its ${category.subcategories.length} subcategories go too, and people can't pick it for new jobs. Jobs already posted keep their category. To keep it for later, hide it instead.`}
        confirmLabel="Delete category"
        onConfirm={() => {
          categoryActions.remove([category.id])
          navigate("/categories")
        }}
      />
    </div>
  )
}

export default CategoryDetailPage
