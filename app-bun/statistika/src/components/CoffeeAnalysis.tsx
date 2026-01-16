import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { jStat } from 'jstat'

const genders = ['Pria', 'Wanita']
const coffees = ['Espresso', 'Latte', 'Cappuccino']
// Observed counts: rows = [Pria, Wanita], columns = coffees
const observed = [
  [40, 30, 30], // Pria
  [20, 40, 40]  // Wanita
]

function matrixRowSums(mat: number[][]) {
  return mat.map(row => row.reduce((a,b)=>a+b, 0))
}
function matrixColSums(mat: number[][]) {
  const cols = mat[0].length
  const out = Array(cols).fill(0)
  for (let i=0;i<mat.length;i++){
    for (let j=0;j<cols;j++){
      out[j] += mat[i][j]
    }
  }
  return out
}

export default function CoffeeAnalysis() {
  const {
    rowTotals, colTotals, N,
    expected, chi2, df, pValue, cramersV,
    chartData, propData
  } = useMemo(() => {
    const rowTotals = matrixRowSums(observed)
    const colTotals = matrixColSums(observed)
    const N = rowTotals.reduce((a,b)=>a+b,0)

    // expected matrix
    const expected = observed.map((row,i) =>
      row.map((_, j) => (rowTotals[i] * colTotals[j]) / N)
    )

    // chi-square
    let chi2 = 0
    for (let i=0;i<observed.length;i++){
      for (let j=0;j<observed[0].length;j++){
        const o = observed[i][j]
        const e = expected[i][j]
        chi2 += (o - e)*(o - e) / e
      }
    }

    const df = (observed.length - 1) * (observed[0].length - 1)
    // p-value using jStat: CDF gives P(X <= x), so p = 1 - CDF(chi2)
    const pValue = 1 - jStat.chisquare.cdf(chi2, df)

    const cramersV = Math.sqrt(chi2 / (N * Math.min(observed.length - 1, observed[0].length - 1)))

    // data for charts
    const chartData = coffees.map((c, idx) => ({
      coffee: c,
      [genders[0]]: observed[0][idx],
      [genders[1]]: observed[1][idx],
    }))

    // proportions per gender (for stacked by proportion)
    const propData = genders.map((g, i) => {
      const total = rowTotals[i]
      const obj: any = { gender: g }
      coffees.forEach((c, j) => {
        obj[c] = +(observed[i][j] / total * 100).toFixed(1) // percent
      })
      return obj
    })

    return { rowTotals, colTotals, N, expected, chi2, df, pValue, cramersV, chartData, propData }
  }, [])

  return (
    <div>
      <div style={{marginBottom:12}}>
        <strong>Data (observed)</strong>
        <table className="table small" style={{marginTop:8}}>
          <thead>
            <tr>
              <th>Jenis Kelamin</th>
              {coffees.map(c => <th key={c}>{c}</th>)}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {observed.map((row, i) => (
              <tr key={i}>
                <td>{genders[i]}</td>
                {row.map((v,j)=> <td key={j}>{v}</td>)}
                <td>{row.reduce((a,b)=>a+b,0)}</td>
              </tr>
            ))}
            <tr>
              <td><strong>Total</strong></td>
              {matrixColSums(observed).map((v,j)=> <td key={j}><strong>{v}</strong></td>)}
              <td><strong>{matrixRowSums(observed).reduce((a,b)=>a+b,0)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{marginTop:12}}>
        <strong>Expected counts</strong>
        <table className="table small" style={{marginTop:8}}>
          <thead>
            <tr>
              <th>Jenis Kelamin</th>
              {coffees.map(c => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {expected.map((row, i) => (
              <tr key={i}>
                <td>{genders[i]}</td>
                {row.map((v,j)=> <td key={j}>{v.toFixed(2)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stats-grid" style={{marginTop:14}}>
        <div className="chart-card">
          <h3>Hasil uji Chi-square</h3>
          <p>χ² = <strong>{chi2.toFixed(4)}</strong></p>
          <p>df = <strong>{df}</strong></p>
          <p>p-value = <strong>{pValue.toExponential ? pValue.toExponential(3) : pValue.toFixed(4)}</strong></p>
          <p>Cramér's V = <strong>{cramersV.toFixed(4)}</strong></p>
          <p>Kesimpulan (α = 0.05): {pValue < 0.05 ? <strong>H0 ditolak — terdapat hubungan signifikan</strong> : <strong>Gagal menolak H0 — tidak cukup bukti hubungan</strong>}</p>
        </div>

        <div className="chart-card">
          <h3>Interpretasi singkat</h3>
          <ul>
            <li>Pria cenderung memilih Espresso (40% pria vs 20% wanita).</li>
            <li>Wanita cenderung memilih Latte & Cappuccino (masing-masing 40% wanita).</li>
            <li>Ukuran efek (Cramér's V ≈ {cramersV.toFixed(3)}) termasuk kecil-sedang.</li>
          </ul>
        </div>
      </div>

      <div style={{marginTop:20}}>
        <h3>Grafik: Grouped bar (jumlah)</h3>
        <div style={{height:300}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{top:20, right:30, left:0, bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="coffee" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={genders[0]} fill="#3182CE" />
              <Bar dataKey={genders[1]} fill="#E53E3E" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{marginTop:20}}>
        <h3>Grafik: Stacked bar (proporsi per gender, %)</h3>
        <div style={{height:320}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={propData} layout="vertical" margin={{top:20, right:30, left:80, bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0,100]} tickFormatter={v => `${v}%`} />
              <YAxis dataKey="gender" type="category" />
              <Tooltip formatter={(value: any) => `${value}%`} />
              <Legend />
              <Bar dataKey="Espresso" stackId="a" fill="#63b3ed" />
              <Bar dataKey="Latte" stackId="a" fill="#f6ad55" />
              <Bar dataKey="Cappuccino" stackId="a" fill="#f687b3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="small" style={{marginTop:8}}>Catatan: stacked bar menunjukkan persentase tiap pilihan dalam masing-masing gender (total = 100% per bar).</p>
      </div>
    </div>
  )
}