import React from 'react'

type Props = {
  fontFamily: string
  setFontFamily: (font: string) => void
  fontSize: number
  setFontSize: (size: number) => void
}

const fontOptions = [
  { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { label: 'Arial', value: "Arial, Helvetica, sans-serif" },
  { label: 'Georgia', value: "Georgia, serif" },
  { label: 'Verdana', value: "Verdana, Geneva, sans-serif" },
  { label: 'Courier New', value: "'Courier New', Courier, monospace" },
  { label: 'Tahoma', value: "Tahoma, Geneva, sans-serif" },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
  { label: 'Palatino', value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
]

const sizePresets = [10, 11, 12, 13, 14, 16, 18, 20, 24]

export default function FontSettings({ 
  fontFamily, 
  setFontFamily, 
  fontSize, 
  setFontSize 
}: Props) {
  return (
    <div 
      className="no-print"
      style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        alignItems: 'center'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e3a5f' }}>
          Jenis Font:
        </label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: '14px',
            borderRadius: '6px',
            border: '1px solid #cbd5e0',
            backgroundColor: 'white',
            cursor: 'pointer',
            minWidth: '180px'
          }}
        >
          {fontOptions.map((font) => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e3a5f' }}>
          Ukuran Font:
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setFontSize(Math.max(8, fontSize - 1))}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #cbd5e0',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            −
          </button>
          
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e0',
              backgroundColor: 'white',
              cursor: 'pointer',
              textAlign: 'center',
              width: '70px'
            }}
          >
            {sizePresets.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>

          <button
            onClick={() => setFontSize(Math.min(32, fontSize + 1))}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #cbd5e0',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            +
          </button>
        </div>
      </div>

      <div style={{ 
        padding: '8px 16px', 
        backgroundColor: '#e2e8f0', 
        borderRadius: '6px',
        fontSize: '13px',
        color: '#4a5568'
      }}>
        <span style={{ fontFamily, fontSize: `${fontSize}px` }}>
          Preview: Statistika dan Probabilitas
        </span>
      </div>
    </div>
  )
}
