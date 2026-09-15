import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CheckCircle2, MapPin } from "lucide-react"

import { BackButton } from "@/components/back-button"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { StatusPill, OutlineBadge } from "@/components/ui/status-pill"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { ReasonDialog } from "@/components/reason-dialog"
import { DocumentGrid, DocumentViewerDialog } from "@/components/document-preview"
import { VerificationReviewDialog } from "@/components/verification-review-dialog"
import { Sparkline } from "@/components/sparkline-chart"
import { cn } from "@/lib/utils"
import {
  users,
  getUserBucket,
  getCoverGradient,
  getProfileViewSummary,
  getRecommendationCount,
  type UserAccount,
  type UserDocument,
  type UserBucket,
} from "@/lib/mock-data"

const REJECT_REASONS = [
  "Blurry or unreadable ID photo",
  "ID does not match selfie",
  "Expired identification",
  "Suspected fraudulent submission",
]

const REMOVE_REASONS = [
  "User requested account deletion",
  "Violation of platform policies",
  "Suspected fraudulent activity",
  "Duplicate account",
  "Other",
]

type DetailTab = "account" | "info" | "worker" | "employer" | "promotions" | "analytics"

const CHIP_TONES = {
  brand: "bg-brand-cta-tint text-brand-cta",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/12 text-success",
} as const

function ChipSection({
  title,
  items,
  tone = "brand",
}: {
  title: string
  items: string[]
  tone?: keyof typeof CHIP_TONES
}) {
  return (
    <section className="space-y-2">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((i) => (
            <span key={i} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", CHIP_TONES[tone])}>
              {i}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Not provided.</p>
      )}
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{value}</p>
    </div>
  )
}

