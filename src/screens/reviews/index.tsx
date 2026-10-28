import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Flag, SearchX, Star } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { PillTabs } from "@/components/pill-tabs"
import { FilterBar } from "@/components/filter-bar"
import { Pagination } from "@/components/pagination"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { BulkAction, BulkBar, Checkbox, SelectHead, SortHead } from "@/components/data-table"
import { EmptyState, ErrorState } from "@/components/page-state"
import { cn } from "@/lib/utils"
import { jobCover } from "@/lib/photos"
import { useTable, type Sorters } from "@/lib/use-table"
import { usePreviewState } from "@/lib/preview-state"
import { users } from "@/lib/mock-data"
import type { Hire, HireState, Review, ReviewState } from "@/lib/trust-data"
import { allHires, allReviews } from "./generated"
import { ReviewDialog } from "./review-dialog"
import { Stars } from "./parts"
import { formatDate } from "./format"

type TabKey = "reported" | "reviews" | "hires"

const ALL_RATINGS = "All ratings"
const ALL_SIDES = "Workers and posters"
const ALL_STATUSES = "All statuses"
const RATING_OPTIONS = ["5 stars", "4 stars", "3 stars", "2 stars", "1 star"]
const SIDE_OPTIONS = ["Workers", "Posters"]
const HIRE_OPTIONS: HireState[] = ["Awaiting confirmation", "Confirmed", "Declined", "Expired"]

const userName = (id: string) => users.find((u) => u.id === id)?.name ?? "Unknown user"
const hireById = new Map(allHires.map((h) => [h.id, h]))

const REVIEW_DOT: Record<ReviewState, string> = {
  Published: "bg-success",
  "Hidden until both review": "bg-muted-foreground",
  Removed: "bg-destructive",
}
const REVIEW_LABEL: Record<ReviewState, string> = {
  Published: "Published",
  "Hidden until both review": "Hidden for now",
  Removed: "Removed",
}
const HIRE_DOT: Record<HireState, string> = {
  "Awaiting confirmation": "bg-warning",
  Confirmed: "bg-success",
  Declined: "bg-destructive",
  Expired: "bg-muted-foreground",
}

function Dot({ className, label, title }: { className: string; label: string; title?: string }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-body2 text-foreground" title={title}>
      <span className={cn("size-2 shrink-0 rounded-full", className)} />
      {label}
    </span>
  )
}

const REVIEW_SORTERS: Sorters<Review> = {
  rating: (r) => r.rating,
  date: (r) => r.date,
  reports: (r) => r.reportCount,
}
const HIRE_SORTERS: Sorters<Hire> = {
  date: (h) => h.date,
  job: (h) => h.jobTitle,
}

function Summary({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0 px-6 first:pl-0">
      <p className="text-caption text-muted-foreground">{label}</p>
      <p className="heading-subsection mt-1 tabular-nums">{value}</p>
      {hint && <p className="truncate text-caption text-muted-foreground">{hint}</p>}
    </div>
  )
}

