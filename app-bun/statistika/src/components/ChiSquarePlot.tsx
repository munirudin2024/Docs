import React from 'react'
import { jStat } from 'jstat'

type Props = {
  chi2: number
  df: number
  alpha?: number
  width?: number
  height?: number
}

function linspace(a: number, b: number, n: number) {
  const out = []
  const step = (b - a) / (n - 1)
  for (let i = 0; i < n; i++) out.push(a + step * i)
  return out
}

export default function ChiSquarePlot({
  chi2,
  df,
  alpha = 0.05,
  width = 700,
  height = 240
}: Props) {
  // critical value (right-tail)
  const critical = jStat.chisquare.inv(1 - alpha, df)

  // x-axis range: up to a high quantile or scaled by observed/critical
  const q999 = jStat.chisquare.inv(0.999, df)
  const xMax = Math.max(q999, chi2 * 1.6, critical * 1.6, 1.0)

  const xs = linspace(0, xMax, 500)
  const ys = xs.map(x => jStat.chisquare.pdf(x, df))
  const yMax = Math.max(...ys) * 1.05

  const pad = { top: 12, right: 20, bottom: 28, left: 44 }
  const w = width - pad.left - pad.right
  const h = height - pad.top - pad.bottom

  const xScale = (x: number) => pad.left + (x / xMax) * w
  const yScale = (y: number) => pad.top + (1 - y / yMax) * h
  const baselineY = pad.top + h

  // full area path
  const fullPath = xs
    .map((x, i) => `${i === 0 ? 'M' : 'L'} ${xScale(x).toFixed(2)} ${yScale(ys[i]).toFixed(2)}`)
    .join(' ') + ` L ${xScale(xs[xs.length - 1]).toFixed(2)} ${baselineY.toFixed(2)} L ${xScale(xs[0]).toFixed(2)} ${baselineY.toFixed(2)} Z`

  // critical region path (x >= critical)
  const critXs = xs.filter(x => x >= critical)
  let critPath = ''
  if (critXs.length > 0) {
    const startIdx = xs.indexOf(critXs[0])
    const critPts = xs.slice(startIdx)
    critPath = critPts
      .map((x, i) => `${i === 0 ? 'M' : 'L'} ${xScale(x).toFixed(2)} ${yScale(ys[startIdx + i]).toFixed(2)}`)
      .join(' ')
    // close to baseline
    critPath += ` L ${xScale(critPts[critPts.length - 1]).toFixed(2)} ${baselineY.toFixed(2)} L ${xScale(critPts[0]).toFixed(2)} ${baselineY.toFixed(2)} Z`
  }

  // helper for vertical lines
  const vLine = (xVal: number) => {
    const x = xScale(xVal)
    return (
      <g key={`v-${xVal}`}>
        <line x1={x} x2={x} y1={pad.top} y2={baselineY} stroke="#333" strokeDasharray="4 4" strokeWidth={1} />
      </g>
    )
  }

  return (
    <div style={{ width: `${width}px`, overflowX: 'auto' }}>
      <svg width={width} height={height + 20}>
        <rect x={0} y={0} width={width} height={height + 20} fill="transparent" />
        {/* axes labels */}
        <text x={pad.left - 34} y={pad.top - 2} fontSize={12} fill="#333">Density</text>
        <text x={pad.left + w / 2} y={height + 16} fontSize={13} fill="#333" textAnchor="middle">χ² value</text>

        {/* full curve area */}
        <path d={fullPath} fill="#e6eef8" stroke="#2b6cb0" strokeWidth={1.25} />

        {/* critical region */}
        {critPath && <path d={critPath} fill="#f56565" opacity={0.85} />}

        {/* x-axis ticks */}
        {(() => {
          const ticks = [0, Math.max(critical / 2, xMax * 0.25), critical, chi2, xMax]
          return ticks.map((t, i) => {
            if (t < 0 || t > xMax) return null
            const x = xScale(t)
            return (
              <g key={`tick-${i}`}>
                <line x1={x} x2={x} y1={baselineY} y2={baselineY + 6} stroke="#333" />
                <text x={x} y={baselineY + 18} fontSize={11} fill="#111" textAnchor="middle">
                  {t === critical ? `χ²c\n(${critical.toFixed(2)})` : (t === chi2 ? `χ²_obs\n(${chi2.toFixed(2)})` : t.toFixed(1))}
                </text>
              </g>
            )
          })
        })()}

        {/* vertical lines for critical and observed */}
        {vLine(critical)}
        {vLine(chi2)}

        {/* legend / info box */}
        <g transform={`translate(${pad.left + 8}, ${pad.top + 6})`}>
          <rect x={w - 220} y={2} width={210} height={66} rx={6} fill="#ffffff" stroke="#e6eaf2" />
          <text x={w - 210} y={20} fontSize={12} fill="#111"><tspan fontWeight={700}>Keputusan uji</tspan></text>
          <text x={w - 210} y={36} fontSize={12} fill="#111">
            {chi2 >= critical ? 'Tolak H0 (masuk daerah kritis)' : 'Gagal tolak H0 (di luar daerah kritis)'}
          </text>
          <text x={w - 210} y={52} fontSize={12} fill="#111">df = {df} • α = {alpha}</text>
          <text x={w - 210} y={66} fontSize={12} fill="#111">χ²c = {critical.toFixed(3)} • χ²obs = {chi2.toFixed(3)}</text>
        </g>
      </svg>
    </div>
  )
}