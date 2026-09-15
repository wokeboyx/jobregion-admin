function Sparkline({
  label,
  latest,
  data,
  color,
}: {
  label: string
  latest: string
  data: number[]
  color: string
}) {
  const width = 668
  const height = 28
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return [x, y] as const
  })

  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ")
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`
  const [lastX, lastY] = points[points.length - 1]

  return (
    <div className="h-20 w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">latest {latest}</p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-7 w-full overflow-visible" preserveAspectRatio="none">
        <path d={areaPath} fill={color} opacity={0.12} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        <circle cx={lastX} cy={lastY} r={4} fill={color} />
      </svg>
    </div>
  )
}

export { Sparkline }
