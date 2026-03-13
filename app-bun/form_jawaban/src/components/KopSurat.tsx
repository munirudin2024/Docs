// import React (opsional, jika JSX digunakan)
import type { MahasiswaInfo } from "../types"
import { templates, type Template } from "../templates"

export type KopProps = MahasiswaInfo & {
  judulUjian: string
  onJudulUjianChange: (val: string) => void
  semester: string
  onSemesterChange: (val: string) => void
  selectedKey: string
  onTemplateChange: (key: string) => void
  waktu: string
  onWaktuChange: (val: string) => void
}

function EditableText({
  value,
  onChange,
  style,
  placeholder,
}: {
  value: string
  onChange: (val: string) => void
  style?: React.CSSProperties
  placeholder?: string
}) {
  return (
    <>
      <input
        className="no-print"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          border: "none",
          borderBottom: "1pt dashed #aaa",
          background: "transparent",
          fontFamily: "inherit",
          fontSize: "inherit",
          fontWeight: "inherit",
          color: "inherit",
          width: "100%",
          outline: "none",
          padding: "0",
          ...style,
        }}
      />
      <span className="print-only" style={{ display: "none" }}>{value}</span>
    </>
  )
}

const staticFields: { label: string; key: keyof MahasiswaInfo }[] = [
  { label: "Nama", key: "nama" },
  { label: "NIM", key: "nim" },
  { label: "Kelas", key: "kelas" },
  { label: "Prodi", key: "prodi" },
]

export default function KopSurat(props: KopProps) {

  return (
    <div style={{ fontFamily: "Times New Roman, serif", width: "100%" }}>

      {/* Logo + Nama Universitas */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12pt",
        marginBottom: "6pt",
      }}>
        <img
          src="/182.jpg"
          alt="Logo"
          style={{ width: "60pt", height: "62pt", objectFit: "contain", flexShrink: 0 }}
        />
        <div style={{ textAlign: "left" }}>
          <p style={{
            margin: 0,
            fontSize: "11pt",
            fontWeight: "bold",
            fontFamily: "Calibri, sans-serif",
            color: "#221f1f",
            lineHeight: 1.3,
          }}>
            YAYASAN MEMAJUKAN ILMU DAN KEBUDAYAAN
          </p>
          <p style={{
            margin: 0,
            fontSize: "24pt",
            fontWeight: "bold",
            fontFamily: "Times New Roman, serif",
            color: "#221f1f",
            lineHeight: 1.1,
          }}>
            UNIVERSITAS SIBER ASIA
          </p>
        </div>
      </div>

      {/* Alamat */}
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "9pt", fontFamily: "Calibri, sans-serif", color: "#221f1f", lineHeight: 1.4 }}>
          Kampus Menara, Jl. RM. Harsono, Ragunan - Jakarta Selatan. Daerah Khusus Ibukota Jakarta
        </p>
        <p style={{ margin: 0, fontSize: "9pt", fontFamily: "Calibri, sans-serif", color: "#221f1f", lineHeight: 1.4 }}>
          12550. Telp. (+6221) 27806189.{" "}
          <a href="mailto:asiacyberuni@acu.ac.id" style={{ color: "#0033cc" }}>asiacyberuni@acu.ac.id</a>.{" "}
          <a href="https://www.unsia.ac.id" style={{ color: "#0033cc" }}>www.unsia.ac.id</a>
        </p>
      </div>

      {/* Garis double */}
      <div style={{ borderBottom: "3pt double #221f1f", margin: "6pt 0 12pt" }} />

      {/* Judul — editable */}
      <div style={{ textAlign: "center", marginBottom: "12pt" }}>
        <p style={{ margin: 0, fontSize: "12pt", fontWeight: "bold", lineHeight: 1.8 }}>
          LEMBAR JAWABAN
        </p>
        <p style={{ margin: 0, fontSize: "12pt", fontWeight: "bold", lineHeight: 1.8 }}>
          <span>{props.judulUjian}</span>
        </p>
        <p style={{ margin: 0, fontSize: "12pt", fontWeight: "bold", lineHeight: 1.8 }}>
          {/*<EditableText
            value={props.semester}
            onChange={props.onSemesterChange}
            placeholder="Semester..."
            style={{ textAlign: "center", fontWeight: "bold", fontSize: "12pt" }}
          />*/}
          <span>{props.semester}</span>
        </p>
      </div>

      {/* Info Mahasiswa */}
      <table style={{ fontSize: "11pt", borderCollapse: "collapse", fontFamily: "Times New Roman, serif", marginBottom: "8pt" }}>
        <tbody>
          {staticFields.map(({ label, key }) =>
            props[key] ? (
              <tr key={key}>
                <td style={{ padding: "1.5pt 0", whiteSpace: "nowrap", width: "90pt" }}>{label}</td>
                <td style={{ padding: "1.5pt 8pt" }}>:</td>
                <td>{props[key]}</td>
              </tr>
            ) : null
          )}

          {/* Mata Kuliah — dropdown */}
          <tr>
            <td style={{ padding: "1.5pt 0", whiteSpace: "nowrap", width: "90pt" }}>Mata Kuliah</td>
            <td style={{ padding: "1.5pt 8pt" }}>:</td>
            <td>
              <select
                className="no-print"
                value={props.selectedKey}
                onChange={(e) => props.onTemplateChange(e.target.value)}
                style={{
                  fontSize: "11pt",
                  fontFamily: "Times New Roman, serif",
                  border: "none",
                  borderBottom: "1pt dashed #aaa",
                  background: "transparent",
                  cursor: "pointer",
                  minWidth: "200pt",
                  padding: "0",
                  outline: "none",
                }}
              >
                {Object.entries(templates).map(([key, t]: [string, Template]) => (
                  <option key={key} value={key}>{t.mahasiswa.mataKuliah}</option>
                ))}
              </select>
              <span className="print-only" style={{ display: "none" }}>{props.mataKuliah}</span>
            </td>
          </tr>

          {/* Waktu — editable */}
          <tr>
            <td style={{ padding: "1.5pt 0", whiteSpace: "nowrap", width: "90pt" }}>Waktu</td>
            <td style={{ padding: "1.5pt 8pt" }}>:</td>
            <td>
              <EditableText
                value={props.waktu}
                onChange={props.onWaktuChange}
                placeholder="Tanggal ujian..."
              />
            </td>
          </tr>

          {/* Dosen */}
          {props.dosen && props.dosen.trim() !== "" ? (
            <tr>
              <td style={{ padding: "1.5pt 0", whiteSpace: "nowrap", width: "90pt" }}>Dosen</td>
              <td style={{ padding: "1.5pt 8pt" }}>:</td>
              <td>{props.dosen}</td>
            </tr>
          ) : null}
        </tbody>
      </table>

      {/* Garis bawah info */}
      {/* <div style={{ borderBottom: "1pt solid #221f1f", marginBottom: "14pt" }} /> */}

      <style>{`
        @media print {
          .print-only { display: inline !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}