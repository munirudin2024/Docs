import React, { useState } from 'react'
import ChiSquareFullAnalysis from './components/ChiSquareFullAnalysis'
import KopSurat from './components/KopSurat'
import PrintButton from './components/PrintButton'
import FontSettings from './components/FontSettings'

export default function App() {
  const [fontFamily, setFontFamily] = useState("'Times New Roman', Times, serif")
  const [fontSize, setFontSize] = useState(13)

  return (
    <div className="app" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      {/* Pengaturan Font */}
      <FontSettings 
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />

      {/* Tombol Cetak */}
      <PrintButton targetId="printable-content" fileName="Analisis_Chi_Square_Lengkap" />
      
      {/* Konten yang akan dicetak */}
      <div 
        id="printable-content"
        style={{
          fontFamily: fontFamily,
          fontSize: `${fontSize}px`
        }}
      >
        <KopSurat 
          nama="Munhammad Munirudin"
          nim="230101010183"
          dosen="Ir Endah Tri Esti Handayani, MMSI"
          mataKuliah="Statistika dan Probabilitas"
          kelas="SI302"
          prodi="Sistem Informasi"
        />
        
        <h1 style={{ 
          fontSize: `${Math.round(fontSize * 1.5)}px`, 
          marginTop: '24px', 
          textAlign: 'center',
          color: '#1e3a5f'
        }}>
          Analisis Chi-Square: Jenis Kelamin vs Pilihan Kopi
        </h1>
        
        <ChiSquareFullAnalysis />
      </div>
    </div>
  )
}