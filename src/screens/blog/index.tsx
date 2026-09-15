import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Newspaper } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { StatusPill, OutlineBadge } from "@/components/ui/status-pill"
import { Avatar } from "@/components/ui/avatar"
import { FilterBar } from "@/components/filter-bar"
import { ModuleHeader } from "@/components/module-header"
import { Pagination } from "@/components/pagination"
import { EmptyState, ErrorState } from "@/components/page-state"
import { usePagination } from "@/lib/use-pagination"
import { usePreviewState } from "@/lib/preview-state"
import { blogPosts } from "@/lib/mock-data"

const STATUS_OPTIONS = ["Draft", "Scheduled", "Published", "Archived"]
const AUTHOR_OPTIONS = ["Chiamaka Obi", "Aisha Bello", "Grace Nwankwo"]
const TAG_OPTIONS = ["Hiring", "Guides", "Career Tips", "Product", "Platform Updates"]

function BlogPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All statuses")
  const [authorFilter, setAuthorFilter] = useState("All authors")
  const [tagFilter, setTagFilter] = useState("All tags")

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return blogPosts.filter((p) => {
      if (statusFilter !== "All statuses" && p.statusLabel !== statusFilter) return false
      if (authorFilter !== "All authors" && p.author !== authorFilter) return false
      if (tagFilter !== "All tags" && !p.tags.includes(tagFilter)) return false
      if (query && !p.title.toLowerCase().includes(query)) return false
      return true
    })
  }, [search, statusFilter, authorFilter, tagFilter])

  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const previewRows = useMemo(() => (previewState === "no-results" ? [] : rows), [previewState, rows])
  const { page, setPage, totalPages, pagedRows } = usePagination(previewRows)

  return (
    <div>
      <ModuleHeader
        title="Blog posts"
        description="Public-facing content shown on the JobRegion website and app."
        action={<Button onClick={() => navigate("/blog/new")}>+ New post</Button>}
      />

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : previewState === "empty" ? (
        <EmptyState
          icon={Newspaper}
          title="No posts yet"
          description="Write your first post to see it here."
          action={<Button onClick={() => navigate("/blog/new")}>+ New post</Button>}
        />
      ) : (
        <>
          <FilterBar
            searchPlaceholder="Search by title…"
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              { label: "All statuses", options: STATUS_OPTIONS, value: statusFilter, onChange: setStatusFilter },
              { label: "All authors", options: AUTHOR_OPTIONS, value: authorFilter, onChange: setAuthorFilter },
              { label: "All tags", options: TAG_OPTIONS, value: tagFilter, onChange: setTagFilter },
            ]}
            className="mb-4"
          />

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.map((post) => (
                  <TableRow key={post.id} onClick={() => navigate(`/blog/${post.id}`)} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br ${post.cover || "bg-muted"}`}
                        >
                          {post.coverImageUrl ? (
                            <img src={post.coverImageUrl} alt={post.title} className="h-full w-full object-cover" />
                          ) : (
                            <Newspaper className="size-4 text-foreground/20" />
                          )}
                        </div>
                        <span className="font-medium text-foreground">{post.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{post.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Avatar name={post.author} />
                        <span className="text-foreground">{post.author}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((t) => (
                          <OutlineBadge key={t} label={t} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusPill status={post.status} label={post.statusLabel} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{post.date}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {post.views.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className="text-xs font-bold text-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/blog/${post.id}`)
                        }}
                      >
                        Edit
                      </button>
                    </TableCell>
                  </TableRow>
                ))}

                {previewRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                      No posts match these filters.
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

export default BlogPage