function VerificationTimeline({ user }: { user: UserAccount }) {
  return (
    <div className="space-y-3">
      {user.verificationHistory.map((step) => (
        <div key={step.label} className="flex items-start gap-2.5">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
          <div>
            <p className="text-sm text-foreground">{step.label}</p>
            <p className="text-xs text-muted-foreground">{step.date}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmployerDetailsTab({ user }: { user: UserAccount }) {
  const jobs = user.jobsPosted ?? []
  const [jobActive, setJobActive] = useState<boolean[]>(jobs.map((j) => j.active ?? true))

  if (jobs.length === 0) {
    return <p className="text-sm text-muted-foreground">No jobs posted yet.</p>
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Posted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-36" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job, i) => (
            <TableRow key={job.title}>
              <TableCell className="font-medium text-foreground">{job.title}</TableCell>
              <TableCell className="text-muted-foreground">{job.posted}</TableCell>
              <TableCell>
                <StatusPill
                  status={jobActive[i] ? "success" : "neutral"}
                  label={jobActive[i] ? "Active" : "Deactivated"}
                />
              </TableCell>
              <TableCell>
                <button
                  type="button"
                  className="text-xs font-bold text-foreground"
                  onClick={() => setJobActive((prev) => prev.map((v, idx) => (idx === i ? !v : v)))}
                >
                  {jobActive[i] ? "Deactivate job" : "Activate job"}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

function PromotionsTab({ user }: { user: UserAccount }) {
  const promoted = (user.jobsPosted ?? []).filter((j) => j.promoted)

  if (promoted.length === 0) {
    return <p className="text-sm text-muted-foreground">No promotions run yet.</p>
  }

  return (
    <div className="space-y-2">
      {promoted.map((job) => (
        <div key={job.title} className="flex items-center justify-between rounded-md border border-border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">{job.title}</p>
            <p className="text-xs text-muted-foreground">
              {job.promotedRange ?? "Active promotion"} · {(job.impressions ?? 0).toLocaleString()} impressions ·{" "}
              {(job.clicks ?? 0).toLocaleString()} clicks
            </p>
          </div>
          <StatusPill status="success" label="Promoted" />
        </div>
      ))}
    </div>
  )
}

function ProfileAnalyticsTab({ userId }: { userId: string }) {
  const summary = getProfileViewSummary(userId)
  const recommendationCount = getRecommendationCount(userId)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-border p-3">
          <p className="text-xs text-muted-foreground">Profile views (30d)</p>
          <p className="mt-1 text-base font-semibold text-foreground">{summary.total}</p>
        </div>
        <div className="rounded-md border border-border p-3">
          <p className="text-xs text-muted-foreground">Views this week</p>
          <p className="mt-1 text-base font-semibold text-foreground">{summary.thisWeek}</p>
        </div>
        <div className="rounded-md border border-border p-3">
          <p className="text-xs text-muted-foreground">Last viewed</p>
          <p className="mt-1 text-base font-semibold text-foreground">{summary.lastViewed}</p>
        </div>
        <div className="rounded-md border border-border p-3">
          <p className="text-xs text-muted-foreground">Times recommended for jobs</p>
          <p className="mt-1 text-base font-semibold text-foreground">{recommendationCount}</p>
        </div>
      </div>
      <div className="rounded-xl border border-border p-4">
        <Sparkline
          label="Profile visits"
          latest={`${summary.trend[summary.trend.length - 1].count} today`}
          data={summary.trend.map((d) => d.count)}
          color="var(--brand-cta)"
        />
      </div>
    </div>
  )
}

function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = users.find((u) => u.id === id)

  const [verification, setVerification] = useState(user?.verification)
  const [verificationLabel, setVerificationLabel] = useState(user?.verificationLabel)
  const [account, setAccount] = useState(user?.account)
  const [accountLabel, setAccountLabel] = useState(user?.accountLabel)
  const [removed, setRemoved] = useState(user?.removed ?? false)

  const [disableOpen, setDisableOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [viewingDoc, setViewingDoc] = useState<UserDocument | null>(null)
  const [tab, setTab] = useState<DetailTab>("account")

  if (!user) {
    return (
      <div>
        <BackButton to="/users" label="Back to Users" />
        <p className="text-sm text-muted-foreground">User not found.</p>
      </div>
    )
  }

  const bucket: UserBucket = getUserBucket({ ...user, verification: verification!, account: account! })
  const isDisabled = accountLabel === "Disabled"

  const identityDocs = user.documents.filter((d) => d.type !== "business")
  const businessDocs = user.documents.filter((d) => d.type === "business")
  const coverGradient = getCoverGradient(user.id)

  const tabDefs: { key: DetailTab; label: string }[] = [
    { key: "account", label: "Account Details" },
    { key: "info", label: "User Information" },
    ...(user.roles.includes("Worker") ? [{ key: "worker" as const, label: "Worker Details" }] : []),
    ...(user.roles.includes("Employer")
      ? [
          { key: "employer" as const, label: "Employer Details" },
          { key: "promotions" as const, label: "Promotions" },
        ]
      : []),
    { key: "analytics", label: "Profile Analytics" },
  ]

  return (
    <div>
      <BackButton to="/users" label="Back to Users" />

      <div className="mb-6 overflow-hidden rounded-xl border border-border">
        <div className={cn("h-20 bg-gradient-to-br sm:h-24", coverGradient)} />
        <div className="px-5 pb-4">
          <Avatar name={user.name} className="-mt-10 size-20 shrink-0 rounded-full text-xl ring-4 ring-card" />
          <div className="mt-3 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-semibold text-foreground">{user.name}</p>
              {user.roles.map((r) => (
                <OutlineBadge key={r} label={r} />
              ))}
              <StatusPill status={verification!} label={verificationLabel!} />
              <StatusPill status={account!} label={accountLabel!} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>Joined {user.dateJoined}</span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {user.location}
              </span>
            </div>
          </div>

          {bucket === "active" && user.interests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {user.interests.map((i) => (
                <span
                  key={i}
                  className="rounded-full bg-brand-cta-tint px-2.5 py-1 text-xs font-semibold text-brand-cta"
                >
                  {i}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 flex h-9 items-center gap-1 overflow-x-auto border-b border-border px-1">
        {tabDefs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "relative whitespace-nowrap px-1.5 py-1 text-sm",
              tab === t.key ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {t.label}
            {tab === t.key && <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-foreground" />}
          </button>
        ))}
      </div>

      {tab === "account" && (
        <div className="space-y-6">
          <section className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Verification timeline</p>
            <VerificationTimeline user={user} />
          </section>

          {identityDocs.length > 0 && (
            <section className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Identity documents</p>
              <DocumentGrid documents={identityDocs} onView={setViewingDoc} />
            </section>
          )}

          {businessDocs.length > 0 && (
            <section className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Business documents</p>
              <DocumentGrid documents={businessDocs} onView={setViewingDoc} />
            </section>
          )}

          {bucket === "deactivated" && user.deactivationReason && (
            <section className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm font-medium text-foreground">Why this account is deactivated</p>
              <p className="mt-1 text-sm text-muted-foreground">{user.deactivationReason}</p>
            </section>
          )}

          {bucket === "pending" && (
            <section className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Verification decision</p>
              <p className="text-sm text-muted-foreground">
                Review the submitted ID and selfie side by side before approving or rejecting this account.
              </p>
              <Button size="sm" className="px-6" onClick={() => setReviewOpen(true)}>
                Review verification
              </Button>
            </section>
          )}

          {!removed && (
            <section className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Account actions</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="px-6" onClick={() => setDisableOpen(true)}>
                  {isDisabled ? "Enable account" : "Disable account"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-destructive px-6 text-white hover:bg-destructive/90"
                  onClick={() => setRemoveOpen(true)}
                >
                  Remove user
                </Button>
              </div>
            </section>
          )}
        </div>
      )}

      {tab === "info" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow label="Full name" value={user.name} />
            <InfoRow label="User ID" value={user.id} />
            <InfoRow label="Roles" value={user.roles.join(", ")} />
            <InfoRow label="Date joined" value={user.dateJoined} />
            <InfoRow label="Location" value={user.location} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Phone" value={user.phone} />
          </div>
          <section className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Bio</p>
            <p className="text-sm text-foreground">{user.bio}</p>
          </section>
          <ChipSection title="Interests" items={user.interests} tone="success" />
        </div>
      )}

      {tab === "worker" && (
        <div className="space-y-6">
          <ChipSection title="Services offered" items={user.services ?? []} tone="brand" />
          <ChipSection title="Selected skills" items={user.skills ?? []} tone="primary" />
          <ChipSection title="Interests" items={user.interests} tone="success" />
        </div>
      )}

      {tab === "employer" && <EmployerDetailsTab user={user} />}

      {tab === "promotions" && <PromotionsTab user={user} />}

      {tab === "analytics" && <ProfileAnalyticsTab userId={user.id} />}

      <ConfirmationDialog
        open={disableOpen}
        onClose={() => setDisableOpen(false)}
        tone="neutral"
        title={isDisabled ? "Enable this account?" : "Disable this account?"}
        description={
          isDisabled
            ? "They will regain access to their account immediately."
            : "They will lose access to their account until it's re-enabled. This action is reversible."
        }
        confirmLabel={isDisabled ? "Enable account" : "Disable account"}
        onConfirm={() => {
          if (isDisabled) {
            setAccount("success")
            setAccountLabel("Active")
          } else {
            setAccount("warning")
            setAccountLabel("Disabled")
          }
        }}
      />

      <ReasonDialog
        open={removeOpen}
        onClose={() => {
          setRemoveOpen(false)
          if (removed) navigate("/users")
        }}
        title="Remove this user?"
        description={`Let us know why you're removing ${user.name}. This permanently removes their account and cannot be undone.`}
        reasons={REMOVE_REASONS}
        confirmLabel="Remove user"
        successTitle="User removed"
        successDescription="Their account has been permanently removed."
        onSubmit={() => {
          setRemoved(true)
          setAccount("destructive")
          setAccountLabel("Removed")
        }}
      />

      <ReasonDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject verification"
        description={`Let ${user.name} know why their verification was rejected.`}
        reasons={REJECT_REASONS}
        confirmLabel="Reject"
        successTitle="Verification rejected"
        successDescription="The applicant will be notified of this decision."
        onSubmit={() => {
          setVerification("destructive")
          setVerificationLabel("Rejected")
        }}
      />

      <VerificationReviewDialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        user={user}
        onApprove={() => {
          setVerification("success")
          setVerificationLabel("Verified")
          setReviewOpen(false)
        }}
        onReject={() => {
          setReviewOpen(false)
          setRejectOpen(true)
        }}
      />

      <DocumentViewerDialog doc={viewingDoc} onClose={() => setViewingDoc(null)} />
    </div>
  )
}

export default UserDetailPage
