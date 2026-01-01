# Cyber Project - React TypeScript

Project web dengan React + TypeScript + Vite + Firebase yang terstruktur dan modular.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup Firebase (lihat QUICKSTART.md)
# Edit src/config/firebase.config.ts dengan Firebase config Anda

# 3. Run development server
npm run dev

# 4. Open browser
# http://localhost:5173
```

**📖 Panduan Setup Firebase:** Baca [QUICKSTART.md](QUICKSTART.md) untuk setup 5 menit!

## 📋 Struktur Folder

```
src/
├── components/         # Komponen-komponen reusable
│   ├── Button/        # Komponen tombol
│   ├── Input/         # Komponen input field
│   ├── Checkbox/      # Komponen checkbox
│   └── index.ts       # Export semua komponen
├── pages/             # Halaman-halaman aplikasi
│   ├── LoginPage/     # Halaman login
│   └── index.ts       # Export semua pages
├── hooks/             # Custom React hooks
│   └── useLoginForm.ts # Hook untuk form login
├── types/             # TypeScript type definitions
│   └── auth.types.ts  # Types untuk authentication
├── utils/             # Fungsi-fungsi utility
├── styles/            # Global styles
└── assets/            # Gambar, fonts, dll
```

## Cara Menjalankan

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build untuk production
npm run build

# Preview production build
npm run preview
```

## Fitur

✅ **Login Page** dengan design modern (mirip SISMAX)
✅ **Firebase Authentication** - Login real dengan email/password
✅ **Form validation** - Email format & required fields
✅ **Error handling** - Pesan error yang jelas
✅ **Success message** - Konfirmasi login berhasil
✅ **Responsive design** - Mobile & desktop friendly
✅ **TypeScript** untuk type safety
✅ **Modular structure** - Mudah dikembangkan
✅ **Custom hooks** untuk logic reusability
✅ **Loading states** - UX yang smooth

## 📝 Dokumentasi

- **[QUICKSTART.md](QUICKSTART.md)** - Setup Firebase dalam 5 menit
- **[FIREBASE-SETUP.md](FIREBASE-SETUP.md)** - Panduan lengkap Firebase
- **README-STRUKTUR.md** (file ini) - Arsitektur project

## Cara Menambahkan Halaman Baru

1. Buat folder baru di `src/pages/NamaHalaman/`
2. Buat file `NamaHalaman.tsx` dan `NamaHalaman.css`
3. Export dari `src/pages/index.ts`
4. Import dan gunakan di `App.tsx`

## Cara Menambahkan Komponen Baru

1. Buat folder baru di `src/components/NamaKomponen/`
2. Buat file `NamaKomponen.tsx` dan `NamaKomponen.css`
3. Export dari `src/components/index.ts`
4. Import dan gunakan di halaman yang membutuhkan

## Tech Stack

- React 19
- TypeScript
- Vite
- CSS Modules
