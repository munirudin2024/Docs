# 🚀 Quick Start - Firebase Login

## Setup Cepat (5 Menit)

### 1. Setup Firebase Project
```bash
# Buka https://console.firebase.google.com/
# 1. Buat project baru
# 2. Klik icon </> untuk Web App
# 3. Copy config yang muncul
```

### 2. Edit Firebase Config

⚠️ **PENTING:** Buka `src/config/firebase.config.ts` dan ganti SEMUA nilai:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyAbc123...",              // 🔴 GANTI dengan API key ASLI Anda
  authDomain: "project.firebaseapp.com",   // 🔴 GANTI
  projectId: "project-id",                 // 🔴 GANTI
  storageBucket: "project.appspot.com",    // 🔴 GANTI
  messagingSenderId: "123456789",          // 🔴 GANTI
  appId: "1:123456789:web:abc123...",     // 🔴 GANTI
  measurementId: "G-XXXXXXXXXX"            // 🔴 GANTI (optional)
};
```

💡 **Cara dapat config:**
- Firebase Console → ⚙️ Settings → Your apps → Web app
- Copy semua nilai yang muncul, jangan sampai ada yang masih `"YOUR_..."`

### 3. Enable Authentication
Di Firebase Console:
1. **Authentication** → **Get started**
2. **Sign-in method** → **Email/Password** → **Enable**
3. **Save**

### 4. Buat Test User
Di Firebase Console → Authentication → Users:
- Email: `test@example.com`
- Password: `test123456`

### 5. Run Project
```bash
npm run dev
```

Buka `http://localhost:5173` dan login!

---

## 📚 File Struktur

```
src/
├── config/
│   └── firebase.config.ts       # ⚙️ EDIT INI untuk config Firebase
├── utils/
│   └── auth.utils.ts            # 🔐 Fungsi login/register/logout
├── hooks/
│   └── useLoginForm.ts          # 🎣 Hook untuk form logic
├── pages/
│   └── LoginPage/               # 📄 Halaman login
└── components/                   # 🧩 Komponen reusable
```

## ✅ Cara Pakai Fungsi Auth

### Login
```typescript
import { loginWithEmail } from './utils/auth.utils';

const result = await loginWithEmail('user@example.com', 'password123');
if (result.success) {
  console.log('Login berhasil!', result.user);
}
```

### Register
```typescript
import { registerWithEmail } from './utils/auth.utils';

const result = await registerWithEmail('new@example.com', 'password123');
```

### Logout
```typescript
import { signOut } from './utils/auth.utils';

await signOut();
```

### Cek User Login
```typescript
import { getCurrentUser, isAuthenticated } from './utils/auth.utils';

if (isAuthenticated()) {
  const user = getCurrentUser();
  console.log('User:', user?.email);
}
```

## 🎯 Next Steps

1. ✅ Login sudah jalan
2. 📝 Buat halaman Register
3. 🏠 Buat halaman Dashboard/Home
4. 🔒 Buat Protected Routes
5. 👤 Tambah fitur Profile

## 💡 Tips

- Token otomatis disimpan ke localStorage
- Error handling sudah built-in
- Form validation sudah ada
- Responsive untuk mobile & desktop

## 🆘 Butuh Bantuan?

Baca [FIREBASE-SETUP.md](FIREBASE-SETUP.md) untuk panduan lengkap!
