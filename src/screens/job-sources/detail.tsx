import { useMemo, useState, type ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { AlertCircle, ChevronRight, ExternalLink, Inbox, Search } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { PillTabs } from "@/components/pill-tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SelectMenu } from "@/components/ui/select-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BulkAction, BulkBar, Checkbox, SelectHead, SortHead } from "@/components/data-table"
import { Pagination } from "@/components/pagination"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { cn } from "@/lib/utils"
import { useTable } from "@/lib/use-table"
import {
  ALL_CATEGORIES,
  CONNECTION_LABEL,
  defaultImportRules,
  defaultPublishRules,
  eligibleJobs,
  getJobSource,
  hostOf,
  importsJobs,
  markReviewed,
  publishesJobs,
  runSync,
  type JobSource,
} from "@/lib/job-sources"
import type { JobListing } from "@/lib/mock-data"
import { allJobs } from "@/screens/jobs/generated"
import { jobPhoto } from "@/screens/jobs/job-photos"
import { CategoryChips, CategoryMapEditor, ChipGroup, DirectionPills, SourceLogo, SourceStatusDot, TagInput, Toggle } from "./parts"
import { DIRECTIONS, DIRECTION_TEXT, EXPIRE_OPTIONS, FREQUENCY_OPTIONS, MODE_OPTIONS, SCOPE_OPTIONS, endpointLabel, scopeText } from "./options"

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="border-t border-border py-8">
      <h2 className="heading-section">{title}</h2>
      {description && <p className="mt-1 text-body2 text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

/**
 * Airbnb's editable settings row: label and current value with an "Edit" link; Edit opens the fields in place with
 * Save, and dims the other rows until you save or cancel.
 */
function EditRow<T>({
  label,
  display,
  value,
  open,
  locked,
  onOpen,
  onClose,
  onSave,
  editor,
}: {
  label: string
  display: ReactNode
  value: T
  open: boolean
  locked: boolean
  onOpen: () => void
  onClose: () => void
  onSave: (v: T) => void
  editor: (draft: T, setDraft: (v: T) => void) => ReactNode
}) {
  return (
    <div className={cn("border-b border-border py-5 transition-opacity", locked && "pointer-events-none opacity-40")}>
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-body1 font-semibold text-foreground">{label}</p>
          {!open && <div className="mt-0.5 text-body2 text-muted-foreground">{display}</div>}
        </div>
        <button type="button" onClick={open ? onClose : onOpen} className="shrink-0 text-body2 font-semibold text-foreground underline underline-offset-2 hover:text-muted-foreground">
          {open ? "Cancel" : "Edit"}
        </button>
      </div>
      {open && (
        <RowEditor
          value={value}
          editor={editor}
          onSave={(v) => {
            onSave(v)
            onClose()
          }}
        />
      )}
    </div>
  )
}

function RowEditor<T>({ value, editor, onSave }: { value: T; editor: (draft: T, setDraft: (v: T) => void) => ReactNode; onSave: (v: T) => void }) {
  const [draft, setDraft] = useState(value)
  return (
    <div className="mt-4 flex flex-col gap-4">
      {editor(draft, setDraft)}
      <Button className="w-fit" onClick={() => onSave(draft)}>
        Save
      </Button>
    </div>
  )
}

const onOff = (v: boolean) => (v ? "On" : "Off")
const list = (v: string[], empty: string) => (v.length ? v.join(", ") : empty)

const DOT: Record<string, string> = { success: "bg-success", warning: "bg-warning", destructive: "bg-destructive", neutral: "bg-muted-foreground" }

function JobStatus({ job }: { job: JobListing }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-body2 text-foreground">
      <span className={cn("size-2 rounded-full", DOT[job.removed ? "destructive" : job.status])} />
      {job.removed ? "Removed" : job.statusLabel === "Pending Review" ? "Needs review" : job.statusLabel}
    </span>
  )
}

