import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Briefcase, ChevronDown, Link2, MessageSquareText, PanelRight, Search, UserRound, X } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/ui/status-pill"
import { cn } from "@/lib/utils"
import { jobCover } from "@/lib/photos"
import { jobs, users } from "@/lib/mock-data"
import { SAVED_REPLIES, type InboxConversation, type InboxMessage, type InboxStatus } from "@/lib/inbox-data"
import { CHANNEL_ICON, STATUS_PILL, adminName, contactOf, dayLabel } from "./helpers"
import { Popover } from "./popover"

type Attachment = NonNullable<InboxMessage["links"]>[number]

/** Messages split by day, and runs from the same sender inside a day (only the first shows the name). */
function groupByDay(messages: InboxMessage[]) {
  const days: { date: string; messages: (InboxMessage & { first: boolean })[] }[] = []
  messages.forEach((m, i) => {
    const date = m.at.split(" ")[0]
    let day = days[days.length - 1]
    if (!day || day.date !== date) {
      day = { date, messages: [] }
      days.push(day)
    }
    const prev = messages[i - 1]
    const first = !prev || prev.from !== m.from || prev.adminId !== m.adminId || prev.at.split(" ")[0] !== date
    day.messages.push({ ...m, first })
  })
  return days
}

function LinkCard({ link }: { link: Attachment }) {
  const job = link.kind === "job" ? jobs.find((j) => j.id === link.id) : undefined
  return (
    <Link
      to={link.kind === "job" ? `/jobs/${link.id}` : `/users/${link.id}`}
      className="flex w-72 max-w-full items-center gap-3 rounded-xl border border-border bg-card p-2 text-left transition-colors hover:bg-muted"
    >
      {job ? (
        <img src={jobCover(job.id)} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
      ) : (
        <Avatar name={link.label} className="size-10 text-caption" />
      )}
      <span className="min-w-0">
        <span className="block truncate text-body2 font-semibold text-foreground">{link.label}</span>
        <span className="block truncate text-caption text-muted-foreground">
          {link.kind === "job" ? `Job · ${job?.location ?? link.id}` : "Profile on Jobs Region"}
        </span>
      </span>
    </Link>
  )
}

function AttachPicker({ onPick }: { onPick: (a: Attachment) => void }) {
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()
  const results = useMemo(() => {
    const js = jobs
      .filter((j) => !j.removed && (!q || `${j.title} ${j.poster} ${j.location}`.toLowerCase().includes(q)))
      .slice(0, 5)
      .map((j): Attachment & { sub: string } => ({ kind: "job", id: j.id, label: j.title, sub: `${j.poster} · ${j.location}` }))
    const us = users
      .filter((u) => !u.removed && (!q || `${u.name} ${u.email}`.toLowerCase().includes(q)))
      .slice(0, 5)
      .map((u): Attachment & { sub: string } => ({ kind: "user", id: u.id, label: u.name, sub: `${u.roles.join(", ")} · ${u.location}` }))
    return [...js, ...us]
  }, [q])

  return (
    <div>
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs or people…"
            className="h-9 w-full rounded-full border border-input bg-card pl-9 pr-3 text-body2 text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
          />
        </div>
      </div>
      <ul className="max-h-72 overflow-y-auto">
        {results.map((r) => (
          <li key={`${r.kind}-${r.id}`}>
            <button
              type="button"
              onClick={() => onPick({ kind: r.kind, id: r.id, label: r.label })}
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted"
            >
              {r.kind === "job" ? (
                <img src={jobCover(r.id)} alt="" className="size-8 shrink-0 rounded-md object-cover" />
              ) : (
                <Avatar name={r.label} className="size-8 text-caption" />
              )}
              <span className="min-w-0">
                <span className="block truncate text-body2 font-medium text-foreground">{r.label}</span>
                <span className="block truncate text-caption text-muted-foreground">{r.sub}</span>
              </span>
            </button>
          </li>
        ))}
        {results.length === 0 && <li className="px-4 py-6 text-center text-body2 text-muted-foreground">Nothing matches.</li>}
      </ul>
    </div>
  )
}

