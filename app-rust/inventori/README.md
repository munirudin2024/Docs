# 📦 Aplikasi Inventori PPIC

Aplikasi inventori berbasis CLI menggunakan Rust dan PostgreSQL untuk management barang, transaksi masuk/keluar, dan laporan.

## 🚀 Quick Start

### Di PC/Laptop (Codespace)
```bash
# Jalankan PostgreSQL
docker compose up -d postgres

# Build & Run
cd app-rust/inventori
cargo run --release
```

### 📱 Di HP Android (Termux + proot Ubuntu)
Lihat panduan lengkap di [ANDROID-SETUP.md](./ANDROID-SETUP.md)

**TL;DR:**
1. Set DATABASE_URL ke Codespace PostgreSQL:
   ```bash
   export DATABASE_URL='postgres://pguser:sisfo%401@<CODESPACE_URL>-5432.app.github.dev/pgdb'
   ```
2. Jalankan: `./run-from-android.sh`

## ✨ Fitur

- ✅ Management Item (Create, Read, Update, Delete)
- ✅ Transaksi Masuk (Purchase Order)
- ✅ Transaksi Keluar (Request)
- ✅ Laporan Real-time & Export
- ✅ Multi-user (Login system)
- ✅ Stock tracking otomatis
- ✅ History transaksi lengkap

## 🛠️ Setup Remote Database

Biar bisa akses dari HP dan PC dengan data yang sama:

### 1. Di Codespace (PC)
```bash
./setup-remote-db.sh
```

Atau manual:
1. Buka tab **PORTS** di VS Code (bawah)
2. Cari port **5432**
3. Klik kanan → **Port Visibility** → **Public**

### 2. Di HP (Termux Ubuntu)
Copy DATABASE_URL dari output `setup-remote-db.sh` atau format manual:
```bash
export DATABASE_URL='postgres://pguser:sisfo%401@<CODESPACE_NAME>-5432.app.github.dev/pgdb'
```

## 📂 File Penting

- `main.rs` - Main application code
- `.env.example` - Template konfigurasi database
- `run-from-android.sh` - Script untuk jalankan dari HP
- `setup-remote-db.sh` - Script setup remote access
- `ANDROID-SETUP.md` - Panduan lengkap setup HP Android

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

## 📱 Workflow HP + PC

1. **Di PC (Codespace):**
   - Development & testing
   - PostgreSQL always running
   - Port 5432 di-forward ke public

2. **Di HP (Termux):**
   - Connect ke PostgreSQL Codespace
   - Sama persis seperti di PC
   - Data real-time sync

3. **Keuntungan:**
   - ✅ Satu database, tidak bingung
   - ✅ Data selalu up-to-date
   - ✅ Bisa input dari mana aja
   - ✅ Backup centralized

## 🐛 Troubleshooting

### Connection Refused di HP
```bash
# Cek port forwarding di Codespace
gh codespace ports

# Pastikan port 5432 visibility = Public
# Restart PostgreSQL di Codespace
docker compose restart postgres
```

### Authentication Failed
```bash
# Pastikan password URL encoded
# sisfo@1 → sisfo%401
export DATABASE_URL='postgres://pguser:sisfo%401@...'
```

### Build Error di HP
```bash
# Install dependencies
apt install -y build-essential pkg-config libssl-dev

# Update Rust
rustup update
```

## 📝 Notes

- PostgreSQL data disimpan di Docker volume `pgdata`
- Backup otomatis selama volume tidak dihapus
- Connection timeout: default 30s
- Max connections: 5

## 🆘 Support

Baca dokumentasi lengkap:
- [ANDROID-SETUP.md](./ANDROID-SETUP.md) - Setup HP Android
- [.env.example](./.env.example) - Konfigurasi database

## 📜 License

Personal project for PPIC inventory management.
