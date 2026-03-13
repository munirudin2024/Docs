export type MahasiswaInfo = {
  nama: string
  nim: string
  dosen: string
  mataKuliah: string
  kelas: string
  prodi: string
  waktu?: string
}

export type FontSetting = {
  fontFamily: string
  fontSize: number
}

export type Soal = {
  nomor: number
  pertanyaan: string
  jawaban: string
}