import React from 'react'

type Props = {
  targetId: string
  fileName?: string
}

export default function PrintButton({ targetId, fileName = 'dokumen' }: Props) {
  const handlePrint = () => {
    const printContent = document.getElementById(targetId)
    if (!printContent) {
      alert('Konten tidak ditemukan!')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Popup diblokir! Izinkan popup untuk mencetak.')
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${fileName}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 20px;
            background: white;
          }
          .kop-surat {
            page-break-inside: avoid;
          }
          svg {
            max-width: 100%;
          }
          table {
            border-collapse: collapse;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `)
    printWindow.document.close()
    
    // Tunggu gambar/SVG dimuat
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  return (
    <button
      onClick={handlePrint}
      className="no-print"
      style={{
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: 'bold',
        backgroundColor: '#1e3a5f',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '20px',
        transition: 'background-color 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2d4a6f'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e3a5f'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9V2h12v7"/>
        <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
        <rect x="6" y="14" width="12" height="8"/>
      </svg>
      Cetak PDF
    </button>
  )
}
