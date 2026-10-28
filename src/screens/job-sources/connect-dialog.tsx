import { useState, type ReactNode } from "react"
import { Code2, Globe, KeyRound, Rss, Webhook } from "lucide-react"

import { Dialog, DialogTextButton } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SelectMenu } from "@/components/ui/select-menu"
import { cn } from "@/lib/utils"
import {
  ALL_CATEGORIES,
  defaultImportRules,
  defaultPublishRules,
  jobSources,
  type ConnectionType,
  type ImportRules,
  type JobSource,
  type PublishRules,
  type SourceDirection,
  type SyncFrequency,
} from "@/lib/job-sources"
import { CategoryChips, ChipGroup, TagInput, ToggleLine } from "./parts"
import { DIRECTIONS, EXPIRE_OPTIONS, FREQUENCY_OPTIONS, MODE_OPTIONS, SCOPE_OPTIONS, colorFor, endpointLabel, initialsOf, slug } from "./options"

const TYPES: { key: ConnectionType; title: string; text: string; icon: ReactNode }[] = [
  { key: "API", title: "API", text: "A partner gives us an API key. Most reliable.", icon: <KeyRound className="size-7" strokeWidth={1.5} /> },
  { key: "Feed", title: "RSS / XML feed", text: "Read their job feed, or publish ours for them to read.", icon: <Rss className="size-7" strokeWidth={1.5} /> },
  { key: "Website", title: "Website", text: "Read listings from public pages. Respects robots.txt and partner terms.", icon: <Globe className="size-7" strokeWidth={1.5} /> },
  { key: "Webhook", title: "Webhook", text: "Jobs are pushed to us, or we push ours to them, as they happen.", icon: <Webhook className="size-7" strokeWidth={1.5} /> },
]

function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-2">
      <p className="text-body1 font-semibold text-foreground">{children}</p>
      {hint && <p className="text-body2 text-muted-foreground">{hint}</p>}
    </div>
  )
}

/**
 * "Connect a source" as an Airbnb modal in three steps: choose the type, fill in the details, set the rules.
 * Connect adds the source to the shared list and hands it back.
 */
