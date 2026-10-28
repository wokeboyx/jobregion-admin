import { cn } from "@/lib/utils"
import { photoFor } from "@/lib/photos"

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")
}

/** A round photo when we have one; otherwise initials on near-black, like business accounts in the app. */
function Avatar({ name, src, className }: { name: string; src?: string; className?: string }) {
  const photo = src ?? photoFor(name)
  return (
    <div
      data-slot="avatar"
      className={cn(
        "flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold uppercase text-white",
        className,
      )}
    >
      {photo ? <img src={photo} alt="" className="size-full object-cover" /> : initials(name)}
    </div>
  )
}

export { Avatar }
