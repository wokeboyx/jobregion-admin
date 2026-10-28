import { useState } from "react"
import { BadgeCheck, Check } from "lucide-react"

import { Dialog, DialogTextButton } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { DocumentSurface, DocumentTypeLabel, DocumentViewerDialog } from "@/components/document-preview"
import { photoFor } from "@/lib/photos"
import type { UserAccount, UserDocument } from "@/lib/mock-data"

function DocPanel({
  doc,
  photo,
  wide,
  onZoom,
}: {
  doc: UserDocument
  photo?: string
  wide?: boolean
  onZoom: (doc: UserDocument) => void
}) {
  return (
    <button type="button" onClick={() => onZoom(doc)} className="group block w-full text-left">
      <DocumentTypeLabel doc={doc} className="mb-2" />
      <div className="overflow-hidden rounded-xl border border-border transition-shadow group-hover:shadow-card">
        <DocumentSurface doc={doc} photo={photo} large className={wide ? "aspect-[5/2] rounded-none" : "aspect-[4/3] rounded-none"} />
      </div>
      <p className="mt-2 text-body1 font-semibold text-foreground group-hover:underline">{doc.label}</p>
      <p className="text-sm text-muted-foreground">Uploaded {doc.uploadedDate}</p>
    </button>
  )
}

/** Airbnb-style ID check: who the person is, what they've confirmed, then their ID and selfie side by side. */
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

  const photo = photoFor(user.name)
  const idDoc = user.documents.find((d) => d.type === "id")
  const selfieDoc = user.documents.find((d) => d.type === "selfie")
  const businessDoc = user.documents.find((d) => d.type === "business")

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Review verification"
      width="w-[760px]"
      footer={
        <>
          <DialogTextButton onClick={onClose}>Cancel</DialogTextButton>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" onClick={onReject}>
              Reject
            </Button>
            <Button variant="brand" size="lg" onClick={onApprove}>
              Approve
            </Button>
          </div>
        </>
      }
    >
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} className="size-16 text-lg" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="heading-card">{user.name}</p>
              {user.verification === "success" && <BadgeCheck className="size-4 fill-foreground text-white" />}
            </div>
            <p className="text-sm text-muted-foreground">
              {user.roles.join(" & ")} · {user.location} · Joined {user.dateJoined}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <p className="heading-card">What {user.name.split(" ")[0]} has confirmed</p>
          <ul className="mt-3 space-y-2">
            {user.verificationHistory.map((step) => (
              <li key={step.label} className="flex items-center gap-3 text-body1 text-foreground">
                <Check className="size-4 shrink-0" strokeWidth={2.5} />
                <span className="flex-1">{step.label}</span>
                <span className="text-sm text-muted-foreground">{step.date}</span>
              </li>
            ))}
          </ul>
        </div>

        {(idDoc || selfieDoc || businessDoc) && (
          <div className="mt-6 grid grid-cols-1 gap-6 border-t border-border pt-6 sm:grid-cols-2">
            {idDoc && <DocPanel doc={idDoc} onZoom={setZoomDoc} />}
            {selfieDoc && <DocPanel doc={selfieDoc} photo={photo} onZoom={setZoomDoc} />}
            {businessDoc && (
              <div className="sm:col-span-2">
                <DocPanel doc={businessDoc} wide onZoom={setZoomDoc} />
              </div>
            )}
          </div>
        )}
      </div>

      <DocumentViewerDialog doc={zoomDoc} onClose={() => setZoomDoc(null)} selfiePhoto={photo} />
    </Dialog>
  )
}

export { VerificationReviewDialog }
