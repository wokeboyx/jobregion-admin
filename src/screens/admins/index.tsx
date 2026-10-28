import { useMemo, useState, type ReactNode } from "react"
import { CalendarDays, Clock, Mail, ShieldCheck } from "lucide-react"

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import type { Status } from "@/components/ui/status-pill"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTextButton } from "@/components/ui/dialog"
import { PageHeader } from "@/components/page-header"
import { PillTabs } from "@/components/pill-tabs"
import { FilterBar } from "@/components/filter-bar"
import { RowMenu, type RowMenuItem } from "@/components/row-menu"
import { FormDialog, FormField } from "@/components/form-dialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { Pagination } from "@/components/pagination"
import { BulkAction, BulkBar, Checkbox, SelectHead, SortHead } from "@/components/data-table"
import { EmptyState, ErrorState } from "@/components/page-state"
import { SelectMenu } from "@/components/ui/select-menu"
import { cn } from "@/lib/utils"
import { useTable, type Sorters } from "@/lib/use-table"
import { usePreviewState } from "@/lib/preview-state"
import { adminRoles, PERMISSION_MODULES, type AdminAccount, type AdminRole } from "@/lib/mock-data"
import { allAdmins } from "./generated"

const LEVELS = ["None", "View", "Edit", "Full"] as const

type TabKey = "admins" | "roles"

const DOT: Record<Status, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  neutral: "bg-muted-foreground",
}

function StatusDot({ status, label }: { status: Status; label: string }) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap text-foreground">
      <span className={cn("size-2 rounded-full", DOT[status])} />
      {label}
    </span>
  )
}

function rowMenuItems(admin: AdminAccount, onOpen: () => void): RowMenuItem[] {
  if (admin.removed) return [{ label: "View", onSelect: onOpen }]
  if (admin.statusLabel === "Invited") {
    return [
      { label: "View", onSelect: onOpen },
      { label: "Resend invite", onSelect: onOpen },
      { label: "Cancel invite", onSelect: onOpen, destructive: true },
    ]
  }
  const items: RowMenuItem[] = [
    { label: "View", onSelect: onOpen },
    { label: "Edit role", onSelect: onOpen },
    { label: admin.statusLabel === "Suspended" ? "Reactivate" : "Suspend", onSelect: onOpen },
  ]
  if (!admin.isSelf) items.push({ label: "Remove", onSelect: onOpen, destructive: true })
  return items
}

function InfoRow({ icon: Icon, children }: { icon: typeof Mail; children: ReactNode }) {
  return (
    <li className="flex items-center gap-4 text-body1 text-foreground">
      <Icon className="size-5 shrink-0" strokeWidth={1.5} />
      <span className="min-w-0 truncate">{children}</span>
    </li>
  )
}

