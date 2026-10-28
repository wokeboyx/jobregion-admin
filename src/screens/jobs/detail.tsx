import { useState, type ComponentType, type ReactNode } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import {
  BadgeCheck,
  Briefcase,
  CalendarDays,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  Globe,
  MapPin,
  MessageCircle,
  Megaphone,
  Sparkles,
  Wallet,
  Wrench,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Status } from "@/components/ui/status-pill"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { ReasonDialog } from "@/components/reason-dialog"
import { JobImageGallery } from "@/components/job-image-gallery"
import { cn } from "@/lib/utils"
import { users, timeAgo } from "@/lib/mock-data"
import { allJobs, findJob } from "./generated"
import { jobSourceByName } from "@/lib/job-sources"
import { jobPhotos } from "./job-photos"

const REJECT_REASONS = [
  "Missing or unclear description",
  "Prohibited category or content",
  "Suspected scam or fraudulent listing",
  "Duplicate listing",
]

const DOT: Record<Status, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  neutral: "bg-muted-foreground",
}

/** One Airbnb-style amenity row: an outline icon, a bold label, and a grey line under it. */
function DetailRow({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string; strokeWidth?: number }>; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <Icon className="mt-0.5 size-6 shrink-0 text-foreground" strokeWidth={1.5} />
      <div>
        <p className="text-body1 font-semibold text-foreground">{label}</p>
        <p className="text-body1 text-muted-foreground">{value}</p>
      </div>
    </div>
  )
}

/** "Imported from Jobberman · View original" under the job's heading. */
function ImportedLine({ source, url }: { source: string; url?: string }) {
  const found = jobSourceByName(source)
  return (
    <p className="mt-2 flex flex-wrap items-center gap-1 text-body1 text-foreground">
      Imported from
      {found ? (
        <Link to={`/job-sources/${found.id}`} className="font-semibold underline underline-offset-2 hover:text-muted-foreground">
          {source}
        </Link>
      ) : (
        <span className="font-semibold">{source}</span>
      )}
      {url && (
        <>
          <span className="text-muted-foreground">·</span>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:text-muted-foreground"
          >
            View original <ExternalLink className="size-3.5" />
          </a>
        </>
      )}
    </p>
  )
}

function Section({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("border-t border-border py-8", className)}>
      {title && <h2 className="heading-section mb-6">{title}</h2>}
      {children}
    </section>
  )
}

