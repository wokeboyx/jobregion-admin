import { Link } from "react-router-dom"
import { Flag } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTextButton } from "@/components/ui/dialog"
import { StatusPill } from "@/components/ui/status-pill"
import { cn } from "@/lib/utils"
import { users } from "@/lib/mock-data"
import { REVIEW_STATE_STATUS, type Hire, type Review } from "@/lib/trust-data"
import { Stars } from "./parts"
import { formatDate } from "./format"

const userName = (id: string) => users.find((u) => u.id === id)?.name ?? "Unknown user"

/** One of Airbnb's category ratings: label, a thin black bar, the score. */
function AspectRow({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center justify-between gap-6 py-3">
      <p className="text-body1 text-foreground">{label}</p>
      <div className="flex items-center gap-3">
        <div className="h-1 w-28 overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-foreground" style={{ width: `${(score / 5) * 100}%` }} />
        </div>
        <span className="w-7 text-right text-caption font-semibold tabular-nums text-foreground">{score.toFixed(1)}</span>
      </div>
    </div>
  )
}

/** The full review in an Airbnb modal: who, stars, text, aspect scores, the reply, and the decision buttons. */
function ReviewDialog({
  review,
  hire,
  onClose,
  onKeep,
  onRemove,
  onRestore,
}: {
  review?: Review
  hire?: Hire
  onClose: () => void
  onKeep: (id: string) => void
  onRemove: (id: string) => void
  onRestore: (id: string) => void
}) {
  const removed = review?.state === "Removed"
  return (
    <Dialog
      open={review !== undefined}
      onClose={onClose}
      title="Review"
      width="w-[620px]"
      footer={
        review && (
          <>
            <DialogTextButton onClick={onClose}>Close</DialogTextButton>
            <div className="flex items-center gap-2">
              {removed ? (
                <Button size="lg" onClick={() => onRestore(review.id)}>
                  Restore
                </Button>
              ) : (
                <>
                  {review.reportCount > 0 && (
                    <Button variant="outline" size="lg" onClick={() => onKeep(review.id)}>
                      Keep it up
                    </Button>
                  )}
                  <Button variant="danger" size="lg" onClick={() => onRemove(review.id)}>
                    Remove
                  </Button>
                </>
              )}
            </div>
          </>
        )
      }
    >
      {review && (
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Avatar name={userName(review.authorId)} className="size-12 text-body2" />
            <div className="min-w-0 flex-1">
              <Link to={`/users/${review.authorId}`} className="heading-card hover:underline">
                {userName(review.authorId)}
              </Link>
              <p className="truncate text-body2 text-muted-foreground">
                Reviewed{" "}
                <Link to={`/users/${review.subjectId}`} className="text-foreground hover:underline">
                  {userName(review.subjectId)}
                </Link>{" "}
                as the {review.about}
              </p>
            </div>
            <StatusPill status={REVIEW_STATE_STATUS[review.state]} label={review.state} />
          </div>

          <div className="mt-4 flex min-w-0 items-center gap-1.5 text-body2 text-foreground">
            <Stars rating={review.rating} className="[&_svg]:size-3.5" />
            <span className="text-muted-foreground">·</span>
            <span className="shrink-0 font-semibold">{formatDate(review.date)}</span>
            {hire && (
              <>
                <span className="text-muted-foreground">·</span>
                <Link to={`/jobs/${hire.jobId}`} className="truncate text-muted-foreground hover:underline">
                  {hire.jobTitle}
                </Link>
              </>
            )}
          </div>

          <p className={cn("mt-3 text-body1 text-foreground", removed && "text-muted-foreground line-through")}>{review.text}</p>

          {review.reportCount > 0 && !removed && (
            <p className="mt-4 flex items-center gap-1.5 text-body2 font-semibold text-destructive">
              <Flag className="size-3.5" />
              Reported {review.reportCount === 1 ? "once" : `${review.reportCount} times`}
            </p>
          )}

          <div className="mt-6 border-t border-border pt-5">
            <h3 className="heading-card mb-1">Scores</h3>
            <div className="divide-y divide-border">
              {Object.entries(review.aspects).map(([aspect, score]) => (
                <AspectRow key={aspect} label={aspect} score={score} />
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-5">
            <h3 className="heading-card mb-3">Reply</h3>
            {review.reply ? (
              <div className="flex gap-3">
                <Avatar name={userName(review.subjectId)} className="size-8 text-caption" />
                <div className="min-w-0">
                  <p className="text-body2 font-semibold text-foreground">Response from {userName(review.subjectId)}</p>
                  <p className="mt-0.5 text-body2 text-foreground">{review.reply}</p>
                </div>
              </div>
            ) : (
              <p className="text-body2 text-muted-foreground">{userName(review.subjectId)} hasn’t replied.</p>
            )}
          </div>
        </div>
      )}
    </Dialog>
  )
}

export { ReviewDialog }
