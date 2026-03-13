import { useState } from "react"
import KopSurat from "./components/KopSurat"
import LembarJawaban from "./components/LembarJawaban"
import FontSetting from "./components/FontSetting"
import PrintButton from "./components/PrintButton"
import { useFontSetting } from "./hooks/useFontSetting"
import { templates } from "./templates"

export default function App() {
  const { setting, setSetting } = useFontSetting()
  const [selectedKey, setSelectedKey] = useState<string>(Object.keys(templates)[0])
  const [waktu, setWaktu] = useState(templates[Object.keys(templates)[0]].mahasiswa.waktu ?? "")
  const [judulUjian, setJudulUjian] = useState(templates[Object.keys(templates)[0]].judulUjian)
  const [semester, setSemester] = useState(templates[Object.keys(templates)[0]].semester)

  const template = templates[selectedKey]

  const handleTemplateChange = (key: string) => {
    setSelectedKey(key)
    setWaktu(templates[key].mahasiswa.waktu ?? "")
    setJudulUjian(templates[key].judulUjian)
    setSemester(templates[key].semester)
  }

  console.log("dosen:", template.mahasiswa.dosen)
  return (
    <div>
      <div className="no-print" style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
        padding: "10px 16px",
        background: "#f5f5f5",
        borderBottom: "1px solid #ddd",
      }}>
        <FontSetting setting={setting} onChange={setSetting} />
        <PrintButton />
      </div>

      <div
        id="print-area"
        style={{
          width: "100%",
          maxWidth: "860px",
          margin: "0 auto",
          padding: "20px 40px",
          fontFamily: setting.fontFamily,
          fontSize: `${setting.fontSize}pt`,
          boxSizing: "border-box",
        }}
      >
        <KopSurat
          {...template.mahasiswa}
          judulUjian={judulUjian}
          onJudulUjianChange={setJudulUjian}
          semester={semester}
          onSemesterChange={setSemester}
          selectedKey={selectedKey}
          onTemplateChange={handleTemplateChange}
          waktu={waktu}
          onWaktuChange={setWaktu}
        />
        <LembarJawaban
          soalList={template.soalList}
          nama={template.mahasiswa.nama}
          waktu={waktu}
          dosen={template.mahasiswa.dosen}
        />
      </div>
    </div>
  )
}