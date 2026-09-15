import { useState } from "react"

function formatShortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function niceMax(value: number) {
  if (value <= 5) return 5
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const residual = value / magnitude
  const niceResidual = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10
  return niceResidual * magnitude
}

function BarChart({
  data,
  color = "var(--brand-cta)",
  xLabel = "Date",
  yLabel = "Count",
}: {
  data: { date: string; count: number }[]
  color?: string
  xLabel?: string
  yLabel?: string
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const rawMax = Math.max(...data.map((d) => d.count), 1)
  const max = niceMax(rawMax)
  const tickCount = 4
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((max / tickCount) * (tickCount - i)))
  const labelStep = Math.max(1, Math.ceil(data.length / 8))

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">{yLabel}</p>
      <div className="flex gap-2">
        <div className="flex w-7 shrink-0 flex-col justify-between text-right text-[10px] leading-none text-muted-foreground">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-40">
            <div className="absolute inset-0 flex flex-col justify-between">
              {ticks.map((_, i) => (
                <div key={i} className="h-px w-full bg-border" />
              ))}
            </div>
            <div className="relative flex h-full items-end gap-1">
              {data.map((d, i) => (
                <div
                  key={d.date}
                  className="relative flex h-full flex-1 flex-col items-center justify-end"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  {hoverIndex === i && (
                    <div className="pointer-events-none absolute -top-11 z-10 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-center shadow-lg">
                      <p className="text-[11px] font-semibold text-background">{d.count.toLocaleString()} signups</p>
                      <p className="text-[9px] text-background/70">{formatShortDate(d.date)}</p>
                    </div>
                  )}
                  <div
                    className="w-full rounded-t-sm transition-opacity"
                    style={{
                      height: `${Math.max((d.count / max) * 100, 2)}%`,
                      backgroundColor: color,
                      opacity: hoverIndex === null || hoverIndex === i ? 1 : 0.45,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-1 flex gap-1">
            {data.map((d, i) => (
              <div key={d.date} className="flex-1 text-center text-[10px] whitespace-nowrap text-muted-foreground">
                {i % labelStep === 0 ? formatShortDate(d.date) : ""}
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-center text-[11px] font-medium text-muted-foreground">{xLabel}</p>
        </div>
      </div>
    </div>
  )
}

export { BarChart }
