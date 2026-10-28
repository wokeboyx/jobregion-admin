import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Newspaper } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Avatar } from "@/components/ui/avatar"
import type { Status } from "@/components/ui/status-pill"
import { FilterBar } from "@/components/filter-bar"
import { PageHeader } from "@/components/page-header"
import { PhotoCard } from "@/components/photo-card"
import { PillTabs } from "@/components/pill-tabs"
import { ViewToggle, type View } from "@/components/view-toggle"
import { Pagination } from "@/components/pagination"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { BulkAction, BulkBar, Checkbox, SelectHead, SortHead } from "@/components/data-table"
import { EmptyState, ErrorState } from "@/components/page-state"
import { useTable, type Sorters } from "@/lib/use-table"
import { usePreviewState } from "@/lib/preview-state"
import { coverFor } from "@/lib/photos"
import { ANCHOR_DATE, BLOG_CATEGORIES, type BlogPost } from "@/lib/mock-data"
import { BLOG_AUTHORS, blogStore } from "./generated"

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "Published", label: "Published" },
  { key: "Draft", label: "Drafts" },
  { key: "Scheduled", label: "Scheduled" },
  { key: "Archived", label: "Archived" },
] as const

type StatusKey = (typeof STATUS_TABS)[number]["key"]

const ALL_AUTHORS = "All authors"
const ALL_CATEGORIES = "All categories"

const DOT: Record<Status, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  neutral: "bg-muted-foreground",
}

const NOT_SCHEDULED = "Not scheduled"

/** Drafts have no date; they sort below every dated post. */
const SORTERS: Sorters<BlogPost> = {
  title: (p) => p.title,
  date: (p) => (p.date === NOT_SCHEDULED ? "" : p.date),
  views: (p) => p.views,
}

const coverOf = (post: BlogPost) => post.coverImageUrl ?? coverFor(post.id)

