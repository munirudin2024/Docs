# 📦 Aplikasi Inventori PPIC

Aplikasi inventori berbasis CLI menggunakan Rust dan PostgreSQL untuk management barang, transaksi masuk/keluar, dan laporan.

## 🚀 Quick Start

### Codespace
```bash
# Jalankan PostgreSQL
docker compose up -d postgres

# Build & Run
cd app-rust/inventori
cargo run --release
```

## 🧰 Perintah Penting

Jalankan aplikasi dengan tema dan lebar tampilan yang dapat diatur:

```bash
# Start PostgreSQL
docker compose up -d postgres

# Masuk ke folder app
cd app-rust/inventori

# Jalankan dengan tema 'dark' dan lebar banner 40
APP_THEME=dark APP_WIDTH=40 cargo run --release

# Contoh tema 'light'
APP_THEME=light cargo run --release
```

## 🎨 Tema & Tampilan

- APP_THEME: `dark` | `light` (default: `dark`)
- APP_WIDTH: angka untuk lebar banner/menu (default: 34). Contoh: `APP_WIDTH=40`
- Contoh konfigurasi cepat:

```bash
APP_THEME=dark APP_WIDTH=40 cargo run --release

## ✨ Fitur

- ✅ Management Item (Create, Read, Update, Delete)
- ✅ Transaksi Masuk (Purchase Order)
- ✅ Transaksi Keluar (Request)
- ✅ Laporan Real-time & Export
- ✅ Multi-user (Login system)
- ✅ Stock tracking otomatis
- ✅ History transaksi lengkap

## 🛠️ Setup Database

```bash
./setup-remote-db.sh
```

Atau manual:
1. Buka tab **PORTS** di VS Code (bawah)
2. Cari port **5432**
3. Klik kanan → **Port Visibility** → **Public**

## 📂 File Penting

- `main.rs` - Main application code
- `.env.example` - Template konfigurasi database
- `setup-remote-db.sh` - Script setup database access

## 🔐 Credentials

**Database:**
- User: `pguser`
- Password: `sisfo@1`
- Database: `pgdb`

**Users App:**
- Munir (ID: 1)
- Baru (ID: 2)

## 📊 Database Schema

### Table: items
```sql
id SERIAL PRIMARY KEY
code VARCHAR(50) UNIQUE
item_name TEXT
stock INT DEFAULT 0
location TEXT
created_at TIMESTAMP
```

### Table: transactions
```sql
id SERIAL PRIMARY KEY
item_id INT REFERENCES items(id)
transaction_type VARCHAR(10) -- 'MASUK'/'KELUAR'
quantity INT
requester TEXT
requester_role TEXT
servant TEXT
created_at TIMESTAMP
```

## 🧪 Testing

```bash
# Build
cargo build --release

# Run tests (jika ada)
cargo test

# Check
cargo check
```

## 📱 Development Workflow

- Development & testing di Codespace
- PostgreSQL always running
- Data centralized & up-to-date

## 🐛 Troubleshooting

### Connection Refused
```bash
# Pastikan port 5432 visibility = Public
docker compose restart postgres
```

### Authentication Failed
```bash
# Pastikan password URL encoded
# sisfo@1 → sisfo%401
export DATABASE_URL='postgres://pguser:sisfo%401@...'
```

## 📝 Notes

- PostgreSQL data disimpan di Docker volume `pgdata`
- Backup otomatis selama volume tidak dihapus
- Connection timeout: default 30s
- Max connections: 5

## 🆘 Support

Baca dokumentasi lengkap:
- [.env.example](./.env.example) - Konfigurasi database

## 📜 License

Personal project for PPIC inventory management.
