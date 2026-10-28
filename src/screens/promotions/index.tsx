import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowDown, ArrowUp, Megaphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { PageHeader } from "@/components/page-header"
import { PillTabs } from "@/components/pill-tabs"
import { PhotoCard } from "@/components/photo-card"
import { FilterBar } from "@/components/filter-bar"
import { RowMenu } from "@/components/row-menu"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { ViewToggle, type View } from "@/components/view-toggle"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { BulkAction, BulkBar, Checkbox, SelectHead, SortHead } from "@/components/data-table"
import { Pagination } from "@/components/pagination"
import { EmptyState, ErrorState } from "@/components/page-state"
import { cn } from "@/lib/utils"
import { useTable } from "@/lib/use-table"
import { usePreviewState } from "@/lib/preview-state"
import {
  promotions,
  ANCHOR_DATE,
  getPromotionEndDate,
  getPromotionTimeRemaining,
  getPromotionStatus,
  promotionPlans as initialPlans,
  naira,
  type Promotion,
  type PromotionPlanConfig,
} from "@/lib/mock-data"
import { planFor, promotionTarget, PROMOTES_LABEL, runnerOf, shortDate } from "./helpers"
import { PlanDialog } from "./plan-dialog"
import { PricingCard } from "./pricing-card"

const TYPE_OPTIONS = ["Job", "Profile"]

/** Airbnb Earnings style number: small grey label, big bold figure. */
function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <p className="text-body2 text-muted-foreground">{label}</p>
      <p className="mt-1 text-h3 font-bold tracking-tight text-foreground">{value}</p>
      {note && <p className="mt-0.5 text-body2 text-muted-foreground">{note}</p>}
    </div>
  )
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-body2 text-foreground">
      <span className={cn("size-2 rounded-full", active ? "bg-success" : "bg-muted-foreground/50")} />
      {active ? "Active" : "Ended"}
    </span>
  )
}

function daysLeft(p: Promotion) {
  const end = new Date(`${getPromotionEndDate(p)}T00:00:00`).getTime()
  return Math.round((end - new Date(`${ANCHOR_DATE}T00:00:00`).getTime()) / 86400000)
}

function PromotionsSummary({ plans, isActive }: { plans: PromotionPlanConfig[]; isActive: (p: Promotion) => boolean }) {
  const month = ANCHOR_DATE.slice(0, 7)
  const active = promotions.filter(isActive).length
  const thisMonth = promotions.filter((p) => p.startDate.startsWith(month))
  const money = thisMonth.reduce((sum, p) => sum + planFor(plans, p.plan).price, 0)
  const views = promotions.reduce((sum, p) => sum + p.viewsGenerated, 0)
  const messages = promotions.reduce((sum, p) => sum + p.messages, 0)
  const monthName = new Date(`${month}-01T00:00:00`).toLocaleDateString("en-GB", { month: "long" })

  return (
    <div className="mb-10 grid grid-cols-2 gap-x-8 gap-y-6 border-b border-border pb-10 lg:grid-cols-4">
      <Stat label="Active now" value={active.toLocaleString()} note={`of ${promotions.length.toLocaleString()} promotions`} />
      <Stat label={`Earned in ${monthName}`} value={naira(money)} note={`${thisMonth.length} bought this month`} />
      <Stat label="Total views" value={views.toLocaleString()} note="From all promotions" />
      <Stat label="Messages" value={messages.toLocaleString()} note="Started from a promotion" />
    </div>
  )
}

type StatusKey = "all" | "active" | "ended"

