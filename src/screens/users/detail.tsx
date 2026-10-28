import { useMemo, useState, type ReactNode } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { AlertCircle, BadgeCheck, Briefcase, CalendarDays, Check, Info, Mail, MapPin, Phone, ShieldCheck } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { PillTabs } from "@/components/pill-tabs"
import { Tabs } from "@/components/tabs"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { ReasonDialog } from "@/components/reason-dialog"
import { DocumentGrid, DocumentViewerDialog } from "@/components/document-preview"
import { VerificationReviewDialog } from "@/components/verification-review-dialog"
import { cn } from "@/lib/utils"
import { photoFor } from "@/lib/photos"
import { getUserBucket, type UserAccount, type UserDocument, type UserBucket } from "@/lib/mock-data"
import { findUser } from "./generated"
import {
  employerOf,
  hiresAs,
  jobPromotionsOf,
  postedJobsOf,
  profilePromotionsOf,
  reviewsAbout,
  seekerOf,
  type Side,
} from "./profiles"
import { getUserStats } from "./user-stats"
import { HireTable, IconRow, InfoRow, Pills, PromotionTable, ReviewList, Section, StatusDot, SubSection } from "./detail-parts"
import { EmployerOverview, PostedJobsTable, SeekerOverview } from "./side-profiles"
import { ProfileAnalytics } from "./profile-analytics"

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

type DetailTab = "overview" | "jobs" | "reviews" | "promotions" | "analytics" | "verification" | "info"

const SIDE_LABEL: Record<Side, string> = { seeker: "Job seeker profile", employer: "Employer profile" }

function VerificationTimeline({ user }: { user: UserAccount }) {
  return (
    <ul className="space-y-4">
      {user.verificationHistory.map((step) => (
        <li key={step.label} className="flex items-start gap-4">
          <Check className="mt-0.5 size-5 shrink-0 text-foreground" strokeWidth={2.25} />
          <div>
            <p className="text-body1 text-foreground">{step.label}</p>
            <p className="text-body2 text-muted-foreground">{step.date}</p>
          </div>
        </li>
      ))}
      {user.reviewerNote && (
        <li className="flex items-start gap-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" strokeWidth={2} />
          <div>
            <p className="text-body1 text-foreground">{user.reviewerNote.label}</p>
            <p className="text-body2 text-muted-foreground">{user.reviewerNote.date}</p>
          </div>
        </li>
      )}
    </ul>
  )
}

/** One stat in the host card, e.g. "4" over "Jobs posted", stacked with hairlines between. */
function CardStat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <p className="heading-subsection font-bold">{value}</p>
      <p className="text-caption font-medium text-foreground">{label}</p>
    </div>
  )
}

