# 📚 Struktur Project - Cyber App

## 🏗️ Arsitektur Folder

```
src/
├── components/           # 🧩 Komponen Reusable
│   ├── Button/          # Tombol dengan variant
│   ├── Checkbox/        # Checkbox component
│   ├── Input/           # Input field dengan validasi
│   ├── Header/          # 🎯 Header aplikasi (top navigation)
│   ├── Sidebar/         # 📋 Sidebar menu
│   ├── MainLayout/      # 📐 Layout utama (sidebar + header + content)
│   ├── ProtectedRoute/  # 🔒 Route yang perlu authentication
│   └── index.ts         # Central export semua components
│
├── pages/               # 📄 Halaman-halaman
│   ├── LoginPage/       # Halaman login
│   ├── DashboardPage/   # 🏠 Halaman dashboard/home
│   └── index.ts         # Export semua pages
│
├── hooks/               # 🎣 Custom React Hooks
│   └── useLoginForm.ts  # Hook untuk form login logic
│
├── utils/               # 🛠️ Utility Functions
│   └── auth.utils.ts    # 🔐 Fungsi authentication (login, logout, dll)
│
├── types/               # 📝 TypeScript Type Definitions
│   └── auth.types.ts    # Types untuk authentication
│
├── config/              # ⚙️ Konfigurasi
│   └── firebase.config.ts # Firebase configuration
│
├── App.tsx              # 🚀 Main App dengan Routing
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## 📦 Import Pattern

### ✅ Cara Import yang Benar

```typescript
// Import dari index.ts (Recommended)
import { Button, Input, MainLayout } from '@/components';
import { LoginPage, DashboardPage } from '@/pages';

// atau dengan relative path
import { Button, Input, MainLayout } from '../../components';
import { LoginPage, DashboardPage } from '../pages';
```

### ❌ Hindari Import Langsung

```typescript
// ❌ Jangan seperti ini
import { Button } from '../../components/Button/Button';

// ✅ Gunakan ini
import { Button } from '../../components';
```

## 🔐 Protected Routes

Halaman yang perlu login menggunakan `ProtectedRoute`:

```typescript
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  } 
/>
```

## 🎨 Layout System

### MainLayout
Semua halaman yang sudah login menggunakan `MainLayout`:

```typescript
import { MainLayout } from '@/components';

export const YourPage = () => {
  return (
    <MainLayout>
      <div>Your content here...</div>
    </MainLayout>
  );
};
```

`MainLayout` otomatis menyediakan:
- ✅ Sidebar kiri dengan menu navigation
- ✅ Header atas dengan user info
- ✅ Footer dengan copyright
- ✅ Responsive design

## 🚀 Cara Menambahkan Fitur Baru

### 1. Tambah Halaman Baru

```bash
# 1. Buat folder di src/pages/
mkdir src/pages/NamaHalaman

# 2. Buat file component dan style
touch src/pages/NamaHalaman/NamaHalaman.tsx
touch src/pages/NamaHalaman/NamaHalaman.css
```

```typescript
// NamaHalaman.tsx
import { MainLayout } from '../../components';
import './NamaHalaman.css';

export const NamaHalaman: React.FC = () => {
  return (
    <MainLayout>
      <div className="nama-halaman">
        <h1>Judul Halaman</h1>
        {/* Content here */}
      </div>
    </MainLayout>
  );
};
```

```typescript
// Tambahkan ke pages/index.ts
export { NamaHalaman } from './NamaHalaman/NamaHalaman';
```

### 2. Tambah Route

```typescript
// App.tsx
import { NamaHalaman } from './pages';

<Route 
  path="/nama-halaman" 
  element={
    <ProtectedRoute>
      <NamaHalaman />
    </ProtectedRoute>
  } 
/>
```

### 3. Tambah Menu di Sidebar

```typescript
// components/Sidebar/Sidebar.tsx
const menuItems = [
  // ... menu lainnya
  {
    id: 'nama-menu',
    label: 'Nama Menu',
    icon: '🎯',
    path: '/nama-halaman'
  }
];
```

### 4. Tambah Komponen Reusable

```bash
# Buat folder component
mkdir src/components/NamaKomponen

# Buat files
touch src/components/NamaKomponen/NamaKomponen.tsx
touch src/components/NamaKomponen/NamaKomponen.css
```

```typescript
// NamaKomponen.tsx
import './NamaKomponen.css';

interface NamaKomponenProps {
  title: string;
  // props lainnya...
}

export const NamaKomponen: React.FC<NamaKomponenProps> = ({ title }) => {
  return (
    <div className="nama-komponen">
      <h3>{title}</h3>
    </div>
  );
};
```

```typescript
// Tambahkan ke components/index.ts
export { NamaKomponen } from './NamaKomponen/NamaKomponen';
```

### 5. Tambah Custom Hook

```typescript
// hooks/useNamaHook.ts
import { useState } from 'react';

export const useNamaHook = () => {
  const [state, setState] = useState(false);

  const toggle = () => setState(!state);

  return { state, toggle };
};
```

## 🎯 Best Practices

### 1. **Component Structure**
- ✅ Satu komponen = satu folder
- ✅ File `.tsx` dan `.css` dalam folder yang sama
- ✅ Export dari `index.ts`

### 2. **Import Order**
```typescript
// 1. React & third-party
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Components & Layouts
import { MainLayout, Button } from '../../components';

// 3. Hooks & Utils
import { useLoginForm } from '../../hooks/useLoginForm';
import { loginWithEmail } from '../../utils/auth.utils';

// 4. Types
import type { LoginFormData } from '../../types/auth.types';

// 5. Styles (terakhir)
import './Component.css';
```

### 3. **TypeScript Types**
```typescript
// ✅ Gunakan interface untuk props
interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

// ✅ Gunakan type untuk union/intersection
type ButtonVariant = 'primary' | 'secondary' | 'danger';
```

### 4. **CSS Naming**
```css
/* ✅ Gunakan kebab-case */
.main-container { }
.user-profile { }
.nav-item-active { }

/* ❌ Hindari camelCase di CSS */
.mainContainer { }
```

### 5. **State Management**
```typescript
// ✅ Local state untuk UI sederhana
const [isOpen, setIsOpen] = useState(false);

// ✅ Custom hooks untuk logic kompleks
const { formData, handleSubmit } = useLoginForm();

// ✅ Context untuk global state (jika diperlukan)
```

## 📚 Resources

- **React Router**: https://reactrouter.com/
- **Firebase Auth**: https://firebase.google.com/docs/auth
- **TypeScript**: https://www.typescriptlang.org/docs/

## 🆘 Troubleshooting

### Error: "Cannot find module"
- ✅ Cek path import (relatif atau dari index.ts)
- ✅ Pastikan file sudah di-export di `index.ts`

### Component tidak muncul
- ✅ Cek console browser untuk error
- ✅ Pastikan route sudah ditambahkan di `App.tsx`

### Style tidak muncul
- ✅ Pastikan import CSS di component
- ✅ Cek class name sudah sesuai

---

Happy coding! 🚀
