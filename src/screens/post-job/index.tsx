import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { cn } from "@/lib/utils"
import {
  DRAFT_KEY,
  EMPTY,
  budgetLabel,
  clearDraft,
  isValid,
  loadDraft,
  posterOf,
  publishJob,
  stepsFor,
  whenLabel,
  type Draft,
  type Step,
} from "./draft"
import {
  BudgetStep,
  CategoryStep,
  ContactStep,
  LocationStep,
  PhotosStep,
  PostAsStep,
  ReviewStep,
  RoleStep,
  TimeStep,
  TitleStep,
  TypeStep,
} from "./steps"

/**
 * Post a job as an admin, after Airbnb's listing setup and the web app's PostJob: a full-screen flow with "Save and exit"
 * at the top, one question per screen in a centred column, and a bar at the bottom with the progress, Back and Next.
 * Admins first choose who the job is posted as, and on review choose to publish now or send it to the review queue,
 * and can promote it for free. The draft is kept in this tab, so "Save and exit" brings you back where you left off.
 */
function PostJobPage() {
  const navigate = useNavigate()
  const [initial] = useState(loadDraft)
  const [d, setD] = useState<Draft>(initial.d)
  const [step, setStep] = useState<Step>(initial.step)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const set = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }))

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ d, step }))
    } catch {
      // Storage can be full or blocked; the draft just won't survive leaving.
    }
  }, [d, step])

  const steps = stepsFor(d.kind)
  const i = Math.max(0, steps.indexOf(step))
  const valid = isValid(step, d)
  const dirty = d.postAs !== undefined || d.kind !== undefined || !!d.title

  const go = (s: Step) => {
    setStep(s)
    document.getElementById("post-job-scroll")?.scrollTo({ top: 0 })
  }
  const next = () => {
    if (step !== "review") return go(steps[i + 1])
    const id = publishJob(d)
    clearDraft()
    navigate(`/jobs/${id}`)
  }
  const startOver = () => {
    clearDraft()
    setD(EMPTY)
    setStep("postAs")
  }

  const poster = posterOf(d)
  const summary =
    step === "budget" && valid
      ? budgetLabel(d)
      : step === "time" && valid
        ? whenLabel(d)
        : step === "postAs" && valid
          ? `Posting as ${poster ? poster.name : "Jobs Region"}`
          : ""
  const nextLabel =
    step === "review" ? (d.publish === "open" ? "Publish job" : "Send to review") : step === "photos" && d.photos.length === 0 ? "Skip for now" : "Next"

  return (
    <div id="post-job-scroll" className="fixed inset-0 z-[45] flex flex-col overflow-y-auto bg-card">
      <header className="sticky top-0 z-10 flex h-[72px] shrink-0 items-center justify-between bg-card px-10">
        <span className="text-body2 font-semibold text-muted-foreground">Post a job · Admin</span>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={() => setConfirmDiscard(true)}
              className="flex h-9 items-center rounded-full px-4 text-body2 font-semibold text-foreground underline underline-offset-2 hover:bg-muted"
            >
              Start over
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("/jobs")}
            className="flex h-9 items-center rounded-full border border-input px-4 text-body2 font-semibold text-foreground hover:border-foreground"
          >
            {dirty ? "Save and exit" : "Exit"}
          </button>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-10 pb-48 pt-10">
        <div key={step} className="flex w-full max-w-[640px] animate-[rise_.25s_ease-out] flex-col gap-8">
          {step === "postAs" && <PostAsStep d={d} set={set} />}
          {step === "type" && <TypeStep d={d} set={set} />}
          {step === "title" && <TitleStep d={d} set={set} />}
          {step === "category" && <CategoryStep d={d} set={set} />}
          {step === "time" && <TimeStep d={d} set={set} />}
          {step === "location" && <LocationStep d={d} set={set} />}
          {step === "role" && <RoleStep d={d} set={set} />}
          {step === "photos" && <PhotosStep d={d} set={set} />}
          {step === "budget" && <BudgetStep d={d} set={set} />}
          {step === "contact" && <ContactStep d={d} set={set} />}
          {step === "review" && <ReviewStep d={d} set={set} go={go} />}
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-[46] bg-card">
        <div className="flex gap-1.5" role="progressbar" aria-label="Progress" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={i + 1}>
          {steps.map((st, k) => (
            <span key={st} className="h-1.5 flex-1 bg-muted-strong">
              <span className={cn("block h-full bg-foreground transition-[width] duration-500", k <= i ? "w-full" : "w-0")} />
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4 px-10 py-4">
          {i > 0 ? (
            <button
              type="button"
              onClick={() => go(steps[i - 1])}
              className="-mx-2 rounded-md px-2 py-1.5 text-body1 font-semibold text-foreground underline underline-offset-4 hover:bg-muted"
            >
              Back
            </button>
          ) : (
            <span />
          )}
          {summary && <p className="min-w-0 truncate text-body1 font-semibold text-foreground">{summary}</p>}
          <Button size="lg" className="min-w-[140px]" disabled={!valid} onClick={next}>
            {nextLabel}
          </Button>
        </div>
      </footer>

      <ConfirmationDialog
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        onConfirm={startOver}
        tone="destructive"
        title="Start over?"
        description="This clears every answer in this draft. The job hasn't been posted yet."
        confirmLabel="Discard draft"
        cancelLabel="Keep editing"
      />
    </div>
  )
}

export default PostJobPage