function AdminDetailDialog({
  admin,
  onClose,
  onUpdate,
}: {
  admin: AdminAccount | null
  onClose: () => void
  onUpdate: (admin: AdminAccount) => void
}) {
  const [trackedId, setTrackedId] = useState<string | null>(null)
  const [role, setRole] = useState("")
  const [roleVariant, setRoleVariant] = useState<AdminAccount["roleVariant"]>("outline")
  const [status, setStatus] = useState<AdminAccount["status"]>("success")
  const [statusLabel, setStatusLabel] = useState("")
  const [removed, setRemoved] = useState(false)

  const [suspendOpen, setSuspendOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [roleDraft, setRoleDraft] = useState(admin?.role ?? "")

  if (admin && admin.id !== trackedId) {
    setTrackedId(admin.id)
    setRole(admin.role)
    setRoleVariant(admin.roleVariant)
    setStatus(admin.status)
    setStatusLabel(admin.statusLabel)
    setRemoved(admin.removed ?? false)
  }

  if (!admin) return null

  const isSuspended = statusLabel === "Suspended"

  return (
    <Dialog
      open
      onClose={onClose}
      title="Admin details"
      footer={
        <>
          <DialogTextButton onClick={onClose}>Close</DialogTextButton>
          {!removed && (
            <Button
              size="lg"
              onClick={() => {
                setRoleDraft(role)
                setRoleOpen(true)
              }}
            >
              Change role
            </Button>
          )}
        </>
      }
    >
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Avatar name={admin.name} className="size-16 text-body1" />
          <div className="min-w-0">
            <p className="heading-section truncate">
              {admin.name}
              {admin.isSelf && <span className="ml-2 text-body1 font-normal text-muted-foreground">(you)</span>}
            </p>
            <div className="mt-1 text-body1">
              <StatusDot status={status} label={statusLabel} />
            </div>
          </div>
        </div>

        <ul className="mt-6 space-y-4 border-t border-border pt-6">
          <InfoRow icon={ShieldCheck}>{role}</InfoRow>
          <InfoRow icon={Mail}>{admin.email}</InfoRow>
          <InfoRow icon={CalendarDays}>Added {admin.dateAdded}</InfoRow>
          <InfoRow icon={Clock}>Last active {admin.lastActive}</InfoRow>
        </ul>

        {!removed && !admin.isSelf && (
          <div className="mt-6 divide-y divide-border border-t border-border">
            <div className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-body1 font-semibold text-foreground">{isSuspended ? "Reactivate access" : "Suspend access"}</p>
                <p className="text-body2 text-muted-foreground">
                  {isSuspended ? "Let them sign in to the admin again." : "Block sign-in until you reactivate them."}
                </p>
              </div>
              <Button variant="outline" onClick={() => setSuspendOpen(true)}>
                {isSuspended ? "Reactivate" : "Suspend"}
              </Button>
            </div>
            <div className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-body1 font-semibold text-foreground">Remove admin</p>
                <p className="text-body2 text-muted-foreground">Permanently take away their access.</p>
              </div>
              <Button variant="destructive" onClick={() => setRemoveOpen(true)}>
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        tone="neutral"
        title={isSuspended ? "Reactivate this admin?" : "Suspend this admin?"}
        description={
          isSuspended
            ? "They will regain access to the admin panel immediately."
            : "They will lose access to the admin panel until reactivated. This action is reversible."
        }
        confirmLabel={isSuspended ? "Reactivate" : "Suspend"}
        onConfirm={() => {
          const nextStatus = isSuspended ? "success" : "warning"
          const nextStatusLabel = isSuspended ? "Active" : "Suspended"
          setStatus(nextStatus)
          setStatusLabel(nextStatusLabel)
          onUpdate({ ...admin, role, roleVariant, status: nextStatus, statusLabel: nextStatusLabel, removed })
        }}
      />

      <ConfirmationDialog
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        tone="destructive"
        title="Remove this admin?"
        description="This permanently removes their access and cannot be undone."
        confirmLabel="Remove admin"
        onConfirm={() => {
          setRemoved(true)
          onUpdate({ ...admin, role, roleVariant, status, statusLabel, removed: true })
          onClose()
        }}
      />

      <FormDialog
        open={roleOpen}
        onClose={() => setRoleOpen(false)}
        title="Change role"
        description={`Pick ${admin.name}'s role. Each role has a fixed set of permissions, which you can see under Roles.`}
        submitLabel="Save role"
        onSubmit={() => {
          const nextRole = adminRoles.find((r) => r.name === roleDraft)
          if (!nextRole) return
          setRole(nextRole.name)
          setRoleVariant(nextRole.variant)
          onUpdate({ ...admin, role: nextRole.name, roleVariant: nextRole.variant, status, statusLabel, removed })
        }}
      >
        <FormField label="Role">
          <SelectMenu
            variant="field"
            aria-label="Role"
            value={roleDraft}
            onChange={setRoleDraft}
            options={adminRoles.map((r) => ({ value: r.name, label: r.name, hint: r.description }))}
          />
        </FormField>
      </FormDialog>
    </Dialog>
  )
}

const ADMIN_STATUS_OPTIONS = ["Active", "Invited", "Suspended", "Removed"]
const ALL_ROLES = "All roles"
const ALL_STATUSES = "All statuses"

const ADMIN_SORTERS: Sorters<AdminAccount> = {
  name: (a) => a.name,
  role: (a) => a.role,
  added: (a) => a.dateAdded,
  // "Never" sorts below every real date.
  lastActive: (a) => (a.lastActive === "Never" ? "" : a.lastActive),
}

function AdminsTab({
  admins,
  setAdmins,
  onInvite,
}: {
  admins: AdminAccount[]
  setAdmins: (update: (admins: AdminAccount[]) => AdminAccount[]) => void
  onInvite: () => void
}) {
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState(ALL_ROLES)
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)

  const selectedAdmin = admins.find((a) => a.id === selectedAdminId) ?? null

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return admins.filter((a) => {
      if (roleFilter !== ALL_ROLES && a.role !== roleFilter) return false
      if (statusFilter !== ALL_STATUSES && a.statusLabel !== statusFilter) return false
      if (query) {
        const haystack = `${a.name} ${a.email}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [admins, search, roleFilter, statusFilter])

  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const previewRows = useMemo(() => (previewState === "no-results" ? [] : rows), [previewState, rows])
  const t = useTable(previewRows, {
    getId: (a) => a.id,
    sorters: ADMIN_SORTERS,
    initialSort: { key: "name", dir: "asc" },
    pageSize: 25,
  })

  const filtersActive = search !== "" || roleFilter !== ALL_ROLES || statusFilter !== ALL_STATUSES
  const clearFilters = () => {
    setSearch("")
    setRoleFilter(ALL_ROLES)
    setStatusFilter(ALL_STATUSES)
  }

  // You can't suspend or remove yourself, and removed admins are already gone.
  const suspendable = t.selection.rows.filter((a) => a.statusLabel === "Active" && !a.isSelf && !a.removed)
  const removable = t.selection.rows.filter((a) => !a.isSelf && !a.removed)

  const updateMany = (targets: AdminAccount[], change: Partial<AdminAccount>) => {
    const ids = new Set(targets.map((a) => a.id))
    setAdmins((as) => as.map((a) => (ids.has(a.id) ? { ...a, ...change } : a)))
    t.selection.clear()
  }

  if (previewState === "error") {
    return <ErrorState onRetry={() => setPreviewState("default")} />
  }

  if (previewState === "empty") {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No admins yet"
        description="Invite your first teammate to start running Jobs Region together."
        action={<Button onClick={onInvite}>Invite admin</Button>}
      />
    )
  }

  return (
    <div>
      <FilterBar
        searchPlaceholder="Search by name or email"
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          { label: ALL_ROLES, options: adminRoles.map((r) => r.name), value: roleFilter, onChange: setRoleFilter },
          { label: ALL_STATUSES, options: ADMIN_STATUS_OPTIONS, value: statusFilter, onChange: setStatusFilter },
        ]}
        className="mb-4"
      />

      <p className="mb-2 text-body2 text-muted-foreground">
        {t.total.toLocaleString()} admin{t.total === 1 ? "" : "s"}
        {filtersActive && (
          <button type="button" onClick={clearFilters} className="ml-3 font-semibold text-foreground underline underline-offset-2">
            Clear filters
          </button>
        )}
      </p>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <SelectHead all={t.selection.allOnPage} some={t.selection.someOnPage} onToggle={t.selection.togglePage} />
            <SortHead label="Admin" sortKey="name" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Role" sortKey="role" sort={t.sort} onSort={t.toggleSort} />
            <TableHead>Status</TableHead>
            <SortHead label="Date added" sortKey="added" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Last active" sortKey="lastActive" sort={t.sort} onSort={t.toggleSort} />
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {t.pagedRows.map((admin) => (
            <TableRow
              key={admin.id}
              onClick={() => setSelectedAdminId(admin.id)}
              className={cn("cursor-pointer", admin.removed && "opacity-60")}
            >
              <TableCell className="w-12">
                <Checkbox checked={t.selection.isSelected(admin.id)} onChange={() => t.selection.toggle(admin.id)} label={`Select ${admin.name}`} />
              </TableCell>
              <TableCell className="py-2.5">
                <div className="flex items-center gap-3">
                  <Avatar name={admin.name} className="size-10 text-caption" />
                  <div className="min-w-0">
                    <p className={cn("truncate text-body2 font-semibold text-foreground", admin.removed && "line-through")}>
                      {admin.name}
                      {admin.isSelf && <span className="ml-1.5 font-normal text-muted-foreground">(you)</span>}
                    </p>
                    <p title={admin.email} className="max-w-72 truncate text-caption text-muted-foreground">
                      {admin.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-body2 text-foreground">{admin.role}</TableCell>
              <TableCell>
                <StatusDot status={admin.status} label={admin.statusLabel} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-body2 tabular-nums">{admin.dateAdded}</TableCell>
              <TableCell className="whitespace-nowrap text-body2 tabular-nums">
                {admin.lastActive === "Never" ? <span className="text-muted-foreground">Never</span> : admin.lastActive}
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <RowMenu items={rowMenuItems(admin, () => setSelectedAdminId(admin.id))} />
              </TableCell>
            </TableRow>
          ))}

          {t.total === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="py-16 text-center text-body1">
                No admins match these filters.
                {filtersActive && (
                  <button type="button" onClick={clearFilters} className="ml-2 font-semibold text-foreground underline underline-offset-2">
                    Clear filters
                  </button>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="mt-6">
        <Pagination
          page={t.page}
          totalPages={t.totalPages}
          onPageChange={t.setPage}
          total={t.total}
          pageSize={t.pageSize}
          onPageSizeChange={t.setPageSize}
          noun="admins"
        />
      </div>

      <BulkBar count={t.selection.count} total={t.total} onSelectAll={t.selection.selectAll} onClear={t.selection.clear}>
        <BulkAction onClick={() => setSuspendOpen(true)}>Suspend</BulkAction>
        <BulkAction tone="danger" onClick={() => setRemoveOpen(true)}>
          Remove
        </BulkAction>
      </BulkBar>

      <ConfirmationDialog
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        tone="neutral"
        title={suspendable.length === 0 ? "Nobody to suspend" : `Suspend ${suspendable.length} admin${suspendable.length === 1 ? "" : "s"}?`}
        description={
          suspendable.length === 0
            ? "Only active admins can be suspended, and you can't suspend yourself."
            : "They lose access to the admin panel until someone reactivates them. Invited, suspended and removed admins, and you, are skipped."
        }
        confirmLabel={suspendable.length === 0 ? "OK" : "Suspend"}
        onConfirm={() => {
          if (suspendable.length > 0) updateMany(suspendable, { status: "warning", statusLabel: "Suspended" })
        }}
      />

      <ConfirmationDialog
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        tone="destructive"
        title={removable.length === 0 ? "Nobody to remove" : `Remove ${removable.length} admin${removable.length === 1 ? "" : "s"}?`}
        description={
          removable.length === 0
            ? "You can't remove yourself, and removed admins are already gone."
            : "This permanently takes away their access and cannot be undone. You and already removed admins are skipped."
        }
        confirmLabel={removable.length === 0 ? "OK" : "Remove"}
        onConfirm={() => {
          if (removable.length > 0) updateMany(removable, { status: "destructive", statusLabel: "Removed", removed: true })
        }}
      />

      <AdminDetailDialog
        admin={selectedAdmin}
        onClose={() => setSelectedAdminId(null)}
        onUpdate={(updated) => setAdmins((as) => as.map((a) => (a.id === updated.id ? updated : a)))}
      />
    </div>
  )
}

function RolePermissionsDialog({
  role,
  onClose,
  onSave,
}: {
  role: AdminRole | null
  onClose: () => void
  onSave: (role: AdminRole) => void
}) {
  const [permissions, setPermissions] = useState<AdminRole["permissions"]>({})
  const [trackedRole, setTrackedRole] = useState<AdminRole | null>(null)

  if (role !== trackedRole) {
    setTrackedRole(role)
    setPermissions(role?.permissions ?? {})
  }

  if (!role) return null

  return (
    <Dialog
      open
      onClose={onClose}
      title={role.name}
      width="w-[640px]"
      footer={
        <>
          <DialogTextButton onClick={onClose}>Cancel</DialogTextButton>
          <Button size="lg" onClick={() => onSave({ ...role, permissions })}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="p-6">
        <p className="text-body1 text-muted-foreground">{role.description} Choose what this role can do in each area.</p>
        <ul className="mt-4 divide-y divide-border">
          {PERMISSION_MODULES.map((mod) => (
            <li key={mod} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <span className="text-body1 font-semibold text-foreground">{mod}</span>
              <div role="radiogroup" aria-label={`${mod} access`} className="flex gap-1.5">
                {LEVELS.map((l) => {
                  const on = (permissions[mod] ?? "None") === l
                  return (
                    <button
                      key={l}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setPermissions((p) => ({ ...p, [mod]: l }))}
                      className={cn(
                        "h-8 rounded-full border px-3.5 text-body2 font-medium transition-colors",
                        on ? "border-foreground bg-foreground text-white" : "border-input text-foreground hover:border-foreground",
                      )}
                    >
                      {l}
                    </button>
                  )
                })}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Dialog>
  )
}

function RolesTab({ roles, setRoles, admins }: { roles: AdminRole[]; setRoles: (roles: AdminRole[]) => void; admins: AdminAccount[] }) {
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null)
  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const isEmpty = previewState === "empty" || previewState === "no-results" || roles.length === 0

  if (previewState === "error") {
    return <ErrorState onRetry={() => setPreviewState("default")} />
  }

  if (isEmpty) {
    return <EmptyState icon={ShieldCheck} title="No roles yet" description="Default roles will show up here." />
  }

  return (
    <div>
      <p className="mb-6 text-body1 text-muted-foreground">
        Every admin has one role. A role decides what they can see and change in each area.
      </p>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {roles.map((role) => {
          const members = admins.filter((a) => a.role === role.name && !a.removed)
          return (
            <section key={role.name} className="flex flex-col rounded-xl border border-border p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="heading-card">{role.name}</h2>
                  <p className="mt-1 text-body1 text-muted-foreground">{role.description}</p>
                </div>
                <div className="flex shrink-0 -space-x-2">
                  {members.slice(0, 3).map((m) => (
                    <Avatar key={m.id} name={m.name} className="size-8 ring-2 ring-card" />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-body2 text-foreground">
                {members.length} admin{members.length === 1 ? "" : "s"}
              </p>

              <ul className="mt-4 flex-1 divide-y divide-border border-t border-border">
                {PERMISSION_MODULES.map((mod) => {
                  const level = role.permissions[mod] ?? "None"
                  return (
                    <li key={mod} className="flex items-center justify-between gap-4 py-2.5 text-body2">
                      <span className="text-foreground">{mod}</span>
                      <span className={cn(level === "None" ? "text-muted-foreground" : "font-semibold text-foreground")}>
                        {level === "None" ? "No access" : level}
                      </span>
                    </li>
                  )
                })}
              </ul>

              <Button variant="outline" className="mt-5 self-start" onClick={() => setSelectedRole(role)}>
                Edit permissions
              </Button>
            </section>
          )
        })}
      </div>

      <RolePermissionsDialog
        role={selectedRole}
        onClose={() => setSelectedRole(null)}
        onSave={(updated) => {
          setRoles(roles.map((r) => (r.name === updated.name ? updated : r)))
          setSelectedRole(null)
        }}
      />
    </div>
  )
}

function AdminsPage() {
  const [tab, setTab] = useState<TabKey>("admins")
  const [admins, setAdmins] = useState<AdminAccount[]>(allAdmins)
  const [roles, setRoles] = useState<AdminRole[]>(adminRoles)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteRole, setInviteRole] = useState("")

  const tabs = [
    { key: "admins" as const, label: "Admins", count: admins.length },
    { key: "roles" as const, label: "Roles", count: roles.length },
  ]

  return (
    <div>
      <PageHeader
        title="Admins and roles"
        description="Who can use the admin, and what each person is allowed to do."
        actions={<Button onClick={() => setInviteOpen(true)}>Invite admin</Button>}
      />

      <PillTabs options={tabs} value={tab} onChange={setTab} className="mb-8" />

      {tab === "admins" && <AdminsTab admins={admins} setAdmins={setAdmins} onInvite={() => setInviteOpen(true)} />}
      {tab === "roles" && <RolesTab roles={roles} setRoles={setRoles} admins={admins} />}

      <FormDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite admin"
        description="This is a mock, so no email is sent, but they'll show up in the list as Invited."
        submitLabel="Send invite"
        onSubmit={() => {}}
      >
        <FormField label="Email">
          <input
            type="email"
            placeholder="name@jobregion.example.com"
            className="h-12 w-full rounded-md border border-input bg-card px-4 text-body1 text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
          />
        </FormField>
        <FormField label="Role">
          <SelectMenu
            variant="field"
            aria-label="Role"
            placeholder="Select a role"
            value={inviteRole}
            onChange={setInviteRole}
            options={roles.map((r) => ({ value: r.name, label: r.name, hint: r.description }))}
          />
        </FormField>
        <FormField label="Personal note (optional)">
          <textarea
            placeholder="Add a short welcome note"
            className="h-28 w-full resize-none rounded-md border border-input bg-card p-4 text-body1 text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
          />
        </FormField>
      </FormDialog>
    </div>
  )
}

export default AdminsPage