function BlogPage() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<BlogPost[]>(() => [...blogStore])
  const [view, setView] = useState<View>("list")
  const [statusTab, setStatusTab] = useState<StatusKey>("all")
  const [search, setSearch] = useState("")
  const [authorFilter, setAuthorFilter] = useState(ALL_AUTHORS)
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const tabOptions = STATUS_TABS.map((t) => ({
    ...t,
    count: t.key === "all" ? posts.length : posts.filter((p) => p.statusLabel === t.key).length,
  }))

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return posts.filter((p) => {
      if (statusTab !== "all" && p.statusLabel !== statusTab) return false
      if (authorFilter !== ALL_AUTHORS && p.author !== authorFilter) return false
      if (categoryFilter !== ALL_CATEGORIES && p.category !== categoryFilter) return false
      if (query && !`${p.title} ${p.author}`.toLowerCase().includes(query)) return false
      return true
    })
  }, [posts, search, statusTab, authorFilter, categoryFilter])

  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const previewRows = useMemo(() => (previewState === "no-results" ? [] : rows), [previewState, rows])
  const t = useTable(previewRows, {
    getId: (p) => p.id,
    sorters: SORTERS,
    initialSort: { key: "date", dir: "desc" },
    pageSize: 25,
  })

  const filtersActive = statusTab !== "all" || search !== "" || authorFilter !== ALL_AUTHORS || categoryFilter !== ALL_CATEGORIES
  const clearFilters = () => {
    setStatusTab("all")
    setSearch("")
    setAuthorFilter(ALL_AUTHORS)
    setCategoryFilter(ALL_CATEGORIES)
  }

  /** Changes go to the shared store too, so the editor and this list agree after navigating. */
  const applyToSelected = (change: (post: BlogPost) => Partial<BlogPost> | null) => {
    t.selection.rows.forEach((p) => {
      const next = change(p)
      if (next) Object.assign(p, next)
    })
    t.selection.clear()
    setPosts([...blogStore])
  }

  const publishSelected = () =>
    applyToSelected((p) =>
      p.statusLabel === "Published" ? null : { status: "success", statusLabel: "Published", date: p.date === NOT_SCHEDULED ? ANCHOR_DATE : p.date },
    )

  const archiveSelected = () => applyToSelected((p) => (p.statusLabel === "Archived" ? null : { status: "neutral", statusLabel: "Archived" }))

  const deleteSelected = () => {
    const ids = new Set(t.selection.rows.map((p) => p.id))
    for (let i = blogStore.length - 1; i >= 0; i--) if (ids.has(blogStore[i].id)) blogStore.splice(i, 1)
    t.selection.clear()
    setPosts([...blogStore])
  }

  const writeButton = <Button onClick={() => navigate("/blog/new")}>Write a post</Button>
  const selectedCount = t.selection.count

  return (
    <div>
      <PageHeader title="Blog" description="Stories and guides shown on the Jobs Region website and app." actions={writeButton} />

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : previewState === "empty" || posts.length === 0 ? (
        <EmptyState icon={Newspaper} title="No posts yet" description="Write your first post to see it here." action={writeButton} />
      ) : (
        <>
          <div className="mb-4 flex flex-col items-stretch gap-6">
            <PillTabs options={tabOptions} value={statusTab} onChange={setStatusTab} />
            <div className="flex w-full flex-wrap items-center gap-2">
              <FilterBar
                searchPlaceholder="Search by title or author"
                searchValue={search}
                onSearchChange={setSearch}
                filters={[
                  { label: ALL_AUTHORS, options: BLOG_AUTHORS, value: authorFilter, onChange: setAuthorFilter },
                  { label: ALL_CATEGORIES, options: BLOG_CATEGORIES, value: categoryFilter, onChange: setCategoryFilter },
                ]}
              />
              <ViewToggle value={view} onChange={setView} />
            </div>
          </div>

          <p className="mb-2 text-body2 text-muted-foreground">
            {t.total.toLocaleString()} post{t.total === 1 ? "" : "s"}
            {filtersActive && (
              <button type="button" onClick={clearFilters} className="ml-3 font-semibold text-foreground underline underline-offset-2">
                Clear filters
              </button>
            )}
          </p>

          {t.total === 0 ? (
            <EmptyState
              icon={Newspaper}
              title="No posts match"
              description="Try a different status, author or category."
              action={
                filtersActive ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 pt-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {t.pagedRows.map((post) => (
                <PhotoCard
                  key={post.id}
                  to={`/blog/${post.id}`}
                  photo={coverOf(post)}
                  badge={post.statusLabel}
                  title={post.title}
                  lines={[`${post.category} · ${post.date}`, post.author]}
                  footer={post.views > 0 ? <span className="font-semibold">{post.views.toLocaleString()} views</span> : undefined}
                />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <SelectHead all={t.selection.allOnPage} some={t.selection.someOnPage} onToggle={t.selection.togglePage} />
                  <SortHead label="Post" sortKey="title" sort={t.sort} onSort={t.toggleSort} />
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <SortHead label="Published / updated" sortKey="date" sort={t.sort} onSort={t.toggleSort} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {t.pagedRows.map((post) => (
                  <TableRow key={post.id} onClick={() => navigate(`/blog/${post.id}`)} className="cursor-pointer">
                    <TableCell className="w-12">
                      <Checkbox checked={t.selection.isSelected(post.id)} onChange={() => t.selection.toggle(post.id)} label={`Select ${post.title}`} />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-3">
                        <img src={coverOf(post)} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p title={post.title} className="max-w-96 truncate text-body2 font-semibold text-foreground">
                            {post.title}
                          </p>
                          <p className="truncate text-caption text-muted-foreground">{post.category}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar name={post.author} className="size-7" />
                        <span className="whitespace-nowrap text-body2 text-foreground">{post.author}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2 whitespace-nowrap text-body2 text-foreground">
                        <span className={`size-2 rounded-full ${DOT[post.status]}`} />
                        {post.statusLabel}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-body2 tabular-nums">
                      {post.date === NOT_SCHEDULED ? <span className="text-muted-foreground">Not scheduled</span> : post.date}
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
              noun="posts"
            />
          </div>

          <BulkBar count={selectedCount} total={t.total} onSelectAll={t.selection.selectAll} onClear={t.selection.clear}>
            <BulkAction onClick={publishSelected}>Publish</BulkAction>
            <BulkAction onClick={archiveSelected}>Archive</BulkAction>
            <BulkAction tone="danger" onClick={() => setDeleteOpen(true)}>
              Delete
            </BulkAction>
          </BulkBar>
        </>
      )}

      <ConfirmationDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        tone="destructive"
        title={`Delete ${selectedCount} post${selectedCount === 1 ? "" : "s"}?`}
        description="This permanently removes the selected posts from the website and app. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={deleteSelected}
      />
    </div>
  )
}

export default BlogPage
