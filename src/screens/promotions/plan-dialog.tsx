import { useId, useState, type ReactNode } from "react"
import { Plus, X } from "lucide-react"

import { Dialog, DialogTextButton } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SelectMenu } from "@/components/ui/select-menu"
import { Checkbox } from "@/components/data-table"
import type { PromotionChannel, PromotionPlanConfig } from "@/lib/mock-data"
import { PROMOTES_LABEL } from "./helpers"
import { PricingCard } from "./pricing-card"

const CHANNELS: { key: PromotionChannel; hint: string }[] = [
  { key: "WhatsApp", hint: "Posted to the Jobs Region WhatsApp channel" },
  { key: "Telegram", hint: "Posted to the Jobs Region Telegram channel" },
  { key: "Social media", hint: "Shared on Instagram, X and Facebook" },
]

const BLANK_PLAN: Omit<PromotionPlanConfig, "id"> = {
  name: "",
  price: 3_000,
  days: 7,
  reach: "",
  perks: ["Promoted badge"],
  popular: false,
  active: true,
  promotes: "Both",
  channels: [],
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-body2 font-semibold text-foreground">{label}</p>
        {hint && <p className="text-caption text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function CheckRow({ checked, onChange, label, hint }: { checked: boolean; onChange: () => void; label: string; hint?: string }) {
  return (
    <div className="flex cursor-pointer items-start gap-3" onClick={onChange}>
      <span className="mt-0.5">
        <Checkbox checked={checked} onChange={onChange} label={label} />
      </span>
      <span>
        <span className="block text-body2 font-medium text-foreground">{label}</span>
        {hint && <span className="block text-caption text-muted-foreground">{hint}</span>}
      </span>
    </div>
  )
}

/**
 * Create or edit a promotion plan in a full Airbnb modal: the fields on the left and, on the right, the card exactly as
 * the Promote page will show it, updating as you type.
 */
function PlanDialog({
  plan,
  onClose,
  onSave,
}: {
  /** Leave out to create a new plan. */
  plan?: PromotionPlanConfig
  onClose: () => void
  onSave: (plan: Omit<PromotionPlanConfig, "id">) => void
}) {
  const formId = useId()
  const [draft, setDraft] = useState<Omit<PromotionPlanConfig, "id">>(() => (plan ? { ...plan, perks: [...plan.perks] } : BLANK_PLAN))
  const [error, setError] = useState("")
  const set = (patch: Partial<PromotionPlanConfig>) => setDraft((d) => ({ ...d, ...patch }))
  const channels = draft.channels ?? []

  const submit = () => {
    if (!draft.name.trim()) return setError("Give the plan a name.")
    if (!(draft.days >= 1)) return setError("A plan runs for at least 1 day.")
    if (!(draft.price >= 0)) return setError("Enter a price.")
    onSave({ ...draft, name: draft.name.trim(), reach: draft.reach.trim(), perks: draft.perks.map((p) => p.trim()).filter(Boolean) })
    onClose()
  }

  return (
    <Dialog
      open
      onClose={onClose}
      width="w-[1000px]"
      title={plan ? `Edit ${plan.name}` : "Create plan"}
      footer={
        <>
          <DialogTextButton onClick={onClose}>Cancel</DialogTextButton>
          <div className="flex items-center gap-4">
            {error && <p className="text-body2 text-destructive">{error}</p>}
            <Button type="submit" form={formId} size="lg">
              {plan ? "Save plan" : "Create plan"}
            </Button>
          </div>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_360px]">
        <form
          id={formId}
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="space-y-8 p-8"
        >
          <section className="space-y-5">
            <h3 className="heading-card">The basics</h3>
            <Field label="Name">
              <Input value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Spotlight" autoFocus />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (₦)">
                <Input type="number" min={0} step={100} value={draft.price} onChange={(e) => set({ price: Number(e.target.value) })} />
              </Field>
              <Field label="Length (days)">
                <Input type="number" min={1} value={draft.days} onChange={(e) => set({ days: Number(e.target.value) })} />
              </Field>
            </div>
            <Field label="Reach line" hint="The one bold line under the price.">
              <Input value={draft.reach} onChange={(e) => set({ reach: e.target.value })} placeholder="e.g. Up to 5× more views" />
            </Field>
            <Field label="What it can promote">
              <SelectMenu
                variant="field"
                aria-label="What it can promote"
                value={draft.promotes}
                onChange={(v) => set({ promotes: v as PromotionPlanConfig["promotes"] })}
                options={(["Both", "Jobs", "Profiles"] as const).map((k) => ({ value: k, label: PROMOTES_LABEL[k] }))}
              />
            </Field>
          </section>

          <section className="space-y-4 border-t border-border pt-8">
            <h3 className="heading-card">Perks</h3>
            <div className="space-y-2">
              {draft.perks.map((perk, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Input
                    value={perk}
                    aria-label={`Perk ${i + 1}`}
                    placeholder="e.g. Top of results in your state"
                    onChange={(e) => set({ perks: draft.perks.map((p, idx) => (idx === i ? e.target.value : p)) })}
                  />
                  <button
                    type="button"
                    aria-label="Remove perk"
                    onClick={() => set({ perks: draft.perks.filter((_, idx) => idx !== i) })}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => set({ perks: [...draft.perks, ""] })}
              className="inline-flex items-center gap-1.5 text-body2 font-semibold text-foreground underline underline-offset-2"
            >
              <Plus className="size-4" />
              Add a perk
            </button>
          </section>

          <section className="space-y-4 border-t border-border pt-8">
            <div>
              <h3 className="heading-card">Shared to channels</h3>
              <p className="text-body2 text-muted-foreground">Optional. We also post the job or profile to these.</p>
            </div>
            {CHANNELS.map((c) => (
              <CheckRow
                key={c.key}
                label={c.key}
                hint={c.hint}
                checked={channels.includes(c.key)}
                onChange={() => set({ channels: channels.includes(c.key) ? channels.filter((x) => x !== c.key) : [...channels, c.key] })}
              />
            ))}
          </section>

          <section className="space-y-4 border-t border-border pt-8">
            <h3 className="heading-card">On the Promote page</h3>
            <CheckRow
              label="Mark as “Most popular”"
              hint="Only one plan carries the badge; this takes it from the others."
              checked={!!draft.popular}
              onChange={() => set({ popular: !draft.popular })}
            />
            <CheckRow
              label="Available to buy"
              hint="Turn off to pause the plan. Promotions already running are not affected."
              checked={draft.active}
              onChange={() => set({ active: !draft.active })}
            />
          </section>
        </form>

        <aside className="border-t border-border bg-muted p-8 md:border-l md:border-t-0">
          <div className="md:sticky md:top-0">
            <p className="mb-6 text-caption font-semibold uppercase tracking-wide text-muted-foreground">Preview</p>
            <PricingCard plan={{ ...draft, id: "preview" }} />
            <p className="mt-4 text-caption text-muted-foreground">
              Changes apply to new purchases. Promotions already running keep the terms they were bought on.
            </p>
          </div>
        </aside>
      </div>
    </Dialog>
  )
}

export { PlanDialog }
