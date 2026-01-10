# Sistem Inventori

Aplikasi sistem inventori lengkap dengan backend Express TypeScript dan frontend React TypeScript.

## 📦 Struktur Project

```
node/
├── inventori-be/          # Backend Express TypeScript
│   ├── src/
│   │   ├── config/        # Database config
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth middleware
│   │   ├── routes/        # API routes
│   │   ├── types/         # TypeScript types
│   │   └── index.ts       # Entry point
│   ├── database/
│   │   └── schema.sql     # Database schema
│   └── package.json
│
└── inventori-fe/          # Frontend React TypeScript
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   ├── store/         # State management
    │   ├── types/         # TypeScript types
    │   └── lib/           # Utilities
    └── package.json
```

## 🚀 Quick Start

### 1. Setup Database

```bash
# Jalankan schema SQL di PostgreSQL
psql -U pguser -d pgdb -f node/inventori-be/database/schema.sql
```

### 2. Setup Backend

```bash
cd node/inventori-be
npm install
npm run dev
```

Backend akan berjalan di `http://localhost:3000`

### 3. Setup Frontend

```bash
cd node/inventori-fe
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## 🔑 Default Login

Setelah setup database, gunakan kredensial berikut:
- **Username**: `admin`
- **Password**: `admin123`

## 📋 Features

### Backend
- ✅ RESTful API dengan Express
- ✅ Authentication JWT
- ✅ PostgreSQL Database
- ✅ TypeScript
- ✅ Input validation
- ✅ Error handling
- ✅ CORS enabled

### Frontend
- ✅ React 18 + TypeScript
- ✅ Vite (Fast build tool)
- ✅ React Router (Navigation)
- ✅ Zustand (State management)
- ✅ TailwindCSS (Styling)
- ✅ Axios (HTTP client)
- ✅ React Hot Toast (Notifications)
- ✅ Responsive design

### Fitur Aplikasi
- ✅ Login & Register
- ✅ Dashboard dengan statistik
- ✅ CRUD Items (Barang)
- ✅ Search & Filter
- ✅ Barcode Scanning
- ✅ Audit Logging
- ✅ Role-based access

## 🔧 Environment Variables

### Backend (.env)
```
PORT=3000
DATABASE_URL=postgres://pguser:sisfo%401@postgres_pgdb/pgdb
JWT_SECRET=inventori-secret-key-2026
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user baru

### Items (Requires Auth)
- `GET /api/items` - Get semua items
- `GET /api/items/:id` - Get item by ID
- `GET /api/items/search/:query` - Search items
- `POST /api/items` - Create item baru
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/scan/:kode_barang` - Scan barcode

### Audit Logs (Requires Auth)
- `GET /api/audit` - Get semua audit logs
- `GET /api/audit/item/:itemId` - Get audit by item
- `GET /api/audit/user/:userId` - Get audit by user

## 🛠️ Development

### Backend
```bash
npm run dev      # Development dengan nodemon
npm run build    # Build untuk production
npm start        # Run production build
npm run lint     # Run ESLint
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Build untuk production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📦 Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL + pg
- JWT (jsonwebtoken)
- bcrypt
- express-validator
- dotenv

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Zustand
- Axios
- TailwindCSS
- React Icons
- React Hot Toast

## 📄 Database Schema

```sql
-- Users table
users (
  id, username, password, nama_lengkap, role, created_at, updated_at
)

-- Items table
items (
  id, kode_barang, nama_barang, kategori, lokasi, qty, satuan, keterangan, created_at, updated_at
)

-- Audit logs table
audit_logs (
  id, user_id, item_id, action, qty_before, qty_after, keterangan, created_at
)
```

## 🎯 Next Steps

1. Install dependencies untuk backend dan frontend
2. Setup database dengan schema.sql
3. Update file .env sesuai konfigurasi
4. Jalankan backend: `npm run dev`
5. Jalankan frontend: `npm run dev`
6. Buka browser ke `http://localhost:5173`
7. Login dengan kredensial default

## 🤝 Contributing

Feel free to contribute to this project!

## 📝 License

ISC
