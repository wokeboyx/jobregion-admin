import { useMemo, useState } from "react"
import { Download, Megaphone, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SelectMenu } from "@/components/ui/select-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { PillTabs } from "@/components/pill-tabs"
import { Pagination } from "@/components/pagination"
import { RowMenu } from "@/components/row-menu"
import { BulkAction, BulkBar, Checkbox, SelectHead, SortHead } from "@/components/data-table"
import { EmptyState, ErrorState } from "@/components/page-state"
import { cn } from "@/lib/utils"
import { useTable } from "@/lib/use-table"
import { usePreviewState } from "@/lib/preview-state"
import {
  announcements as initialAnnouncements,
  newsletterSubscribers as initialSubscribers,
  AUDIENCE_LABEL,
  CHANNEL_LABEL,
  type Announcement,
  type AnnouncementChannel,
  type AnnouncementStatus,
  type AudienceKind,
  type NewsletterSubscriber,
} from "@/lib/announcements-data"
import { CHANNEL_ORDER, audienceSummary, exportSubscribersCsv, formatCount, formatDateTime, pct } from "./audience"
import { Composer } from "./composer"
import { SubscribersTable } from "./subscribers"
import { ChannelIcons } from "./channels"
import { AnnouncementDetail } from "./detail"

type TabKey = "all" | "sent" | "scheduled" | "drafts" | "subscribers"

const TAB_STATUS: Record<Exclude<TabKey, "all" | "subscribers">, AnnouncementStatus> = {
  sent: "Sent",
  scheduled: "Scheduled",
  drafts: "Draft",
}

const STATUS_DOT: Record<AnnouncementStatus, string> = {
  Sent: "bg-success",
  Scheduled: "bg-warning",
  Draft: "bg-muted-foreground",
}

const openRate = (a: Announcement) => (a.delivered ? pct(a.opened ?? 0, a.delivered) : -1)
const clickRate = (a: Announcement) => (a.delivered ? pct(a.clicked ?? 0, a.delivered) : -1)

const SORTERS = {
  title: (a: Announcement) => a.title,
  date: (a: Announcement) => a.date,
  delivered: (a: Announcement) => a.delivered ?? -1,
  open: openRate,
  click: clickRate,
}

const CHANNEL_OPTIONS = [{ value: "all", label: "All channels" }, ...CHANNEL_ORDER.map((c) => ({ value: c, label: CHANNEL_LABEL[c] }))]
const AUDIENCE_OPTIONS = [
  { value: "all", label: "All audiences" },
  ...(Object.keys(AUDIENCE_LABEL) as AudienceKind[]).map((k) => ({ value: k, label: AUDIENCE_LABEL[k] })),
]
const SUB_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "Subscribed", label: "Subscribed" },
  { value: "Unsubscribed", label: "Unsubscribed" },
]
const SUB_SOURCE_OPTIONS = [
  { value: "all", label: "All sources" },
  { value: "Website footer", label: "Website footer" },
  { value: "Blog", label: "Blog" },
]

