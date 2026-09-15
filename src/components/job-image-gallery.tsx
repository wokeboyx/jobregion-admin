import { useState } from "react"
import { Image as ImageIcon } from "lucide-react"

import { Dialog } from "@/components/ui/dialog"
import type { JobImage } from "@/lib/mock-data"

function JobImageGallery({ images }: { images: JobImage[] }) {
  const [viewing, setViewing] = useState<JobImage | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setViewing(img)}
            className="group flex flex-col gap-2 text-left"
          >
            <div
              className={`flex h-28 items-center justify-center rounded-lg bg-gradient-to-br ${img.cover} ring-1 ring-inset ring-black/5 transition-transform group-hover:scale-[1.02]`}
            >
              <ImageIcon className="size-8 text-foreground/25" />
            </div>
            <p className="text-xs font-medium text-foreground group-hover:underline">{img.label}</p>
          </button>
        ))}
      </div>

      <Dialog open={viewing !== null} onClose={() => setViewing(null)} width="w-[420px]">
        {viewing && (
          <div className="p-4">
            <div
              className={`mb-4 flex h-64 items-center justify-center rounded-xl bg-gradient-to-br ${viewing.cover}`}
            >
              <ImageIcon className="size-12 text-foreground/25" />
            </div>
            <p className="text-sm font-semibold text-foreground">{viewing.label}</p>
          </div>
        )}
      </Dialog>
    </>
  )
}

export { JobImageGallery }
