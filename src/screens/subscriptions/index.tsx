import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Check, X, Crown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Avatar } from "@/components/ui/avatar"
import { PageHeader } from "@/components/page-header"
import { PillTabs } from "@/components/pill-tabs"
import { FilterBar } from "@/components/filter-bar"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { FormDialog, FormField } from "@/components/form-dialog"
import { Pagination } from "@/components/pagination"
import { BulkAction, BulkBar, Checkbox, SelectHead, SortHead } from "@/components/data-table"
import { EmptyState, ErrorState } from "@/components/page-state"
import { SelectMenu } from "@/components/ui/select-menu"
import { cn } from "@/lib/utils"
import { useTable } from "@/lib/use-table"
import { usePreviewState } from "@/lib/preview-state"
import {
  subscriptionPlans as initialPlans,
  type SubscriptionPlan,
} from "@/lib/mock-data"
import { members, type Member } from "./members"

const TABS = [
  { key: "plans", label: "Plans" },
  { key: "subscribers", label: "Members" },
] as const

type TabKey = (typeof TABS)[number]["key"]

const BILLING_OPTIONS: SubscriptionPlan["billingPeriod"][] = ["Monthly", "Yearly"]
const AUDIENCE_OPTIONS: SubscriptionPlan["audience"][] = ["Worker", "Employer", "Both"]

function BenefitsEditor({
  benefits,
  onChange,
}: {
  benefits: string[]
  onChange: (next: string[]) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-body2 font-semibold text-foreground">Benefits</p>
      <div className="space-y-2">
        {benefits.map((value, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              value={value}
              onChange={(e) => onChange(benefits.map((b, idx) => (idx === i ? e.target.value : b)))}
              placeholder={`Benefit ${i + 1}`}
              className="h-12 w-full rounded-md border border-input bg-card px-4 text-body2 text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
            />
            {benefits.length > 1 && (
              <button
                type="button"
                aria-label="Remove benefit"
                onClick={() => onChange(benefits.filter((_, idx) => idx !== i))}
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...benefits, ""])}
        className="text-body2 font-semibold text-foreground underline underline-offset-2"
      >
        Add another benefit
      </button>
    </div>
  )
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <SelectMenu variant="field" value={value} onChange={onChange} options={options} />
  )
}

/** Airbnb Earnings style number: small grey label, big bold figure. */
function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <p className="text-body2 text-muted-foreground">{label}</p>
      <p className="mt-1 text-h3 font-bold leading-10 tracking-tight text-foreground">{value}</p>
      {note && <p className="mt-0.5 text-body2 text-muted-foreground">{note}</p>}
    </div>
  )
}

