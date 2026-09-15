import { useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"

import { BackButton } from "@/components/back-button"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StatusPill, OutlineBadge } from "@/components/ui/status-pill"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { ReasonDialog } from "@/components/reason-dialog"
import { JobImageGallery } from "@/components/job-image-gallery"
import { jobs, users, timeAgo } from "@/lib/mock-data"

function userName(userId: string) {
  return users.find((u) => u.id === userId)?.name ?? "Unknown user"
}

const REJECT_REASONS = [
  "Missing or unclear description",
  "Prohibited category or content",
  "Suspected scam or fraudulent listing",
  "Duplicate listing",
]

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{value}</p>
    </div>
  )
}

function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const job = jobs.find((j) => j.id === id)

  const [status, setStatus] = useState(job?.status)
  const [statusLabel, setStatusLabel] = useState(job?.statusLabel)
  const [flagged, setFlagged] = useState(job?.statusLabel === "Flagged")
  const [removed, setRemoved] = useState(job?.removed ?? false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  if (!job) {
    return (
      <div>
        <BackButton to="/jobs" label="Back to Jobs" />
        <p className="text-sm text-muted-foreground">Job not found.</p>
      </div>
    )
  }

  const isPending = statusLabel === "Pending Review"
  const displayStatus = removed ? "destructive" : flagged ? "destructive" : status!
  const displayStatusLabel = removed ? "Removed" : flagged ? "Flagged" : statusLabel!

  return (
    <div className="mx-auto max-w-3xl">
      <BackButton to="/jobs" label="Back to Jobs" />

      <div className="mb-1 flex items-start justify-between gap-4">
        <p className="text-lg font-semibold text-foreground">{job.title}</p>
        {isPending && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setStatus("success")
                setStatusLabel("Open")
              }}
            >
              Approve
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => setRejectOpen(true)}
            >
              Reject
            </Button>
          </div>
        )}
        {!isPending && !removed && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setFlagged((f) => !f)}>
              {flagged ? "Unflag" : "Flag"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => setRemoveOpen(true)}
            >
              Remove job
            </Button>
          </div>
        )}
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
          {job.type}
        </span>
        <StatusPill status={displayStatus} label={displayStatusLabel} />
        {job.promoted && (
          <OutlineBadge
            label="Promoted"
            className="gap-1.5 border-brand-cta/30 bg-brand-cta-tint text-brand-cta"
          />
        )}
      </div>

      <p className="mb-6 text-xs text-muted-foreground">
        {job.category} · Posted {timeAgo(job.datePosted)}
      </p>

      <section className="mb-6 space-y-2">
        <p className="text-sm font-semibold text-foreground">Posted by</p>
        <Link
          to={`/users/${job.posterId}`}
          className="flex w-fit items-center gap-2.5 rounded-xl border border-border p-2.5 pr-4 transition-colors hover:bg-muted"
        >
          <Avatar name={job.poster} className="size-8 text-[13px]" />
          <span className="text-sm font-medium text-foreground">{job.poster}</span>
        </Link>
      </section>

      <section className="mb-6 space-y-2">
        <p className="text-sm font-semibold text-foreground">Description</p>
        <p className="text-sm text-muted-foreground">{job.description}</p>
      </section>

      {job.images.length > 0 && (
        <section className="mb-6 space-y-2">
          <p className="text-sm font-semibold text-foreground">Uploaded images</p>
          <JobImageGallery images={job.images} />
        </section>
      )}

      <section className="mb-6 space-y-3">
        <p className="text-sm font-semibold text-foreground">Job details</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Date needed" value={job.serviceDate} />
          <InfoRow label="Time needed" value={job.serviceTime} />
          <InfoRow label="Location" value={job.location} />
          {job.experienceYears !== undefined && (
            <InfoRow
              label="Experience required"
              value={`${job.experienceYears} year${job.experienceYears === 1 ? "" : "s"}`}
            />
          )}
          <InfoRow label="Budget" value={job.budget} />
          <InfoRow label="Promoted" value={job.promoted ? "Yes" : "No"} />
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Recommended by the system ({job.recommended.length})</p>
        <div className="space-y-2">
          {job.recommended.map((r) => (
            <Link
              key={r.userId}
              to={`/users/${r.userId}`}
              className="flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-2.5">
                <Avatar name={userName(r.userId)} />
                <span className="text-sm font-medium text-foreground">{userName(r.userId)}</span>
              </div>
              <OutlineBadge label="Recommended" />
            </Link>
          ))}
          {job.recommended.length === 0 && (
            <p className="text-sm text-muted-foreground">No system recommendations for this job.</p>
          )}
        </div>
      </section>

      <ConfirmationDialog
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        tone="destructive"
        title="Remove this job?"
        description="This permanently removes the listing and cannot be undone."
        confirmLabel="Remove job"
        onConfirm={() => {
          setRemoved(true)
          navigate("/jobs")
        }}
      />

      <ReasonDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject this job listing?"
        description={`Let ${job.poster} know why this listing was rejected.`}
        reasons={REJECT_REASONS}
        confirmLabel="Reject"
        successTitle="Job rejected"
        successDescription="The poster will be notified of this decision."
        onSubmit={() => {
          setStatus("destructive")
          setStatusLabel("Rejected")
        }}
      />
    </div>
  )
}

export default JobDetailPage
