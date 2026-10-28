import { Button } from "@/components/ui/button"
import { Dialog, DialogTextButton } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { CHANNEL_LABEL, channelStats, type Announcement } from "@/lib/announcements-data"
import { CHANNEL_ICON, audienceSummary, channelReach, estimatedReach, formatCount, formatDateTime, pct } from "./audience"

function RateBar({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted-strong">
        <span className="block h-full rounded-full bg-foreground" style={{ width: `${Math.min(100, value)}%` }} />
      </span>
      <span className="w-12 text-right tabular-nums text-foreground">{value.toFixed(1)}%</span>
    </span>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-caption text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-h5 font-bold tabular-nums tracking-tight text-foreground">{value}</p>
      {sub && <p className="text-caption text-muted-foreground">{sub}</p>}
    </div>
  )
}

/** Everything about one announcement: the message, who it went to, and how each channel did. */
function AnnouncementDetail({
  announcement: a,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onUnschedule,
}: {
  announcement: Announcement | null
  onClose: () => void
  onEdit: (a: Announcement) => void
  onDuplicate: (a: Announcement) => void
  onDelete: (a: Announcement) => void
  onUnschedule: (a: Announcement) => void
}) {
  if (!a) return null
  const sent = a.status === "Sent" && a.delivered !== undefined
  const stats = channelStats(a)
  const delivered = a.delivered ?? 0
  const opened = a.opened ?? 0
  const clicked = a.clicked ?? 0

  return (
    <Dialog
      open
      onClose={onClose}
      title={a.title}
      width="w-[760px]"
      footer={
        <>
          {a.status === "Draft" ? (
            <DialogTextButton onClick={() => onDelete(a)} className="text-destructive">
              Delete draft
            </DialogTextButton>
          ) : a.status === "Scheduled" ? (
            <DialogTextButton onClick={() => onUnschedule(a)}>Move to drafts</DialogTextButton>
          ) : (
            <DialogTextButton onClick={onClose}>Close</DialogTextButton>
          )}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onDuplicate(a)}>
              Duplicate
            </Button>
            {a.status !== "Sent" && <Button onClick={() => onEdit(a)}>Edit</Button>}
          </div>
        </>
      }
    >
      <div className="space-y-8 px-6 py-6">
        <section>
          <h3 className="heading-card">{a.title}</h3>
          <p className="mt-1 whitespace-pre-line text-body1 text-foreground">{a.message}</p>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-body2 sm:grid-cols-4">
            <div>
              <dt className="text-caption text-muted-foreground">Status</dt>
              <dd className="text-foreground">{a.status}</dd>
            </div>
            <div>
              <dt className="text-caption text-muted-foreground">{a.status === "Sent" ? "Sent" : a.status === "Scheduled" ? "Goes out" : "Edited"}</dt>
              <dd className="text-foreground">{formatDateTime(a.date)}</dd>
            </div>
            <div>
              <dt className="text-caption text-muted-foreground">Audience</dt>
              <dd className="text-foreground">{audienceSummary(a.audience)}</dd>
            </div>
            <div>
              <dt className="text-caption text-muted-foreground">Link</dt>
              <dd className="truncate text-foreground" title={a.link}>
                {a.link ?? "None"}
              </dd>
            </div>
          </dl>
        </section>

        {sent ? (
          <section className="border-t border-border pt-6">
            <h3 className="heading-card mb-4">Results</h3>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <Stat label="Delivered" value={formatCount(delivered)} sub="people" />
              <Stat label="Opened" value={formatCount(opened)} sub={`${pct(opened, delivered)}% open rate`} />
              <Stat label="Clicked" value={formatCount(clicked)} sub={`${pct(clicked, delivered)}% click rate`} />
              <Stat label="Click to open" value={`${pct(clicked, opened)}%`} sub="of people who opened" />
            </div>
          </section>
        ) : (
          <section className="border-t border-border pt-6">
            <h3 className="heading-card">Expected reach</h3>
            <p className="mt-1 text-body2 text-muted-foreground">
              About {formatCount(estimatedReach(a.audience, a.channels))} people. Results show here once it’s sent.
            </p>
          </section>
        )}

        <section className="border-t border-border pt-6">
          <h3 className="heading-card mb-2">By channel</h3>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Channel</TableHead>
                <TableHead className="text-right">{sent ? "Delivered" : "Can reach"}</TableHead>
                {sent && (
                  <>
                    <TableHead className="text-right">Opened</TableHead>
                    <TableHead>Open rate</TableHead>
                    <TableHead className="text-right">Clicked</TableHead>
                    <TableHead className="text-right">Click rate</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {a.channels.map((c) => {
                const Icon = CHANNEL_ICON[c]
                const s = stats[c]
                return (
                  <TableRow key={c} className="hover:bg-transparent">
                    <TableCell>
                      <span className="inline-flex items-center gap-2 font-medium text-foreground">
                        <Icon className="size-4" />
                        {CHANNEL_LABEL[c]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-foreground">
                      {formatCount(s ? s.delivered : channelReach(a.audience, c))}
                    </TableCell>
                    {sent && s && (
                      <>
                        <TableCell className="text-right tabular-nums text-foreground">{formatCount(s.opened)}</TableCell>
                        <TableCell>
                          <RateBar value={pct(s.opened, s.delivered)} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-foreground">{formatCount(s.clicked)}</TableCell>
                        <TableCell className="text-right tabular-nums text-foreground">{pct(s.clicked, s.delivered).toFixed(1)}%</TableCell>
                      </>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {sent && <p className="mt-3 text-caption text-muted-foreground">One person can get it on more than one channel, so channels add up to more than the total.</p>}
        </section>
      </div>
    </Dialog>
  )
}

export { AnnouncementDetail, RateBar }
