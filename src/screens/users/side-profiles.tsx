import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BellRing, Briefcase, Building2, Crown, FileText, Grid2x2, Hash, MailCheck, UserRound } from "lucide-react"

import { Dialog } from "@/components/ui/dialog"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Pagination } from "@/components/pagination"
import { RowMenu } from "@/components/row-menu"
import { SortHead } from "@/components/data-table"
import type { Status } from "@/components/ui/status-pill"
import { cn } from "@/lib/utils"
import { jobCover } from "@/lib/photos"
import { useTable } from "@/lib/use-table"
import { ANCHOR_DATE, type EmployerProfile, type JobListing, type SeekerProfile, type UserAccount } from "@/lib/mock-data"
import { Empty, Fact, InfoRow, Pills, Section, StatusDot, SubSection } from "./detail-parts"
import { responsesFor, workPhotosFor } from "./profiles"

/* ---------- Job seeker ---------- */

function WorkPhotos({ photos, name }: { photos: string[]; name: string }) {
  const [open, setOpen] = useState(false)
  const [big, ...rest] = photos
  const small = rest.slice(0, 4)
  return (
    <>
      <div className="relative grid h-80 grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl">
        <img src={big} alt="" className={cn("size-full object-cover", small.length ? "col-span-2 row-span-2" : "col-span-4 row-span-2")} />
        {small.map((p, i) => (
          <img
            key={p}
            src={p}
            alt=""
            className={cn("size-full object-cover", small.length === 1 && "col-span-2 row-span-2", small.length === 2 && "col-span-2", small.length === 3 && i === 2 && "col-span-2")}
          />
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg border border-foreground bg-card px-4 py-2 text-body2 font-semibold text-foreground shadow-card hover:bg-muted"
        >
          <Grid2x2 className="size-4" /> Show all photos
        </button>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title={`${name}'s work photos`} width="w-[760px]">
        <div className="grid grid-cols-2 gap-2">
          {photos.map((p) => (
            <img key={p} src={p} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
          ))}
        </div>
      </Dialog>
    </>
  )
}

export function SeekerOverview({ user, seeker }: { user: UserAccount; seeker: SeekerProfile }) {
  const firstName = user.name.split(" ")[0]
  const proActive = seeker.pro && seeker.pro.until >= ANCHOR_DATE
  return (
    <>
      <Section
        title="Job seeker profile"
        description={[seeker.headline, seeker.workType === "service" ? "Service provider" : "Corporate job seeker", seeker.yearsExperience].filter(Boolean).join(" · ")}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Fact icon={Crown} title={proActive ? "Pro member" : seeker.pro ? "Pro membership ended" : "Not a Pro member"}>
            {seeker.pro ? `${seeker.pro.since} – ${seeker.pro.until}` : "Free plan, no skill-match alerts"}
          </Fact>
          <Fact icon={FileText} title={seeker.resumeName ?? "No resume uploaded"}>
            {seeker.resumeName ? "Resume on profile" : "Corporate jobs ask for one"}
          </Fact>
          <Fact icon={BellRing} title={`${seeker.jobAlerts} job alert${seeker.jobAlerts === 1 ? "" : "s"}`}>
            {proActive ? "Skill-match alerts on with Pro" : "Saved searches"}
          </Fact>
          <Fact icon={Briefcase} title={seeker.workType === "service" ? "Offers services" : "Looking for a role"}>
            {seeker.workAreas.length} work area{seeker.workAreas.length === 1 ? "" : "s"}
          </Fact>
        </div>

        <div className="mt-10">
          <SubSection title="Work areas">
            {seeker.workAreas.length === 0 ? (
              <p className="text-body1 text-muted-foreground">No work areas set.</p>
            ) : (
              <div className="divide-y divide-border">
                {seeker.workAreas.map((a, i) => (
                  <div key={a.category} className="flex flex-wrap items-center gap-3 py-4 first:pt-0">
                    <p className="w-40 shrink-0 text-body1 font-semibold text-foreground">
                      {a.category}
                      {i === 0 && <span className="block text-caption font-normal text-muted-foreground">Primary</span>}
                    </p>
                    <Pills items={a.subSkills} empty="No sub-skills picked." />
                  </div>
                ))}
              </div>
            )}
          </SubSection>
          <SubSection title={`What ${firstName} offers`}>
            <Pills items={user.services ?? []} empty="No services listed." />
          </SubSection>
          <SubSection title="Skills">
            <Pills items={user.skills ?? []} empty="No skills listed." />
          </SubSection>
        </div>
      </Section>

      <Section title="Work photos" description="Shown on their profile and their card in Find people.">
        <WorkPhotos photos={workPhotosFor(seeker)} name={firstName} />
      </Section>
    </>
  )
}

/* ---------- Employer ---------- */

export function EmployerOverview({ user, employer }: { user: UserAccount; employer: EmployerProfile }) {
  const c = employer.company
  return (
    <Section
      title="Employer profile"
      description={employer.type === "business" ? `Hires as a business${c ? `: ${c.name}` : ""}.` : "Hires as an individual."}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Fact icon={employer.type === "business" ? Building2 : UserRound} title={employer.type === "business" ? "Business" : "Individual"}>
          Hiring type
        </Fact>
        {c && (
          <Fact icon={MailCheck} title={c.emailVerified ? "Work email verified" : "Work email not verified"}>
            {c.email}
          </Fact>
        )}
        {c && (
          <Fact icon={Hash} title={c.cac}>
            CAC registration number
          </Fact>
        )}
      </div>

      {c && (
        <div className="mt-10">
          <SubSection title="Company details">
            <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
              <InfoRow label="Company name" value={c.name} />
              <InfoRow label="CAC number" value={c.cac} />
              <InfoRow
                label="Work email"
                value={
                  <span className="flex items-center gap-3">
                    {c.email}
                    <StatusDot status={c.emailVerified ? "success" : "warning"} label={c.emailVerified ? "Verified" : "Not verified"} />
                  </span>
                }
              />
              <InfoRow label="Address" value={c.address} />
              <InfoRow
                label="Website"
                value={
                  c.website ? (
                    <a href={c.website} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                      {c.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    "Not provided"
                  )
                }
              />
              <InfoRow label="Account email" value={user.email} />
            </div>
          </SubSection>
        </div>
      )}

      <div className="mt-10">
        <SubSection title="Hires for">
          <Pills items={employer.interests} empty="Nothing picked yet." />
        </SubSection>
        {employer.about && (
          <SubSection title="About">
            <p className="max-w-2xl text-body1 text-foreground">{employer.about}</p>
          </SubSection>
        )}
      </div>
    </Section>
  )
}

const shortDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })

const JOB_DOT: Record<string, Status> = { Open: "success", "Pending Review": "warning", Filled: "neutral", Flagged: "destructive", Removed: "destructive" }

/** Jobs this person posted. Every row opens the job; the menu keeps the old activate / deactivate action. */
export function PostedJobsTable({ jobs }: { jobs: JobListing[] }) {
  const navigate = useNavigate()
  const [inactive, setInactive] = useState<Set<string>>(() => new Set())
  const sorters = useMemo(
    () => ({
      title: (j: JobListing) => j.title,
      status: (j: JobListing) => j.statusLabel,
      views: (j: JobListing) => j.views,
      responses: (j: JobListing) => responsesFor(j),
      posted: (j: JobListing) => j.datePosted,
    }),
    [],
  )
  const t = useTable(jobs, { getId: (j) => j.id, sorters, initialSort: { key: "posted", dir: "desc" }, pageSize: 10 })

  if (jobs.length === 0) return <Empty>No jobs posted yet.</Empty>

  const toggle = (id: string) =>
    setInactive((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <SortHead label="Job" sortKey="title" sort={t.sort} onSort={t.toggleSort} className="first:pl-0" />
            <SortHead label="Status" sortKey="status" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Views" sortKey="views" sort={t.sort} onSort={t.toggleSort} align="right" />
            <SortHead label="Responses" sortKey="responses" sort={t.sort} onSort={t.toggleSort} align="right" />
            <SortHead label="Posted" sortKey="posted" sort={t.sort} onSort={t.toggleSort} />
            <TableHead className="w-10 last:pr-0" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {t.pagedRows.map((job) => {
            const off = inactive.has(job.id)
            return (
              <TableRow key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} className={cn("cursor-pointer", (off || job.removed) && "opacity-60")}>
                <TableCell className="py-2.5 first:pl-0">
                  <div className="flex items-center gap-3">
                    <img src={job.photos?.[0] ?? jobCover(job.id)} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <Link
                        to={`/jobs/${job.id}`}
                        onClick={(e) => e.stopPropagation()}
                        title={job.title}
                        className="block max-w-44 truncate text-body2 font-semibold text-foreground hover:underline"
                      >
                        {job.title}
                      </Link>
                      <p className="max-w-44 truncate text-caption text-muted-foreground">
                        {job.id} · {job.category.split(" › ").pop()}
                        {job.promoted && " · Promoted"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusDot status={off ? "neutral" : (JOB_DOT[job.statusLabel] ?? job.status)} label={off ? "Deactivated" : job.statusLabel === "Pending Review" ? "Pending" : job.statusLabel} />
                </TableCell>
                <TableCell className="text-right tabular-nums text-foreground">{job.views.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{responsesFor(job).toLocaleString()}</TableCell>
                <TableCell title={job.datePosted} className="whitespace-nowrap tabular-nums">
                  {shortDate(job.datePosted)}
                </TableCell>
                <TableCell className="last:pr-0">
                  <RowMenu
                    items={[
                      { label: "Open job", onSelect: () => navigate(`/jobs/${job.id}`) },
                      { label: off ? "Activate job" : "Deactivate job", onSelect: () => toggle(job.id), destructive: !off },
                    ]}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <Pagination
        page={t.page}
        totalPages={t.totalPages}
        onPageChange={t.setPage}
        total={t.total}
        pageSize={t.pageSize}
        onPageSizeChange={t.setPageSize}
        noun="jobs"
      />
    </div>
  )
}
