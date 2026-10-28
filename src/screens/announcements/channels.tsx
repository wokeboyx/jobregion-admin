import { cn } from "@/lib/utils"
import { CHANNEL_LABEL, type AnnouncementChannel } from "@/lib/announcements-data"
import { CHANNEL_ICON, CHANNEL_ORDER } from "./audience"

/** Compact channel icons with a hover/focus tooltip. Channels that aren't used are shown faint so columns line up. */
function ChannelIcons({ channels }: { channels: AnnouncementChannel[] }) {
  return (
    <div className="flex items-center gap-1" aria-label={channels.map((c) => CHANNEL_LABEL[c]).join(", ")}>
      {CHANNEL_ORDER.map((c) => {
        const Icon = CHANNEL_ICON[c]
        const on = channels.includes(c)
        return (
          <span
            key={c}
            tabIndex={on ? 0 : -1}
            aria-hidden={!on}
            className={cn(
              "group/ch relative flex size-7 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-foreground",
              on ? "bg-muted-strong text-foreground" : "text-border",
            )}
          >
            <Icon className="size-3.5" />
            {on && (
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-caption font-medium text-white opacity-0 transition-opacity group-hover/ch:opacity-100 group-focus-visible/ch:opacity-100"
              >
                {CHANNEL_LABEL[c]}
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}

export { ChannelIcons }