function Thread({
  conversation,
  detailsOpen,
  onToggleDetails,
  onSend,
  onStatus,
}: {
  conversation: InboxConversation
  detailsOpen: boolean
  onToggleDetails: () => void
  onSend: (id: string, body: string, links: Attachment[]) => void
  onStatus: (id: string, status: InboxStatus) => void
}) {
  const [draft, setDraft] = useState("")
  const [links, setLinks] = useState<Attachment[]>([])
  const endRef = useRef<HTMLDivElement>(null)
  const contact = contactOf(conversation)
  const ChannelIcon = CHANNEL_ICON[conversation.channel]
  const closed = conversation.status === "Closed"
  const days = useMemo(() => groupByDay(conversation.messages), [conversation.messages])
  const canSend = draft.trim().length > 0 || links.length > 0

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" })
  }, [conversation.messages.length])

  const send = () => {
    if (!canSend) return
    onSend(conversation.id, draft.trim(), links)
    setDraft("")
    setLinks([])
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-border px-6">
        <div className="min-w-0">
          <h2 className="heading-card truncate">{contact.name}</h2>
          <p className="flex items-center gap-1.5 truncate text-caption text-muted-foreground">
            <ChannelIcon className="size-3.5 shrink-0" />
            {conversation.topic} · {conversation.channel} · {conversation.id}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusPill status={STATUS_PILL[conversation.status]} label={conversation.status} />
          {closed ? (
            <Button variant="outline" size="sm" onClick={() => onStatus(conversation.id, "Open")}>
              Reopen
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onStatus(conversation.id, "Closed")}>
              Close
            </Button>
          )}
          <button
            type="button"
            aria-label={detailsOpen ? "Hide details" : "Show details"}
            aria-pressed={detailsOpen}
            onClick={onToggleDetails}
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted",
              detailsOpen ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <PanelRight className="size-4" />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[640px]">
          {days.map((day) => (
            <section key={day.date} aria-label={dayLabel(day.date)} className="mb-6">
              <div className="sticky top-0 z-10 mb-4 flex justify-center">
                <span className="rounded-full border border-border bg-card px-3 py-1 text-caption font-semibold text-muted-foreground">
                  {dayLabel(day.date)}
                </span>
              </div>
              <div className="space-y-1">
                {day.messages.map((m) => {
                  const ours = m.from === "us"
                  const name = ours ? adminName(m.adminId) : contact.name
                  const time = m.at.split(" ")[1]
                  return (
                    <div key={m.id} className={cn("flex gap-2.5", ours && "flex-row-reverse", m.first && "pt-3")}>
                      <div className="w-8 shrink-0">{m.first && <Avatar name={name} className="size-8 text-caption" />}</div>
                      <div className={cn("flex max-w-[78%] flex-col gap-1.5", ours ? "items-end" : "items-start")}>
                        {m.first && (
                          <p className="text-caption text-muted-foreground">
                            <span className="font-semibold text-foreground">{ours ? name.split(" ")[0] : name}</span> · {time}
                          </p>
                        )}
                        {m.body && (
                          <p
                            title={time}
                            className={cn(
                              "whitespace-pre-line rounded-2xl px-4 py-2.5 text-body2",
                              ours ? "bg-primary text-white" : "bg-muted-strong text-foreground",
                              m.first && (ours ? "rounded-tr-md" : "rounded-tl-md"),
                            )}
                          >
                            {m.body}
                          </p>
                        )}
                        {m.links?.map((l) => <LinkCard key={`${l.kind}-${l.id}`} link={l} />)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
          {closed && (
            <p className="border-t border-border pt-5 text-center text-body2 text-muted-foreground">
              This conversation is closed. Sending a reply opens it again.
            </p>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="sticky bottom-0 shrink-0 border-t border-border bg-card px-6 pb-4 pt-3">
        <div className="rounded-xl border border-input focus-within:border-transparent focus-within:ring-2 focus-within:ring-foreground">
          {links.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-3 pt-3">
              {links.map((l) => (
                <span key={`${l.kind}-${l.id}`} className="inline-flex h-7 max-w-64 items-center gap-1.5 rounded-full bg-muted-strong pl-2.5 pr-1 text-caption font-medium text-foreground">
                  {l.kind === "job" ? <Briefcase className="size-3.5 shrink-0" /> : <UserRound className="size-3.5 shrink-0" />}
                  <span className="truncate">{l.label}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${l.label}`}
                    onClick={() => setLinks((xs) => xs.filter((x) => x !== l))}
                    className="flex size-5 items-center justify-center rounded-full hover:bg-border"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <label htmlFor="inbox-reply" className="sr-only">
            Reply
          </label>
          <textarea
            id="inbox-reply"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                send()
              }
            }}
            placeholder={`Reply to ${contact.name.split(" ")[0]}…`}
            className="block h-20 w-full resize-none bg-transparent px-3.5 py-3 text-body2 text-foreground outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center gap-1 px-2 pb-2">
            <Popover
              label="Saved replies"
              trigger={({ open, toggle }) => (
                <button
                  type="button"
                  onClick={toggle}
                  aria-expanded={open}
                  className={cn("flex h-8 items-center gap-1.5 rounded-full px-3 text-body2 font-medium text-foreground hover:bg-muted", open && "bg-muted")}
                >
                  <MessageSquareText className="size-4" />
                  Saved replies
                  <ChevronDown className="size-3.5" />
                </button>
              )}
            >
              {(close) => (
                <ul>
                  {SAVED_REPLIES.map((r) => (
                    <li key={r.label}>
                      <button
                        type="button"
                        onClick={() => {
                          setDraft((d) => (d.trim() ? `${d.trim()}\n\n${r.body}` : r.body))
                          close()
                        }}
                        className="block w-full px-4 py-2.5 text-left hover:bg-muted"
                      >
                        <span className="block text-body2 font-semibold text-foreground">{r.label}</span>
                        <span className="line-clamp-2 text-caption text-muted-foreground">{r.body}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Popover>
            <Popover
              label="Attach a job or profile"
              trigger={({ open, toggle }) => (
                <button
                  type="button"
                  onClick={toggle}
                  aria-expanded={open}
                  className={cn("flex h-8 items-center gap-1.5 rounded-full px-3 text-body2 font-medium text-foreground hover:bg-muted", open && "bg-muted")}
                >
                  <Link2 className="size-4" />
                  Attach link
                </button>
              )}
            >
              {(close) => (
                <AttachPicker
                  onPick={(a) => {
                    setLinks((xs) => (xs.some((x) => x.kind === a.kind && x.id === a.id) ? xs : [...xs, a]))
                    close()
                  }}
                />
              )}
            </Popover>
            <p className="ml-auto hidden pr-2 text-caption text-muted-foreground xl:block">
              Sent by {conversation.channel === "In-app" ? "in-app message and email" : "email"} · ⌘↵
            </p>
            <Button size="sm" onClick={send} disabled={!canSend} className="ml-auto xl:ml-0">
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Thread, type Attachment }
