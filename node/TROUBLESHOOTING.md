# 🔧 Troubleshooting Guide

## ❌ Login Gagal

### Solusi 1: Update Password Admin
Jika mendapat error "Username atau password salah", password admin perlu di-generate ulang:

```bash
# 1. Generate bcrypt hash untuk password "admin123"
cd /workspaces/Docs/node/inventori-be
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10, (err, hash) => console.log(hash));"

# 2. Copy hash yang muncul (contoh: $2b$10$Qm4AKJ...)
# 3. Update ke database
docker exec postgres_pgdb psql -U pguser -d pgdb -c "UPDATE users SET password = '\$2b\$10\$HASH_ANDA_DISINI' WHERE username = 'admin';"

# 4. Verifikasi
docker exec postgres_pgdb psql -U pguser -d pgdb -c "SELECT username, role FROM users WHERE username = 'admin';"
```

### Solusi 2: Cek Backend Connection
```bash
# Cek apakah backend running
curl http://localhost:3001

# Jika tidak respond, restart backend
cd /workspaces/Docs/node/inventori-be
npm run dev
```

### Solusi 3: Cek Database Connection
```bash
# Verifikasi PostgreSQL container running
docker ps | grep postgres

# Test connection ke database
docker exec postgres_pgdb psql -U pguser -d pgdb -c "SELECT current_database();"

# Cek file .env di backend
cat node/inventori-be/.env
# DATABASE_URL harus: postgres://pguser:sisfo%401@localhost:5432/pgdb
```

## ❌ Port Already in Use

### Error: `EADDRINUSE: address already in use :::3001`

```bash
# Kill process di port 3001
lsof -ti:3001 | xargs kill -9

# Atau gunakan fuser
fuser -k 3001/tcp

# Restart backend
cd /workspaces/Docs/node/inventori-be
npm run dev
```

## ❌ Database Connection Error

### Error: `ENOTFOUND postgres_pgdb`

Update file `.env` di backend:
```bash
cd /workspaces/Docs/node/inventori-be
nano .env
```

Ganti `DATABASE_URL` menjadi:
```
DATABASE_URL=postgres://pguser:sisfo%401@localhost:5432/pgdb
```

### Error: `password authentication failed`

```bash
# Cek password database
cat /workspaces/Docs/secrets/pg_password.txt

# Update .env dengan password yang benar (URL encoded)
# sisfo@1 → sisfo%401
```

## ❌ Frontend Cannot Connect to Backend

### Error: Network Error / CORS

1. Cek apakah backend running:
```bash
curl http://localhost:3001
```

2. Cek konfigurasi API URL di frontend:
```bash
cat node/inventori-fe/src/lib/axios.ts
# Harus: http://localhost:3001/api
```

3. Restart frontend setelah perubahan:
```bash
cd /workspaces/Docs/node/inventori-fe
pkill -f "node.*vite"
npm run dev
```

## ❌ Migration Failed

### Error: `column already exists`

Gunakan `migration.sql` bukan `schema.sql`:
```bash
docker exec -i postgres_pgdb psql -U pguser -d pgdb < node/inventori-be/database/migration.sql
```

Migration script menggunakan `ADD COLUMN IF NOT EXISTS` yang aman untuk database yang sudah ada.

## 🔍 Debug Commands

### Cek Status Semua Services
```bash
# Backend
curl http://localhost:3001

# Frontend
curl http://localhost:5173

# Database
docker exec postgres_pgdb psql -U pguser -d pgdb -c "SELECT version();"

# Cek process running
ps aux | grep -E "ts-node|vite|postgres"
```

### Cek Data di Database
```bash
# Cek users
docker exec postgres_pgdb psql -U pguser -d pgdb -c "SELECT id, username, role FROM users;"

# Cek items
docker exec postgres_pgdb psql -U pguser -d pgdb -c "SELECT kode_barang, nama_barang, qty FROM items LIMIT 5;"

# Cek transactions
docker exec postgres_pgdb psql -U pguser -d pgdb -c "SELECT id, type, created_at FROM transactions ORDER BY created_at DESC LIMIT 5;"
```

### Test API dengan curl
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get items (dengan token)
TOKEN="YOUR_TOKEN_HERE"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/items
```

## 📝 Logs Location

- Backend log: `/tmp/backend.log` (jika running dengan nohup)
- Frontend: Terminal output (Vite dev server)
- Database: `docker logs postgres_pgdb`

## 🆘 Still Having Issues?

1. Restart semua services:
```bash
# Stop all
pkill -f "ts-node"
pkill -f "node.*vite"

# Start backend
cd /workspaces/Docs/node/inventori-be
nohup npm run dev > /tmp/backend.log 2>&1 &

# Start frontend
cd /workspaces/Docs/node/inventori-fe
npm run dev
```

2. Check logs:
```bash
tail -50 /tmp/backend.log
docker logs postgres_pgdb --tail 50
```

3. Verify environment:
```bash
cat node/inventori-be/.env
cat node/inventori-fe/src/lib/axios.ts
```
