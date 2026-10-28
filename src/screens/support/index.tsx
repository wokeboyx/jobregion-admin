import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LifeBuoy, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import type { Status } from "@/components/ui/status-pill"
import { PageHeader } from "@/components/page-header"
import { PillTabs } from "@/components/pill-tabs"
import { FilterBar } from "@/components/filter-bar"
import { RowMenu } from "@/components/row-menu"
import { Pagination } from "@/components/pagination"
import { BulkAction, BulkBar, Checkbox, SelectHead, SortHead } from "@/components/data-table"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { FormDialog, FormField } from "@/components/form-dialog"
import { EmptyState, ErrorState } from "@/components/page-state"
import { cn } from "@/lib/utils"
import { useTable, type Sorters } from "@/lib/use-table"
import { usePreviewState } from "@/lib/preview-state"
import { helpCategories, type HelpArticle, type HelpCategory } from "./generated"

const DOT: Record<Status, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  neutral: "bg-muted-foreground",
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "Published", label: "Published" },
  { key: "Draft", label: "Drafts" },
] as const

type StatusKey = (typeof STATUS_TABS)[number]["key"]

const ALL = "all"

interface Row {
  article: HelpArticle
  category: HelpCategory
}

const SORTERS: Sorters<Row> = {
  title: (r) => r.article.title,
  category: (r) => r.category.name,
  status: (r) => r.article.statusLabel,
  updated: (r) => r.article.updated,
  views: (r) => r.article.views,
}

const PUBLISHED = { status: "success" as Status, statusLabel: "Published" }
const DRAFT = { status: "warning" as Status, statusLabel: "Draft" }

function StatusDot({ status, label }: { status: Status; label: string }) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap text-body2 text-foreground">
      <span className={cn("size-2 rounded-full", DOT[status])} />
      {label}
    </span>
  )
}

function CategoryButton({
  label,
  count,
  active,
  inactive,
  onSelect,
}: {
  label: string
  count: number
  active: boolean
  inactive?: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-current={active ? "true" : undefined}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted",
        active && "bg-muted",
      )}
    >
      <span className="min-w-0">
        <span className={cn("block truncate text-body2", active ? "font-semibold text-foreground" : "text-foreground")} title={label}>
          {label}
        </span>
        {inactive && <span className="block text-caption text-muted-foreground">Hidden from the Help Center</span>}
      </span>
      <span className="shrink-0 text-caption tabular-nums text-muted-foreground">{count.toLocaleString()}</span>
    </button>
  )
}

function SupportPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<HelpCategory[]>(() => [...helpCategories])
  const [categoryId, setCategoryId] = useState<string>(ALL)
  const [statusTab, setStatusTab] = useState<StatusKey>("all")
  const [search, setSearch] = useState("")

  const [categoryDialog, setCategoryDialog] = useState<{ mode: "add" } | { mode: "edit"; id: string } | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false)
  const [deleteArticlesOpen, setDeleteArticlesOpen] = useState(false)

  /** Writes go to the shared store first so the article editor sees the same data, then we re-render from it. */
  const commit = () => setCategories([...helpCategories])

  const selectedCategory = categories.find((c) => c.id === categoryId) ?? null

  const allRows = useMemo(() => categories.flatMap((category) => category.articles.map((article) => ({ article, category }))), [categories])
  const scopeRows = useMemo(
    () => (selectedCategory ? allRows.filter((r) => r.category.id === selectedCategory.id) : allRows),
    [allRows, selectedCategory],
  )

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return scopeRows.filter(({ article }) => {
      if (statusTab !== "all" && article.statusLabel !== statusTab) return false
      if (query && !`${article.title} ${article.author}`.toLowerCase().includes(query)) return false
      return true
    })
  }, [scopeRows, search, statusTab])

  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const previewRows = useMemo(() => (previewState === "no-results" ? [] : rows), [previewState, rows])
  const t = useTable(previewRows, {
    getId: (r) => r.article.id,
    sorters: SORTERS,
    initialSort: { key: "updated", dir: "desc" },
    pageSize: 25,
  })

  const tabOptions = STATUS_TABS.map((s) => ({
    ...s,
    count: s.key === "all" ? scopeRows.length : scopeRows.filter((r) => r.article.statusLabel === s.key).length,
  }))

  const filtersActive = statusTab !== "all" || search !== ""
  const clearFilters = () => {
    setStatusTab("all")
    setSearch("")
  }

  const selectCategory = (id: string) => {
    setCategoryId(id)
    t.selection.clear()
  }

  const setStatus = (articles: HelpArticle[], next: typeof PUBLISHED) => {
    articles.forEach((a) => Object.assign(a, next))
    commit()
  }

  const deleteArticles = (ids: Set<string>) => {
    helpCategories.forEach((c) => {
      c.articles = c.articles.filter((a) => !ids.has(a.id))
    })
    commit()
  }

  const selectedArticles = t.selection.rows.map((r) => r.article)
  const bulk = (fn: () => void) => {
    fn()
    t.selection.clear()
  }

  const openCategoryDialog = (mode: "add" | "edit") => {
    if (mode === "edit" && selectedCategory) {
      setCategoryName(selectedCategory.name)
      setCategoryDialog({ mode: "edit", id: selectedCategory.id })
    } else {
      setCategoryName("")
      setCategoryDialog({ mode: "add" })
    }
  }

  const saveCategory = () => {
    const name = categoryName.trim()
    if (!name || !categoryDialog) return
    if (categoryDialog.mode === "edit") {
      const cat = helpCategories.find((c) => c.id === categoryDialog.id)
      if (cat) cat.name = name
    } else {
      const id = `SC-${Date.now()}`
      helpCategories.push({ id, name, active: true, articles: [] })
      setCategoryId(id)
    }
    commit()
  }

  const toggleCategoryActive = () => {
    const cat = helpCategories.find((c) => c.id === categoryId)
    if (!cat) return
    cat.active = !cat.active
    commit()
  }

  const deleteCategory = () => {
    if (!selectedCategory) return
    const index = helpCategories.findIndex((c) => c.id === selectedCategory.id)
    if (index !== -1) helpCategories.splice(index, 1)
    setCategoryId(ALL)
    commit()
  }

  const writeArticle = () =>
    navigate("/support/articles/new", { state: { categoryId: selectedCategory?.id ?? categories[0]?.id } })

  const addCategoryButton = (
    <Button variant="outline" onClick={() => openCategoryDialog("add")}>
      Add category
    </Button>
  )

  const totalArticles = allRows.length
  const scopePublished = tabOptions.find((o) => o.key === "Published")?.count ?? 0
  const selectedCount = t.selection.count

  return (
    <div>
      <PageHeader
        title="Help Center"
        description="Answers and how-tos people see in the Jobs Region Help Center on web and mobile."
        actions={
          <>
            {addCategoryButton}
            <Button onClick={writeArticle}>Write article</Button>
          </>
        }
      />

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : previewState === "empty" || categories.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No categories yet"
          description="Create a category to start organising Help Center articles."
          action={<Button onClick={() => openCategoryDialog("add")}>Add category</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
          <nav aria-label="Categories">
            <div className="lg:sticky lg:top-28">
              <h2 className="heading-card mb-3 px-3">Categories</h2>
              <CategoryButton label="All articles" count={totalArticles} active={categoryId === ALL} onSelect={() => selectCategory(ALL)} />
              <div className="my-2 h-px bg-border" />
              <ul className="space-y-0.5">
                {categories.map((c) => (
                  <li key={c.id}>
                    <CategoryButton
                      label={c.name}
                      count={c.articles.length}
                      active={c.id === categoryId}
                      inactive={!c.active}
                      onSelect={() => selectCategory(c.id)}
                    />
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => openCategoryDialog("add")}
                className="mt-3 flex items-center gap-2 px-3 py-2 text-body2 font-semibold text-foreground underline underline-offset-2"
              >
                <Plus className="size-4" />
                Add category
              </button>
            </div>
          </nav>

          <section className="min-w-0">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="heading-section truncate">{selectedCategory?.name ?? "All articles"}</h2>
                <p className="mt-1 text-body2 text-muted-foreground">
                  {scopeRows.length.toLocaleString()} article{scopeRows.length === 1 ? "" : "s"} · {scopePublished.toLocaleString()} published
                  {selectedCategory && !selectedCategory.active && " · Hidden from the Help Center"}
                  {!selectedCategory && ` · ${categories.length} categories`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={writeArticle}>
                  <Plus />
                  Add article
                </Button>
                {selectedCategory && (
                  <RowMenu
                    items={[
                      { label: "Rename", onSelect: () => openCategoryDialog("edit") },
                      { label: selectedCategory.active ? "Hide from Help Center" : "Show in Help Center", onSelect: toggleCategoryActive },
                      { label: "Delete category", destructive: true, onSelect: () => setDeleteCategoryOpen(true) },
                    ]}
                  />
                )}
              </div>
            </div>

            <div className="mb-3 flex flex-col items-stretch gap-6">
              <PillTabs options={tabOptions} value={statusTab} onChange={setStatusTab} />
              <FilterBar searchPlaceholder="Search by title or author" searchValue={search} onSearchChange={setSearch} />
            </div>

            <p className="mb-2 text-body2 text-muted-foreground">
              {t.total.toLocaleString()} article{t.total === 1 ? "" : "s"}
              {filtersActive && (
                <button type="button" onClick={clearFilters} className="ml-3 font-semibold text-foreground underline underline-offset-2">
                  Clear filters
                </button>
              )}
            </p>

            {scopeRows.length === 0 && previewState !== "no-results" ? (
              <EmptyState
                icon={LifeBuoy}
                title="No articles here yet"
                description="Write the first article for this category."
                action={<Button onClick={writeArticle}>Write article</Button>}
              />
            ) : t.total === 0 ? (
              <EmptyState
                icon={LifeBuoy}
                title="No articles match"
                description="Try a different status or search."
                action={
                  filtersActive ? (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <SelectHead all={t.selection.allOnPage} some={t.selection.someOnPage} onToggle={t.selection.togglePage} />
                    <SortHead label="Title" sortKey="title" sort={t.sort} onSort={t.toggleSort} />
                    <SortHead label="Status" sortKey="status" sort={t.sort} onSort={t.toggleSort} />
                    <SortHead label="Updated" sortKey="updated" sort={t.sort} onSort={t.toggleSort} />
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {t.pagedRows.map(({ article }) => (
                    <TableRow key={article.id} onClick={() => navigate(`/support/articles/${article.id}`)} className="cursor-pointer">
                      <TableCell className="w-12">
                        <Checkbox
                          checked={t.selection.isSelected(article.id)}
                          onChange={() => t.selection.toggle(article.id)}
                          label={`Select ${article.title}`}
                        />
                      </TableCell>
                      <TableCell className="py-3">
                        <p title={article.title} className="max-w-64 truncate text-body2 font-semibold text-foreground">
                          {article.title}
                        </p>
                        <p className="max-w-64 truncate text-caption text-muted-foreground">By {article.author}</p>
                      </TableCell>
                      <TableCell>
                        <StatusDot status={article.status} label={article.statusLabel} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-body2 tabular-nums">{article.updated}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <RowMenu
                          items={[
                            { label: "Edit", onSelect: () => navigate(`/support/articles/${article.id}`) },
                            {
                              label: article.statusLabel === "Published" ? "Unpublish" : "Publish",
                              onSelect: () => setStatus([article], article.statusLabel === "Published" ? DRAFT : PUBLISHED),
                            },
                            { label: "Delete", destructive: true, onSelect: () => deleteArticles(new Set([article.id])) },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <div className="mt-6">
              <Pagination
                page={t.page}
                totalPages={t.totalPages}
                onPageChange={t.setPage}
                total={t.total}
                pageSize={t.pageSize}
                onPageSizeChange={t.setPageSize}
                noun="articles"
              />
            </div>
          </section>
        </div>
      )}

      <BulkBar count={selectedCount} total={t.total} onSelectAll={t.selection.selectAll} onClear={t.selection.clear}>
        <BulkAction onClick={() => bulk(() => setStatus(selectedArticles, PUBLISHED))}>Publish</BulkAction>
        <BulkAction onClick={() => bulk(() => setStatus(selectedArticles, DRAFT))}>Unpublish</BulkAction>
        <BulkAction tone="danger" onClick={() => setDeleteArticlesOpen(true)}>
          Delete
        </BulkAction>
      </BulkBar>

      <ConfirmationDialog
        open={deleteArticlesOpen}
        onClose={() => setDeleteArticlesOpen(false)}
        tone="destructive"
        title={`Delete ${selectedCount} article${selectedCount === 1 ? "" : "s"}?`}
        description="They disappear from the Help Center on web and mobile straight away. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => bulk(() => deleteArticles(new Set(selectedArticles.map((a) => a.id))))}
      />

      <ConfirmationDialog
        open={deleteCategoryOpen}
        onClose={() => setDeleteCategoryOpen(false)}
        tone="destructive"
        title="Delete this category?"
        description={
          selectedCategory && selectedCategory.articles.length > 0
            ? `Its ${selectedCategory.articles.length} article${selectedCategory.articles.length === 1 ? "" : "s"} will be deleted too. This cannot be undone.`
            : "This cannot be undone."
        }
        confirmLabel="Delete category"
        onConfirm={deleteCategory}
      />

      <FormDialog
        open={categoryDialog !== null}
        onClose={() => setCategoryDialog(null)}
        title={categoryDialog?.mode === "edit" ? "Rename category" : "Add category"}
        description={
          categoryDialog?.mode === "edit"
            ? "The new name shows in the Help Center straight away."
            : "Create a new category to group related Help Center articles."
        }
        submitLabel={categoryDialog?.mode === "edit" ? "Save" : "Create category"}
        onSubmit={saveCategory}
      >
        <FormField label="Category name">
          <input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="e.g. Billing"
            aria-label="Category name"
            className="h-12 w-full rounded-md border border-input bg-card px-4 text-body2 text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
          />
        </FormField>
      </FormDialog>
    </div>
  )
}

export default SupportPage
