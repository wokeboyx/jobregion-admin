import { useMemo, useState, type ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BadgeCheck, Search, Users as UsersIcon } from "lucide-react"

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Avatar } from "@/components/ui/avatar"
import { SelectMenu } from "@/components/ui/select-menu"
import { PageHeader } from "@/components/page-header"
import { PillTabs } from "@/components/pill-tabs"
import { ViewToggle, type View } from "@/components/view-toggle"
import { Pagination } from "@/components/pagination"
import { RowMenu } from "@/components/row-menu"
import { EmptyState, ErrorState } from "@/components/page-state"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { SortHead, SelectHead, Checkbox, BulkBar, BulkAction } from "@/components/data-table"
import type { Status } from "@/components/ui/status-pill"
import { cn } from "@/lib/utils"
import { useTable } from "@/lib/use-table"
import { usePreviewState } from "@/lib/preview-state"
import { getUserBucket, type UserAccount, type UserBucket } from "@/lib/mock-data"
import { statsLine } from "./user-stats"
import { allUsers } from "./generated"
import { sidesOf, type Side } from "./profiles"

const TABS: { key: UserBucket; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending verification" },
  { key: "deactivated", label: "Deactivated" },
]

const ALL_PROFILES = "all"
const PROFILE_OPTIONS = [
  { value: ALL_PROFILES, label: "All profiles" },
  { value: "seeker", label: "Job seeker" },
  { value: "employer", label: "Employer" },
  { value: "both", label: "Both profiles" },
]
const ALL_VERIFICATION = "all"
const VERIFICATION_OPTIONS = [
  { value: ALL_VERIFICATION, label: "All verification states" },
  { value: "Verified", label: "Verified" },
  { value: "Pending", label: "Pending" },
  { value: "Rejected", label: "Rejected" },
]

const SIDE_LABEL: Record<Side, string> = { seeker: "Seeker", employer: "Employer" }

const DOT: Record<Status, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  neutral: "bg-muted-foreground",
}

function StatusDot({ status, label }: { status: Status; label: string }) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap text-body2 text-foreground">
      <span className={cn("size-2 shrink-0 rounded-full", DOT[status])} />
      {label}
    </span>
  )
}

function VerifiedTick({ user, className }: { user: UserAccount; className?: string }) {
  if (user.verification !== "success") return null
  return <BadgeCheck aria-label="Verified" className={cn("size-4 shrink-0 fill-foreground text-white", className)} />
}

function ProfilePills({ sides }: { sides: Side[] }) {
  return (
    <div className="flex gap-1.5">
      {sides.map((s) => (
        <span key={s} className="rounded-full border border-input px-2.5 py-0.5 text-caption font-medium text-foreground">
          {SIDE_LABEL[s]}
        </span>
      ))}
    </div>
  )
}

