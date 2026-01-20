

type Props = {
  nama?: string
  nim?: string
  dosen?: string
  mataKuliah?: string
  kelas?: string
  prodi?: string
}

export default function KopSurat({
  nama = "Munhammad Munirudin",
  nim = "230101010183",
  dosen = "Ir Endah Tri Esti Handayani, MMSI",
  mataKuliah = "Statistika dan Probabilitas",
  kelas = "SI302",
  prodi = "Sistem Informasi"
}: Props) {
  return (
    <div className="kop-surat" style={{
      fontFamily: 'Times New Roman, serif',
      marginBottom: '24px',
      borderBottom: '3px double #333',
      paddingBottom: '16px'
    }}>
      {/* Header Universitas */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '8px'
      }}>
        {/* Logo */}
        <div style={{
          width: '70px',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src="/182.jpg" 
            alt="Logo Universitas Siber Asia" 
            style={{ width: '80px', height: '80px', objectFit: 'contain' }}
          />
        </div>
        
        {/* Nama Universitas */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a5f' }}>
            YAYASAN MEMAJUKAN ILMU DAN KEBUDAYAAN
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', letterSpacing: '2px' }}>
            UNIVERSITAS SIBER ASIA
          </div>
          <div style={{ fontSize: '10px', color: '#333', marginTop: '4px' }}>
            Kampus Menara, Jl. RM. Harsono, Ragunan - Jakarta Selatan, Daerah Khusus Ibukota Jakarta
          </div>
          <div style={{ fontSize: '10px', color: '#333' }}>
            12550. Telp. (+6221) 27806189. <a href="mailto:asiacyberuni@acu.ac.id" style={{ color: '#0066cc' }}>asiacyberuni@acu.ac.id</a>. <a href="https://www.unsia.ac.id" style={{ color: '#0066cc' }}>www.unsia.ac.id</a>
          </div>
        </div>
      </div>

      {/* Judul Lembar */}
      <div style={{
        textAlign: 'center',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '16px', 
          fontWeight: 'bold',
          textDecoration: 'underline',
          letterSpacing: '3px'
        }}>
          LEMBAR JAWABAN
        </h2>
      </div>

      {/* Info Mahasiswa */}
      <table style={{ 
        fontSize: '15px', 
        borderCollapse: 'collapse',
        marginLeft: '20px',
        width: 'auto'
      }}>
        <tbody>
          <tr>
            <td style={{ width: '100px', padding: '2px 0', whiteSpace: 'nowrap' }}>Nama</td>
            <td style={{ padding: '2px 8px' }}>:</td>
            <td>{nama}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0', whiteSpace: 'nowrap' }}>NIM</td>
            <td style={{ padding: '2px 8px' }}>:</td>
            <td>{nim}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0', whiteSpace: 'nowrap' }}>Dosen</td>
            <td style={{ padding: '2px 8px' }}>:</td>
            <td>{dosen}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0', whiteSpace: 'nowrap' }}>Mata Kuliah</td>
            <td style={{ padding: '2px 8px' }}>:</td>
            <td style={{ whiteSpace: 'nowrap' }}>{mataKuliah}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0', whiteSpace: 'nowrap' }}>Kelas</td>
            <td style={{ padding: '2px 8px' }}>:</td>
            <td>{kelas}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0', whiteSpace: 'nowrap' }}>Prodi</td>
            <td style={{ padding: '2px 8px' }}>:</td>
            <td>{prodi}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
