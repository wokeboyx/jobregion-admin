import { IdCard, UserRound, Building2 } from "lucide-react"

import { Dialog } from "@/components/ui/dialog"
import type { UserDocument } from "@/lib/mock-data"

export const DOC_ICON = { id: IdCard, selfie: UserRound, business: Building2 } as const

function DocumentThumbnail({ doc, onView }: { doc: UserDocument; onView: (doc: UserDocument) => void }) {
  const Icon = DOC_ICON[doc.type]
  return (
    <button type="button" onClick={() => onView(doc)} className="group flex flex-col gap-2 text-left">
      <div
        className={`flex h-28 items-center justify-center rounded-lg bg-gradient-to-br ${doc.cover} ring-1 ring-inset ring-black/5 transition-transform group-hover:scale-[1.02]`}
      >
        <Icon className="size-8 text-foreground/25" />
      </div>
      <div>
        <p className="text-xs font-medium text-foreground group-hover:underline">{doc.label}</p>
        <p className="text-[11px] text-muted-foreground">Uploaded {doc.uploadedDate}</p>
      </div>
    </button>
  )
}

function DocumentGrid({ documents, onView }: { documents: UserDocument[]; onView: (doc: UserDocument) => void }) {
  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">No documents uploaded.</p>
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {documents.map((doc) => (
        <DocumentThumbnail key={doc.id} doc={doc} onView={onView} />
      ))}
    </div>
  )
}

function DocumentViewerDialog({ doc, onClose }: { doc: UserDocument | null; onClose: () => void }) {
  const Icon = doc ? DOC_ICON[doc.type] : null
  return (
    <Dialog open={doc !== null} onClose={onClose} width="w-[420px]">
      {doc && Icon && (
        <div className="p-4">
          <div className={`mb-4 flex h-64 items-center justify-center rounded-xl bg-gradient-to-br ${doc.cover}`}>
            <Icon className="size-12 text-foreground/25" />
          </div>
          <p className="text-sm font-semibold text-foreground">{doc.label}</p>
          <p className="text-xs text-muted-foreground">Uploaded {doc.uploadedDate}</p>
        </div>
      )}
    </Dialog>
  )
}

export { DocumentGrid, DocumentViewerDialog }
