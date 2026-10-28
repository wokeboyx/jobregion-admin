import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { BadgeCheck, CalendarDays, Mail, MapPin, Phone, X } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { SelectMenu } from "@/components/ui/select-menu"
import { StatusPill } from "@/components/ui/status-pill"
import { jobCover } from "@/lib/photos"
import { jobs } from "@/lib/mock-data"
import { INBOX_TAGS, type InboxConversation, type InboxStatus } from "@/lib/inbox-data"
import { CHANNEL_ICON, STATUS_PILL, assignableAdmins, contactOf, formatDate, lastAt, listTime, lookupUser, personKey } from "./helpers"

const STATUS_OPTIONS: InboxStatus[] = ["New", "Open", "Waiting on them", "Closed"]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border px-5 py-5 first:border-t-0">
      <h3 className="mb-3 text-caption font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-3">
      <span className="shrink-0 text-body2 text-muted-foreground">{label}</span>
      <div className="min-w-0 text-right text-body2 text-foreground">{children}</div>
    </div>
  )
}

function Details({
  conversation,
  all,
  onClose,
  onOpen,
  onAssign,
  onStatus,
  onTags,
}: {
  conversation: InboxConversation
  all: InboxConversation[]
  onClose: () => void
  onOpen: (id: string) => void
  onAssign: (id: string, adminId: string) => void
  onStatus: (id: string, status: InboxStatus) => void
  onTags: (id: string, tags: string[]) => void
}) {
  const contact = contactOf(conversation)
  const user = conversation.userId ? lookupUser(conversation.userId) : undefined
  const job = jobs.find((j) => j.id === conversation.linkedJobId)
  const ChannelIcon = CHANNEL_ICON[conversation.channel]
  const tags = conversation.tags ?? []
  const key = personKey(conversation)
  const previous = all
    .filter((c) => c.id !== conversation.id && personKey(c) === key)
    .sort((a, b) => lastAt(b).localeCompare(lastAt(a)))
  const verified = user?.verification === "success"

  return (
    <aside aria-label="Conversation details" className="flex min-h-0 flex-col border-l border-border">
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-border px-5">
        <h2 className="heading-card">Details</h2>
        <button
          type="button"
          aria-label="Hide details"
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-full text-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Section title="Person">
          <div className="flex items-center gap-3">
            <Avatar name={contact.name} className="size-12 text-body2" />
            <div className="min-w-0">
              <p className="flex items-center gap-1 truncate text-body1 font-semibold text-foreground">
                <span className="truncate">{contact.name}</span>
                {verified && <BadgeCheck className="size-4 shrink-0 text-foreground" aria-label="Verified" />}
              </p>
              <p className="truncate text-caption text-muted-foreground">
                {user ? `${user.roles.join(" and ")} · ${user.verificationLabel}` : "Guest, no account"}
              </p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-body2 text-foreground">
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate" title={contact.email}>
                {contact.email || "No email"}
              </span>
            </li>
            {user && (
              <>
                <li className="flex items-center gap-2.5">
                  <Phone className="size-4 shrink-0 text-muted-foreground" />
                  {user.phone}
                </li>
                <li className="flex items-center gap-2.5">
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  {user.location}
                </li>
                <li className="flex items-center gap-2.5">
                  <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                  Joined {formatDate(user.dateJoined)}
                </li>
              </>
            )}
          </ul>
          {user && (
            <Link to={`/users/${user.id}`} className="mt-4 inline-block text-body2 font-semibold text-foreground underline underline-offset-2">
              View profile
            </Link>
          )}
        </Section>

        <Section title="Conversation">
          <Field label="Topic">{conversation.topic}</Field>
          <Field label="Channel">
            <span className="inline-flex items-center gap-1.5">
              <ChannelIcon className="size-3.5" />
              {conversation.channel}
            </span>
          </Field>
          <Field label="Assignee">
            <SelectMenu
              aria-label="Assignee"
              align="right"
              placeholder="Unassigned"
              value={conversation.assignedAdminId ?? ""}
              onChange={(v) => onAssign(conversation.id, v)}
              options={[{ value: "", label: "Unassigned" }, ...assignableAdmins]}
              className="ml-auto"
            />
          </Field>
          <Field label="Status">
            <SelectMenu
              aria-label="Status"
              align="right"
              value={conversation.status}
              onChange={(v) => onStatus(conversation.id, v as InboxStatus)}
              options={STATUS_OPTIONS}
              className="ml-auto"
              menuClassName="min-w-44"
            />
          </Field>
        </Section>

        <Section title="Tags">
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((t) => (
              <span key={t} className="inline-flex h-7 items-center gap-1 rounded-full border border-border pl-2.5 pr-1 text-caption font-medium text-foreground">
                {t}
                <button
                  type="button"
                  aria-label={`Remove tag ${t}`}
                  onClick={() => onTags(conversation.id, tags.filter((x) => x !== t))}
                  className="flex size-5 items-center justify-center rounded-full hover:bg-muted"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
            {tags.length < INBOX_TAGS.length && (
              <SelectMenu
                aria-label="Add a tag"
                placeholder="Add tag"
                value=""
                onChange={(v) => onTags(conversation.id, [...tags, v])}
                options={INBOX_TAGS.filter((t) => !tags.includes(t))}
                className="[&>button]:h-7 [&>button]:px-2.5 [&>button]:text-caption"
                menuClassName="min-w-40"
              />
            )}
          </div>
        </Section>

        <Section title="Linked job">
          {job ? (
            <Link to={`/jobs/${job.id}`} className="-mx-2 flex items-center gap-3 rounded-lg p-2 hover:bg-muted">
              <img src={jobCover(job.id)} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
              <span className="min-w-0">
                <span className="block truncate text-body2 font-semibold text-foreground">{job.title}</span>
                <span className="block truncate text-caption text-muted-foreground">
                  {job.poster} · {job.budget}
                </span>
              </span>
            </Link>
          ) : (
            <p className="text-body2 text-muted-foreground">No job linked.</p>
          )}
        </Section>

        <Section title={`Previous conversations (${previous.length})`}>
          {previous.length === 0 ? (
            <p className="text-body2 text-muted-foreground">This is their first conversation with us.</p>
          ) : (
            <ul className="-mx-2">
              {previous.slice(0, 8).map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(c.id)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg p-2 text-left hover:bg-muted"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-body2 font-medium text-foreground">{c.topic}</span>
                      <span className="block truncate text-caption text-muted-foreground">
                        {c.id} · {listTime(lastAt(c))}
                      </span>
                    </span>
                    <StatusPill status={STATUS_PILL[c.status]} label={c.status} className="shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </aside>
  )
}

export { Details }
