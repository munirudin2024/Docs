# 🚀 Quick Reference - Sistem Inventori Web

## Status Services

```bash
# Cek semua services
ps aux | grep -E "ts-node|vite" | grep -v grep
docker ps | grep postgres

# Cek endpoint
curl http://localhost:3001  # Backend
curl http://localhost:5173  # Frontend
```

## Start/Stop Services

### Backend (Port 3001)
```bash
# Start
cd /workspaces/Docs/node/inventori-be
npm run dev

# Start di background
nohup npm run dev > /tmp/backend.log 2>&1 &

# Stop
pkill -f "ts-node src/index.ts"
```

### Frontend (Port 5173)
```bash
# Start
cd /workspaces/Docs/node/inventori-fe
npm run dev

# Stop
pkill -f "node.*vite"
```

### Database
```bash
# Start container
docker start postgres_pgdb

# Stop container
docker stop postgres_pgdb

# Access psql
docker exec -it postgres_pgdb psql -U pguser -d pgdb
```

## Login Credentials

| Username | Password  | Role    |
|----------|-----------|---------|
| admin    | admin123  | admin   |
| munir    | (check db)| admin   |
| testuser | (check db)| petugas |

## API Testing

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get Items (dengan auth)
```bash
TOKEN="paste_token_disini"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/items
```

### Get Transactions
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/transactions?limit=10"
```

### Create Transaction IN
```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item_id": 1,
    "type": "IN",
    "quantity": 10,
    "po_number": "PO-2026-001",
    "notes": "Test dari API"
  }'
```

## Database Quick Commands

```bash
# Cek items
docker exec postgres_pgdb psql -U pguser -d pgdb -c \
  "SELECT kode_barang, nama_barang, qty FROM items LIMIT 5;"

# Cek transactions hari ini
docker exec postgres_pgdb psql -U pguser -d pgdb -c \
  "SELECT t.id, t.type, i.kode_barang, t.quantity, t.created_at 
   FROM transactions t 
   JOIN items i ON t.item_id = i.id 
   WHERE t.created_at::date = CURRENT_DATE 
   ORDER BY t.created_at DESC;"

# Cek users
docker exec postgres_pgdb psql -U pguser -d pgdb -c \
  "SELECT id, username, nama_lengkap, role FROM users;"

# Update password user
docker exec postgres_pgdb psql -U pguser -d pgdb -c \
  "UPDATE users SET password = 'NEW_BCRYPT_HASH' WHERE username = 'admin';"
```

## File Locations

```
/workspaces/Docs/node/
├── inventori-be/          # Backend Express
│   ├── src/
│   │   ├── index.ts       # Entry point
│   │   ├── config/        # Database config
│   │   ├── controllers/   # Business logic
│   │   ├── routes/        # API routes
│   │   └── middleware/    # Auth, etc
│   ├── .env               # Environment vars
│   └── database/
│       ├── schema.sql     # Fresh install
│       └── migration.sql  # Safe migration
│
├── inventori-fe/          # Frontend React
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── services/      # API calls
│   │   ├── components/    # UI components
│   │   └── lib/axios.ts   # API config
│   └── package.json
│
└── README.md              # Main documentation
```

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Login gagal | `node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10, (err, hash) => console.log(hash));"` lalu update password di DB |
| Port 3001 in use | `lsof -ti:3001 \| xargs kill -9` |
| Database not found | `docker exec -i postgres_pgdb psql -U pguser -d pgdb < node/inventori-be/database/migration.sql` |
| Frontend 404 | Cek `src/lib/axios.ts` → harus `http://localhost:3001/api` |
| CORS error | Restart backend, pastikan `cors()` middleware aktif |

## URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001 (health check)

## Integration Test

```bash
# Full integration test
cd /workspaces/Docs/node

# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

echo "Token: ${TOKEN:0:30}..."

# 2. Get items count
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/items | jq 'length'

# 3. Get transactions
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/transactions?limit=3" | jq '.[].type'

# 4. Get statistics
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/transactions/statistics | jq .
```

## Monitoring

```bash
# Watch backend log
tail -f /tmp/backend.log

# Watch database activity
docker logs -f postgres_pgdb

# Monitor port usage
lsof -i :3001
lsof -i :5173
lsof -i :5432
```

## Backup & Restore

```bash
# Backup database
docker exec postgres_pgdb pg_dump -U pguser pgdb > backup_$(date +%Y%m%d).sql

# Restore database
docker exec -i postgres_pgdb psql -U pguser -d pgdb < backup_20260109.sql
```

---

**Tip**: Bookmark halaman ini untuk akses cepat command-command yang sering digunakan!
