# Inventori Backend API

Backend API untuk sistem inventori menggunakan Express dan TypeScript.

## Features

- ✅ Authentication dengan JWT
- ✅ CRUD Items (Barang)
- ✅ Barcode Scanning
- ✅ Audit Logging
- ✅ Role-based Access Control
- ✅ PostgreSQL Database

## Tech Stack

- Node.js + Express
- TypeScript
- PostgreSQL
- JWT Authentication
- bcrypt

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup database:
```bash
# Jalankan schema.sql di PostgreSQL
psql -U pguser -d pgdb -f database/schema.sql
```

3. Setup environment:
```bash
cp .env.example .env
# Edit .env sesuai konfigurasi
```

4. Run development:
```bash
npm run dev
```

5. Build production:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user baru

### Items
- `GET /api/items` - Get semua items
- `GET /api/items/:id` - Get item by ID
- `GET /api/items/search/:query` - Search items
- `POST /api/items` - Create item baru
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/scan/:kode_barang` - Scan barcode

### Audit Logs
- `GET /api/audit` - Get semua audit logs
- `GET /api/audit/item/:itemId` - Get audit logs by item
- `GET /api/audit/user/:userId` - Get audit logs by user

## Environment Variables

```
PORT=3000
DATABASE_URL=postgres://user:password@host:port/database
JWT_SECRET=your-secret-key
NODE_ENV=development
```
