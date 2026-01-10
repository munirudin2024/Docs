# Sistem Inventori PPIC (Kompatibel dengan Rust CLI App)

Aplikasi sistem inventori lengkap yang **menggunakan database PostgreSQL yang sama** dengan aplikasi CLI Rust. Anda dapat menggunakan kedua aplikasi (Web dan CLI) untuk mengakses dan menginput data ke satu database yang sama.

## 🎯 Keunggulan Utama

✅ **Database Bersama**: Rust CLI dan Web App menggunakan database PostgreSQL yang sama
✅ **Auto-Sync**: Data yang diinput dari CLI langsung terlihat di Web, dan sebaliknya  
✅ **Fitur Lengkap**: Transaksi IN/OUT, Stock Opname, Audit, Report dengan filter  
✅ **Pallet Management**: Grid 20x20 (1-400) untuk manajemen pallet gudang  
✅ **Multi-Role**: Support untuk maintenance, production, order, titipan, tidak stok  

## 🚀 Quick Start

### 1. Setup Database (Jika Belum)
```bash
# Jika database belum ada, jalankan migration
docker exec -i postgres_pgdb psql -U pguser -d pgdb < node/inventori-be/database/migration.sql
```

### 2. Setup Admin User Password
```bash
# Generate password hash untuk admin123
cd node/inventori-be
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10, (err, hash) => console.log(hash));"

# Copy hash yang dihasilkan, lalu update ke database:
docker exec postgres_pgdb psql -U pguser -d pgdb -c "UPDATE users SET password = 'PASTE_HASH_DISINI' WHERE username = 'admin';"
```

### 3. Backend
```bash
cd node/inventori-be
cp .env.example .env  # Jika .env belum ada
npm install
npm run dev    # Port 3001
```

### 4. Frontend
```bash
cd node/inventori-fe
npm install
npm run dev    # Port 5173
```

**Login Web:** `admin` / `admin123`

**URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📡 API Endpoints

```
POST /api/auth/login              - Login
POST /api/transactions            - Create transaksi
GET  /api/transactions            - Get transaksi (filter: type, role, requester, code)
GET  /api/transactions/statistics - Statistics
POST /api/opname                  - Create stock opname
GET  /api/opname                  - Get opname list
GET  /api/opname/audit/:code      - Audit opname by item
GET  /api/items                   - CRUD items
GET  /api/audit                   - Audit logs
```

## 🔄 Workflow Integration

**Scenario 1:** Input di Rust CLI → View di Web App
**Scenario 2:** Input di Web App → View di Rust CLI
**Scenario 3:** Stock Opname di Web → Audit di CLI

Semua data **real-time sync** melalui database PostgreSQL!

## 📊 Database Schema (Kompatibel)

- `users` - Login & authentication
- `items` - Master barang (auto-sync: code↔kode_barang, name↔nama_barang, stock↔qty)
- `transactions` - Transaksi IN/OUT (format Rust CLI)
- `stock_opname` - Stock opname records
- `pallets` - Pallet registry 20x20 grid
- `audit_logs` - Audit trail

## 🛠️ Tech Stack

**Backend:** Express + TypeScript + PostgreSQL  
**Frontend:** React + TypeScript + Vite + TailwindCSS  
**Rust CLI:** Tokio + SQLx + Tabled  

Lihat dokumentasi lengkap di masing-masing folder:
- [Backend README](inventori-be/README.md)
- [Frontend README](inventori-fe/README.md)