function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>(initialAnnouncements)
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(initialSubscribers)
  const [tab, setTab] = useState<TabKey>("all")
  const [search, setSearch] = useState("")
  const [channel, setChannel] = useState<"all" | AnnouncementChannel>("all")
  const [audience, setAudience] = useState<"all" | AudienceKind>("all")
  const [subStatus, setSubStatus] = useState("all")
  const [subSource, setSubSource] = useState("all")
  // The composer opens in place of the list: undefined = list, null = new, an announcement = editing it.
  const [editing, setEditing] = useState<Announcement | null | undefined>(undefined)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [notice, setNotice] = useState("")
  const { state: previewState, setState: setPreviewState } = usePreviewState()

  const query = search.trim().toLowerCase()
  const onSubscribers = tab === "subscribers"
  const filtersActive = onSubscribers
    ? query !== "" || subStatus !== "all" || subSource !== "all"
    : query !== "" || channel !== "all" || audience !== "all"

  const clearFilters = () => {
    setSearch("")
    setChannel("all")
    setAudience("all")
    setSubStatus("all")
    setSubSource("all")
  }

  const rows = useMemo(() => {
    if (previewState === "no-results" || tab === "subscribers") return []
    return items.filter((a) => {
      if (tab !== "all" && a.status !== TAB_STATUS[tab]) return false
      if (channel !== "all" && !a.channels.includes(channel)) return false
      if (audience !== "all" && a.audience.kind !== audience) return false
      if (query && !`${a.title} ${a.message} ${audienceSummary(a.audience)}`.toLowerCase().includes(query)) return false
      return true
    })
  }, [items, tab, channel, audience, query, previewState])

  const subscriberRows = useMemo(() => {
    if (previewState === "no-results") return []
    return subscribers.filter(
      (s) =>
        (subStatus === "all" || s.status === subStatus) &&
        (subSource === "all" || s.source === subSource) &&
        (!query || `${s.email} ${s.source}`.toLowerCase().includes(query)),
    )
  }, [subscribers, subStatus, subSource, query, previewState])

  const t = useTable(rows, { getId: (a) => a.id, sorters: SORTERS, initialSort: { key: "date", dir: "desc" }, pageSize: 25 })

  const count = (s: AnnouncementStatus) => items.filter((a) => a.status === s).length
  const subscribedCount = subscribers.filter((s) => s.status === "Subscribed").length
  const tabs = [
    { key: "all" as const, label: "All", count: items.length },
    { key: "sent" as const, label: "Sent", count: count("Sent") },
    { key: "scheduled" as const, label: "Scheduled", count: count("Scheduled") },
    { key: "drafts" as const, label: "Drafts", count: count("Draft") },
    { key: "subscribers" as const, label: "Subscribers", count: subscribedCount },
  ]

  const viewing = items.find((a) => a.id === viewingId) ?? null

  const save = (a: Announcement) => {
    setItems((xs) => (xs.some((x) => x.id === a.id) ? xs.map((x) => (x.id === a.id ? a : x)) : [a, ...xs]))
    setEditing(undefined)
    setTab(a.status === "Sent" ? "sent" : a.status === "Scheduled" ? "scheduled" : "drafts")
    setNotice(
      a.status === "Sent"
        ? `“${a.title}” was sent to about ${formatCount(a.delivered ?? 0)} people.`
        : a.status === "Scheduled"
          ? `“${a.title}” is scheduled for ${formatDateTime(a.date)}.`
          : `“${a.title}” was saved as a draft.`,
    )
  }

  const newId = (i = 0) => `AN-${(Date.now() + i).toString().slice(-6)}`
  const asCopy = (a: Announcement, i = 0): Announcement => ({
    ...a,
    id: newId(i),
    title: `${a.title} (copy)`,
    status: "Draft",
    delivered: undefined,
    opened: undefined,
    clicked: undefined,
  })

  const remove = (ids: string[]) => setItems((xs) => xs.filter((x) => !ids.includes(x.id)))
  const unschedule = (id: string) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status: "Draft" } : x)))
  const duplicate = (a: Announcement) => setEditing({ ...asCopy(a), title: a.title })

  const selectedDrafts = t.selection.rows.filter((a) => a.status === "Draft")
  const bulkDeleteDrafts = () => {
    remove(selectedDrafts.map((a) => a.id))
    setNotice(`Deleted ${selectedDrafts.length} draft${selectedDrafts.length === 1 ? "" : "s"}.`)
    t.selection.clear()
  }
  const bulkDuplicate = () => {
    const copies = t.selection.rows.map((a, i) => asCopy(a, i))
    setItems((xs) => [...copies, ...xs])
    setNotice(`Made ${copies.length} cop${copies.length === 1 ? "y" : "ies"} in Drafts.`)
    t.selection.clear()
  }

  const unsubscribe = (ids: string[]) => {
    setSubscribers((xs) => xs.map((s) => (ids.includes(s.id) ? { ...s, status: "Unsubscribed" } : s)))
    setNotice(`Unsubscribed ${ids.length.toLocaleString()} ${ids.length === 1 ? "person" : "people"} from the newsletter.`)
  }

  if (editing !== undefined) {
    return <Composer key={editing?.id ?? "new"} initial={editing ?? undefined} onCancel={() => setEditing(undefined)} onSave={save} />
  }

  const emptyCopy: Record<Exclude<TabKey, "subscribers">, string> = {
    all: "Nothing here yet. Send your first announcement.",
    sent: "Nothing sent yet. Announcements you send show up here with how many people opened them.",
    scheduled: "Nothing scheduled. Pick “Schedule” in a new announcement to send it later.",
    drafts: "No drafts. Save an announcement as a draft to finish it later.",
  }

  const resultCount = onSubscribers ? subscriberRows.length : t.total
  const noun = onSubscribers ? (resultCount === 1 ? "subscriber" : "subscribers") : resultCount === 1 ? "announcement" : "announcements"

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Tell people what’s new by push, in the app, by email or in the website newsletter."
        actions={<Button onClick={() => setEditing(null)}>New announcement</Button>}
      />

      {notice && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-border px-5 py-4 shadow-card">
          <p className="text-body1 text-foreground">{notice}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setNotice("")}
            className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : previewState === "empty" ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="Send your first push, in-app message, email or newsletter."
          action={<Button onClick={() => setEditing(null)}>New announcement</Button>}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col items-stretch gap-6">
            <PillTabs
              options={tabs}
              value={tab}
              onChange={(k) => {
                setTab(k)
                t.selection.clear()
              }}
            />
            <div className="flex w-full flex-wrap items-center gap-2">
              <div className="relative max-w-full">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  aria-label="Search"
                  placeholder={onSubscribers ? "Search by email…" : "Search announcements…"}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-[26rem] max-w-full rounded-full border border-input bg-card pl-10 pr-4 text-body2 text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
                />
              </div>
              {onSubscribers ? (
                <>
                  <SelectMenu aria-label="Status" value={subStatus} onChange={setSubStatus} options={SUB_STATUS_OPTIONS} />
                  <SelectMenu aria-label="Source" value={subSource} onChange={setSubSource} options={SUB_SOURCE_OPTIONS} />
                  <Button variant="outline" onClick={() => exportSubscribersCsv(subscriberRows)}>
                    <Download />
                    Export CSV
                  </Button>
                </>
              ) : (
                <>
                  <SelectMenu
                    aria-label="Channel"
                   
                    value={channel}
                    onChange={(v) => setChannel(v as "all" | AnnouncementChannel)}
                    options={CHANNEL_OPTIONS}
                  />
                  <SelectMenu
                    aria-label="Audience"
                   
                    value={audience}
                    onChange={(v) => setAudience(v as "all" | AudienceKind)}
                    options={AUDIENCE_OPTIONS}
                  />
                </>
              )}
            </div>
          </div>

          <div className="mb-2 flex flex-wrap items-center gap-3 text-body2 text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{resultCount.toLocaleString()}</span> {noun}
              {onSubscribers && ` · ${subscribedCount.toLocaleString()} subscribed from the website footer and blog`}
            </span>
            {filtersActive && (
              <button type="button" onClick={clearFilters} className="font-semibold text-foreground underline underline-offset-2">
                Clear filters
              </button>
            )}
          </div>

          {onSubscribers ? (
            subscriberRows.length > 0 ? (
              <SubscribersTable rows={subscriberRows} onUnsubscribe={unsubscribe} />
            ) : (
              <p className="py-16 text-center text-body2 text-muted-foreground">No subscribers match these filters.</p>
            )
          ) : t.total === 0 ? (
            <p className="py-16 text-center text-body2 text-muted-foreground">
              {filtersActive ? "No announcements match these filters." : emptyCopy[tab]}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <SelectHead all={t.selection.allOnPage} some={t.selection.someOnPage} onToggle={t.selection.togglePage} />
                    <SortHead label="Announcement" sortKey="title" sort={t.sort} onSort={t.toggleSort} />
                    <TableHead>Audience</TableHead>
                    <TableHead>Channels</TableHead>
                    <TableHead>Status</TableHead>
                    <SortHead label="Sent or scheduled" sortKey="date" sort={t.sort} onSort={t.toggleSort} />
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {t.pagedRows.map((a) => {
                    const on = t.selection.isSelected(a.id)
                    return (
                      <TableRow key={a.id} onClick={() => setViewingId(a.id)} className={cn("cursor-pointer", on && "bg-muted")}>
                        <TableCell className="w-12">
                          <Checkbox checked={on} onChange={() => t.selection.toggle(a.id)} label={`Select ${a.title}`} />
                        </TableCell>
                        <TableCell className="max-w-[280px]">
                          <p className="truncate text-body2 font-semibold text-foreground" title={a.title}>
                            {a.title}
                          </p>
                          <p className="truncate text-caption text-muted-foreground" title={a.message}>
                            {a.message}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-[140px]">
                          <p className="truncate text-foreground" title={audienceSummary(a.audience)}>
                            {audienceSummary(a.audience)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <ChannelIcons channels={a.channels} />
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-2 whitespace-nowrap text-foreground">
                            <span className={cn("size-2 rounded-full", STATUS_DOT[a.status])} />
                            {a.status}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums">
                          <span className={a.status === "Draft" ? "text-muted-foreground" : "text-foreground"}>{formatDateTime(a.date)}</span>
                          {a.status === "Draft" && <span className="block text-caption">Last edited</span>}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <RowMenu
                            items={
                              a.status === "Sent"
                                ? [
                                    { label: "View results", onSelect: () => setViewingId(a.id) },
                                    { label: "Send again as new", onSelect: () => duplicate(a) },
                                  ]
                                : a.status === "Scheduled"
                                  ? [
                                      { label: "Edit", onSelect: () => setEditing(a) },
                                      { label: "Move to drafts", onSelect: () => unschedule(a.id) },
                                    ]
                                  : [
                                      { label: "Edit", onSelect: () => setEditing(a) },
                                      { label: "Delete draft", onSelect: () => remove([a.id]), destructive: true },
                                    ]
                            }
                          />
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
                noun="announcements"
              />
            </>
          )}
        </>
      )}

      {!onSubscribers && (
        <BulkBar count={t.selection.count} total={t.total} onSelectAll={t.selection.selectAll} onClear={t.selection.clear}>
          <BulkAction onClick={bulkDuplicate}>Duplicate</BulkAction>
          {selectedDrafts.length > 0 && (
            <BulkAction tone="danger" onClick={bulkDeleteDrafts}>
              Delete {selectedDrafts.length === t.selection.count ? "" : `${selectedDrafts.length} `}draft{selectedDrafts.length === 1 ? "" : "s"}
            </BulkAction>
          )}
        </BulkBar>
      )}

      <AnnouncementDetail
        announcement={viewing}
        onClose={() => setViewingId(null)}
        onEdit={(a) => {
          setViewingId(null)
          setEditing(a)
        }}
        onDuplicate={(a) => {
          setViewingId(null)
          duplicate(a)
        }}
        onDelete={(a) => {
          setViewingId(null)
          remove([a.id])
          setNotice(`“${a.title}” was deleted.`)
        }}
        onUnschedule={(a) => {
          setViewingId(null)
          unschedule(a.id)
          setNotice(`“${a.title}” moved to drafts.`)
        }}
      />
    </div>
  )
}

export default AnnouncementsPage