function PromotionsTab({ plans }: { plans: PromotionPlanConfig[] }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState<StatusKey>("all")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All types")
  const [planFilter, setPlanFilter] = useState("All plans")
  const [view, setView] = useState<View>("list")
  const [ended, setEnded] = useState<Set<string>>(() => new Set())
  const [confirmEnd, setConfirmEnd] = useState<string[] | null>(null)

  const isActive = (p: Promotion) => !ended.has(p.id) && getPromotionStatus(p).status === "success"

  const planNames = useMemo(() => {
    const ids = new Set([...plans.map((p) => p.id), ...promotions.map((p) => p.plan)])
    return [...ids].map((id) => planFor(plans, id).name)
  }, [plans])

  const scoped = useMemo(() => {
    const query = search.trim().toLowerCase()
    return promotions.filter((p) => {
      if (typeFilter !== "All types" && p.type !== typeFilter) return false
      if (planFilter !== "All plans" && planFor(plans, p.plan).name !== planFilter) return false
      if (query) {
        const haystack = `${runnerOf(p).name} ${promotionTarget(p).label} ${p.reference}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [search, typeFilter, planFilter, plans])

  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const rows = useMemo(() => {
    if (previewState === "no-results") return []
    if (status === "all") return scoped
    return scoped.filter((p) => {
      const active = !ended.has(p.id) && getPromotionStatus(p).status === "success"
      return status === "active" ? active : !active
    })
  }, [scoped, status, ended, previewState])

  const t = useTable(rows, {
    getId: (p: Promotion) => p.id,
    sorters: {
      started: (p) => p.startDate,
      left: (p) => (ended.has(p.id) ? -1 : daysLeft(p)),
      views: (p) => p.viewsGenerated,
      messages: (p) => p.messages,
    },
    initialSort: { key: "started", dir: "desc" },
    pageSize: 25,
  })

  if (previewState === "error") return <ErrorState onRetry={() => setPreviewState("default")} />
  if (previewState === "empty")
    return (
      <EmptyState
        icon={Megaphone}
        title="No promotions yet"
        description="When a worker or employer boosts a profile or job, it'll show up here."
      />
    )

  const activeCount = scoped.filter(isActive).length
  const tabs = [
    { key: "all" as const, label: "All", count: scoped.length },
    { key: "active" as const, label: "Active", count: activeCount },
    { key: "ended" as const, label: "Ended", count: scoped.length - activeCount },
  ]
  const filtered = search.trim() !== "" || typeFilter !== "All types" || planFilter !== "All plans" || status !== "all"
  const clearFilters = () => {
    setSearch("")
    setTypeFilter("All types")
    setPlanFilter("All plans")
    setStatus("all")
  }
  const timeLeft = (p: Promotion) => (ended.has(p.id) ? "Ended early" : getPromotionTimeRemaining(p))

  return (
    <div>
      <PromotionsSummary plans={plans} isActive={isActive} />

      <div className="mb-6 flex flex-col items-stretch gap-6">
        <PillTabs options={tabs} value={status} onChange={setStatus} />
        <div className="flex w-full flex-wrap items-center gap-2">
          <FilterBar
            searchPlaceholder="Search by person, job or reference"
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              { label: "All types", options: TYPE_OPTIONS, value: typeFilter, onChange: setTypeFilter },
              { label: "All plans", options: planNames, value: planFilter, onChange: setPlanFilter },
            ]}
          />
          <ViewToggle value={view} onChange={setView} />
        </div>
      </div>

      <div className="mb-2 flex items-center gap-3 text-body2 text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{t.total.toLocaleString()}</span> {t.total === 1 ? "promotion" : "promotions"}
        </span>
        {filtered && (
          <button type="button" onClick={clearFilters} className="font-semibold text-foreground underline underline-offset-2">
            Clear filters
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="border-t border-border py-16 text-center">
          <p className="heading-card">No promotions match these filters</p>
          <p className="mt-1 text-body2 text-muted-foreground">Try a different search or clear the filters.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-border pt-6 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {t.pagedRows.map((p) => {
            const target = promotionTarget(p)
            const runner = runnerOf(p)
            const active = isActive(p)
            return (
              <div key={p.id} className="relative">
                <PhotoCard
                  to={`/promotions/${p.id}`}
                  photo={target.photo}
                  badge={planFor(plans, p.plan).name}
                  corner={
                    <span className="flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-caption font-semibold text-foreground shadow-[0_1px_4px_rgb(0_0_0/0.12)]">
                      <span className={cn("size-1.5 rounded-full", active ? "bg-success" : "bg-muted-foreground/60")} />
                      {active ? "Active" : "Ended"}
                    </span>
                  }
                  title={target.label}
                  lines={[`Run by ${runner.name}`, timeLeft(p) === "Ended" ? `Ended ${shortDate(getPromotionEndDate(p))}` : timeLeft(p)]}
                  footer={
                    <span>
                      <span className="font-semibold">{p.viewsGenerated.toLocaleString()} views</span>
                      <span className="text-muted-foreground"> · {p.messages} messages</span>
                    </span>
                  }
                />
                {p.type === "Profile" && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[20/19]">
                    <Avatar name={runner.name} className="absolute bottom-3 left-3 size-12 text-body2 ring-[3px] ring-white shadow-[0_2px_8px_rgb(0_0_0/0.2)]" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SelectHead all={t.selection.allOnPage} some={t.selection.someOnPage} onToggle={t.selection.togglePage} />
              <TableHead>Promoted</TableHead>
              <TableHead>Run by</TableHead>
              <TableHead>Plan</TableHead>
              <SortHead label="Time left" sortKey="left" sort={t.sort} onSort={t.toggleSort} />
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {t.pagedRows.map((p) => {
              const target = promotionTarget(p)
              const runner = runnerOf(p)
              const plan = planFor(plans, p.plan)
              return (
                <TableRow key={p.id} onClick={() => navigate(`/promotions/${p.id}`)} className="cursor-pointer">
                  <TableCell>
                    <Checkbox checked={t.selection.isSelected(p.id)} onChange={() => t.selection.toggle(p.id)} label={`Select ${target.label}`} />
                  </TableCell>
                  <TableCell className="max-w-[320px]">
                    <div className="flex items-center gap-3">
                      <img src={target.photo} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground" title={target.label}>
                          {target.label}
                        </p>
                        <p className="text-caption text-muted-foreground">{p.type} promotion</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {runner.to ? (
                      <Link
                        to={runner.to}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 whitespace-nowrap text-foreground hover:underline"
                      >
                        <Avatar name={runner.name} className="size-7 text-caption" />
                        {runner.name}
                      </Link>
                    ) : (
                      <span className="flex items-center gap-2 whitespace-nowrap text-foreground">
                        <Avatar name={runner.name} className="size-7 text-caption" />
                        {runner.name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="font-medium text-foreground">{plan.name}</span>
                    <span className="block text-caption">
                      {plan.days} days · {naira(plan.price)}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="text-foreground">{timeLeft(p)}</span>
                    <span className="block text-caption tabular-nums">Ends {shortDate(getPromotionEndDate(p))}</span>
                  </TableCell>
                  <TableCell>
                    <StatusDot active={isActive(p)} />
                  </TableCell>
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
        noun="promotions"
      />

      <BulkBar count={t.selection.count} total={t.total} onSelectAll={t.selection.selectAll} onClear={t.selection.clear}>
        <BulkAction tone="danger" onClick={() => setConfirmEnd(t.selection.rows.filter(isActive).map((p) => p.id))}>
          End promotion
        </BulkAction>
      </BulkBar>

      <ConfirmationDialog
        open={confirmEnd !== null}
        onClose={() => setConfirmEnd(null)}
        tone="destructive"
        title={
          confirmEnd?.length === 0
            ? "These promotions have already ended"
            : `End ${confirmEnd?.length === 1 ? "this promotion" : `${confirmEnd?.length ?? 0} promotions`} now?`
        }
        description={
          confirmEnd?.length === 0
            ? "None of the selected promotions are running, so there's nothing to end."
            : "The Promoted badge comes off straight away and they drop back to normal results. This doesn't refund anyone; refund from Payments if you need to."
        }
        confirmLabel={confirmEnd?.length === 0 ? "OK" : "End now"}
        onConfirm={() => {
          if (!confirmEnd?.length) return
          setEnded((s) => new Set([...s, ...confirmEnd]))
          t.selection.clear()
        }}
      />
    </div>
  )
}

const TABS = [
  { key: "promotions", label: "Promotions" },
  { key: "plans", label: "Plans and prices" },
] as const

type TabKey = (typeof TABS)[number]["key"]

type PlanEdit = { mode: "create" } | { mode: "edit"; plan: PromotionPlanConfig }

/** Plans as a short ordered table (the order is the order on the Promote page) with the live pricing cards under it. */
function PlansTab({
  plans,
  setPlans,
  edit,
  setEdit,
}: {
  plans: PromotionPlanConfig[]
  setPlans: (update: (plans: PromotionPlanConfig[]) => PromotionPlanConfig[]) => void
  edit: PlanEdit | null
  setEdit: (edit: PlanEdit | null) => void
}) {
  const [deleting, setDeleting] = useState<PromotionPlanConfig | null>(null)

  const runningOn = (planId: string) => promotions.filter((p) => p.plan === planId && getPromotionStatus(p).status === "success").length

  const move = (index: number, by: -1 | 1) =>
    setPlans((ps) => {
      const next = [...ps]
      const [item] = next.splice(index, 1)
      next.splice(index + by, 0, item)
      return next
    })

  const save = (data: Omit<PromotionPlanConfig, "id">, id?: string) =>
    setPlans((ps) => {
      const clearPopular = (p: PromotionPlanConfig) => (data.popular ? { ...p, popular: false } : p)
      if (id) return ps.map((p) => (p.id === id ? { ...data, id } : clearPopular(p)))
      return [...ps.map(clearPopular), { ...data, id: `plan-${Date.now()}` }]
    })

  const duplicate = (plan: PromotionPlanConfig) =>
    setPlans((ps) => {
      const i = ps.findIndex((p) => p.id === plan.id)
      const copy = { ...plan, perks: [...plan.perks], id: `${plan.id}-copy-${Date.now()}`, name: `${plan.name} (copy)`, popular: false, active: false }
      return [...ps.slice(0, i + 1), copy, ...ps.slice(i + 1)]
    })

  const toggleActive = (plan: PromotionPlanConfig) => setPlans((ps) => ps.map((p) => (p.id === plan.id ? { ...p, active: !p.active } : p)))

  const live = plans.filter((p) => p.active)
  const deletingRunning = deleting ? runningOn(deleting.id) : 0

  return (
    <div>
      <div className="mb-6 max-w-2xl">
        <h2 className="heading-section">What people can buy</h2>
        <p className="mt-2 text-body1 text-muted-foreground">
          The web app's Promote page lists these plans in this order. Posting and messaging stay free; promotions and Pro
          are the only paid extras.
        </p>
      </div>

      {plans.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No plans yet"
          description="Create a plan so people can promote their jobs and profiles."
          action={<Button onClick={() => setEdit({ mode: "create" })}>Create plan</Button>}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-24">Order</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Length</TableHead>
              <TableHead>Promotes</TableHead>
              <TableHead>Shared to</TableHead>
              <TableHead className="text-right">Running now</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan, i) => (
              <TableRow key={plan.id} onClick={() => setEdit({ mode: "edit", plan })} className="cursor-pointer">
                <TableCell>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      aria-label={`Move ${plan.name} up`}
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                      className="flex size-8 items-center justify-center rounded-full border border-input text-foreground hover:border-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${plan.name} down`}
                      disabled={i === plans.length - 1}
                      onClick={() => move(i, 1)}
                      className="flex size-8 items-center justify-center rounded-full border border-input text-foreground hover:border-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{plan.name}</span>
                    {plan.popular && (
                      <span className="rounded-full bg-foreground px-2 py-0.5 text-caption font-semibold text-white">Most popular</span>
                    )}
                  </span>
                  <span className="block max-w-[260px] truncate text-caption" title={plan.reach}>
                    {plan.reach || "No reach line"}
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-foreground">{naira(plan.price)}</TableCell>
                <TableCell className="whitespace-nowrap tabular-nums">{plan.days} days</TableCell>
                <TableCell className="whitespace-nowrap">{PROMOTES_LABEL[plan.promotes]}</TableCell>
                <TableCell className="whitespace-nowrap">{plan.channels?.length ? plan.channels.join(", ") : "—"}</TableCell>
                <TableCell className="text-right tabular-nums text-foreground">{runningOn(plan.id)}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap text-foreground">
                    <span className={cn("size-2 rounded-full", plan.active ? "bg-success" : "bg-muted-foreground/50")} />
                    {plan.active ? "On sale" : "Paused"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <RowMenu
                    items={[
                      { label: "Edit", onSelect: () => setEdit({ mode: "edit", plan }) },
                      { label: "Duplicate", onSelect: () => duplicate(plan) },
                      { label: plan.active ? "Pause" : "Resume", onSelect: () => toggleActive(plan) },
                      ...(i > 0 ? [{ label: "Move up", onSelect: () => move(i, -1) }] : []),
                      ...(i < plans.length - 1 ? [{ label: "Move down", onSelect: () => move(i, 1) }] : []),
                      { label: "Delete", destructive: true, onSelect: () => setDeleting(plan) },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <section className="mt-12 border-t border-border pt-10">
        <h2 className="heading-section">How the Promote page shows them</h2>
        <p className="mt-1 text-body2 text-muted-foreground">Only plans on sale appear in the app. Paused plans are hidden.</p>
        {live.length === 0 ? (
          <p className="mt-6 text-body1 text-muted-foreground">No plans are on sale, so people can't promote anything right now.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {live.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                footer={
                  <div className="flex gap-2">
                    <Button size="lg" className="flex-1" onClick={() => setEdit({ mode: "edit", plan })}>
                      Edit plan
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => toggleActive(plan)}>
                      Pause
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </section>

      {edit && (
        <PlanDialog
          key={edit.mode === "edit" ? edit.plan.id : "new"}
          plan={edit.mode === "edit" ? edit.plan : undefined}
          onClose={() => setEdit(null)}
          onSave={(data) => save(data, edit.mode === "edit" ? edit.plan.id : undefined)}
        />
      )}

      <ConfirmationDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        tone="destructive"
        title={`Delete ${deleting?.name ?? "this plan"}?`}
        description={
          deletingRunning > 0
            ? `${deletingRunning} ${deletingRunning === 1 ? "promotion is" : "promotions are"} running on ${deleting?.name} right now. They keep running until they end, but no one can buy this plan again. To stop sales for a while, pause it instead.`
            : `No promotions are running on it. No one will be able to buy it again. To stop sales for a while, pause it instead.`
        }
        confirmLabel="Delete plan"
        onConfirm={() => {
          if (deleting) setPlans((ps) => ps.filter((p) => p.id !== deleting.id))
        }}
      />
    </div>
  )
}

function PromotionsPage() {
  const [tab, setTab] = useState<TabKey>("promotions")
  const [plans, setPlans] = useState<PromotionPlanConfig[]>(initialPlans)
  const [edit, setEdit] = useState<PlanEdit | null>(null)

  return (
    <div>
      <PageHeader
        title="Promotions"
        description="Boosted jobs and profiles, and the plans people can buy to get seen."
        actions={tab === "plans" && <Button onClick={() => setEdit({ mode: "create" })}>Create plan</Button>}
      />
      <PillTabs options={TABS} value={tab} onChange={setTab} className="mb-10" />
      {tab === "promotions" ? <PromotionsTab plans={plans} /> : <PlansTab plans={plans} setPlans={setPlans} edit={edit} setEdit={setEdit} />}
    </div>
  )
}

export default PromotionsPage
