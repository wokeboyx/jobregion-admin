import { useMemo, useState } from "react"
import { Route, Routes, useNavigate, useParams } from "react-router-dom"
import { Inbox as InboxIcon, MessageSquare, Search } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { SelectMenu } from "@/components/ui/select-menu"
import { StatusPill } from "@/components/ui/status-pill"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BackButton } from "@/components/back-button"
import { PageHeader } from "@/components/page-header"
import { PillTabs } from "@/components/pill-tabs"
import { Pagination } from "@/components/pagination"
import { BulkAction, BulkBar, Checkbox, SelectHead } from "@/components/data-table"
import { EmptyState, ErrorState } from "@/components/page-state"
import { cn } from "@/lib/utils"
import { useTable } from "@/lib/use-table"
import { usePreviewState } from "@/lib/preview-state"
import { currentAdminId } from "@/lib/mock-data"
import { inboxConversations, type InboxChannel, type InboxConversation, type InboxStatus } from "@/lib/inbox-data"
import { CHANNEL_ICON, STATUS_PILL, adminName, contactOf, lastAt, lastMessage, listTime, nowStamp } from "./helpers"
import { Thread, type Attachment } from "./thread"
import { Details } from "./details"

type ViewKey = "unassigned" | "mine" | "open" | "waiting" | "closed" | "all"
type SortKey = "newest" | "oldest" | "unassigned"

const CHANNELS: InboxChannel[] = ["Website form", "In-app", "Email"]
const ALL_CHANNELS = "All channels"

const isOpen = (c: InboxConversation) => c.status !== "Closed"

const VIEW_FILTER: Record<ViewKey, (c: InboxConversation) => boolean> = {
  unassigned: (c) => isOpen(c) && !c.assignedAdminId,
  mine: (c) => isOpen(c) && c.assignedAdminId === currentAdminId,
  open: isOpen,
  waiting: (c) => c.status === "Waiting on them",
  closed: (c) => c.status === "Closed",
  all: () => true,
}

const VIEWS: { key: ViewKey; label: string }[] = [
  { key: "unassigned", label: "Unassigned" },
  { key: "mine", label: "Mine" },
  { key: "open", label: "All open" },
  { key: "waiting", label: "Waiting on them" },
  { key: "closed", label: "Closed" },
  { key: "all", label: "Everything" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "unassigned", label: "Unassigned first" },
]