/** Airbnb host card for the optional grid view. */
function UserCard({ user, menu }: { user: UserAccount; menu: ReactNode }) {
  return (
    <div className={cn("group relative", user.removed && "opacity-60")}>
      <Link
        to={`/users/${user.id}`}
        className="flex h-full flex-col items-center rounded-xl border border-border bg-card px-5 pb-6 pt-8 text-center transition-shadow hover:shadow-card"
      >
        <Avatar name={user.name} className="size-24 text-2xl" />
        <div className="mt-4 flex max-w-full items-center gap-1">
          <p className={cn("heading-card truncate", user.removed && "line-through")}>{user.name}</p>
          <VerifiedTick user={user} />
        </div>
        <p className="mt-0.5 line-clamp-1 text-body2 text-muted-foreground">{user.location.split(",")[0]}</p>
        <div className="mt-2">
          <ProfilePills sides={sidesOf(user)} />
        </div>
        {user.verification !== "success" && (
          <div className="mt-2">
            <StatusDot status={user.verification} label={user.verificationLabel} />
          </div>
        )}
        <p className="mt-4 w-full border-t border-border pt-4 text-body2 text-muted-foreground">{statsLine(user)}</p>
      </Link>
      <div className="absolute right-2 top-2">{menu}</div>
    </div>
  )
}

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function downloadCsv(rows: UserAccount[]) {
  const header = ["ID", "Name", "Email", "Phone", "Profiles", "Location", "Verification", "Account", "Joined", "Activity"]
  const lines = rows.map((u) =>
    [u.id, u.name, u.email, u.phone, sidesOf(u).map((s) => SIDE_LABEL[s]).join(" + "), u.location, u.verificationLabel, u.accountLabel, u.dateJoined, u.activity]
      .map(csvCell)
      .join(","),
  )
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `users-${rows.length}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Users at scale: status tabs with counts, search and filter pills, a result count with "Clear filters", a sortable
 * table with row checkboxes and bulk Verify / Disable / Export CSV, and paging with totals. Generated users are real
 * accounts and open their own detail page.
 */
function UsersPage() {
  const navigate = useNavigate()
  const [version, setVersion] = useState(0)
  const [tab, setTab] = useState<UserBucket>("active")
  const [view, setView] = useState<View>("list")
  const [search, setSearch] = useState("")
  const [profileFilter, setProfileFilter] = useState(ALL_PROFILES)
  const [verificationFilter, setVerificationFilter] = useState(ALL_VERIFICATION)
  const [disableOpen, setDisableOpen] = useState(false)

  // `version` re-reads the list after bulk actions change users in place.
  const everyone = useMemo(() => {
    void version
    return allUsers()
  }, [version])

  const counts = useMemo(() => {
    const c: Record<UserBucket, number> = { active: 0, pending: 0, deactivated: 0 }
    everyone.forEach((u) => (c[getUserBucket(u)] += 1))
    return c
  }, [everyone])

  const filtersActive = search.trim() !== "" || profileFilter !== ALL_PROFILES || verificationFilter !== ALL_VERIFICATION
  const clearFilters = () => {
    setSearch("")
    setProfileFilter(ALL_PROFILES)
    setVerificationFilter(ALL_VERIFICATION)
  }

  const { state: previewState, setState: setPreviewState } = usePreviewState()

  const rows = useMemo(() => {
    if (previewState === "no-results") return []
    const query = search.trim().toLowerCase()
    return everyone.filter((u) => {
      if (getUserBucket(u) !== tab) return false
      if (profileFilter !== ALL_PROFILES) {
        const sides = sidesOf(u)
        if (profileFilter === "both" ? sides.length < 2 : !sides.includes(profileFilter as Side)) return false
      }
      if (verificationFilter !== ALL_VERIFICATION && u.verificationLabel !== verificationFilter) return false
      if (query && !`${u.name} ${u.email} ${u.phone} ${u.id}`.toLowerCase().includes(query)) return false
      return true
    })
  }, [everyone, tab, profileFilter, verificationFilter, search, previewState])

  const sorters = useMemo(
    () => ({
      name: (u: UserAccount) => u.name,
      location: (u: UserAccount) => u.location,
      joined: (u: UserAccount) => u.dateJoined,
    }),
    [],
  )
  const t = useTable(rows, {
    getId: (u) => u.id,
    sorters,
    initialSort: { key: "joined", dir: "desc" },
    pageSize: 25,
  })

  const selected = t.selection.rows
  const pendingSelected = selected.filter((u) => u.verification === "warning")
  const disableable = selected.filter((u) => !u.removed && u.accountLabel !== "Disabled")
  const apply = (list: UserAccount[], patch: Partial<UserAccount>) => {
    list.forEach((u) => Object.assign(u, patch))
    t.selection.clear()
    setVersion((v) => v + 1)
  }

  const menuFor = (user: UserAccount) => (
    <RowMenu
      items={[
        { label: "View profile", onSelect: () => navigate(`/users/${user.id}`) },
        ...(user.verification === "warning"
          ? [{ label: "Verify", onSelect: () => apply([user], { verification: "success", verificationLabel: "Verified" }) }]
          : []),
      ]}
    />
  )

  return (
    <div>
      <PageHeader
        title="Users"
        description="Everyone on Jobs Region. One account can find work, hire, or both."
      />

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : previewState === "empty" ? (
        <EmptyState icon={UsersIcon} title="No users yet" description="Once people sign up on Jobs Region, they'll show up here." />
      ) : (
        <>
          <div className="mb-3 flex flex-col items-stretch gap-6">
            <PillTabs options={TABS.map((x) => ({ ...x, count: counts[x.key] }))} value={tab} onChange={setTab} />
            <div className="flex w-full flex-wrap items-center gap-2">
              <div className="relative h-10 w-[26rem] max-w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-foreground" />
                <input
                  type="search"
                  aria-label="Search users"
                  placeholder="Search name, email, phone or ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-full border border-input bg-card pl-10 pr-4 text-body2 text-foreground outline-none placeholder:text-muted-foreground hover:border-foreground focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
                />
              </div>
              <SelectMenu aria-label="Profiles" value={profileFilter} onChange={setProfileFilter} options={PROFILE_OPTIONS} />
              <SelectMenu
                aria-label="Verification"
                value={verificationFilter}
                onChange={setVerificationFilter}
                options={VERIFICATION_OPTIONS}
               
              />
              <ViewToggle value={view} onChange={setView} />
            </div>
          </div>

          <p className="mb-2 text-body2 text-muted-foreground">
            <span className="font-semibold text-foreground">{t.total.toLocaleString()}</span> user{t.total === 1 ? "" : "s"}
            {filtersActive && (
              <button type="button" onClick={clearFilters} className="ml-3 font-semibold text-foreground underline underline-offset-2">
                Clear filters
              </button>
            )}
          </p>

          {t.total === 0 ? (
            <div className="border-t border-border py-16 text-center">
              <p className="heading-card">No matching users</p>
              <p className="mt-1 text-body2 text-muted-foreground">Try changing or removing some of your filters.</p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 gap-6 border-t border-border pt-6 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {t.pagedRows.map((user) => (
                <UserCard key={user.id} user={user} menu={menuFor(user)} />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <SelectHead all={t.selection.allOnPage} some={t.selection.someOnPage} onToggle={t.selection.togglePage} />
                  <SortHead label="Name" sortKey="name" sort={t.sort} onSort={t.toggleSort} />
                  <TableHead>Profiles</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Account</TableHead>
                  <SortHead label="Joined" sortKey="joined" sort={t.sort} onSort={t.toggleSort} />
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {t.pagedRows.map((user) => (
                  <TableRow
                    key={user.id}
                    onClick={() => navigate(`/users/${user.id}`)}
                    className={cn("cursor-pointer", user.removed && "opacity-60", t.selection.isSelected(user.id) && "bg-muted")}
                  >
                    <TableCell className="w-12">
                      <Checkbox checked={t.selection.isSelected(user.id)} onChange={() => t.selection.toggle(user.id)} label={`Select ${user.name}`} />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} className="size-10 text-caption" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <p title={user.name} className={cn("max-w-64 truncate text-body2 font-semibold text-foreground", user.removed && "line-through")}>
                              {user.name}
                            </p>
                            <VerifiedTick user={user} className="size-3.5" />
                          </div>
                          <p title={user.email} className="max-w-64 truncate text-caption text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ProfilePills sides={sidesOf(user)} />
                    </TableCell>
                    <TableCell>
                      <StatusDot status={user.verification} label={user.verificationLabel} />
                    </TableCell>
                    <TableCell>
                      <StatusDot status={user.account} label={user.accountLabel} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">{user.dateJoined}</TableCell>
                    <TableCell>{menuFor(user)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Pagination
            page={t.page}
            totalPages={t.totalPages}
            onPageChange={t.setPage}
            total={t.total}
            pageSize={t.pageSize}
            onPageSizeChange={t.setPageSize}
            noun="users"
          />

          <BulkBar count={t.selection.count} total={t.total} onSelectAll={t.selection.selectAll} onClear={t.selection.clear}>
            {pendingSelected.length > 0 && (
              <BulkAction onClick={() => apply(pendingSelected, { verification: "success", verificationLabel: "Verified" })}>
                Verify {pendingSelected.length}
              </BulkAction>
            )}
            {disableable.length > 0 && (
              <BulkAction tone="danger" onClick={() => setDisableOpen(true)}>
                Disable {disableable.length}
              </BulkAction>
            )}
            <BulkAction onClick={() => downloadCsv(selected)}>Export CSV</BulkAction>
          </BulkBar>

          <ConfirmationDialog
            open={disableOpen}
            onClose={() => setDisableOpen(false)}
            tone="destructive"
            title={`Disable ${disableable.length} account${disableable.length === 1 ? "" : "s"}?`}
            description="They will lose access until their account is enabled again. You can undo this from each profile."
            confirmLabel="Disable"
            onConfirm={() => apply(disableable, { account: "warning", accountLabel: "Disabled" })}
          />
        </>
      )}
    </div>
  )
}

export default UsersPage