function ConnectSourceDialog({ open, onClose, onConnected }: { open: boolean; onClose: () => void; onConnected: (s: JobSource) => void }) {
  const [step, setStep] = useState(1)
  const [type, setType] = useState<ConnectionType>()
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [direction, setDirection] = useState<SourceDirection>("Import")
  const [frequency, setFrequency] = useState<SyncFrequency>("Daily")
  const [termsOk, setTermsOk] = useState(false)
  const [importRules, setImportRules] = useState<ImportRules>(defaultImportRules)
  const [publishRules, setPublishRules] = useState<PublishRules>(defaultPublishRules)

  const reset = () => {
    setStep(1)
    setType(undefined)
    setName("")
    setUrl("")
    setApiKey("")
    setDirection("Import")
    setFrequency("Daily")
    setTermsOk(false)
    setImportRules(defaultImportRules())
    setPublishRules(defaultPublishRules())
  }
  const close = () => {
    reset()
    onClose()
  }

  const imports = direction !== "Publish"
  const publishes = direction !== "Import"
  const generated =
    (type === "Webhook" && direction !== "Publish") || (type === "Feed" && direction === "Publish")
      ? type === "Webhook"
        ? `https://hooks.jobsregion.ng/in/${slug(name)}`
        : `https://jobsregion.ng/feeds/${slug(name)}.xml`
      : undefined
  const urlOk = !!generated || /^https?:\/\/\S+\.\S+/.test(url.trim())
  const detailsOk = name.trim().length >= 2 && urlOk && (type !== "API" || apiKey.trim().length >= 8) && (type !== "Website" || !imports || termsOk)
  const canNext = step === 1 ? !!type : step === 2 ? detailsOk : true

  const connect = () => {
    const source: JobSource = {
      id: `${slug(name)}-${Date.now().toString(36)}`,
      name: name.trim(),
      initials: initialsOf(name),
      color: colorFor(name),
      website: generated ? "" : url.trim(),
      direction,
      connection: type!,
      endpoint: generated ?? url.trim(),
      apiKeyHint: type === "API" ? apiKey.trim().slice(-4) : undefined,
      status: "Connected",
      lastSync: "Never",
      frequency: type === "Webhook" ? "Manual" : frequency,
      jobsImported: 0,
      jobsPublished: 0,
      importedThisWeek: 0,
      publishedThisWeek: 0,
      waitingReview: 0,
      importRules: imports ? importRules : undefined,
      publishRules: publishes ? publishRules : undefined,
      history: [],
    }
    jobSources.push(source)
    onConnected(source)
    close()
  }

  const setImport = (p: Partial<ImportRules>) => setImportRules((r) => ({ ...r, ...p }))
  const setPublish = (p: Partial<PublishRules>) => setPublishRules((r) => ({ ...r, ...p }))

  return (
    <Dialog
      open={open}
      onClose={close}
      width="w-[640px]"
      title="Connect a source"
      footer={
        <>
          {step === 1 ? <DialogTextButton onClick={close}>Cancel</DialogTextButton> : <DialogTextButton onClick={() => setStep(step - 1)}>Back</DialogTextButton>}
          <Button size="lg" disabled={!canNext} onClick={() => (step < 3 ? setStep(step + 1) : connect())}>
            {step < 3 ? "Next" : "Connect"}
          </Button>
        </>
      }
    >
      <div className="px-6 py-6">
        <p className="text-body2 font-semibold text-muted-foreground">Step {step} of 3</p>

        {step === 1 && (
          <>
            <h2 className="heading-section mt-1">How does it connect?</h2>
            <div role="radiogroup" aria-label="Connection type" className="mt-6 grid grid-cols-2 gap-3">
              {TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="radio"
                  aria-checked={type === t.key}
                  onClick={() => setType(t.key)}
                  className={cn(
                    "flex flex-col gap-3 rounded-xl p-4 text-left transition-colors",
                    type === t.key ? "bg-muted outline-2 -outline-offset-2 outline-foreground" : "outline-1 -outline-offset-1 outline-input hover:outline-2 hover:-outline-offset-2 hover:outline-foreground",
                  )}
                >
                  {t.icon}
                  <span>
                    <span className="block text-body1 font-semibold text-foreground">{t.title}</span>
                    <span className="block text-body2 text-muted-foreground">{t.text}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            <h2 className="heading-section mt-1">Tell us about it</h2>
            <div>
              <Label>Name</Label>
              <Input aria-label="Name" placeholder="e.g. Jobberman" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Direction</Label>
              <ChipGroup options={DIRECTIONS} value={direction} onChange={setDirection} />
            </div>
            <div>
              <Label>{endpointLabel(type!, direction)}</Label>
              {generated ? (
                <div className="flex h-12 items-center gap-2 rounded-md bg-muted px-4 text-body2 text-foreground">
                  <Code2 className="size-4 shrink-0" />
                  <span className="truncate">{generated}</span>
                </div>
              ) : (
                <Input aria-label="URL" type="url" placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} />
              )}
            </div>
            {type === "API" && (
              <div>
                <Label hint="Stored encrypted. Only the last 4 characters are shown afterwards.">API key</Label>
                <Input aria-label="API key" type="password" placeholder="Paste the key from the partner" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
              </div>
            )}
            {type === "Webhook" ? (
              <p className="text-body2 text-muted-foreground">Webhooks run as jobs happen, so there's no schedule to set.</p>
            ) : (
              <div>
                <Label>Sync frequency</Label>
                <ChipGroup options={FREQUENCY_OPTIONS} value={frequency} onChange={setFrequency} />
              </div>
            )}
            {type === "Website" && imports && (
              <label className="flex items-start gap-3 rounded-xl border border-border p-4 text-body2 text-foreground">
                <input type="checkbox" checked={termsOk} onChange={(e) => setTermsOk(e.target.checked)} className="mt-0.5 size-4 accent-foreground" />
                <span>
                  <b className="font-semibold">Their robots.txt and terms allow this.</b>
                  <span className="block text-muted-foreground">We only read public listing pages, at most once an hour, and stop if the site blocks us.</span>
                </span>
              </label>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <h2 className="heading-section mt-1">Set the rules</h2>
            {imports && (
              <section className="flex flex-col gap-5">
                <p className="heading-card">Jobs coming in</p>
                <div>
                  <Label>New jobs</Label>
                  <ChipGroup options={MODE_OPTIONS} value={importRules.mode} onChange={(mode) => setImport({ mode })} />
                </div>
                <div>
                  <Label hint="For jobs whose category we can't map. You can map categories one by one later.">Default category</Label>
                  <SelectMenu variant="field" aria-label="Default category" value={importRules.defaultCategory} onChange={(defaultCategory) => setImport({ defaultCategory })} options={ALL_CATEGORIES} />
                </div>
                <div>
                  <Label hint="Only import jobs that mention one of these. Leave empty for all.">Keywords</Label>
                  <TagInput label="Keywords" placeholder="Type and press Enter" value={importRules.keywords} onChange={(keywords) => setImport({ keywords })} />
                </div>
                <div>
                  <Label hint="Leave empty for all of Nigeria.">Locations</Label>
                  <TagInput label="Locations" placeholder="e.g. Lagos" value={importRules.locations} onChange={(locations) => setImport({ locations })} />
                </div>
                <ToggleLine title="Skip duplicates" text="Skip a job when the same title and poster is already on Jobs Region." checked={importRules.dedupe} onChange={(dedupe) => setImport({ dedupe })} />
                <ToggleLine title="Show attribution" text={`Jobs show "Imported from ${name || "the source"}" with a link to the original.`} checked={importRules.attribution} onChange={(attribution) => setImport({ attribution })} />
                <div>
                  <Label>Expire imported jobs after</Label>
                  <SelectMenu variant="field" aria-label="Expire after" value={String(importRules.expireDays)} onChange={(v) => setImport({ expireDays: Number(v) })} options={EXPIRE_OPTIONS} />
                </div>
              </section>
            )}
            {publishes && (
              <section className={cn("flex flex-col gap-5", imports && "border-t border-border pt-6")}>
                <p className="heading-card">Jobs going out</p>
                <div>
                  <Label>Which jobs to send</Label>
                  <ChipGroup options={SCOPE_OPTIONS} value={publishRules.scope} onChange={(scope) => setPublish({ scope })} />
                </div>
                {publishRules.scope === "categories" && <CategoryChips value={publishRules.categories} onChange={(categories) => setPublish({ categories })} />}
                <ToggleLine title="Include the budget" text="Show the ₦ range on the other site." checked={publishRules.includeBudget} onChange={(includeBudget) => setPublish({ includeBudget })} />
                <ToggleLine title="Link back to Jobs Region" text="People apply and message on Jobs Region, where it's free." checked={publishRules.linkBack} onChange={(linkBack) => setPublish({ linkBack })} />
              </section>
            )}
          </div>
        )}
      </div>
    </Dialog>
  )
}

export { ConnectSourceDialog }