type JobTab = "all" | "pending" | "open"

/** Jobs that came in from this source, as a table with sorting, paging and bulk review. */
function ImportedJobs({ source }: { source: JobSource }) {
  const navigate = useNavigate()
  const [version, setVersion] = useState(0)
  const [tab, setTab] = useState<JobTab>("all")
  const [search, setSearch] = useState("")
  const [removeOpen, setRemoveOpen] = useState(false)

  // `version` changes after a bulk action so the mutated rows are read again.
  const all = useMemo(() => {
    void version
    return allJobs().filter((j) => j.source === source.name)
  }, [source.name, version])
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return all.filter((j) => {
      if (tab === "pending" && j.statusLabel !== "Pending Review") return false
      if (tab === "open" && (j.statusLabel !== "Open" || j.removed)) return false
      return !q || `${j.title} ${j.poster}`.toLowerCase().includes(q)
    })
  }, [all, tab, search])
  const t = useTable(rows, {
    getId: (j) => j.id,
    sorters: { title: (j) => j.title, views: (j) => j.views, posted: (j) => j.datePosted },
    initialSort: { key: "posted", dir: "desc" },
    pageSize: 10,
  })

  const pending = t.selection.rows.filter((j) => j.statusLabel === "Pending Review" && !j.removed)
  const approve = () => {
    pending.forEach((j) => Object.assign(j, { status: "success", statusLabel: "Open" }))
    markReviewed(source, pending.length)
    t.selection.clear()
    setVersion((v) => v + 1)
  }
  const remove = () => {
    t.selection.rows.forEach((j) => Object.assign(j, { removed: true, status: "destructive", statusLabel: "Removed" }))
    t.selection.clear()
    setVersion((v) => v + 1)
  }

  const tabs = [
    { key: "all" as const, label: "All", count: all.length },
    { key: "pending" as const, label: "Needs review", count: all.filter((j) => j.statusLabel === "Pending Review").length },
    { key: "open" as const, label: "Open", count: all.filter((j) => j.statusLabel === "Open" && !j.removed).length },
  ]

  if (all.length === 0) return <p className="text-body2 text-muted-foreground">No jobs from {source.name} on Jobs Region yet. Run a sync to pull some in.</p>

  return (
    <>
      <div className="mb-3 flex flex-col items-stretch gap-6">
        <PillTabs options={tabs} value={tab} onChange={setTab} />
        <div className="relative h-10 w-[26rem] max-w-full">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-foreground" />
          <input
            type="search"
            aria-label="Search imported jobs"
            placeholder="Search jobs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-full border border-input bg-card pl-10 pr-4 text-body2 text-foreground outline-none placeholder:text-muted-foreground hover:border-foreground focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
          />
        </div>
      </div>
      <p className="mb-2 text-body2 text-muted-foreground">
        {t.total.toLocaleString()} job{t.total === 1 ? "" : "s"}
        {(tab !== "all" || search) && (
          <button
            type="button"
            onClick={() => {
              setTab("all")
              setSearch("")
            }}
            className="ml-3 font-semibold text-foreground underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </p>
      {t.total === 0 ? (
        <p className="border-t border-border py-10 text-center text-body2 text-muted-foreground">No jobs match these filters.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SelectHead all={t.selection.allOnPage} some={t.selection.someOnPage} onToggle={t.selection.togglePage} />
              <SortHead label="Job" sortKey="title" sort={t.sort} onSort={t.toggleSort} />
              <TableHead>Status</TableHead>
              <SortHead label="Views" sortKey="views" sort={t.sort} onSort={t.toggleSort} align="right" />
              <SortHead label="Imported" sortKey="posted" sort={t.sort} onSort={t.toggleSort} className="last:pr-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {t.pagedRows.map((j) => (
              <TableRow key={j.id} onClick={() => navigate(`/jobs/${j.id}`)} className={cn("cursor-pointer", j.removed && "opacity-60")}>
                <TableCell className="w-12">
                  <Checkbox checked={t.selection.isSelected(j.id)} onChange={() => t.selection.toggle(j.id)} label={`Select ${j.title}`} />
                </TableCell>
                <TableCell className="py-2.5">
                  <div className="flex items-center gap-3">
                    <img src={jobPhoto(j)} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p title={j.title} className="max-w-72 truncate text-body2 font-semibold text-foreground">
                        {j.title}
                      </p>
                      <p className="max-w-72 truncate text-caption text-muted-foreground">
                        {j.poster} · {j.budget}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <JobStatus job={j} />
                </TableCell>
                <TableCell className="text-right tabular-nums">{j.views.toLocaleString()}</TableCell>
                <TableCell className="whitespace-nowrap tabular-nums last:pr-0">{j.datePosted}</TableCell>
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
        noun="jobs"
      />
      <BulkBar count={t.selection.count} total={t.total} onSelectAll={t.selection.selectAll} onClear={t.selection.clear}>
        {pending.length > 0 && <BulkAction onClick={approve}>Approve {pending.length}</BulkAction>}
        <BulkAction tone="danger" onClick={() => setRemoveOpen(true)}>
          Remove
        </BulkAction>
      </BulkBar>
      <ConfirmationDialog
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        onConfirm={remove}
        tone="destructive"
        title={`Remove ${t.selection.count} job${t.selection.count === 1 ? "" : "s"}?`}
        description="They come off Jobs Region. The originals on the source site are not touched."
        confirmLabel="Remove"
      />
    </>
  )
}

function SentJobs({ source }: { source: JobSource }) {
  const rows = eligibleJobs(source).slice(0, 5)
  if (rows.length === 0) return <p className="text-body2 text-muted-foreground">No open jobs match these rules right now.</p>
  return (
    <div className="divide-y divide-border">
      {rows.map((j) => (
        <Link key={j.id} to={`/jobs/${j.id}`} className="-mx-3 flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted">
          <img src={jobPhoto(j)} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body2 font-semibold text-foreground">{j.title}</p>
            <p className="truncate text-caption text-muted-foreground">
              {j.category} · {source.publishRules?.includeBudget ? j.budget : "Budget hidden"}
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-foreground" />
        </Link>
      ))}
    </div>
  )
}

function JobSourceDetailPage() {
  const { id } = useParams()
  const source = getJobSource(id ?? "")
  const [, setVersion] = useState(0)
  const [editing, setEditing] = useState<string>()
  const [syncing, setSyncing] = useState(false)
  const [disconnectOpen, setDisconnectOpen] = useState(false)

  if (!source) {
    return <PageHeader title="Source not found" description="It may have been removed, or the link is wrong." back={{ to: "/job-sources", label: "Back to job sources" }} />
  }

  /** Writes to the shared mock source and re-renders. */
  const update = (p: Partial<JobSource>) => {
    Object.assign(source, p)
    setVersion((v) => v + 1)
  }
  const row = (key: string) => ({
    open: editing === key,
    locked: editing !== undefined && editing !== key,
    onOpen: () => setEditing(key),
    onClose: () => setEditing(undefined),
  })

  const syncNow = () => {
    setSyncing(true)
    window.setTimeout(() => {
      runSync(source)
      setSyncing(false)
      setVersion((v) => v + 1)
    }, 900)
  }

  const imports = importsJobs(source)
  const publishes = publishesJobs(source)
  const ir = source.importRules
  const pr = source.publishRules
  const inactive = source.status === "Paused" || source.status === "Not connected"

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-4">
            <SourceLogo source={source} size="size-12" />
            {source.name}
          </span>
        }
        description={`${CONNECTION_LABEL[source.connection]} · ${DIRECTION_TEXT[source.direction]}`}
        back={{ to: "/job-sources", label: "Back to job sources" }}
      />

      <div className="grid grid-cols-1 gap-x-20 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          {source.status === "Error" && (
            <div className="mb-8 flex items-start gap-3 rounded-xl border border-destructive/40 p-4">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div>
                <p className="text-body1 font-semibold text-foreground">The last sync failed</p>
                <p className="text-body2 text-muted-foreground">{source.errorMessage}</p>
              </div>
            </div>
          )}

          <Section title="Connection">
            <EditRow
              {...row("name")}
              label="Name"
              display={source.name}
              value={source.name}
              onSave={(name) => update({ name: name.trim() || source.name })}
              editor={(v, set) => <Input aria-label="Name" value={v} onChange={(e) => set(e.target.value)} />}
            />
            <EditRow
              {...row("endpoint")}
              label={endpointLabel(source.connection, source.direction)}
              display={<span className="break-all">{source.endpoint}</span>}
              value={source.endpoint}
              onSave={(endpoint) => update({ endpoint: endpoint.trim() })}
              editor={(v, set) => <Input aria-label="URL" type="url" value={v} onChange={(e) => set(e.target.value)} />}
            />
            {source.connection === "API" && (
              <EditRow
                {...row("key")}
                label="API key"
                display={source.apiKeyHint ? `•••• •••• ${source.apiKeyHint}` : "Not set"}
                value=""
                onSave={(key) => key.trim().length >= 8 && update({ apiKeyHint: key.trim().slice(-4) })}
                editor={(v, set) => <Input aria-label="New API key" type="password" placeholder="Paste a new key (at least 8 characters)" value={v} onChange={(e) => set(e.target.value)} />}
              />
            )}
            <EditRow
              {...row("direction")}
              label="Direction"
              display={DIRECTION_TEXT[source.direction]}
              value={source.direction}
              onSave={(direction) =>
                update({
                  direction,
                  importRules: direction !== "Publish" ? (source.importRules ?? defaultImportRules()) : source.importRules,
                  publishRules: direction !== "Import" ? (source.publishRules ?? defaultPublishRules()) : source.publishRules,
                })
              }
              editor={(v, set) => <ChipGroup options={DIRECTIONS} value={v} onChange={set} />}
            />
            <EditRow
              {...row("frequency")}
              label="Sync frequency"
              display={source.connection === "Webhook" ? "Real time (webhook)" : source.frequency}
              value={source.frequency}
              onSave={(frequency) => update({ frequency })}
              editor={(v, set) => <ChipGroup options={FREQUENCY_OPTIONS} value={v} onChange={set} />}
            />
            {source.website && (
              <a href={source.website} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-body2 font-semibold text-foreground underline underline-offset-2">
                {hostOf(source.website)} <ExternalLink className="size-3.5" />
              </a>
            )}
          </Section>

          {imports && ir && (
            <Section title="Import rules" description="What happens to jobs we pull in from this source.">
              <EditRow
                {...row("map")}
                label="Category mapping"
                display={ir.categoryMap.length ? `${ir.categoryMap.length} mapped · others go to ${ir.defaultCategory}` : `Everything goes to ${ir.defaultCategory}`}
                value={{ map: ir.categoryMap, fallback: ir.defaultCategory }}
                onSave={(v) => update({ importRules: { ...ir, categoryMap: v.map.filter((m) => m.from.trim() && m.to), defaultCategory: v.fallback } })}
                editor={(v, set) => (
                  <>
                    <CategoryMapEditor value={v.map} onChange={(map) => set({ ...v, map })} />
                    <div>
                      <p className="mb-2 text-body2 font-semibold text-foreground">Anything else goes to</p>
                      <SelectMenu variant="field" aria-label="Default category" value={v.fallback} onChange={(fallback) => set({ ...v, fallback })} options={ALL_CATEGORIES} />
                    </div>
                  </>
                )}
              />
              <EditRow
                {...row("keywords")}
                label="Keyword filter"
                display={list(ir.keywords, "All jobs")}
                value={ir.keywords}
                onSave={(keywords) => update({ importRules: { ...ir, keywords } })}
                editor={(v, set) => <TagInput label="Keywords" placeholder="Type a word and press Enter" value={v} onChange={set} />}
              />
              <EditRow
                {...row("locations")}
                label="Location filter"
                display={list(ir.locations, "All of Nigeria")}
                value={ir.locations}
                onSave={(locations) => update({ importRules: { ...ir, locations } })}
                editor={(v, set) => <TagInput label="Locations" placeholder="e.g. Lagos" value={v} onChange={set} />}
              />
              <EditRow
                {...row("mode")}
                label="New jobs"
                display={MODE_OPTIONS.find((o) => o[0] === ir.mode)?.[1]}
                value={ir.mode}
                onSave={(mode) => update({ importRules: { ...ir, mode } })}
                editor={(v, set) => <ChipGroup options={MODE_OPTIONS} value={v} onChange={set} />}
              />
              <EditRow
                {...row("dedupe")}
                label="Skip duplicates (same title and poster)"
                display={onOff(ir.dedupe)}
                value={ir.dedupe}
                onSave={(dedupe) => update({ importRules: { ...ir, dedupe } })}
                editor={(v, set) => <Toggle checked={v} onChange={set} label="Skip duplicates" />}
              />
              <EditRow
                {...row("attribution")}
                label="Attribution"
                display={ir.attribution ? `Shows "Imported from ${source.name}" with a link to the original` : "Off"}
                value={ir.attribution}
                onSave={(attribution) => update({ importRules: { ...ir, attribution } })}
                editor={(v, set) => <Toggle checked={v} onChange={set} label="Attribution" />}
              />
              <EditRow
                {...row("expire")}
                label="Expire imported jobs after"
                display={`${ir.expireDays} days`}
                value={String(ir.expireDays)}
                onSave={(v) => update({ importRules: { ...ir, expireDays: Number(v) } })}
                editor={(v, set) => <SelectMenu variant="field" aria-label="Expire after" value={v} onChange={set} options={EXPIRE_OPTIONS} />}
              />
            </Section>
          )}

          {publishes && pr && (
            <Section title="Publish rules" description="Which Jobs Region jobs we send to this site.">
              <EditRow
                {...row("scope")}
                label="Jobs to send"
                display={scopeText(pr)}
                value={{ scope: pr.scope, categories: pr.categories }}
                onSave={(v) => update({ publishRules: { ...pr, ...v } })}
                editor={(v, set) => (
                  <>
                    <ChipGroup options={SCOPE_OPTIONS} value={v.scope} onChange={(scope) => set({ ...v, scope })} />
                    {v.scope === "categories" && <CategoryChips value={v.categories} onChange={(categories) => set({ ...v, categories })} />}
                  </>
                )}
              />
              <EditRow
                {...row("budget")}
                label="Include the budget"
                display={onOff(pr.includeBudget)}
                value={pr.includeBudget}
                onSave={(includeBudget) => update({ publishRules: { ...pr, includeBudget } })}
                editor={(v, set) => <Toggle checked={v} onChange={set} label="Include the budget" />}
              />
              <EditRow
                {...row("linkBack")}
                label="Link back to Jobs Region"
                display={onOff(pr.linkBack)}
                value={pr.linkBack}
                onSave={(linkBack) => update({ publishRules: { ...pr, linkBack } })}
                editor={(v, set) => <Toggle checked={v} onChange={set} label="Link back to Jobs Region" />}
              />
            </Section>
          )}

          <Section title="Sync history">
            {source.history.length === 0 ? (
              <p className="text-body2 text-muted-foreground">No syncs yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="first:pl-0">Time</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="text-right">{imports ? "Found" : "Matched"}</TableHead>
                    <TableHead className="text-right">{imports ? "Added" : "Sent"}</TableHead>
                    <TableHead className="text-right">Duplicates</TableHead>
                    <TableHead className="text-right last:pr-0">Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {source.history.map((h) => (
                    <TableRow key={h.id} className="hover:bg-transparent">
                      <TableCell className="whitespace-nowrap py-3 first:pl-0">
                        <p className="text-body2 text-foreground">{h.at}</p>
                        {h.note && <p className="max-w-72 truncate text-caption text-muted-foreground" title={h.note}>{h.note}</p>}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 text-body2 text-foreground">
                          <span className={cn("size-2 rounded-full", h.result === "Success" ? "bg-success" : h.result === "Partial" ? "bg-warning" : "bg-destructive")} />
                          {h.result}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{h.found}</TableCell>
                      <TableCell className="text-right tabular-nums text-foreground">{h.added}</TableCell>
                      <TableCell className="text-right tabular-nums">{h.duplicates}</TableCell>
                      <TableCell className={cn("text-right tabular-nums last:pr-0", h.errors > 0 && "text-destructive")}>{h.errors}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Section>

          {imports && (
            <Section title="Imported jobs" description="Approve or remove jobs that came in from this source.">
              <ImportedJobs source={source} />
            </Section>
          )}
          {publishes && (
            <Section title="Jobs being sent" description="Open jobs that match the publish rules right now.">
              <SentJobs source={source} />
            </Section>
          )}
        </div>

        <aside>
          <div className="sticky top-28 rounded-xl border border-border p-6 shadow-card">
            <SourceStatusDot status={source.status} className="font-semibold" />
            <div className="mt-2">
              <DirectionPills direction={source.direction} />
            </div>

            <div className="mt-5 divide-y divide-border border-y border-border text-body2">
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">Last sync</span>
                <span className="font-semibold text-foreground">{source.lastSync}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">Frequency</span>
                <span className="font-semibold text-foreground">{source.connection === "Webhook" ? "Real time" : source.frequency}</span>
              </div>
              {imports && (
                <>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-muted-foreground">Jobs pulled in</span>
                    <span className="font-semibold tabular-nums text-foreground">{source.jobsImported.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-muted-foreground">Waiting in review</span>
                    <span className="font-semibold tabular-nums text-foreground">{source.waitingReview}</span>
                  </div>
                </>
              )}
              {publishes && (
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground">Jobs published</span>
                  <span className="font-semibold tabular-nums text-foreground">{source.jobsPublished.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              {source.status === "Not connected" ? (
                <Button size="lg" className="w-full" onClick={() => update({ status: "Connected" })}>
                  Connect
                </Button>
              ) : (
                <>
                  <Button size="lg" className="w-full" disabled={syncing || inactive} onClick={syncNow}>
                    {syncing ? "Syncing…" : "Sync now"}
                  </Button>
                  <Button variant="outline" size="lg" className="w-full" onClick={() => update({ status: source.status === "Paused" ? "Connected" : "Paused" })}>
                    {source.status === "Paused" ? "Resume" : "Pause"}
                  </Button>
                  <Button variant="destructive" size="lg" className="w-full" onClick={() => setDisconnectOpen(true)}>
                    Disconnect
                  </Button>
                </>
              )}
              {source.waitingReview > 0 && (
                <Link to="/jobs" className="flex items-center justify-center gap-1.5 pt-1 text-body2 font-semibold text-foreground underline underline-offset-2">
                  <Inbox className="size-4" /> Review queue
                </Link>
              )}
            </div>
          </div>
        </aside>
      </div>

      <ConfirmationDialog
        open={disconnectOpen}
        onClose={() => setDisconnectOpen(false)}
        onConfirm={() => update({ status: "Not connected" })}
        tone="destructive"
        title={`Disconnect ${source.name}?`}
        description="Syncing stops. Jobs already imported stay on Jobs Region, and you can connect again later."
        confirmLabel="Disconnect"
      />
    </div>
  )
}

export default JobSourceDetailPage