function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const job = findJob(id)

  const [status, setStatus] = useState(job?.status)
  const [statusLabel, setStatusLabel] = useState(job?.statusLabel)
  const [flagged, setFlagged] = useState(job?.statusLabel === "Flagged")
  const [removed, setRemoved] = useState(job?.removed ?? false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  if (!job) {
    return (
      <div>
        <PageHeader title="Job not found" description="This job may have been removed or the link is wrong." back={{ to: "/jobs", label: "Back to jobs" }} />
      </div>
    )
  }

  const isPending = statusLabel === "Pending Review"
  const displayStatus: Status = removed || flagged ? "destructive" : status!
  const displayStatusLabel = removed ? "Removed" : flagged ? "Flagged" : statusLabel === "Pending Review" ? "Needs review" : statusLabel!

  const poster = users.find((u) => u.id === job.posterId)
  const posterJobCount = allJobs().filter((j) => j.posterId === job.posterId).length
  const TypeIcon = job.type === "Skilled" ? Wrench : Sparkles

  return (
    <div>
      <PageHeader title={job.title} back={{ to: "/jobs", label: "Back to jobs" }} />

      <JobImageGallery photos={jobPhotos(job)} title={job.title} />

      <div className="mt-10 grid grid-cols-1 gap-x-20 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <div className="pb-8">
            <h2 className="heading-section">
              {job.type} job · {job.category}
            </h2>
            <p className="mt-1 text-body1 text-muted-foreground">
              {job.location} · Posted {timeAgo(job.datePosted)}
              {job.promoted && " · Promoted"}
            </p>
            {job.source && <ImportedLine source={job.source} url={job.sourceUrl} />}
          </div>

          <Section>
            {job.official ? (
              <div className="flex items-center gap-4 py-2">
                <Avatar name="Jobs Region" className="size-14 text-body1" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-body1 font-semibold text-foreground">
                    Posted by Jobs Region <BadgeCheck className="size-4 text-foreground" />
                  </p>
                  <p className="text-body1 text-muted-foreground">Official listing posted by the Jobs Region team</p>
                </div>
              </div>
            ) : (
              <Link
                to={`/users/${job.posterId}`}
                className="-mx-3 flex items-center gap-4 rounded-xl px-3 py-2 transition-colors hover:bg-muted"
              >
                <Avatar name={job.poster} className="size-14 text-body1" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-body1 font-semibold text-foreground">
                    Posted by {job.poster}
                    {poster?.verification === "success" && <BadgeCheck className="size-4 text-foreground" />}
                  </p>
                  <p className="text-body1 text-muted-foreground">
                    {posterJobCount} job{posterJobCount === 1 ? "" : "s"} posted
                    {poster && ` · Joined ${timeAgo(poster.dateJoined)}`}
                  </p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-foreground" />
              </Link>
            )}
          </Section>

          <Section title="About this job">
            <p className="max-w-2xl text-body1 leading-relaxed text-foreground">{job.description}</p>
          </Section>

          {job.applyUrl && (
            <Section title="How to apply">
              <p className="max-w-2xl text-body1 text-muted-foreground">
                {job.source ? `Applications go through ${job.source}'s original listing.` : "Applicants apply on the poster's own careers page or hiring system."}
              </p>
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex max-w-full items-center gap-2 rounded-xl border border-border px-4 py-3 text-body2 font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <ExternalLink className="size-4 shrink-0" />
                <span className="truncate" title={job.applyUrl}>
                  {job.applyUrl}
                </span>
              </a>
            </Section>
          )}

          <Section title="Job details">
            <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
              <DetailRow icon={CalendarDays} label="Date needed" value={job.serviceDate} />
              <DetailRow icon={Clock} label="Time needed" value={job.serviceTime} />
              <DetailRow icon={MapPin} label="Location" value={job.location} />
              <DetailRow icon={Wallet} label="Budget" value={job.budget} />
              <DetailRow icon={TypeIcon} label="Job type" value={job.type} />
              {job.experienceYears !== undefined && (
                <DetailRow
                  icon={Briefcase}
                  label="Experience required"
                  value={`${job.experienceYears} year${job.experienceYears === 1 ? "" : "s"}`}
                />
              )}
              {job.mode && <DetailRow icon={Globe} label="Where" value={job.mode} />}
              {job.contactMethods && job.contactMethods.length > 0 && (
                <DetailRow icon={MessageCircle} label="How people reach the poster" value={job.contactMethods.join(", ")} />
              )}
              <DetailRow icon={Megaphone} label="Promoted" value={job.promoted ? "Yes, shown higher in search" : "No"} />
            </div>
          </Section>

          <Section title={`Recommended workers (${job.recommended.length})`}>
            {job.recommended.length === 0 ? (
              <p className="text-body1 text-muted-foreground">No system recommendations for this job.</p>
            ) : (
              <div className="divide-y divide-border">
                {job.recommended.map((r) => {
                  const worker = users.find((u) => u.id === r.userId)
                  const name = worker?.name ?? "Unknown user"
                  return (
                    <Link
                      key={r.userId}
                      to={`/users/${r.userId}`}
                      className="-mx-3 flex items-center gap-4 rounded-xl px-3 py-4 transition-colors hover:bg-muted"
                    >
                      <Avatar name={name} className="size-12 text-body1" />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 text-body1 font-semibold text-foreground">
                          {name}
                          {worker?.verification === "success" && <BadgeCheck className="size-4 text-foreground" />}
                        </p>
                        <p className="line-clamp-1 text-body1 text-muted-foreground">
                          {[worker?.location, worker?.services?.slice(0, 2).join(", ")].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <ChevronRight className="size-5 shrink-0 text-foreground" />
                    </Link>
                  )
                })}
              </div>
            )}
          </Section>
        </div>

        <aside className="lg:pt-0">
          <div className="sticky top-28 rounded-xl border border-border p-6 shadow-card">
            <span className="inline-flex items-center gap-2 text-body2 font-semibold text-foreground">
              <span className={cn("size-2 rounded-full", DOT[displayStatus])} />
              {displayStatusLabel}
            </span>

            <p className="mt-4 text-body2 text-muted-foreground">Budget</p>
            <p className="text-h4 font-bold leading-tight tracking-tight text-foreground">{job.budget}</p>

            <div className="mt-5 divide-y divide-border border-y border-border text-body1">
              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="size-4" /> Views
                </span>
                <span className="font-semibold text-foreground">{job.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">Date posted</span>
                <span className="font-semibold text-foreground">{job.datePosted}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">Recommended</span>
                <span className="font-semibold text-foreground">{job.recommended.length}</span>
              </div>
            </div>

            {isPending && (
              <div className="mt-6 space-y-3">
                <Button
                  variant="brand"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setStatus("success")
                    setStatusLabel("Open")
                  }}
                >
                  Approve job
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={() => setRejectOpen(true)}>
                  Reject
                </Button>
                <p className="text-center text-body2 text-muted-foreground">The poster is notified either way.</p>
              </div>
            )}
            {!isPending && !removed && (
              <div className="mt-6 space-y-3">
                <Button variant="outline" size="lg" className="w-full" onClick={() => setFlagged((f) => !f)}>
                  {flagged ? "Unflag" : "Flag"}
                </Button>
                <Button variant="danger" size="lg" className="w-full" onClick={() => setRemoveOpen(true)}>
                  Remove job
                </Button>
              </div>
            )}
            {removed && <p className="mt-6 text-center text-body2 text-muted-foreground">This job has been removed.</p>}
          </div>
        </aside>
      </div>

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
