# Analisis: Jenis Kelamin vs Pilihan Kopi (React + TypeScript)

Instruksi singkat:

1. Pasang dependensi:
   npm install recharts jstat

2. Jika TypeScript mengeluh tentang modul `jstat`, buat file `src/custom.d.ts` (disertakan di repo ini).

3. Jalankan dev server:
   npm run dev

4. Buka aplikasi, Anda akan melihat tabel observasi, expected counts, hasil uji chi-square (χ², df, p-value), Cramér's V, dan dua grafik:
   - Grouped bar (perbandingan jumlah per kopi per gender)
   - Stacked bar (proporsi per gender)

Penjelasan singkat:
- Data: Pria = [Espresso:40, Latte:30, Cappuccino:30], Wanita = [20,40,40], N=200.
- Uji: Chi-square test of independence, α = 0.05.
- Ukuran efek: Cramér's V.