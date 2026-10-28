import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { BarChart } from "@/components/bar-chart"
import { DateRangeDropdown, type CustomRange, type DatePreset } from "@/components/date-range-dropdown"
import { PillTabs } from "@/components/pill-tabs"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { jobCover } from "@/lib/photos"
import type { JobListing, UserAccount } from "@/lib/mock-data"
import { employerAnalytics, forChart, resolveRange, seekerAnalytics, type ChartSeries, type Range, type Stat } from "./analytics"
import type { Side } from "./profiles"

function Delta({ stat, range }: { stat: Stat; range: Range }) {
  if (stat.delta === null) return <p className="mt-1 text-caption text-muted-foreground">No data for the {range.prevLabel}</p>
  const pct = Math.round(stat.delta * 100)
  const good = stat.lowerIsBetter ? pct < 0 : pct > 0
  return (
    <p className="mt-1 text-caption text-muted-foreground">
      <span className={cn("font-semibold", pct === 0 ? "text-foreground" : good ? "text-success" : "text-destructive")}>
        {pct > 0 ? "+" : ""}
        {pct}%
      </span>{" "}
      vs {range.prevLabel}
    </p>
  )
}

/** Airbnb Earnings style: a small grey label, a big number, and the change under it. */
function BigStats({ stats, range }: { stats: Stat[]; range: Range }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label}>
          <p className="text-body2 text-muted-foreground">{s.label}</p>
          <p className="mt-1 text-h3 font-bold tracking-tight text-foreground tabular-nums">{s.value}</p>
          <Delta stat={s} range={range} />
        </div>
      ))}
    </div>
  )
}

function Chart({ charts }: { charts: ChartSeries[] }) {
  const [key, setKey] = useState(charts[0].key)
  const current = charts.find((c) => c.key === key) ?? charts[0]
  const data = forChart(current.data)
  const weekly = data.length !== current.data.length
  return (
    <div className="rounded-xl border border-border p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="heading-card">{current.label}</h3>
        <PillTabs options={charts.map((c) => ({ key: c.key, label: c.label }))} value={current.key} onChange={setKey} />
      </div>
      <BarChart data={data} unit={current.label.toLowerCase()} yLabel={weekly ? `${current.label} per week` : `${current.label} per day`} xLabel={weekly ? "Week of" : "Date"} />
    </div>
  )
}

const pctText = (delta: number | null) => (delta === null ? "—" : `${delta > 0 ? "+" : ""}${Math.round(delta * 100)}%`)

/**
 * Analytics for one side of the account: big numbers with the change vs the previous period, a bar chart, and a small
 * breakdown table. The date range applies to all three.
 */
function ProfileAnalytics({ user, side, posted }: { user: UserAccount; side: Side; posted: JobListing[] }) {
  const navigate = useNavigate()
  const [preset, setPreset] = useState<DatePreset>("30d")
  const [custom, setCustom] = useState<CustomRange | null>(null)
  const range = useMemo(() => resolveRange(preset, custom), [preset, custom])

  const seeker = useMemo(() => (side === "seeker" ? seekerAnalytics(user, range) : null), [side, user, range])
  const employer = useMemo(() => (side === "employer" ? employerAnalytics(user, posted, range) : null), [side, user, posted, range])
  const data = seeker ?? employer!

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body2 text-muted-foreground">
          {range.start} – {range.end}
        </p>
        <DateRangeDropdown
          preset={preset}
          customRange={custom}
          onChange={(p, c) => {
            setPreset(p)
            if (c) setCustom(c)
          }}
        />
      </div>

      <BigStats stats={data.stats} range={range} />

      <Chart key={side} charts={data.charts} />

      {seeker && (
        <div>
          <h3 className="heading-subsection mb-2">Views by source</h3>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="first:pl-0">Source</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Share</TableHead>
                <TableHead className="text-right last:pr-0">vs {range.prevLabel}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seeker.sources.map((s) => (
                <TableRow key={s.source} className="hover:bg-transparent">
                  <TableCell className="first:pl-0">
                    <p className="text-body2 font-semibold text-foreground">{s.source}</p>
                    <div className="mt-1.5 h-1.5 w-40 overflow-hidden rounded-full bg-muted-strong">
                      <div className="h-full rounded-full bg-foreground" style={{ width: `${Math.round(s.share * 100)}%` }} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-foreground">{s.views.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{Math.round(s.share * 100)}%</TableCell>
                  <TableCell className="text-right tabular-nums last:pr-0">{pctText(s.delta)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {employer && (
        <div>
          <h3 className="heading-subsection mb-2">By job</h3>
          {employer.jobRows.length === 0 ? (
            <p className="text-body1 text-muted-foreground">No jobs posted yet, so there is nothing to break down.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="first:pl-0">Job</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Responses</TableHead>
                    <TableHead className="text-right">First response</TableHead>
                    <TableHead className="text-right last:pr-0">Hires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employer.jobRows.slice(0, 5).map((r) => (
                    <TableRow key={r.job.id} onClick={() => navigate(`/jobs/${r.job.id}`)} className="cursor-pointer">
                      <TableCell className="py-2.5 first:pl-0">
                        <div className="flex items-center gap-3">
                          <img src={r.job.photos?.[0] ?? jobCover(r.job.id)} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                          <p title={r.job.title} className="max-w-72 truncate text-body2 font-semibold text-foreground">
                            {r.job.title}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-foreground">{r.views.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.responses.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.firstResponse} h</TableCell>
                      <TableCell className="text-right tabular-nums last:pr-0">{r.hires}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {employer.jobRows.length > 5 && (
                <p className="mt-3 text-caption text-muted-foreground">Top 5 of {employer.jobRows.length} jobs by views in this period.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export { ProfileAnalytics }