function InboxList({
  items,
  onBulk,
}: {
  items: InboxConversation[]
  onBulk: (ids: string[], change: (c: InboxConversation) => InboxConversation) => void
}) {
  const navigate = useNavigate()
  const [view, setView] = useState<ViewKey>("unassigned")
  const [search, setSearch] = useState("")
  const [channel, setChannel] = useState(ALL_CHANNELS)
  const [sortKey, setSortKey] = useState<SortKey>("newest")
  const { state: previewState, setState: setPreviewState } = usePreviewState()

  const rows = useMemo(() => {
    if (previewState === "no-results") return []
    const query = search.trim().toLowerCase()
    const filtered = items.filter((c) => {
      if (!VIEW_FILTER[view](c)) return false
      if (channel !== ALL_CHANNELS && c.channel !== channel) return false
      if (!query) return true
      const contact = contactOf(c)
      return `${c.id} ${contact.name} ${contact.email} ${c.topic} ${c.channel} ${(c.tags ?? []).join(" ")} ${c.messages.map((m) => m.body).join(" ")}`
        .toLowerCase()
        .includes(query)
    })
    const newest = (a: InboxConversation, b: InboxConversation) => lastAt(b).localeCompare(lastAt(a))
    if (sortKey === "oldest") return filtered.sort((a, b) => -newest(a, b))
    if (sortKey === "unassigned") return filtered.sort((a, b) => Number(!!a.assignedAdminId) - Number(!!b.assignedAdminId) || newest(a, b))
    return filtered.sort(newest)
  }, [items, view, search, channel, sortKey, previewState])

  const t = useTable(rows, { getId: (c) => c.id, pageSize: 25 })
  const filtersActive = search !== "" || channel !== ALL_CHANNELS
  const clearFilters = () => {
    setSearch("")
    setChannel(ALL_CHANNELS)
  }

  const bulkAssignToMe = () => {
    onBulk(t.selection.rows.map((c) => c.id), (c) => ({ ...c, assignedAdminId: currentAdminId, status: c.status === "New" ? "Open" : c.status }))
    t.selection.clear()
  }
  const bulkClose = () => {
    onBulk(t.selection.rows.map((c) => c.id), (c) => ({ ...c, status: "Closed" }))
    t.selection.clear()
  }

  return (
    <div>
      <PageHeader
        title="Inbox"
        description="Messages people send from the website contact form, Help & support in the app, and replies to our emails."
      />

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : previewState === "empty" ? (
        <EmptyState
          icon={MessageSquare}
          title="No messages yet"
          description="When someone writes to Jobs Region from the website, the app or by email, it shows up here."
        />
      ) : (
        <>
          <div className="mb-3 flex flex-col items-stretch gap-6">
            <PillTabs
              options={VIEWS.map((v) => ({ ...v, count: items.filter(VIEW_FILTER[v.key]).length }))}
              value={view}
              onChange={(k) => {
                setView(k)
                t.selection.clear()
              }}
            />
            <div className="flex w-full flex-wrap items-center gap-2">
              <div className="relative h-10 w-[26rem] max-w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-foreground" />
                <input
                  type="search"
                  aria-label="Search conversations"
                  placeholder="Search name, email, message or tag"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-full border border-input bg-card pl-10 pr-4 text-body2 text-foreground outline-none placeholder:text-muted-foreground hover:border-foreground focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
                />
              </div>
              <SelectMenu aria-label="Channel" value={channel} onChange={setChannel} options={[ALL_CHANNELS, ...CHANNELS]} />
              <SelectMenu aria-label="Sort" value={sortKey} onChange={(v) => setSortKey(v as SortKey)} options={SORT_OPTIONS} />
            </div>
          </div>

          <p className="mb-2 text-body2 text-muted-foreground">
            <span className="font-semibold text-foreground">{t.total.toLocaleString()}</span> conversation{t.total === 1 ? "" : "s"}
            {filtersActive && (
              <button type="button" onClick={clearFilters} className="ml-3 font-semibold text-foreground underline underline-offset-2">
                Clear filters
              </button>
            )}
          </p>

          {t.total === 0 ? (
            <div className="border-t border-border py-16 text-center">
              <p className="heading-card">{filtersActive ? "No conversations match" : view === "unassigned" ? "Everything is assigned" : "Nothing here"}</p>
              <p className="mt-1 text-body2 text-muted-foreground">
                {filtersActive ? "Try another name, email or word." : "Pick another tab above."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <SelectHead all={t.selection.allOnPage} some={t.selection.someOnPage} onToggle={t.selection.togglePage} />
                  <TableHead>Person</TableHead>
                  <TableHead>Latest message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead className="text-right">Last activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {t.pagedRows.map((c) => {
                  const contact = contactOf(c)
                  const last = lastMessage(c)
                  const unread = c.status === "New"
                  const ChannelIcon = CHANNEL_ICON[c.channel]
                  return (
                    <TableRow
                      key={c.id}
                      onClick={() => navigate(`/inbox/${c.id}`)}
                      className={cn("cursor-pointer", t.selection.isSelected(c.id) && "bg-muted")}
                    >
                      <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={t.selection.isSelected(c.id)} onChange={() => t.selection.toggle(c.id)} label={`Select conversation with ${contact.name}`} />
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={contact.name} className="size-10 text-caption" />
                          <div className="min-w-0">
                            <p title={contact.name} className={cn("flex max-w-36 items-center gap-2 truncate text-body2 text-foreground", unread ? "font-bold" : "font-semibold")}>
                              <span className="truncate">{contact.name}</span>
                              {unread && <span className="size-2 shrink-0 rounded-full bg-brand" aria-label="New" />}
                            </p>
                            <p title={contact.email} className="max-w-36 truncate text-caption text-muted-foreground">
                              {contact.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="flex max-w-60 items-center gap-1.5 truncate text-caption text-muted-foreground" title={c.channel}>
                          <ChannelIcon className="size-3.5 shrink-0" />
                          <span className="truncate">{c.topic}</span>
                        </p>
                        <p title={last?.body} className={cn("max-w-60 truncate", unread ? "font-semibold text-foreground" : "text-muted-foreground")}>
                          {last?.from === "us" && "You: "}
                          {last?.body || "Sent a link"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <StatusPill status={STATUS_PILL[c.status]} label={c.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {c.assignedAdminId ? (
                          <span className="flex items-center gap-2 text-foreground">
                            <Avatar name={adminName(c.assignedAdminId)} className="size-6 text-caption" />
                            {adminName(c.assignedAdminId)}
                          </span>
                        ) : isOpen(c) ? (
                          <span className="font-medium text-foreground">Unassigned</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right tabular-nums">{last && listTime(last.at)}</TableCell>
                    </TableRow>
                  )
                })}
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
            noun="conversations"
          />

          <BulkBar count={t.selection.count} total={t.total} onSelectAll={t.selection.selectAll} onClear={t.selection.clear}>
            <BulkAction onClick={bulkAssignToMe}>Assign to me</BulkAction>
            <BulkAction onClick={bulkClose}>Close</BulkAction>
          </BulkBar>
        </>
      )}
    </div>
  )
}

function InboxConversationPage({
  items,
  onSend,
  onStatus,
  onAssign,
  onTags,
}: {
  items: InboxConversation[]
  onSend: (id: string, body: string, links: Attachment[]) => void
  onStatus: (id: string, status: InboxStatus) => void
  onAssign: (id: string, adminId: string) => void
  onTags: (id: string, tags: string[]) => void
}) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [detailsOpen, setDetailsOpen] = useState(true)
  const conversation = items.find((c) => c.id === id)

  return (
    <div>
      <BackButton to="/inbox" label="Inbox" />
      {conversation ? (
        <div
          className={cn(
            "grid h-[calc(100vh-200px)] min-h-[560px] overflow-hidden rounded-xl border border-border",
            detailsOpen ? "grid-cols-[minmax(0,1fr)_320px]" : "grid-cols-[minmax(0,1fr)]",
          )}
        >
          <section aria-label="Conversation" className="min-h-0 min-w-0">
            <Thread
              key={conversation.id}
              conversation={conversation}
              detailsOpen={detailsOpen}
              onToggleDetails={() => setDetailsOpen((o) => !o)}
              onSend={onSend}
              onStatus={onStatus}
            />
          </section>
          {detailsOpen && (
            <Details
              conversation={conversation}
              all={items}
              onClose={() => setDetailsOpen(false)}
              onOpen={(next) => navigate(`/inbox/${next}`)}
              onAssign={onAssign}
              onStatus={onStatus}
              onTags={onTags}
            />
          )}
        </div>
      ) : (
        <EmptyState icon={InboxIcon} title="Conversation not found" description="It may have been removed. Go back to the inbox to pick another one." />
      )}
    </div>
  )
}

function InboxPage() {
  const [items, setItems] = useState<InboxConversation[]>(inboxConversations)

  const patch = (ids: string[], change: (c: InboxConversation) => InboxConversation) =>
    setItems((cs) => cs.map((c) => (ids.includes(c.id) ? change(c) : c)))

  const send = (id: string, body: string, links: Attachment[]) =>
    patch([id], (c) => ({
      ...c,
      status: "Waiting on them",
      assignedAdminId: c.assignedAdminId ?? currentAdminId,
      messages: [
        ...c.messages,
        { id: `m${c.messages.length + 1}-${Date.now()}`, from: "us", adminId: currentAdminId, body, at: nowStamp(), links: links.length ? links : undefined },
      ],
    }))

  return (
    <Routes>
      <Route index element={<InboxList items={items} onBulk={patch} />} />
      <Route
        path=":id"
        element={
          <InboxConversationPage
            items={items}
            onSend={send}
            onStatus={(id, status) => patch([id], (c) => ({ ...c, status }))}
            onAssign={(id, adminId) => patch([id], (c) => ({ ...c, assignedAdminId: adminId || undefined }))}
            onTags={(id, tags) => patch([id], (c) => ({ ...c, tags }))}
          />
        }
      />
    </Routes>
  )
}

export default InboxPage
