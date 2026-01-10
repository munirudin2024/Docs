# Inventori Frontend

Frontend aplikasi inventori menggunakan React, TypeScript, dan Vite.

## Features

- ✅ Login & Register
- ✅ Dashboard dengan statistik
- ✅ CRUD Items
- ✅ Search & Filter
- ✅ Audit Logs
- ✅ Responsive Design
- ✅ State Management dengan Zustand
- ✅ Toast Notifications

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- Zustand (State Management)
- Axios
- TailwindCSS
- React Icons
- React Hot Toast

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup environment:
```bash
# Edit .env jika perlu
VITE_API_URL=http://localhost:3000/api
```

3. Run development:
```bash
npm run dev
```

4. Build production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── pages/           # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── ItemsPage.tsx
│   └── AuditPage.tsx
├── services/        # API services
│   ├── authService.ts
│   ├── itemsService.ts
│   └── auditService.ts
├── store/           # State management
│   └── authStore.ts
├── types/           # TypeScript types
│   └── index.ts
├── lib/             # Utilities
│   └── axios.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Default Credentials

Setelah setup database:
- Username: `admin`
- Password: `admin123`
