import { useState } from "react"
import { LayoutGrid } from "lucide-react"

import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

/** Grid placement for each photo in the mosaic, by how many photos there are (one big photo left, smaller right). */
function cellClasses(count: number, index: number) {
  if (count === 1) return "col-span-4 row-span-2"
  if (count === 2) return "col-span-2 row-span-2"
  if (index === 0) return "col-span-2 row-span-2"
  if (count <= 4) return "col-span-2 row-span-1"
  return "col-span-1 row-span-1"
}

/**
 * Airbnb's listing photo mosaic: one big photo on the left and up to four smaller ones on the right, with a white
 * "Show all photos" pill that opens every photo in a modal.
 */
function JobImageGallery({ photos, title }: { photos: string[]; title: string }) {
  const [open, setOpen] = useState(false)
  const shown = photos.length >= 5 ? photos.slice(0, 5) : photos.length >= 3 ? photos.slice(0, 3) : photos

  if (photos.length === 0) return null

  return (
    <>
      <div className="relative grid h-[260px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl sm:h-[360px] lg:h-[420px]">
        {shown.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
            className={cn("group relative overflow-hidden bg-muted", cellClasses(shown.length, i))}
          >
            <img src={src} alt="" className="size-full object-cover transition-[filter] group-hover:brightness-90" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute bottom-4 right-4 flex h-9 items-center gap-2 rounded-lg border border-foreground bg-card px-4 text-sm font-semibold text-foreground shadow-[0_1px_4px_rgb(0_0_0/0.12)] hover:bg-muted"
        >
          <LayoutGrid className="size-4" strokeWidth={1.75} />
          Show all photos
        </button>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title={title} width="w-[880px]">
        <div className="grid grid-cols-2 gap-2 p-6">
          {photos.map((src, i) => (
            <img
              key={`${src}-${i}`}
              src={src}
              alt={`Photo ${i + 1} of ${photos.length}`}
              className={cn("w-full rounded-lg object-cover", i % 3 === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square")}
            />
          ))}
        </div>
      </Dialog>
    </>
  )
}

export { JobImageGallery }