function ReviewsPage() {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<Review[]>(allReviews)
  const [tab, setTab] = useState<TabKey>("reported")
  const [search, setSearch] = useState("")
  const [rating, setRating] = useState(ALL_RATINGS)
  const [side, setSide] = useState(ALL_SIDES)
  const [hireStatus, setHireStatus] = useState(ALL_STATUSES)
  const [openId, setOpenId] = useState<string | null>(null)
  const [removeIds, setRemoveIds] = useState<string[]>([])

  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const noResults = previewState === "no-results"

  const reported = useMemo(() => reviews.filter((r) => r.reportCount > 0 && r.state !== "Removed"), [reviews])
  const published = reviews.filter((r) => r.state === "Published")
  const average = published.length ? published.reduce((n, r) => n + r.rating, 0) / published.length : 0
  const confirmedHires = allHires.filter((h) => h.state === "Confirmed").length

  const reviewRows = useMemo(() => {
    if (noResults) return []
    const query = search.trim().toLowerCase()
    return (tab === "reported" ? reported : reviews).filter((r) => {
      if (rating !== ALL_RATINGS && `${r.rating} star${r.rating === 1 ? "" : "s"}` !== rating) return false
      if (side === "Workers" && r.about !== "worker") return false
      if (side === "Posters" && r.about !== "poster") return false
      if (query) {
        const job = hireById.get(r.hireId)?.jobTitle ?? ""
        const haystack = `${userName(r.authorId)} ${userName(r.subjectId)} ${r.text} ${job}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [reviews, reported, tab, search, rating, side, noResults])

  const hireRows = useMemo(() => {
    if (noResults) return []
    const query = search.trim().toLowerCase()
    return allHires.filter((h) => {
      if (hireStatus !== ALL_STATUSES && h.state !== hireStatus) return false
      if (query) {
        const haystack = `${h.jobTitle} ${userName(h.posterId)} ${userName(h.workerId)}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [search, hireStatus, noResults])

  const reviewsWritten = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of reviews) counts.set(r.hireId, (counts.get(r.hireId) ?? 0) + 1)
    return counts
  }, [reviews])

  const rt = useTable(reviewRows, { getId: (r) => r.id, sorters: REVIEW_SORTERS, initialSort: { key: "date", dir: "desc" } })
  const ht = useTable(hireRows, { getId: (h) => h.id, sorters: HIRE_SORTERS, initialSort: { key: "date", dir: "desc" } })

  const patch = (ids: string[], change: Partial<Review>) => {
    const set = new Set(ids)
    setReviews((rs) => rs.map((r) => (set.has(r.id) ? { ...r, ...change } : r)))
  }

  const filtered = search.trim() !== "" || (tab === "hires" ? hireStatus !== ALL_STATUSES : rating !== ALL_RATINGS || side !== ALL_SIDES)
  const clearFilters = () => {
    setSearch("")
    setRating(ALL_RATINGS)
    setSide(ALL_SIDES)
    setHireStatus(ALL_STATUSES)
  }

  const openReview = reviews.find((r) => r.id === openId)
  const total = tab === "hires" ? ht.total : rt.total
  const noun = tab === "hires" ? (total === 1 ? "hire" : "hires") : total === 1 ? "review" : "reviews"

  const tabs = [
    { key: "reported" as const, label: "Reported", count: reported.length },
    { key: "reviews" as const, label: "All reviews", count: reviews.length },
    { key: "hires" as const, label: "Hires", count: allHires.length },
  ]

  return (
    <div>
      <PageHeader
        title="Reviews & hires"
        description="Reviews come from confirmed hires. Check the reported ones and keep the ratings fair."
      />

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : previewState === "empty" ? (
        <EmptyState icon={Star} title="No reviews yet" description="Reviews appear once both people confirm a hire and one of them writes a review." />
      ) : (
        <>
          <section className="mb-8 grid grid-cols-2 gap-y-5 divide-border border-y border-border py-5 md:grid-cols-5 md:divide-x">
            <div className="min-w-0 pr-6">
              <p className="text-caption text-muted-foreground">Average rating</p>
              <p className="mt-1 flex items-center gap-2">
                <Star className="size-5 fill-foreground text-foreground" />
                <span className="heading-subsection tabular-nums">{average.toFixed(2)}</span>
              </p>
              <p className="text-caption text-muted-foreground">From {published.length} published reviews</p>
            </div>
            <Summary label="Published" value={published.length.toLocaleString()} hint="Count towards ratings" />
            <Summary
              label="Hidden for now"
              value={reviews.filter((r) => r.state === "Hidden until both review").length.toLocaleString()}
              hint="Until both sides review, or 14 days"
            />
            <Summary label="Reported" value={reported.length.toLocaleString()} hint="Need a look" />
            <Summary label="Confirmed hires" value={confirmedHires.toLocaleString()} hint="Only these can be reviewed" />
          </section>

          <div className="mb-4 flex flex-col items-stretch gap-6">
            <PillTabs
              options={tabs}
              value={tab}
              onChange={(k) => {
                setTab(k)
                rt.selection.clear()
              }}
            />
            {tab === "hires" ? (
              <FilterBar
                searchPlaceholder="Search by job or person"
                searchValue={search}
                onSearchChange={setSearch}
                filters={[{ label: ALL_STATUSES, options: HIRE_OPTIONS, value: hireStatus, onChange: setHireStatus }]}
              />
            ) : (
              <FilterBar
                searchPlaceholder="Search by person, job or text"
                searchValue={search}
                onSearchChange={setSearch}
                filters={[
                  { label: ALL_RATINGS, options: RATING_OPTIONS, value: rating, onChange: setRating },
                  { label: ALL_SIDES, options: SIDE_OPTIONS, value: side, onChange: setSide },
                ]}
              />
            )}
          </div>

          <div className="mb-2 flex items-center gap-3 text-body2 text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{total.toLocaleString()}</span> {noun}
            </span>
            {filtered && (
              <button type="button" onClick={clearFilters} className="font-semibold text-foreground underline underline-offset-2">
                Clear filters
              </button>
            )}
          </div>

          {total === 0 ? (
            tab === "reported" && !filtered && !noResults ? (
              <EmptyState icon={Flag} title="You’re all caught up" description="No reported reviews right now." />
            ) : (
              <EmptyState icon={SearchX} title={`No matching ${tab === "hires" ? "hires" : "reviews"}`} description="Try another filter or search term." />
            )
          ) : tab === "hires" ? (
            <>
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <SortHead label="Job" sortKey="job" sort={ht.sort} onSort={ht.toggleSort} className="w-[30%]" />
                    <TableHead className="w-[17%]">Poster</TableHead>
                    <TableHead className="w-[15%]">Worker</TableHead>
                    <TableHead className="w-28">Marked hired by</TableHead>
                    <SortHead label="Date" sortKey="date" sort={ht.sort} onSort={ht.toggleSort} className="w-32" />
                    <TableHead className="w-24 text-right">Reviews</TableHead>
                    <TableHead className="w-48">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ht.pagedRows.map((h) => (
                    <TableRow key={h.id} onClick={() => navigate(`/jobs/${h.jobId}`)} className="cursor-pointer">
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-3">
                          <img src={jobCover(h.jobId)} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                          <span className="truncate text-body2 font-semibold text-foreground" title={h.jobTitle}>
                            {h.jobTitle}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Link to={`/users/${h.posterId}`} className="flex min-w-0 items-center gap-2 text-body2 text-foreground hover:underline">
                          <Avatar name={userName(h.posterId)} className="size-7 text-caption" />
                          <span className="truncate">{userName(h.posterId)}</span>
                        </Link>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Link to={`/users/${h.workerId}`} className="flex min-w-0 items-center gap-2 text-body2 text-foreground hover:underline">
                          <Avatar name={userName(h.workerId)} className="size-7 text-caption" />
                          <span className="truncate">{userName(h.workerId)}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-body2">{h.claimedBy === "poster" ? "Poster" : "Worker"}</TableCell>
                      <TableCell className="whitespace-nowrap text-body2 tabular-nums">
                        {formatDate(h.date)}
                        {h.confirmedDate && <span className="block text-caption text-muted-foreground">Confirmed {formatDate(h.confirmedDate)}</span>}
                      </TableCell>
                      <TableCell className="text-right text-body2 tabular-nums">
                        {h.state === "Confirmed" ? `${Math.min(2, reviewsWritten.get(h.id) ?? 0)} of 2` : "—"}
                      </TableCell>
                      <TableCell>
                        <Dot className={HIRE_DOT[h.state]} label={h.state} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                page={ht.page}
                totalPages={ht.totalPages}
                onPageChange={ht.setPage}
                total={ht.total}
                pageSize={ht.pageSize}
                onPageSizeChange={ht.setPageSize}
                noun="hires"
              />
            </>
          ) : (
            <>
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <SelectHead all={rt.selection.allOnPage} some={rt.selection.someOnPage} onToggle={rt.selection.togglePage} />
                    <SortHead label="Rating" sortKey="rating" sort={rt.sort} onSort={rt.toggleSort} className="w-32" />
                    <TableHead>Review</TableHead>
                    <TableHead className="w-[18%]">Job</TableHead>
                    <TableHead className="w-24">About</TableHead>
                    <SortHead label="Date" sortKey="date" sort={rt.sort} onSort={rt.toggleSort} className="w-32" />
                    <SortHead label="Reports" sortKey="reports" sort={rt.sort} onSort={rt.toggleSort} align="right" className="w-24" />
                    <TableHead className="w-36">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rt.pagedRows.map((r) => {
                    const hire = hireById.get(r.hireId)
                    return (
                      <TableRow key={r.id} onClick={() => setOpenId(r.id)} className="cursor-pointer">
                        <TableCell>
                          <Checkbox checked={rt.selection.isSelected(r.id)} onChange={() => rt.selection.toggle(r.id)} label={`Select review ${r.id}`} />
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <Stars rating={r.rating} />
                            <span className="text-body2 font-semibold tabular-nums text-foreground">{r.rating.toFixed(1)}</span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <p
                            className={cn("truncate text-body2 text-foreground", r.state === "Removed" && "text-muted-foreground line-through")}
                            title={r.text}
                          >
                            {r.text}
                          </p>
                          <p className="truncate text-caption text-muted-foreground">
                            {userName(r.authorId)} → {userName(r.subjectId)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="truncate text-body2" title={hire?.jobTitle}>
                            {hire?.jobTitle ?? "—"}
                          </p>
                        </TableCell>
                        <TableCell className="text-body2">{r.about === "worker" ? "Worker" : "Poster"}</TableCell>
                        <TableCell className="whitespace-nowrap text-body2 tabular-nums">{formatDate(r.date)}</TableCell>
                        <TableCell className={cn("text-right text-body2 tabular-nums", r.reportCount > 0 && "font-semibold text-destructive")}>
                          {r.reportCount}
                        </TableCell>
                        <TableCell>
                          <Dot className={REVIEW_DOT[r.state]} label={REVIEW_LABEL[r.state]} title={r.state} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <Pagination
                page={rt.page}
                totalPages={rt.totalPages}
                onPageChange={rt.setPage}
                total={rt.total}
                pageSize={rt.pageSize}
                onPageSizeChange={rt.setPageSize}
                noun="reviews"
              />
            </>
          )}
        </>
      )}

      {tab !== "hires" && (
        <BulkBar count={rt.selection.count} total={rt.total} onSelectAll={rt.selection.selectAll} onClear={rt.selection.clear}>
          <BulkAction
            onClick={() => {
              patch(
                rt.selection.rows.filter((r) => r.state !== "Removed").map((r) => r.id),
                { reportCount: 0 },
              )
              rt.selection.clear()
            }}
          >
            Keep up
          </BulkAction>
          <BulkAction tone="danger" onClick={() => setRemoveIds(rt.selection.rows.filter((r) => r.state !== "Removed").map((r) => r.id))}>
            Remove
          </BulkAction>
        </BulkBar>
      )}

      <ReviewDialog
        review={openReview}
        hire={openReview ? hireById.get(openReview.hireId) : undefined}
        onClose={() => setOpenId(null)}
        onKeep={(id) => patch([id], { reportCount: 0 })}
        onRemove={(id) => {
          setOpenId(null)
          setRemoveIds([id])
        }}
        onRestore={(id) => patch([id], { state: "Published" })}
      />

      <ConfirmationDialog
        open={removeIds.length > 0}
        onClose={() => setRemoveIds([])}
        onConfirm={() => {
          patch(removeIds, { state: "Removed", reportCount: 0 })
          rt.selection.clear()
        }}
        tone="destructive"
        title={removeIds.length > 1 ? `Remove ${removeIds.length} reviews?` : "Remove this review?"}
        description="It comes off the profile and stops counting towards the rating. Both people get an email saying why."
        confirmLabel={removeIds.length > 1 ? "Remove reviews" : "Remove review"}
      />
    </div>
  )
}

export default ReviewsPage
