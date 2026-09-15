import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Users as UsersIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { StatusPill, OutlineBadge } from "@/components/ui/status-pill"
import { Avatar } from "@/components/ui/avatar"
import { FilterBar } from "@/components/filter-bar"
import { Pagination } from "@/components/pagination"
import { RowMenu } from "@/components/row-menu"
import { EmptyState, ErrorState } from "@/components/page-state"
import { cn } from "@/lib/utils"
import { usePagination } from "@/lib/use-pagination"
import { usePreviewState } from "@/lib/preview-state"
import { users, getUserBucket, type UserBucket } from "@/lib/mock-data"

const TABS: { key: UserBucket; label: string }[] = [
  { key: "active", label: "Active Users" },
  { key: "pending", label: "Pending Verification" },
  { key: "deactivated", label: "Deactivated" },
]

const ROLE_OPTIONS = ["Worker", "Employer"]
const VERIFICATION_OPTIONS = ["Verified", "Pending", "Rejected"]

function UsersPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<UserBucket>("active")
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("All roles")
  const [verificationFilter, setVerificationFilter] = useState("All verification states")

  const counts = useMemo(() => {
    return {
      active: users.filter((u) => getUserBucket(u) === "active").length,
      pending: users.filter((u) => getUserBucket(u) === "pending").length,
      deactivated: users.filter((u) => getUserBucket(u) === "deactivated").length,
    }
  }, [])

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return users.filter((u) => {
      if (getUserBucket(u) !== tab) return false
      if (roleFilter !== "All roles" && !u.roles.includes(roleFilter as "Worker" | "Employer")) return false
      if (verificationFilter !== "All verification states" && u.verificationLabel !== verificationFilter) return false
      if (query) {
        const haystack = `${u.name} ${u.email} ${u.phone}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [tab, roleFilter, verificationFilter, search])

  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const previewRows = useMemo(() => (previewState === "no-results" ? [] : rows), [previewState, rows])
  const { page, setPage, totalPages, pagedRows } = usePagination(previewRows)

  return (
    <div>
      <div className="mb-4 flex h-9 items-center gap-1 border-b border-border px-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "relative flex items-center gap-1.5 px-1.5 py-1 text-sm",
              tab === t.key ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {t.label}
            <span className="text-xs text-muted-foreground">{counts[t.key]}</span>
            {tab === t.key && <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-foreground" />}
          </button>
        ))}
      </div>

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : previewState === "empty" ? (
        <EmptyState
          icon={UsersIcon}
          title="No users yet"
          description="Once people sign up on JobRegion, they'll show up here."
        />
      ) : (
        <>
          <FilterBar
            searchPlaceholder="Search by name, email, or phone…"
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              { label: "All roles", options: ROLE_OPTIONS, value: roleFilter, onChange: setRoleFilter },
              {
                label: "All verification states",
                options: VERIFICATION_OPTIONS,
                value: verificationFilter,
                onChange: setVerificationFilter,
              },
            ]}
            className="mb-4"
          />

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Date joined</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.map((user) => (
                  <TableRow
                    key={user.id}
                    onClick={() => navigate(`/users/${user.id}`)}
                    className={cn("cursor-pointer", user.removed && "opacity-60")}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={user.name} />
                        <span className={cn("font-medium text-foreground", user.removed && "line-through")}>
                          {user.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        {user.roles.map((r) => (
                          <OutlineBadge key={r} label={r} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusPill status={user.verification} label={user.verificationLabel} />
                    </TableCell>
                    <TableCell>
                      <StatusPill status={user.account} label={user.accountLabel} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.dateJoined}</TableCell>
                    <TableCell className="text-muted-foreground">{user.activity}</TableCell>
                    <TableCell>
                      <RowMenu
                        items={[{ label: "View profile", onSelect: () => navigate(`/users/${user.id}`) }]}
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {previewRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      No users match these filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <div className="mt-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  )
}

export default UsersPage
