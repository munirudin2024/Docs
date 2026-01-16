import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { jStat } from 'jstat'
import ChiSquarePlot from './ChiSquarePlot'

const genders = ['Pria', 'Wanita']
const coffees = ['Espresso', 'Latte', 'Cappuccino']
// Observed counts: rows = [Pria, Wanita], columns = coffees
const observed = [
  [40, 30, 30], // Pria
  [20, 40, 40]  // Wanita
]

function matrixRowSums(mat: number[][]) {
  return mat.map(row => row.reduce((a, b) => a + b, 0))
}
function matrixColSums(mat: number[][]) {
  const cols = mat[0].length
  const out = Array(cols).fill(0)
  for (let i = 0; i < mat.length; i++) {
    for (let j = 0; j < cols; j++) {
      out[j] += mat[i][j]
    }
  }
  return out
}

// Styling untuk section
const sectionStyle: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '20px'
}

const headingStyle: React.CSSProperties = {
  color: '#1e3a5f',
  borderBottom: '2px solid #3182ce',
  paddingBottom: '8px',
  marginBottom: '12px'
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '12px',
  fontSize: '14px'
}

const thStyle: React.CSSProperties = {
  backgroundColor: '#1e3a5f',
  color: 'white',
  padding: '10px',
  textAlign: 'center',
  border: '1px solid #2d4a6f'
}

const tdStyle: React.CSSProperties = {
  padding: '8px 10px',
  textAlign: 'center',
  border: '1px solid #e2e8f0'
}

const formulaStyle: React.CSSProperties = {
  backgroundColor: '#edf2f7',
  padding: '12px',
  borderRadius: '6px',
  fontFamily: 'monospace',
  fontSize: '14px',
  margin: '8px 0',
  overflowX: 'auto'
}

