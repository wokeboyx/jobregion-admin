import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { X, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { StatusPill, OutlineBadge } from "@/components/ui/status-pill"
import { Avatar } from "@/components/ui/avatar"
import { ModuleHeader } from "@/components/module-header"
import { FilterBar } from "@/components/filter-bar"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { FormDialog, FormField } from "@/components/form-dialog"
import { Pagination } from "@/components/pagination"
import { EmptyState, ErrorState } from "@/components/page-state"
import { cn } from "@/lib/utils"
import { usePagination } from "@/lib/use-pagination"
import { usePreviewState } from "@/lib/preview-state"
import {
  subscriptionPlans as initialPlans,
  subscribers as initialSubscribers,
  users,
  type SubscriptionPlan,
  type Subscriber,
} from "@/lib/mock-data"

const TABS = [
  { key: "plans", label: "Plans" },
  { key: "subscribers", label: "Subscribers" },
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
    <div className="space-y-1.5">
      <p className="text-[13px] font-medium text-foreground">Benefits</p>
      <div className="space-y-2">
        {benefits.map((value, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              value={value}
              onChange={(e) => onChange(benefits.map((b, idx) => (idx === i ? e.target.value : b)))}
              placeholder={`Benefit ${i + 1}`}
              className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-brand-cta"
            />
            {benefits.length > 1 && (
              <button
                type="button"
                aria-label="Remove benefit"
                onClick={() => onChange(benefits.filter((_, idx) => idx !== i))}
                className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
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
        className="text-xs font-bold text-foreground"
      >
        + Add another benefit
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
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-brand-cta"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

function PlansTab() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans)

  const [addOpen, setAddOpen] = useState(false)
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
      <ModuleHeader
        title="Subscription plans"
        description="Configure the plans workers and employers can subscribe to."
        action={<Button onClick={() => setAddOpen(true)}>+ Add plan</Button>}
      />

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : isEmpty ? (
        <EmptyState
          icon={CreditCard}
          title="No plans yet"
          description="Create a plan to start offering subscriptions to workers or employers."
          action={<Button onClick={() => setAddOpen(true)}>+ Add plan</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-foreground">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {plan.price} / {plan.billingPeriod.toLowerCase()} · {plan.audience}
                  </p>
                </div>
                <StatusPill status={plan.status} label={plan.statusLabel} />
              </div>

              <ul className="space-y-1.5">
                {plan.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-center gap-1 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => openEdit(plan)}
                  className="rounded-md px-2 py-1.5 text-[13px] font-bold text-foreground hover:bg-muted"
                >
                  Edit
                </button>
                <button
                  type="button"
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
                  className="rounded-md px-2 py-1.5 text-[13px] font-bold text-foreground hover:bg-muted"
                >
                  {plan.status === "success" ? "Archive" : "Reactivate"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeletePlanId(plan.id)}
                  className="rounded-md px-2 py-1.5 text-[13px] font-bold text-destructive hover:bg-muted"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <FormDialog
        open={addOpen}
        onClose={() => {
          setAddOpen(false)
          resetAddForm()
        }}
        title="Add plan"
        description="Create a new subscription plan for workers or employers."
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
            placeholder="e.g. Worker Pro"
            className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-brand-cta"
          />
        </FormField>
        <FormField label="Price">
          <input
            id="new-plan-price"
            placeholder="e.g. ₦2,500"
            className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-brand-cta"
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
            className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-brand-cta"
          />
        </FormField>
        <FormField label="Price">
          <input
            id="edit-plan-price"
            defaultValue={editPlan?.price}
            className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-brand-cta"
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
const SUB_STATUS_OPTIONS = ["Active", "Cancelled"]

function SubscribersTab() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("All roles")
  const [statusFilter, setStatusFilter] = useState("All statuses")
  const [planFilter, setPlanFilter] = useState("All plans")

  const planOptions = useMemo(() => initialPlans.map((p) => p.name), [])

  const metrics = useMemo(() => {
    const withUser = subscribers
      .map((s) => ({ sub: s, user: users.find((u) => u.id === s.userId) }))
      .filter((x): x is { sub: Subscriber; user: (typeof users)[number] } => Boolean(x.user))

    const byPlan = initialPlans
      .map((p) => ({ name: p.name, count: subscribers.filter((s) => s.planId === p.id).length }))
      .filter((p) => p.count > 0)

    return {
      total: subscribers.length,
      workers: withUser.filter((x) => x.user.roles.includes("Worker")).length,
      employers: withUser.filter((x) => x.user.roles.includes("Employer")).length,
      byPlan,
    }
  }, [subscribers])

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return subscribers.filter((s) => {
      const user = users.find((u) => u.id === s.userId)
      const plan = initialPlans.find((p) => p.id === s.planId)
      if (!user || !plan) return false
      if (roleFilter !== "All roles" && !user.roles.includes(roleFilter as "Worker" | "Employer")) return false
      if (statusFilter !== "All statuses" && s.statusLabel !== statusFilter) return false
      if (planFilter !== "All plans" && plan.name !== planFilter) return false
      if (query && !user.name.toLowerCase().includes(query)) return false
      return true
    })
  }, [subscribers, search, roleFilter, statusFilter, planFilter])

  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const previewRows = useMemo(() => (previewState === "no-results" ? [] : rows), [previewState, rows])
  const { page, setPage, totalPages, pagedRows } = usePagination(previewRows)

  if (previewState === "error") {
    return <ErrorState onRetry={() => setPreviewState("default")} />
  }

  if (previewState === "empty") {
    return (
      <EmptyState
        icon={CreditCard}
        title="No subscribers yet"
        description="Once workers or employers subscribe to a plan, they'll show up here."
      />
    )
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Total subscribers</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{metrics.total}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Worker subscribers</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{metrics.workers}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Employer subscribers</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{metrics.employers}</p>
        </Card>
      </div>

      {metrics.byPlan.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">By plan:</span>
          {metrics.byPlan.map((p) => (
            <span
              key={p.name}
              className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground"
            >
              {p.name} · {p.count}
            </span>
          ))}
        </div>
      )}

      <FilterBar
        searchPlaceholder="Search by subscriber name…"
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          { label: "All roles", options: ROLE_OPTIONS, value: roleFilter, onChange: setRoleFilter },
          { label: "All plans", options: planOptions, value: planFilter, onChange: setPlanFilter },
          { label: "All statuses", options: SUB_STATUS_OPTIONS, value: statusFilter, onChange: setStatusFilter },
        ]}
        className="mb-4"
      />

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subscriber</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Billing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start date</TableHead>
              <TableHead>Next billing</TableHead>
              <TableHead className="w-36" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.map((s) => {
              const user = users.find((u) => u.id === s.userId)!
              const plan = initialPlans.find((p) => p.id === s.planId)!
              const isActive = s.statusLabel === "Active"

              return (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link to={`/users/${user.id}`} className="flex items-center gap-2.5 hover:underline">
                      <Avatar name={user.name} />
                      <span className="font-medium text-foreground">{user.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      {user.roles.map((r) => (
                        <OutlineBadge key={r} label={r} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{plan.name}</TableCell>
                  <TableCell className="text-muted-foreground">{plan.billingPeriod}</TableCell>
                  <TableCell>
                    <StatusPill status={s.status} label={s.statusLabel} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.startDate}</TableCell>
                  <TableCell className="text-muted-foreground">{s.nextBillingDate}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className={cn("text-xs font-bold", isActive ? "text-destructive" : "text-foreground")}
                      onClick={() =>
                        setSubscribers((subs) =>
                          subs.map((sub) =>
                            sub.id === s.id
                              ? isActive
                                ? { ...sub, status: "destructive", statusLabel: "Cancelled", nextBillingDate: "—" }
                                : { ...sub, status: "success", statusLabel: "Active" }
                              : sub,
                          ),
                        )
                      }
                    >
                      {isActive ? "Cancel subscription" : "Reactivate"}
                    </button>
                  </TableCell>
                </TableRow>
              )
            })}

            {previewRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No subscribers match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}

function SubscriptionsPage() {
  const [tab, setTab] = useState<TabKey>("plans")

  return (
    <div>
      <div className="mb-4 flex h-9 items-center gap-1 border-b border-border px-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "relative px-1.5 py-1 text-sm",
              tab === t.key ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {t.label}
            {tab === t.key && <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-foreground" />}
          </button>
        ))}
      </div>

      {tab === "plans" && <PlansTab />}
      {tab === "subscribers" && <SubscribersTab />}
    </div>
  )
}

export default SubscriptionsPage
