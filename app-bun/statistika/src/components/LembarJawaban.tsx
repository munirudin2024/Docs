import ttdImage from "../assets/ttd.jpg"
import { useState, useRef, useEffect } from "react"
import type { Soal } from "../types"

type Props = {
  soalList: Soal[]
  nama?: string
  waktu?: string
  dosen?: string // tambah ini
}

function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
  style,
}: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto"
      ref.current.style.height = ref.current.scrollHeight + "px"
    }
  }, [value])

  return (
    <textarea
      ref={ref}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      style={{
        width: "100%",
        padding: "4pt 6pt",
        fontSize: "11pt",
        fontFamily: "Times New Roman, serif",
        border: "1pt solid #ccc",
        borderRadius: "3pt",
        resize: "none",
        overflow: "hidden",
        boxSizing: "border-box",
        lineHeight: 1.8,
        display: "block",
        background: "transparent",
        ...style,
      }}
    />
  )
}

type SoalState = {
  id: number
  pertanyaan: string
  jawaban: string
}

export default function LembarJawaban({ soalList, nama = "", waktu = "", dosen = "" }: Props) {
  const [soals, setSoals] = useState<SoalState[]>(
    soalList.map((s, i) => ({ id: i + 1, pertanyaan: s.pertanyaan, jawaban: s.jawaban }))
  )

  // Sinkronkan soals setiap kali soalList berubah (misal: ganti template)
  useEffect(() => {
    setSoals(soalList.map((s, i) => ({ id: i + 1, pertanyaan: s.pertanyaan, jawaban: s.jawaban })))
  }, [soalList])

  const updatePertanyaan = (id: number, val: string) => {
    setSoals((prev) => prev.map((s) => s.id === id ? { ...s, pertanyaan: val } : s))
  }

  const updateJawaban = (id: number, val: string) => {
    setSoals((prev) => prev.map((s) => s.id === id ? { ...s, jawaban: val } : s))
  }

  const tambahSoal = () => {
    const newId = soals.length > 0 ? Math.max(...soals.map((s) => s.id)) + 1 : 1
    setSoals((prev) => [...prev, { id: newId, pertanyaan: "", jawaban: "" }])
  }

  const hapusSoal = (id: number) => {
    setSoals((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div style={{ fontFamily: "Times New Roman, serif" }}>

      {/* Daftar Soal */}
      <div style={{ marginBottom: "20pt" }}>
        {soals.map((soal, index) => (
          <div key={soal.id} style={{ marginBottom: "20pt" }}>

            {/* Nomor + Pertanyaan + Tombol Hapus */}
            <div style={{ display: "flex", gap: "6pt", alignItems: "flex-start", marginBottom: "4pt" }}>
              <span style={{ fontWeight: "bold", minWidth: "16pt", fontSize: "11pt", paddingTop: "4pt" }}>
                {index + 1}.
              </span>

              {/* Pertanyaan editable */}
              <div style={{ flex: 1 }}>
                <AutoTextarea
                  className="no-print"
                  value={soal.pertanyaan}
                  onChange={(val) => updatePertanyaan(soal.id, val)}
                  placeholder="Tulis pertanyaan di sini..."
                  style={{ border: "1pt dashed #aaa", background: "#fffbe6" }}
                />
                {/* Print: teks pertanyaan */}
                <div className="print-only" style={{ display: "none", fontSize: "11pt", lineHeight: 1.6 }}>
                  {soal.pertanyaan}
                </div>
              </div>

              {/* Tombol hapus soal */}
              <button
                className="no-print"
                onClick={() => hapusSoal(soal.id)}
                title="Hapus soal"
                style={{
                  background: "none",
                  border: "1pt solid #e55",
                  color: "#e55",
                  borderRadius: "3pt",
                  cursor: "pointer",
                  fontSize: "11pt",
                  padding: "2pt 7pt",
                  flexShrink: 0,
                  marginTop: "2pt",
                }}
              >
                ✕
              </button>
            </div>

            {/* Jawaban */}
            <div style={{ marginLeft: "22pt" }}>
              <AutoTextarea
                className="no-print"
                value={soal.jawaban}
                onChange={(val) => updateJawaban(soal.id, val)}
                placeholder="Tulis jawaban di sini..."
              />
              {/* Print: teks jawaban */}
              <div
                className="print-only"
                style={{
                  display: "none",
                  whiteSpace: "pre-wrap",
                  fontSize: "11pt",
                  lineHeight: 1.8,
                  minHeight: "40pt",
                  borderBottom: "0.5pt solid #ccc",
                  paddingBottom: "4pt",
                }}
              >
                {soal.jawaban || " "}
              </div>
            </div>
          </div>
        ))}

        {/* Tombol Tambah Soal */}
        <button
          className="no-print"
          onClick={tambahSoal}
          style={{
            padding: "6pt 16pt",
            fontSize: "11pt",
            fontFamily: "Times New Roman, serif",
            background: "none",
            border: "1pt dashed #1e3a5f",
            color: "#1e3a5f",
            borderRadius: "4pt",
            cursor: "pointer",
            width: "100%",
            marginTop: "4pt",
          }}
        >
          + Tambah Soal
        </button>
      </div>

      {/* Tabel Nilai + TTD */}
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "11pt",
        fontFamily: "Times New Roman, serif",
        marginTop: "10pt",
      }}>
        <thead>
          <tr>
            {["Nilai", "Tanda Tangan Dosen", "Mahasiswa"].map((h) => (
              <th key={h} style={{
                border: "1pt solid #221f1f",
                padding: "6pt",
                textAlign: "center",
                fontWeight: "normal",
                width: "33.33%",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {/* Nilai */}
            <td style={{ border: "1pt solid #221f1f", height: "80pt", verticalAlign: "bottom", padding: "6pt" }} />

            {/* TTD Dosen — nama dosen di bawah */}
            <td style={{
              border: "1pt solid #221f1f",
              height: "80pt",
              verticalAlign: "bottom",
              textAlign: "center",
              padding: "6pt",
            }}>
              {dosen && <span>{dosen}</span>}
            </td>

            {/* TTD Mahasiswa */}
            <td style={{
              border: "1pt solid #221f1f",
              height: "80pt",
              verticalAlign: "bottom",
              textAlign: "center",
              padding: "6pt",
            }}>
              <img
                src={ttdImage}
                alt="Tanda Tangan"
                style={{
                  width: "110pt",
                  height: "90pt",
                  objectFit: "contain",
                  display: "block",
                  margin: "0 auto 4pt",
                }}
              />
              {nama}
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ border: "1pt solid #221f1f", padding: "6pt" }}>
              Diserahkan Pada :
            </td>
            <td style={{ border: "1pt solid #221f1f", padding: "6pt", textAlign: "center" }}>
              Jakarta, {waktu}
            </td>
          </tr>
        </tbody>
      </table>

      <style>{`
        @media print {
          .print-only { display: block !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}