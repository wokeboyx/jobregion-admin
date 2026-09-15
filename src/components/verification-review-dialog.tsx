import { useState } from "react"
import { CheckCircle2 } from "lucide-react"

import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { OutlineBadge } from "@/components/ui/status-pill"
import { DocumentViewerDialog, DOC_ICON } from "@/components/document-preview"
import type { UserAccount, UserDocument } from "@/lib/mock-data"

function DocPanel({ title, doc, onZoom }: { title: string; doc: UserDocument; onZoom: (doc: UserDocument) => void }) {
  const Icon = DOC_ICON[doc.type]
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</p>
      <button
        type="button"
        onClick={() => onZoom(doc)}
        className={`flex h-56 w-full items-center justify-center rounded-lg bg-gradient-to-br ${doc.cover} ring-1 ring-inset ring-black/5 transition-transform hover:scale-[1.01]`}
      >
        <Icon className="size-10 text-foreground/25" />
      </button>
    </div>
  )
}

function VerificationReviewDialog({
  open,
  onClose,
  user,
  onApprove,
  onReject,
}: {
  open: boolean
  onClose: () => void
  user: UserAccount
  onApprove: () => void
  onReject: () => void
}) {
  const [zoomDoc, setZoomDoc] = useState<UserDocument | null>(null)

  const idDoc = user.documents.find((d) => d.type === "id")
  const selfieDoc = user.documents.find((d) => d.type === "selfie")
  const businessDoc = user.documents.find((d) => d.type === "business")

  return (
    <Dialog open={open} onClose={onClose} width="w-[720px]">
      <div className="max-h-[85vh] overflow-y-auto p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} className="size-11 shrink-0 text-sm" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold text-foreground">{user.name}</p>
                {user.roles.map((r) => (
                  <OutlineBadge key={r} label={r} />
                ))}
              </div>
              <div className="mt-1 space-y-0.5">
                {user.verificationHistory.map((step) => (
                  <p key={step.label} className="flex items-center gap-1.5 text-xs text-success">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    {step.label} — {step.date}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="bg-destructive px-5 text-white hover:bg-destructive/90"
              onClick={onReject}
            >
              Reject
            </Button>
            <Button size="sm" className="px-5" onClick={onApprove}>
              Approve
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {idDoc && <DocPanel title={`ID Document — ${idDoc.label}`} doc={idDoc} onZoom={setZoomDoc} />}
          {selfieDoc && <DocPanel title="Selfie" doc={selfieDoc} onZoom={setZoomDoc} />}
          {businessDoc && (
            <div className="sm:col-span-2">
              <DocPanel title={`Business Document — ${businessDoc.label}`} doc={businessDoc} onZoom={setZoomDoc} />
            </div>
          )}
        </div>
      </div>

      <DocumentViewerDialog doc={zoomDoc} onClose={() => setZoomDoc(null)} />
    </Dialog>
  )
}

export { VerificationReviewDialog }