function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const user = findUser(id)

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
  const [tab, setTab] = useState<DetailTab>(user?.verification === "warning" ? "verification" : "overview")

  const seeker = user ? seekerOf(user) : null
  const employer = user ? employerOf(user) : null
  const posted = useMemo(() => (user && employer ? postedJobsOf(user.id) : []), [user, employer])

  if (!user) {
    return (
      <div>
        <PageHeader title="User not found" back={{ to: "/users", label: "Back to users" }} />
        <p className="text-body1 text-muted-foreground">This account doesn't exist or has been removed.</p>
      </div>
    )
  }

  const sides: Side[] = [...(seeker ? (["seeker"] as const) : []), ...(employer ? (["employer"] as const) : [])]
  const requested = params.get("side") as Side | null
  const side: Side | null = requested && sides.includes(requested) ? requested : (sides[0] ?? null)
  const setSide = (s: Side) => {
    setParams({ side: s }, { replace: true })
    if (tab !== "verification" && tab !== "info") setTab("overview")
  }

  const bucket: UserBucket = getUserBucket({ ...user, verification: verification!, account: account! })
  const isDisabled = accountLabel === "Disabled"
  const isVerified = verification === "success"
  const firstName = user.name.split(" ")[0]
  const stats = getUserStats(user)
  const photo = photoFor(user.name)

  const identityDocs = user.documents.filter((d) => d.type !== "business")
  const businessDocs = user.documents.filter((d) => d.type === "business")

  const sideReviews = side ? reviewsAbout(user.id, side) : []
  const published = sideReviews.filter((r) => r.state === "Published")
  const rating = published.length ? published.reduce((s, r) => s + r.rating, 0) / published.length : null
  const sideHires = side ? hiresAs(user.id, side) : []
  const promoRows = side === "seeker" ? profilePromotionsOf(user, photo) : side === "employer" ? jobPromotionsOf(user, posted) : []

  const missing = (["seeker", "employer"] as const).find((s) => !sides.includes(s))
  const missingNote =
    sides.length === 0
      ? `${firstName} hasn't set up either side yet.`
      : missing === "employer"
        ? `No employer profile yet. ${firstName} only uses Jobs Region to find work.`
        : missing === "seeker"
          ? `No job seeker profile yet. ${firstName} only uses Jobs Region to hire.`
          : `${firstName} uses both sides of Jobs Region. Switch to see each profile.`

  const tabDefs: { key: DetailTab; label: string }[] = [
    ...(side ? [{ key: "overview" as const, label: "Profile" }] : []),
    ...(side === "employer" ? [{ key: "jobs" as const, label: "Jobs" }] : []),
    ...(side ? [{ key: "reviews" as const, label: "Reviews" }] : []),
    ...(side ? [{ key: "promotions" as const, label: "Promotions" }] : []),
    ...(side ? [{ key: "analytics" as const, label: "Analytics" }] : []),
    { key: "verification", label: "Verification" },
    { key: "info", label: "Account" },
  ]
  const activeTab = tabDefs.some((t) => t.key === tab) ? tab : tabDefs[0].key
  const sideWord = side === "employer" ? "poster" : "worker"

  return (
    <div>
      <PageHeader title={user.name} back={{ to: "/users", label: "Back to users" }} />

      <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border pb-6">
        {sides.length > 0 && <PillTabs options={sides.map((s) => ({ key: s, label: SIDE_LABEL[s] }))} value={side!} onChange={setSide} />}
        <p className="flex items-center gap-2 text-body2 text-muted-foreground">
          <Info className="size-4 shrink-0" />
          {missingNote}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[380px_minmax(0,1fr)] xl:gap-20">
        {/* Left: the host card and account actions */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center gap-6 rounded-3xl bg-card p-6 shadow-[0_6px_16px_rgb(0_0_0/0.12)]">
            <div className="flex flex-1 flex-col items-center text-center">
              <div className="relative">
                <Avatar name={user.name} className="size-28 text-h4" />
                {isVerified && (
                  <span className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-brand text-white ring-4 ring-card">
                    <ShieldCheck className="size-4" strokeWidth={2.5} />
                  </span>
                )}
              </div>
              <p className={cn("heading-section mt-3", removed && "line-through")}>{firstName}</p>
              <p className="mt-0.5 text-body2 font-medium text-foreground">
                {side === "employer" ? (employer?.type === "business" ? "Employer · Business" : "Employer") : side === "seeker" ? "Job seeker" : "No profile"}
                {side === "seeker" && seeker?.pro && " · Pro"}
              </p>
            </div>
            <div className="w-28 shrink-0 divide-y divide-border">
              {side === "employer" ? (
                <CardStat value={posted.length || stats.jobsPosted} label="Jobs posted" />
              ) : (
                <CardStat value={sideHires.length} label="Hires" />
              )}
              <CardStat
                value={rating ? <>{rating.toFixed(1)} ★</> : published.length}
                label={rating ? `${published.length} review${published.length === 1 ? "" : "s"}` : "Reviews"}
              />
              <CardStat
                value={stats.tenure.value}
                label={stats.tenure.unit === "years" ? "Years on Jobs Region" : "Months on Jobs Region"}
              />
            </div>
          </div>

          <div className="mt-8 space-y-4 rounded-xl border border-border p-6">
            <p className="heading-card">Account status</p>
            <div className="flex items-center justify-between">
              <span className="text-body1 text-muted-foreground">Identity</span>
              <StatusDot status={verification!} label={verificationLabel!} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body1 text-muted-foreground">Account</span>
              <StatusDot status={account!} label={accountLabel!} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body1 text-muted-foreground">Profiles</span>
              <span className="text-body2 text-foreground">{sides.length === 2 ? "Seeker and employer" : sides.length ? (sides[0] === "seeker" ? "Seeker" : "Employer") : "None"}</span>
            </div>

            {(bucket === "pending" || !removed) && (
              <div className="space-y-3 border-t border-border pt-5">
                {bucket === "pending" && (
                  <Button variant="brand" size="lg" className="w-full" onClick={() => setReviewOpen(true)}>
                    Review verification
                  </Button>
                )}
                {!removed && (
                  <>
                    <Button variant="outline" size="lg" className="w-full" onClick={() => setDisableOpen(true)}>
                      {isDisabled ? "Enable account" : "Disable account"}
                    </Button>
                    <Button variant="destructive" size="lg" className="w-full" onClick={() => setRemoveOpen(true)}>
                      Remove user
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Right: About, then the tabbed sections for the chosen side */}
        <div className="min-w-0">
          <section className="pb-10">
            <h2 className="heading-section">About {firstName}</h2>
            <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <IconRow icon={MapPin}>Lives in {user.location}</IconRow>
              <IconRow icon={Briefcase}>
                {sides.length === 2 ? "Works and hires" : side === "employer" ? "Hires on Jobs Region" : "Works on Jobs Region"}
              </IconRow>
              <IconRow icon={Mail}>{user.email}</IconRow>
              <IconRow icon={Phone}>{user.phone}</IconRow>
              <IconRow icon={CalendarDays}>Joined {user.dateJoined}</IconRow>
              {isVerified && <IconRow icon={BadgeCheck}>Identity verified</IconRow>}
            </div>
            <p className="mt-8 max-w-2xl text-body1 leading-relaxed text-foreground">{user.bio}</p>
          </section>

          <div className="border-t border-border pt-8">
            <Tabs tabs={tabDefs} value={activeTab} onChange={setTab} className="mb-10 overflow-x-auto" />

            {activeTab === "overview" && side === "seeker" && seeker && <SeekerOverview user={user} seeker={seeker} />}
            {activeTab === "overview" && side === "employer" && employer && <EmployerOverview user={user} employer={employer} />}

            {activeTab === "jobs" && (
              <Section title="Jobs posted" description={`Every job ${firstName} has posted. Open one to review it, or deactivate it from the menu.`}>
                <PostedJobsTable jobs={posted} />
              </Section>
            )}

            {activeTab === "reviews" && side && (
              <Section
                title={side === "employer" ? "Reviews and hires as a poster" : "Reviews and hires as a worker"}
                description={side === "employer" ? "What workers said after being hired, and who was hired." : "What posters said after hiring, and the jobs they were hired for."}
              >
                <SubSection title={`Reviews received as a ${sideWord}`}>
                  <ReviewList items={sideReviews} empty={`No reviews as a ${sideWord} yet.`} />
                </SubSection>
                <SubSection title={`Hires as a ${sideWord}`}>
                  <HireTable
                    items={sideHires}
                    otherSide={side === "employer" ? "worker" : "poster"}
                    empty={`No hires as a ${sideWord} yet.`}
                  />
                </SubSection>
              </Section>
            )}

            {activeTab === "promotions" && side && (
              <Section
                title={side === "employer" ? "Promotions on jobs" : "Promotions on profile"}
                description={side === "employer" ? `Boosts ${firstName} paid for on their job posts.` : `Boosts ${firstName} paid for to show their profile higher in Find people.`}
              >
                <PromotionTable
                  items={promoRows}
                  empty={side === "employer" ? "No job promotions run yet." : "No profile promotions run yet."}
                />
              </Section>
            )}

            {activeTab === "analytics" && side && (
              <Section
                title={side === "employer" ? "Employer analytics" : "Job seeker analytics"}
                description={side === "employer" ? "How their jobs are found and answered." : "How often people find and contact this profile."}
              >
                <ProfileAnalytics key={side} user={user} side={side} posted={posted} />
              </Section>
            )}

            {activeTab === "verification" && (
              <div>
                {bucket === "deactivated" && user.deactivationReason && (
                  <Section title="Why this account is deactivated">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" strokeWidth={2} />
                      <p className="text-body1 text-foreground">{user.deactivationReason}</p>
                    </div>
                  </Section>
                )}

                {bucket === "pending" && (
                  <Section
                    title="Waiting for your decision"
                    description="Check the ID and selfie side by side before approving or rejecting this account."
                  >
                    <Button size="lg" onClick={() => setReviewOpen(true)}>
                      Review verification
                    </Button>
                  </Section>
                )}

                <Section title="Identity verification" description="The documents this person uploaded to prove who they are.">
                  {identityDocs.length > 0 ? (
                    <DocumentGrid documents={identityDocs} onView={setViewingDoc} selfiePhoto={photo} />
                  ) : (
                    <p className="text-body1 text-muted-foreground">No identity documents uploaded.</p>
                  )}
                </Section>

                {businessDocs.length > 0 && (
                  <Section title="Business documents">
                    <DocumentGrid documents={businessDocs} onView={setViewingDoc} />
                  </Section>
                )}

                <Section title={`${firstName}'s confirmed information`}>
                  <VerificationTimeline user={user} />
                </Section>
              </div>
            )}

            {activeTab === "info" && (
              <div>
                <Section title="Account details">
                  <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
                    <InfoRow label="Full name" value={user.name} />
                    <InfoRow label="User ID" value={user.id} />
                    <InfoRow label="Profiles" value={sides.map((s) => SIDE_LABEL[s]).join(", ") || "None"} />
                    <InfoRow label="Date joined" value={user.dateJoined} />
                    <InfoRow label="Location" value={user.location} />
                    <InfoRow label="Email" value={user.email} />
                    <InfoRow label="Phone" value={user.phone} />
                    <InfoRow label="Activity" value={user.activity} />
                  </div>
                </Section>
                <Section title="Bio">
                  <p className="max-w-2xl text-body1 leading-relaxed text-foreground">{user.bio}</p>
                </Section>
                <Section title="Interests">
                  <Pills items={user.interests} />
                </Section>
              </div>
            )}
          </div>
        </div>
      </div>

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

      <DocumentViewerDialog doc={viewingDoc} onClose={() => setViewingDoc(null)} selfiePhoto={photo} />
    </div>
  )
}

export default UserDetailPage
