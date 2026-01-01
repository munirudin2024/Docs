# 🔥 Setup Firebase untuk Login

## 📋 Langkah-langkah Setup

### 1. Buat Project di Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add project" atau "Tambah project"
3. Masukkan nama project (misal: "cyber-app")
4. Ikuti wizard setup sampai selesai

### 2. Tambahkan Web App ke Project

1. Di Firebase Console, klik icon **</>** (Web)
2. Daftar app Anda (misal: "Cyber Web App")
3. Copy configuration yang muncul (ada `apiKey`, `authDomain`, dll)

### 3. Enable Authentication

1. Di menu sebelah kiri, klik **Authentication**
2. Klik **Get started**
3. Pilih tab **Sign-in method**
4. Klik **Email/Password**
5. Enable toggle pertama "Email/Password"
6. Klik **Save**

### 4. Konfigurasi di Project

#### Option 1: Edit langsung firebase.config.ts (Untuk testing)

Edit file [src/config/firebase.config.ts](src/config/firebase.config.ts):

\`\`\`typescript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // dari Firebase Console
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
\`\`\`

#### Option 2: Gunakan Environment Variables (Recommended untuk production)

1. Copy file \`.env.example\` menjadi \`.env\`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. Edit \`.env\` dan isi dengan config Firebase Anda:
   \`\`\`
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
   \`\`\`

3. Update [src/config/firebase.config.ts](src/config/firebase.config.ts):
   \`\`\`typescript
   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID
   };
   \`\`\`

### 5. Tambahkan User untuk Testing

Di Firebase Console → Authentication → Users:
1. Klik **Add user**
2. Masukkan email: `test@example.com`
3. Masukkan password: `test123456`
4. Klik **Add user**

### 6. Test Login

1. Jalankan development server:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Buka browser di `http://localhost:5174`

3. Login dengan:
   - Email: `test@example.com`
   - Password: `test123456`

## 🎯 Fitur yang Sudah Tersedia

✅ **Login dengan Email/Password** - Menggunakan Firebase Authentication
✅ **Error Handling** - Pesan error yang jelas untuk user
✅ **Loading State** - Tampil saat proses login
✅ **Success Message** - Konfirmasi login berhasil
✅ **Form Validation** - Validasi email dan required fields
✅ **Token Management** - Simpan token ke localStorage

## 📁 File-file Penting

- **[src/config/firebase.config.ts](src/config/firebase.config.ts)** - Konfigurasi Firebase
- **[src/utils/auth.utils.ts](src/utils/auth.utils.ts)** - Fungsi login, register, logout
- **[src/hooks/useLoginForm.ts](src/hooks/useLoginForm.ts)** - Hook untuk form login
- **[src/types/auth.types.ts](src/types/auth.types.ts)** - TypeScript types

## 🔐 Security Notes

⚠️ **PENTING:** 
- Jangan commit file \`.env\` ke Git!
- File \`.env\` sudah ada di \`.gitignore\`
- Untuk production, gunakan environment variables dari hosting platform

## 🚀 Next Steps

Setelah login berfungsi, Anda bisa:

1. **Tambah Register Page** - Pakai fungsi \`registerWithEmail\` yang sudah ada
2. **Tambah Dashboard** - Halaman setelah login berhasil
3. **Protected Routes** - Cegah akses tanpa login
4. **Profile Management** - Edit profil user
5. **Password Reset** - Fitur lupa password

## 📚 Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth/web/start)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [React TypeScript](https://react-typescript-cheatsheet.netlify.app/)

## ❓ Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
- Cek kembali API key di config
- Pastikan tidak ada typo

### Error: "Firebase: Error (auth/operation-not-allowed)"
- Enable Email/Password di Firebase Console → Authentication → Sign-in method

### Error: "Firebase: Error (auth/invalid-credential)"
- Email atau password salah
- Pastikan user sudah dibuat di Firebase Console

### Port sudah digunakan
- Vite akan otomatis pakai port lain (misal 5174)
- Atau stop process yang pakai port 5173