function PlansTab({ addOpen, setAddOpen }: { addOpen: boolean; setAddOpen: (open: boolean) => void }) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans)

  const [draftBenefits, setDraftBenefits] = useState<string[]>([""])
  const [draftBilling, setDraftBilling] = useState<SubscriptionPlan["billingPeriod"]>("Monthly")
  const [draftAudience, setDraftAudience] = useState<SubscriptionPlan["audience"]>("Worker")

  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null)
  const [editBenefits, setEditBenefits] = useState<string[]>([""])
  const [editBilling, setEditBilling] = useState<SubscriptionPlan["billingPeriod"]>("Monthly")
  const [editAudience, setEditAudience] = useState<SubscriptionPlan["audience"]>("Worker")

  const [deletePlanId, setDeletePlanId] = useState<string | null>(null)

  const resetAddForm = () => {
    setDraftBenefits([""])
    setDraftBilling("Monthly")
    setDraftAudience("Worker")
  }

  const openEdit = (plan: SubscriptionPlan) => {
    setEditPlan(plan)
    setEditBenefits(plan.benefits.length > 0 ? plan.benefits : [""])
    setEditBilling(plan.billingPeriod)
    setEditAudience(plan.audience)
  }

  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const isEmpty = previewState === "empty" || previewState === "no-results" || plans.length === 0

  return (
    <div>
      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : isEmpty ? (
        <EmptyState
          icon={Crown}
          title="No plans yet"
          description="Create a plan to offer Pro in the app."
          action={<Button onClick={() => setAddOpen(true)}>Add plan</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const active = plan.status === "success"
            return (
              <div
                key={plan.id}
                className="flex flex-col rounded-xl border border-border bg-card p-8 transition-shadow hover:shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="heading-card">{plan.name}</p>
                    <p className="mt-0.5 text-body2 text-muted-foreground">For {plan.audience === "Both" ? "everyone" : `${plan.audience.toLowerCase()}s`}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-2 text-body2 text-foreground">
                    <span className={cn("size-2 rounded-full", active ? "bg-success" : "bg-muted-foreground/50")} />
                    {plan.statusLabel}
                  </span>
                </div>

                <p className={cn("mt-5", !active && "opacity-50")}>
                  <span className="text-h3 font-bold leading-none tracking-tight text-foreground">{plan.price}</span>
                  <span className="text-body1 text-muted-foreground"> / {plan.billingPeriod === "Monthly" ? "month" : "year"}</span>
                </p>

                <ul className={cn("mt-6 space-y-3 border-t border-border pt-6", !active && "opacity-50")}>
                  {plan.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-body1 text-foreground">
                      <Check className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} />
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex items-center gap-2 pt-8">
                  <Button size="lg" className="flex-1" onClick={() => openEdit(plan)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      setPlans((ps) =>
                        ps.map((p) =>
                          p.id === plan.id
                            ? p.status === "success"
                              ? { ...p, status: "neutral", statusLabel: "Archived" }
                              : { ...p, status: "success", statusLabel: "Active" }
                            : p,
                        ),
                      )
                    }
                  >
                    {active ? "Archive" : "Reactivate"}
                  </Button>
                  <Button variant="destructive" size="lg" className="px-4" onClick={() => setDeletePlanId(plan.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <FormDialog
        open={addOpen}
        onClose={() => {
          setAddOpen(false)
          resetAddForm()
        }}
        title="Add plan"
        description="Create a new membership plan."
        submitLabel="Create plan"
        onSubmit={() => {
          const nameInput = document.getElementById("new-plan-name") as HTMLInputElement | null
          const priceInput = document.getElementById("new-plan-price") as HTMLInputElement | null
          const name = nameInput?.value.trim()
          const price = priceInput?.value.trim()
          if (!name || !price) return
          const benefits = draftBenefits.map((b) => b.trim()).filter(Boolean)
          setPlans((ps) => [
            ...ps,
            {
              id: `PLAN-${Date.now()}`,
              name,
              price,
              billingPeriod: draftBilling,
              audience: draftAudience,
              benefits,
              status: "success",
              statusLabel: "Active",
            },
          ])
          resetAddForm()
        }}
      >
        <FormField label="Plan name">
          <input
            id="new-plan-name"
            placeholder="e.g. Jobs Region Pro"
            className="h-12 w-full rounded-md border border-input bg-card px-4 text-body2 text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
          />
        </FormField>
        <FormField label="Price">
          <input
            id="new-plan-price"
            placeholder="e.g. ₦2,500"
            className="h-12 w-full rounded-md border border-input bg-card px-4 text-body2 text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
          />
        </FormField>
        <FormField label="Billing period">
          <SelectField value={draftBilling} onChange={(v) => setDraftBilling(v as SubscriptionPlan["billingPeriod"])} options={BILLING_OPTIONS} />
        </FormField>
        <FormField label="Audience">
          <SelectField value={draftAudience} onChange={(v) => setDraftAudience(v as SubscriptionPlan["audience"])} options={AUDIENCE_OPTIONS} />
        </FormField>
        <BenefitsEditor benefits={draftBenefits} onChange={setDraftBenefits} />
      </FormDialog>

      <FormDialog
        open={editPlan !== null}
        onClose={() => setEditPlan(null)}
        title="Edit plan"
        description="Update this plan's details."
        submitLabel="Save changes"
        onSubmit={() => {
          const nameInput = document.getElementById("edit-plan-name") as HTMLInputElement | null
          const priceInput = document.getElementById("edit-plan-price") as HTMLInputElement | null
          const name = nameInput?.value.trim()
          const price = priceInput?.value.trim()
          if (!name || !price || !editPlan) return
          const benefits = editBenefits.map((b) => b.trim()).filter(Boolean)
          setPlans((ps) =>
            ps.map((p) =>
              p.id === editPlan.id
                ? { ...p, name, price, billingPeriod: editBilling, audience: editAudience, benefits }
                : p,
            ),
          )
        }}
      >
        <FormField label="Plan name">
          <input
            id="edit-plan-name"
            defaultValue={editPlan?.name}
            className="h-12 w-full rounded-md border border-input bg-card px-4 text-body2 text-foreground outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
          />
        </FormField>
        <FormField label="Price">
          <input
            id="edit-plan-price"
            defaultValue={editPlan?.price}
            className="h-12 w-full rounded-md border border-input bg-card px-4 text-body2 text-foreground outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
          />
        </FormField>
        <FormField label="Billing period">
          <SelectField value={editBilling} onChange={(v) => setEditBilling(v as SubscriptionPlan["billingPeriod"])} options={BILLING_OPTIONS} />
        </FormField>
        <FormField label="Audience">
          <SelectField value={editAudience} onChange={(v) => setEditAudience(v as SubscriptionPlan["audience"])} options={AUDIENCE_OPTIONS} />
        </FormField>
        <BenefitsEditor benefits={editBenefits} onChange={setEditBenefits} />
      </FormDialog>

      <ConfirmationDialog
        open={deletePlanId !== null}
        onClose={() => setDeletePlanId(null)}
        tone="destructive"
        title="Delete this plan?"
        description="Existing subscribers will keep their current plan name on record, but no one will be able to subscribe to it going forward. This cannot be undone."
        confirmLabel="Delete plan"
        onConfirm={() => {
          if (deletePlanId) setPlans((ps) => ps.filter((p) => p.id !== deletePlanId))
        }}
      />
    </div>
  )
}

const ROLE_OPTIONS = ["Worker", "Employer"]

type MemberStatus = "all" | "active" | "cancelled"

function shortDate(iso: string) {
  if (!iso) return "—"
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function SubscribersTab() {
  const navigate = useNavigate()
  const [list, setList] = useState<Member[]>(members)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("All roles")
  const [planFilter, setPlanFilter] = useState("All plans")
  const [status, setStatus] = useState<MemberStatus>("all")
  const [confirmCancel, setConfirmCancel] = useState<string[] | null>(null)

  const planOptions = useMemo(() => initialPlans.map((p) => p.name), [])

  const metrics = useMemo(() => {
    const active = list.filter((m) => m.active)
    const monthly = active.reduce((sum, m) => {
      const plan = initialPlans.find((p) => p.id === m.planId)
      if (!plan) return sum
      const amount = Number(plan.price.replace(/[^\d.]/g, "")) || 0
      return sum + (plan.billingPeriod === "Yearly" ? amount / 12 : amount)
    }, 0)
    return {
      total: list.length,
      active: active.length,
      monthly: Math.round(monthly),
      workers: active.filter((m) => m.roles.includes("Worker")).length,
      employers: active.filter((m) => m.roles.includes("Employer")).length,
    }
  }, [list])

  const scoped = useMemo(() => {
    const query = search.trim().toLowerCase()
    return list.filter((m) => {
      const plan = initialPlans.find((p) => p.id === m.planId)
      if (roleFilter !== "All roles" && !m.roles.includes(roleFilter as "Worker" | "Employer")) return false
      if (planFilter !== "All plans" && plan?.name !== planFilter) return false
      if (query && !`${m.name} ${m.email}`.toLowerCase().includes(query)) return false
      return true
    })
  }, [list, search, roleFilter, planFilter])

  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const rows = useMemo(() => {
    if (previewState === "no-results") return []
    if (status === "all") return scoped
    return scoped.filter((m) => (status === "active" ? m.active : !m.active))
  }, [scoped, status, previewState])

  const t = useTable(rows, {
    getId: (m: Member) => m.id,
    sorters: { name: (m) => m.name, start: (m) => m.startDate, next: (m) => m.nextBillingDate || "9999" },
    initialSort: { key: "start", dir: "desc" },
    pageSize: 25,
  })

  if (previewState === "error") {
    return <ErrorState onRetry={() => setPreviewState("default")} />
  }

  if (previewState === "empty") {
    return (
      <EmptyState
        icon={Crown}
        title="No Pro members yet"
        description="When someone starts Pro in the app, they’ll show up here."
      />
    )
  }

  const activeCount = scoped.filter((m) => m.active).length
  const tabs = [
    { key: "all" as const, label: "All", count: scoped.length },
    { key: "active" as const, label: "Active", count: activeCount },
    { key: "cancelled" as const, label: "Cancelled", count: scoped.length - activeCount },
  ]
  const filtered = search.trim() !== "" || roleFilter !== "All roles" || planFilter !== "All plans" || status !== "all"
  const cancel = (ids: string[]) => {
    setList((ms) => ms.map((m) => (ids.includes(m.id) ? { ...m, active: false, nextBillingDate: "" } : m)))
    t.selection.clear()
  }

  return (
    <div>
      <div className="mb-10 border-b border-border pb-10">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4">
          <Stat label="Active members" value={metrics.active.toLocaleString()} note={`${metrics.total.toLocaleString()} all time`} />
          <Stat label="Monthly revenue" value={`₦${metrics.monthly.toLocaleString("en-NG")}`} note="From active members" />
          <Stat label="Workers" value={metrics.workers.toLocaleString()} note="Active" />
          <Stat label="Employers" value={metrics.employers.toLocaleString()} note="Active" />
        </div>
      </div>

      <div className="mb-6 flex flex-col items-stretch gap-6">
        <PillTabs options={tabs} value={status} onChange={setStatus} />
        <FilterBar
          searchPlaceholder="Search by name or email"
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            { label: "All roles", options: ROLE_OPTIONS, value: roleFilter, onChange: setRoleFilter },
            { label: "All plans", options: planOptions, value: planFilter, onChange: setPlanFilter },
          ]}
        />
      </div>

      <div className="mb-2 flex items-center gap-3 text-body2 text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{t.total.toLocaleString()}</span> {t.total === 1 ? "member" : "members"}
        </span>
        {filtered && (
          <button
            type="button"
            onClick={() => {
              setSearch("")
              setRoleFilter("All roles")
              setPlanFilter("All plans")
              setStatus("all")
            }}
            className="font-semibold text-foreground underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="border-t border-border py-16 text-center">
          <p className="heading-card">No members match these filters</p>
          <p className="mt-1 text-body2 text-muted-foreground">Try a different search or clear the filters.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SelectHead all={t.selection.allOnPage} some={t.selection.someOnPage} onToggle={t.selection.togglePage} />
              <SortHead label="Member" sortKey="name" sort={t.sort} onSort={t.toggleSort} />
              <TableHead>Role</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <SortHead label="Started" sortKey="start" sort={t.sort} onSort={t.toggleSort} />
              <SortHead label="Next billing" sortKey="next" sort={t.sort} onSort={t.toggleSort} />
              <TableHead className="w-40" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {t.pagedRows.map((m) => {
              const plan = initialPlans.find((p) => p.id === m.planId)
              return (
                <TableRow
                  key={m.id}
                  onClick={m.userId ? () => navigate(`/users/${m.userId}`) : undefined}
                  className={cn(m.userId && "cursor-pointer")}
                >
                  <TableCell>
                    <Checkbox checked={t.selection.isSelected(m.id)} onChange={() => t.selection.toggle(m.id)} label={`Select ${m.name}`} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} className="size-10 text-body2" />
                      <div className="min-w-0">
                        {m.userId ? (
                          <Link
                            to={`/users/${m.userId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="whitespace-nowrap font-semibold text-foreground hover:underline"
                          >
                            {m.name}
                          </Link>
                        ) : (
                          <p className="whitespace-nowrap font-semibold text-foreground">{m.name}</p>
                        )}
                        <p className="max-w-[240px] truncate text-caption text-muted-foreground" title={m.email}>
                          {m.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{m.roles.join(" · ")}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="text-foreground">{plan?.name ?? "Removed plan"}</span>
                    {plan && (
                      <span className="block text-caption">
                        {plan.price} / {plan.billingPeriod === "Monthly" ? "month" : "year"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 whitespace-nowrap text-foreground">
                      <span className={cn("size-2 rounded-full", m.active ? "bg-success" : "bg-muted-foreground/50")} />
                      {m.active ? "Active" : "Cancelled"}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">{shortDate(m.startDate)}</TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">{shortDate(m.nextBillingDate)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={m.active ? "destructive" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (m.active) setConfirmCancel([m.id])
                        else
                          setList((ms) =>
                            ms.map((x) => (x.id === m.id ? { ...x, active: true, nextBillingDate: "2026-08-07" } : x)),
                          )
                      }}
                    >
                      {m.active ? "Cancel" : "Reactivate"}
                    </Button>
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
        noun="members"
      />

      <BulkBar count={t.selection.count} total={t.total} onSelectAll={t.selection.selectAll} onClear={t.selection.clear}>
        <BulkAction tone="danger" onClick={() => setConfirmCancel(t.selection.rows.filter((m) => m.active).map((m) => m.id))}>
          Cancel membership
        </BulkAction>
      </BulkBar>

      <ConfirmationDialog
        open={confirmCancel !== null}
        onClose={() => setConfirmCancel(null)}
        tone="destructive"
        title={
          confirmCancel?.length === 0
            ? "These memberships are already cancelled"
            : `Cancel ${confirmCancel?.length === 1 ? "this membership" : `${confirmCancel?.length ?? 0} memberships`}?`
        }
        description={
          confirmCancel?.length === 0
            ? "None of the selected members have an active membership."
            : "They won't be charged again and Pro perks stop at the end of the period they've paid for. We'll email them."
        }
        confirmLabel={confirmCancel?.length === 0 ? "OK" : "Cancel membership"}
        cancelLabel="Keep"
        onConfirm={() => {
          if (confirmCancel?.length) cancel(confirmCancel)
        }}
      />
    </div>
  )
}

function SubscriptionsPage() {
  const [tab, setTab] = useState<TabKey>("plans")
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div>
      <PageHeader
        title="Pro membership"
        description="Jobs Region Pro is the membership job seekers see in the app: instant alerts, a Pro badge and a place above free profiles. Price, length and perks are set here."
        actions={tab === "plans" && <Button onClick={() => setAddOpen(true)}>Add plan</Button>}
      />
      <PillTabs options={TABS} value={tab} onChange={setTab} className="mb-10" />

      {tab === "plans" && <PlansTab addOpen={addOpen} setAddOpen={setAddOpen} />}
      {tab === "subscribers" && <SubscribersTab />}
    </div>
  )
}

export default SubscriptionsPage
