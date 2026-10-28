import { IdCard, UserRound, Building2 } from "lucide-react"

import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { UserDocument } from "@/lib/mock-data"

const DOC_ICON = { id: IdCard, selfie: UserRound, business: Building2 } as const

/** What kind of document it is, in Airbnb's ID-verification words. */
const DOC_TYPE_LABEL = { id: "Government ID", selfie: "Selfie", business: "Business registration" } as const

/**
 * The document itself: a quiet grey surface with the document drawn as a white card (or the person's photo for a
 * selfie when we have one), like Airbnb's ID verification screens.
 */
function DocumentSurface({ doc, photo, className, large }: { doc: UserDocument; photo?: string; className?: string; large?: boolean }) {
  const Icon = DOC_ICON[doc.type]
  if (doc.type === "selfie" && photo) {
    return (
      <div className={cn("overflow-hidden rounded-xl bg-muted", className)}>
        <img src={photo} alt="" className="size-full object-cover" />
      </div>
    )
  }
  return (
    <div className={cn("flex items-center justify-center rounded-xl bg-muted", className)}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-border bg-card shadow-[0_1px_4px_rgb(0_0_0/0.08)]",
          large ? "w-3/5 p-5" : "w-3/5 p-3",
        )}
      >
        <Icon className={cn("shrink-0 text-foreground", large ? "size-10" : "size-6")} strokeWidth={1.5} />
        <div className="flex-1 space-y-1.5">
          <span className="block h-1.5 w-4/5 rounded-full bg-border" />
          <span className="block h-1.5 w-3/5 rounded-full bg-border" />
          <span className="block h-1.5 w-2/5 rounded-full bg-border" />
        </div>
      </div>
    </div>
  )
}

/** The small grey uppercase label over a document, e.g. "GOVERNMENT ID". */
function DocumentTypeLabel({ doc, className }: { doc: UserDocument; className?: string }) {
  return (
    <p className={cn("text-body2 font-semibold uppercase tracking-wide text-muted-foreground", className)}>
      {DOC_TYPE_LABEL[doc.type]}
    </p>
  )
}

function DocumentTile({ doc, photo, onView }: { doc: UserDocument; photo?: string; onView: (doc: UserDocument) => void }) {
  return (
    <button type="button" onClick={() => onView(doc)} className="group flex flex-col text-left">
      <div className="overflow-hidden rounded-xl border border-border transition-shadow group-hover:shadow-card">
        <DocumentSurface doc={doc} photo={photo} className="aspect-[4/3] rounded-none" />
      </div>
      <DocumentTypeLabel doc={doc} className="mt-3" />
      <p className="mt-0.5 text-body1 font-semibold text-foreground group-hover:underline">{doc.label}</p>
      <p className="text-sm text-muted-foreground">Uploaded {doc.uploadedDate}</p>
    </button>
  )
}

function DocumentGrid({
  documents,
  onView,
  selfiePhoto,
}: {
  documents: UserDocument[]
  onView: (doc: UserDocument) => void
  /** The person's photo, shown on selfie tiles. */
  selfiePhoto?: string
}) {
  if (documents.length === 0) {
    return <p className="text-body1 text-muted-foreground">No documents uploaded.</p>
  }
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
      {documents.map((doc) => (
        <DocumentTile key={doc.id} doc={doc} photo={selfiePhoto} onView={onView} />
      ))}
    </div>
  )
}

function DocumentViewerDialog({ doc, onClose, selfiePhoto }: { doc: UserDocument | null; onClose: () => void; selfiePhoto?: string }) {
  return (
    <Dialog open={doc !== null} onClose={onClose} title={doc ? DOC_TYPE_LABEL[doc.type] : ""} width="w-[520px]">
      {doc && (
        <div className="p-6">
          <DocumentSurface doc={doc} photo={selfiePhoto} large className="aspect-[4/3]" />
          <p className="mt-4 text-base font-semibold text-foreground">{doc.label}</p>
          <p className="text-sm text-muted-foreground">Uploaded {doc.uploadedDate}</p>
        </div>
      )}
    </Dialog>
  )
}

export { DocumentGrid, DocumentSurface, DocumentTypeLabel, DocumentViewerDialog }