export default function ChiSquareFullAnalysis() {
  const {
    rowTotals, colTotals, N,
    expected, chi2, df, pValue, criticalValue, cramersV,
    cellContributions, chartData, propData
  } = useMemo(() => {
    const rowTotals = matrixRowSums(observed)
    const colTotals = matrixColSums(observed)
    const N = rowTotals.reduce((a, b) => a + b, 0)

    // expected matrix
    const expected = observed.map((row, i) =>
      row.map((_, j) => (rowTotals[i] * colTotals[j]) / N)
    )

    // chi-square contributions per cell
    const cellContributions = observed.map((row, i) =>
      row.map((o, j) => {
        const e = expected[i][j]
        return (o - e) * (o - e) / e
      })
    )

    // total chi-square
    let chi2 = 0
    for (let i = 0; i < observed.length; i++) {
      for (let j = 0; j < observed[0].length; j++) {
        chi2 += cellContributions[i][j]
      }
    }

    const df = (observed.length - 1) * (observed[0].length - 1)
    const pValue = 1 - jStat.chisquare.cdf(chi2, df)
    const criticalValue = jStat.chisquare.inv(0.95, df)
    const cramersV = Math.sqrt(chi2 / (N * Math.min(observed.length - 1, observed[0].length - 1)))

    // data for charts
    const chartData = coffees.map((c, idx) => ({
      coffee: c,
      [genders[0]]: observed[0][idx],
      [genders[1]]: observed[1][idx],
    }))

    const propData = genders.map((g, i) => {
      const total = rowTotals[i]
      const obj: any = { gender: g }
      coffees.forEach((c, j) => {
        obj[c] = +(observed[i][j] / total * 100).toFixed(1)
      })
      return obj
    })

    return { rowTotals, colTotals, N, expected, chi2, df, pValue, criticalValue, cramersV, cellContributions, chartData, propData }
  }, [])

  return (
    <div style={{ fontFamily: 'Georgia, serif', lineHeight: 1.7 }}>
      
      {/* BAGIAN 1: DATA */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>1. Data</h3>
        <p>Total responden = <strong>{N}</strong></p>
        <p>Tabel frekuensi observasi:</p>
        
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Jenis Kelamin</th>
              {coffees.map(c => <th key={c} style={thStyle}>{c}</th>)}
              <th style={thStyle}>Total</th>
            </tr>
          </thead>
          <tbody>
            {observed.map((row, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f7fafc' }}>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{genders[i]}</td>
                {row.map((v, j) => <td key={j} style={tdStyle}>{v}</td>)}
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{rowTotals[i]}</td>
              </tr>
            ))}
            <tr style={{ backgroundColor: '#e2e8f0' }}>
              <td style={{ ...tdStyle, fontWeight: 'bold' }}>Total</td>
              {colTotals.map((v, j) => <td key={j} style={{ ...tdStyle, fontWeight: 'bold' }}>{v}</td>)}
              <td style={{ ...tdStyle, fontWeight: 'bold' }}>{N}</td>
            </tr>
          </tbody>
        </table>

        <p style={{ marginTop: '12px' }}>
          <strong>Pertanyaan:</strong> Apakah ada hubungan signifikan antara jenis kelamin dan pilihan kopi pada α = 0,05?
        </p>
      </div>

      {/* BAGIAN 2: HIPOTESIS */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>2. Hipotesis</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>H₀ (Null Hypothesis):</strong> Jenis kelamin dan pilihan kopi bersifat <em>independen</em> (tidak berhubungan).</li>
          <li><strong>H₁ (Alternative Hypothesis):</strong> Ada hubungan antara jenis kelamin dan pilihan kopi (tidak independen).</li>
        </ul>
      </div>

      {/* BAGIAN 3: FREKUENSI HARAPAN */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>3. Hitung Frekuensi Harapan</h3>
        
        <div style={formulaStyle}>
          <strong>Rumus:</strong> E<sub>ij</sub> = (Baris<sub>i</sub> Total × Kolom<sub>j</sub> Total) / N
        </div>

        <p><strong>Perhitungan untuk Pria:</strong></p>
        <ul style={{ paddingLeft: '20px', fontFamily: 'monospace' }}>
          <li>E(Pria, Espresso) = {rowTotals[0]} × {colTotals[0]} / {N} = <strong>{expected[0][0].toFixed(1)}</strong></li>
          <li>E(Pria, Latte) = {rowTotals[0]} × {colTotals[1]} / {N} = <strong>{expected[0][1].toFixed(1)}</strong></li>
          <li>E(Pria, Cappuccino) = {rowTotals[0]} × {colTotals[2]} / {N} = <strong>{expected[0][2].toFixed(1)}</strong></li>
        </ul>

        <p><strong>Perhitungan untuk Wanita:</strong></p>
        <ul style={{ paddingLeft: '20px', fontFamily: 'monospace' }}>
          <li>E(Wanita, Espresso) = {rowTotals[1]} × {colTotals[0]} / {N} = <strong>{expected[1][0].toFixed(1)}</strong></li>
          <li>E(Wanita, Latte) = {rowTotals[1]} × {colTotals[1]} / {N} = <strong>{expected[1][1].toFixed(1)}</strong></li>
          <li>E(Wanita, Cappuccino) = {rowTotals[1]} × {colTotals[2]} / {N} = <strong>{expected[1][2].toFixed(1)}</strong></li>
        </ul>

        <p><strong>Tabel Expected:</strong></p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Jenis Kelamin</th>
              {coffees.map(c => <th key={c} style={thStyle}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {expected.map((row, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f7fafc' }}>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{genders[i]}</td>
                {row.map((v, j) => <td key={j} style={tdStyle}>{v.toFixed(1)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BAGIAN 4: STATISTIK CHI-SQUARE */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>4. Statistik Chi-Square (χ²)</h3>
        
        <div style={formulaStyle}>
          <strong>Rumus:</strong> χ² = Σ (O<sub>ij</sub> - E<sub>ij</sub>)² / E<sub>ij</sub>
        </div>

        <p><strong>Hitungan setiap sel:</strong></p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Sel</th>
              <th style={thStyle}>Observed (O)</th>
              <th style={thStyle}>Expected (E)</th>
              <th style={thStyle}>(O - E)²</th>
              <th style={thStyle}>(O - E)² / E</th>
            </tr>
          </thead>
          <tbody>
            {genders.map((g, i) => 
              coffees.map((c, j) => (
                <tr key={`${i}-${j}`} style={{ backgroundColor: (i * 3 + j) % 2 === 0 ? '#fff' : '#f7fafc' }}>
                  <td style={tdStyle}>{g}, {c}</td>
                  <td style={tdStyle}>{observed[i][j]}</td>
                  <td style={tdStyle}>{expected[i][j].toFixed(2)}</td>
                  <td style={tdStyle}>{((observed[i][j] - expected[i][j]) ** 2).toFixed(4)}</td>
                  <td style={{ ...tdStyle, fontWeight: 'bold', color: '#2b6cb0' }}>{cellContributions[i][j].toFixed(6)}</td>
                </tr>
              ))
            )}
            <tr style={{ backgroundColor: '#1e3a5f', color: 'white' }}>
              <td colSpan={4} style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold', color: 'white' }}>Total χ² =</td>
              <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '16px', color: '#ffd700' }}>{chi2.toFixed(6)}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ ...formulaStyle, marginTop: '16px' }}>
          <strong>Derajat Kebebasan (df):</strong> (r - 1) × (c - 1) = ({observed.length} - 1) × ({observed[0].length} - 1) = <strong>{df}</strong>
        </div>
      </div>

      {/* BAGIAN 5: NILAI KRITIS DAN P-VALUE */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>5. Nilai Kritis dan P-Value</h3>
        
        <table style={{ ...tableStyle, maxWidth: '500px' }}>
          <tbody>
            <tr>
              <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 'bold' }}>χ²<sub>observed</sub></td>
              <td style={{ ...tdStyle, fontSize: '18px', color: '#2b6cb0' }}>{chi2.toFixed(4)}</td>
            </tr>
            <tr>
              <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 'bold' }}>χ²<sub>critical</sub> (α=0.05, df={df})</td>
              <td style={{ ...tdStyle, fontSize: '18px', color: '#e53e3e' }}>{criticalValue.toFixed(4)}</td>
            </tr>
            <tr>
              <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 'bold' }}>p-value</td>
              <td style={{ ...tdStyle, fontSize: '18px', color: '#38a169' }}>{pValue.toFixed(6)} ≈ {(pValue * 100).toFixed(2)}%</td>
            </tr>
          </tbody>
        </table>

        <div style={{ 
          backgroundColor: chi2 > criticalValue ? '#fed7d7' : '#c6f6d5', 
          padding: '16px', 
          borderRadius: '8px', 
          marginTop: '16px',
          border: chi2 > criticalValue ? '2px solid #e53e3e' : '2px solid #38a169'
        }}>
          <p style={{ margin: 0 }}>
            <strong>Perbandingan:</strong> χ²<sub>observed</sub> ({chi2.toFixed(4)}) {chi2 > criticalValue ? '>' : '<'} χ²<sub>critical</sub> ({criticalValue.toFixed(4)})
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '16px' }}>
            <strong>Keputusan:</strong> {chi2 > criticalValue ? 
              <span style={{ color: '#c53030' }}>TOLAK H₀</span> : 
              <span style={{ color: '#276749' }}>GAGAL TOLAK H₀</span>
            }
          </p>
        </div>
      </div>

      {/* BAGIAN 6: KESIMPULAN STATISTIK */}
      <div style={{ ...sectionStyle, backgroundColor: '#ebf8ff' }}>
        <h3 style={headingStyle}>6. Kesimpulan Statistik</h3>
        <p style={{ fontSize: '16px' }}>
          p-value ≈ <strong>{pValue.toFixed(4)}</strong> {'<'} 0.05 ⇒ <strong style={{ color: '#c53030' }}>Tolak H₀</strong>
        </p>
        <p style={{ fontSize: '16px', marginTop: '8px' }}>
          <strong>Kesimpulan:</strong> Ada hubungan yang <em>signifikan</em> antara jenis kelamin dan pilihan kopi pada tingkat signifikansi 5%.
        </p>
      </div>

      {/* BAGIAN 7: UKURAN EFEK */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>7. Ukuran Efek </h3>
        
        <div style={formulaStyle}>
          <strong>Rumus:</strong> V = √(χ² / (N × min(r-1, c-1)))
        </div>

        <p style={{ fontFamily: 'monospace' }}>
          V = √({chi2.toFixed(4)} / ({N} × min({observed.length}-1, {observed[0].length}-1)))
        </p>
        <p style={{ fontFamily: 'monospace' }}>
          V = √({chi2.toFixed(4)} / ({N} × 1))
        </p>
        <p style={{ fontFamily: 'monospace' }}>
          V = √({(chi2 / N).toFixed(6)}) = <strong>{cramersV.toFixed(4)}</strong>
        </p>

        <table style={{ ...tableStyle, maxWidth: '400px', marginTop: '16px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Nilai V</th>
              <th style={thStyle}>Interpretasi</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: cramersV < 0.1 ? '#fefcbf' : '#fff' }}>
              <td style={tdStyle}>~0.1</td>
              <td style={tdStyle}>Efek Kecil</td>
            </tr>
            <tr style={{ backgroundColor: cramersV >= 0.1 && cramersV < 0.3 ? '#fefcbf' : '#fff' }}>
              <td style={tdStyle}>~0.3</td>
              <td style={tdStyle}>Efek Sedang</td>
            </tr>
            <tr style={{ backgroundColor: cramersV >= 0.3 ? '#fefcbf' : '#fff' }}>
              <td style={tdStyle}>~0.5</td>
              <td style={tdStyle}>Efek Besar</td>
            </tr>
          </tbody>
        </table>

        <p style={{ marginTop: '12px' }}>
          <strong>Interpretasi:</strong> V ≈ {cramersV.toFixed(3)} termasuk dalam kategori <strong>efek kecil-sedang</strong>.
        </p>
      </div>

      {/* BAGIAN 8: INTERPRETASI PRAKTIS */}
      <div style={{ ...sectionStyle, backgroundColor: '#f0fff4' }}>
        <h3 style={headingStyle}>8. Interpretasi Praktis</h3>
        
        <p>Hasil menunjukkan ada hubungan yang <strong>signifikan</strong> antara jenis kelamin dan preferensi kopi. Dari tabel frekuensi terlihat pola:</p>
        
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>Pria</strong> cenderung memilih <strong>Espresso</strong> (40% pria vs 20% wanita).</li>
          <li><strong>Wanita</strong> cenderung lebih memilih <strong>Latte</strong> dan <strong>Cappuccino</strong> (masing-masing 40% wanita, sedangkan pria 30%).</li>
        </ul>

        <p style={{ marginTop: '12px' }}>
          Namun ukuran efek sedang-kecil (V ≈ {cramersV.toFixed(2)}), artinya walau hubungan signifikan secara statistik, <strong>kekuatan asosiasi tidak besar</strong>.
        </p>
      </div>

      {/* BAGIAN 9: VISUALISASI CHI-SQUARE */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>9. Visualisasi Distribusi Chi-Square</h3>
        <ChiSquarePlot chi2={chi2} df={df} alpha={0.05} />
      </div>

      {/* BAGIAN 10: GRAFIK DATA */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>10. Grafik Data</h3>
        
        <h4 style={{ marginTop: '16px' }}>Grouped Bar Chart (Jumlah Observasi)</h4>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="coffee" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={genders[0]} fill="#3182CE" name="Pria" />
              <Bar dataKey={genders[1]} fill="#E53E3E" name="Wanita" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <h4 style={{ marginTop: '24px' }}>Stacked Bar Chart (Proporsi per Gender, %)</h4>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={propData} layout="vertical" margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <YAxis dataKey="gender" type="category" />
              <Tooltip formatter={(value: any) => `${value}%`} />
              <Legend />
              <Bar dataKey="Espresso" stackId="a" fill="#63b3ed" />
              <Bar dataKey="Latte" stackId="a" fill="#f6ad55" />
              <Bar dataKey="Cappuccino" stackId="a" fill="#f687b3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          <em>Catatan: Stacked bar menunjukkan persentase tiap pilihan dalam masing-masing gender (total = 100% per bar).</em>
        </p>
      </div>

    </div>
  )
}
