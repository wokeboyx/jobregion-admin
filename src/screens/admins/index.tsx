import { useMemo, useState } from "react"
import { ChevronDown, ShieldCheck } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { StatusPill, OutlineBadge } from "@/components/ui/status-pill"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { FilterBar } from "@/components/filter-bar"
import { FormDialog, FormField } from "@/components/form-dialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { Pagination } from "@/components/pagination"
import { EmptyState, ErrorState } from "@/components/page-state"
import { cn } from "@/lib/utils"
import { usePagination } from "@/lib/use-pagination"
import { usePreviewState } from "@/lib/preview-state"
import { admins as initialAdmins, adminRoles, PERMISSION_MODULES, type AdminAccount, type AdminRole } from "@/lib/mock-data"

const LEVELS = ["None", "View", "Edit", "Full"] as const

const TABS = [
  { key: "admins", label: "Admins" },
  { key: "roles", label: "Roles & Permissions" },
] as const

type TabKey = (typeof TABS)[number]["key"]

function RoleBadge({ role, variant }: { role: string; variant: AdminAccount["roleVariant"] }) {
  if (variant === "outline") return <OutlineBadge label={role} />
  return <StatusPill status={variant} label={role} />
}

function RowActions({ admin, onOpen }: { admin: AdminAccount; onOpen: () => void }) {
  if (admin.removed) {
    return (
      <button type="button" onClick={onOpen} className="text-xs font-semibold text-foreground">
        View
      </button>
    )
  }
  if (admin.statusLabel === "Invited") {
    return (
      <div className="flex justify-end gap-4 text-xs font-semibold">
        <button type="button" onClick={onOpen}>View</button>
        <button type="button" onClick={onOpen}>Resend invite</button>
        <button type="button" onClick={onOpen} className="text-destructive">Cancel invite</button>
      </div>
    )
  }
  return (
    <div className="flex justify-end gap-4 text-xs font-semibold">
      <button type="button" onClick={onOpen}>View</button>
      <button type="button" onClick={onOpen}>Edit role</button>
      <button type="button" onClick={onOpen}>{admin.statusLabel === "Suspended" ? "Reactivate" : "Suspend"}</button>
      {!admin.isSelf && (
        <button type="button" onClick={onOpen} className="text-destructive">
          Remove
        </button>
      )}
    </div>
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
    <Dialog open onClose={onClose} width="w-[480px]">
      <div className="p-5">
        <div className="mb-5 flex items-center gap-3">
          <Avatar name={admin.name} className="size-10 text-sm" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-foreground">{admin.name}</p>
              {roleVariant === "outline" ? <OutlineBadge label={role} /> : <StatusPill status={roleVariant} label={role} />}
            </div>
            <StatusPill status={status} label={statusLabel} />
          </div>
        </div>

        <div className="mb-5 space-y-1 text-xs text-muted-foreground">
          <p>{admin.email}</p>
          <p>Added {admin.dateAdded} · Last active {admin.lastActive}</p>
        </div>

        {!removed && (
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button variant="outline" size="sm" onClick={() => setRoleOpen(true)}>
              Change role
            </Button>
            {!admin.isSelf && (
              <>
                <Button variant="outline" size="sm" onClick={() => setSuspendOpen(true)}>
                  {isSuspended ? "Reactivate" : "Suspend"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-destructive text-white hover:bg-destructive/90"
                  onClick={() => setRemoveOpen(true)}
                >
                  Remove admin
                </Button>
              </>
            )}
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
        description={`Update ${admin.name}'s role. Permissions are fixed per role — see Roles & Permissions.`}
        submitLabel="Save role"
        onSubmit={() => {
          const select = document.getElementById("role-select") as HTMLSelectElement | null
          const nextRole = adminRoles.find((r) => r.name === select?.value)
          if (!nextRole) return
          setRole(nextRole.name)
          setRoleVariant(nextRole.variant)
          onUpdate({ ...admin, role: nextRole.name, roleVariant: nextRole.variant, status, statusLabel, removed })
        }}
      >
        <FormField label="Role">
          <div className="relative">
            <select
              id="role-select"
              defaultValue={role}
              className="h-9 w-full appearance-none rounded-md border border-border bg-card pl-2.5 pr-8 text-sm text-foreground outline-none focus-visible:border-brand-cta"
            >
              {adminRoles.map((r) => (
                <option key={r.name}>{r.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </FormField>
      </FormDialog>
    </Dialog>
  )
}

const ADMIN_STATUS_OPTIONS = ["Active", "Invited", "Suspended", "Removed"]

function AdminsTab() {
  const [admins, setAdmins] = useState<AdminAccount[]>(initialAdmins)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("All roles")
  const [statusFilter, setStatusFilter] = useState("All statuses")

  const selectedAdmin = admins.find((a) => a.id === selectedAdminId) ?? null

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return admins.filter((a) => {
      if (roleFilter !== "All roles" && a.role !== roleFilter) return false
      if (statusFilter !== "All statuses" && a.statusLabel !== statusFilter) return false
      if (query) {
        const haystack = `${a.name} ${a.email}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [admins, search, roleFilter, statusFilter])

  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const previewRows = useMemo(() => (previewState === "no-results" ? [] : rows), [previewState, rows])
  const { page, setPage, totalPages, pagedRows } = usePagination(previewRows)

  if (previewState === "error") {
    return <ErrorState onRetry={() => setPreviewState("default")} />
  }

  if (previewState === "empty") {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No admins yet"
        description="Invite your first teammate to start managing JobRegion together."
        action={<Button onClick={() => setInviteOpen(true)}>Invite admin</Button>}
      />
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <FilterBar
          searchPlaceholder="Search by name or email…"
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            { label: "All roles", options: adminRoles.map((r) => r.name), value: roleFilter, onChange: setRoleFilter },
            { label: "All statuses", options: ADMIN_STATUS_OPTIONS, value: statusFilter, onChange: setStatusFilter },
          ]}
        />
        <Button onClick={() => setInviteOpen(true)}>Invite admin</Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date added</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.map((admin) => (
              <TableRow
                key={admin.id}
                onClick={() => setSelectedAdminId(admin.id)}
                className={cn("cursor-pointer", admin.removed && "opacity-60")}
              >
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={admin.name} />
                    <div>
                      <p className={cn("font-medium text-foreground", admin.removed && "line-through")}>
                        {admin.name}
                      </p>
                      {admin.isSelf && <p className="text-[11px] text-muted-foreground">You</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                <TableCell>
                  <RoleBadge role={admin.role} variant={admin.roleVariant} />
                </TableCell>
                <TableCell>
                  <StatusPill status={admin.status} label={admin.statusLabel} />
                </TableCell>
                <TableCell className="text-muted-foreground">{admin.dateAdded}</TableCell>
                <TableCell className="text-muted-foreground">{admin.lastActive}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RowActions admin={admin} onOpen={() => setSelectedAdminId(admin.id)} />
                </TableCell>
              </TableRow>
            ))}

            {previewRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No admins match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <FormDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite admin"
        description="Mock-only — no real email is sent, but they'll appear in the list as Invited."
        submitLabel="Send invite"
        onSubmit={() => {}}
      >
        <FormField label="Email">
          <input
            type="email"
            placeholder="name@jobregion.example.com"
            className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-brand-cta"
          />
        </FormField>
        <FormField label="Role">
          <div className="relative">
            <select className="h-9 w-full appearance-none rounded-md border border-border bg-card pl-2.5 pr-8 text-sm text-foreground outline-none focus-visible:border-brand-cta">
              <option value="">Select a role</option>
              {adminRoles.map((r) => (
                <option key={r.name}>{r.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </FormField>
        <FormField label="Personal note (optional)">
          <textarea
            placeholder="Add a short welcome note (optional)"
            className="h-[72px] w-full resize-none rounded-md border border-border bg-card p-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-brand-cta"
          />
        </FormField>
      </FormDialog>

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
    <Dialog open onClose={onClose} width="w-[560px]">
      <div className="p-5">
        <p className="text-base font-semibold text-foreground">{role.name}</p>
        <p className="mb-4 text-sm text-muted-foreground">{role.description}</p>

        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-[1fr_repeat(4,64px)] border-b border-border bg-muted">
            <div className="px-2.5 py-2 text-[11px] font-semibold text-muted-foreground">MODULE</div>
            {LEVELS.map((l) => (
              <div key={l} className="px-1 py-2 text-center text-[11px] font-semibold text-muted-foreground">
                {l.toUpperCase()}
              </div>
            ))}
          </div>
          {PERMISSION_MODULES.map((mod, i) => (
            <div
              key={mod}
              className={cn(
                "grid grid-cols-[1fr_repeat(4,64px)]",
                i !== PERMISSION_MODULES.length - 1 && "border-b border-border",
              )}
            >
              <div className="px-2.5 py-2 text-sm text-foreground">{mod}</div>
              {LEVELS.map((l) => (
                <div key={l} className="flex items-center justify-center py-2">
                  <input
                    type="checkbox"
                    checked={permissions[mod] === l}
                    onChange={() => setPermissions((p) => ({ ...p, [mod]: l }))}
                    className="size-4 accent-foreground"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 bg-muted p-4">
        <Button variant="outline" size="sm" className="px-5" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" className="px-5" onClick={() => onSave({ ...role, permissions })}>
          Save changes
        </Button>
      </div>
    </Dialog>
  )
}

function RolesTab() {
  const [roles, setRoles] = useState<AdminRole[]>(adminRoles)
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
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        These are the default roles available on JobRegion Admin. Click a role to view and edit its permissions.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {roles.map((role) => (
          <button
            key={role.name}
            type="button"
            onClick={() => setSelectedRole(role)}
            className="rounded-md border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
          >
            <p className="text-base font-semibold text-foreground">{role.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{role.description}</p>
          </button>
        ))}
      </div>

      <RolePermissionsDialog
        role={selectedRole}
        onClose={() => setSelectedRole(null)}
        onSave={(updated) => {
          setRoles((rs) => rs.map((r) => (r.name === updated.name ? updated : r)))
          setSelectedRole(null)
        }}
      />
    </div>
  )
}

function AdminsPage() {
  const [tab, setTab] = useState<TabKey>("admins")

  return (
    <div>
      <div className="mb-4 flex h-9 items-center gap-1 border-b border-border px-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "relative px-1.5 py-1 text-sm",
              tab === t.key ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {t.label}
            {tab === t.key && <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-foreground" />}
          </button>
        ))}
      </div>

      {tab === "admins" && <AdminsTab />}
      {tab === "roles" && <RolesTab />}
    </div>
  )
}

export default AdminsPage
