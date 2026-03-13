import type { FontSetting } from "../types"

type Props = {
  setting: FontSetting
  onChange: (s: FontSetting) => void
}

const fontOptions = [
  "Times New Roman, serif",
  "Arial, sans-serif",
  "Georgia, serif",
  "Calibri, sans-serif",
  "Courier New, monospace",
]

export default function FontSetting({ setting, onChange }: Props) {
  return (
    <div
      className="no-print"
      style={{
        display: "flex",
        gap: "16px",
        alignItems: "center",
        marginBottom: "16px",
        padding: "10px 16px",
        background: "#f5f5f5",
        borderRadius: "8px",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontWeight: "bold", fontSize: "13px" }}>⚙️ Font Setting</span>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <label style={{ fontSize: "13px" }}>Font:</label>
        <select
          value={setting.fontFamily}
          onChange={(e) => onChange({ ...setting, fontFamily: e.target.value })}
          style={{ padding: "4px 8px", fontSize: "13px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          {fontOptions.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>
              {f.split(",")[0]}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <label style={{ fontSize: "13px" }}>Ukuran:</label>
        <input
          type="number"
          min={10}
          max={24}
          value={setting.fontSize}
          onChange={(e) => onChange({ ...setting, fontSize: Number(e.target.value) })}
          style={{ width: "56px", padding: "4px 8px", fontSize: "13px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <span style={{ fontSize: "13px" }}>px</span>
      </div>
    </div>
  )
}