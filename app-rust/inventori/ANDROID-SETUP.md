# 📱 Cara Jalankan App Inventori dari HP Android

## Setup di Termux (One Time Setup)

### 1. Install Termux & proot Ubuntu (Sudah dilakukan)
```bash
# Di Termux
pkg update && pkg upgrade
pkg install proot-distro
proot-distro install ubuntu
proot-distro login ubuntu
```

### 2. Install Dependencies di Ubuntu
```bash
# Di proot Ubuntu
apt update && apt upgrade -y
apt install -y git curl build-essential pkg-config libssl-dev

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### 3. Clone Repository
```bash
cd ~
git clone https://github.com/munirudin2024/Docs.git
cd Docs/app-rust/inventori
```

## Cara Pakai Setiap Hari

### Step 1: Pastikan PostgreSQL di Codespace Jalan
1. Buka Codespace di browser PC/laptop
2. Jalankan: `docker compose up -d postgres`
3. Cek Codespace URL kamu, contoh: `sturdy-space-guacamole-xxxxxx.app.github.dev`

### Step 2: Set Database Connection di HP
Di Termux Ubuntu, masuk ke folder app:
```bash
cd ~/Docs/app-rust/inventori
```

Buat file `.env`:
```bash
nano .env
```

Isi dengan (ganti `xxxxxx` dengan Codespace URL kamu):
```
DATABASE_URL=postgres://pguser:sisfo%401@sturdy-space-guacamole-xxxxxx-5432.app.github.dev/pgdb
```

Save: `Ctrl+O`, Enter, `Ctrl+X`

### Step 3: Jalankan App
```bash
./run-from-android.sh
```

Atau manual:
```bash
export DATABASE_URL='postgres://pguser:sisfo%401@<CODESPACE_URL>-5432.app.github.dev/pgdb'
cargo run --release
```

## Cara Cari Codespace URL

### Metode 1: Via Browser
1. Buka Codespace di browser
2. Lihat URL di address bar
3. Format: `https://sturdy-space-guacamole-xxxxxx.app.github.dev`
4. Pakai hostname: `sturdy-space-guacamole-xxxxxx-5432.app.github.dev`

### Metode 2: Via GitHub CLI di Codespace
Di Codespace terminal:
```bash
gh codespace ports
```

Akan tampil list ports dan URLs.

### Metode 3: Via Settings
1. Buka repo di GitHub
2. Settings → Codespaces
3. Lihat active codespaces dan URLnya

## Troubleshooting

### Error: Connection refused
- Pastikan PostgreSQL port 5432 sudah exposed di Codespace
- Cek: `docker compose ps` di Codespace
- Pastikan port forwarding visibility = **Public** di Codespace Ports tab

### Error: Authentication failed
- Pastikan password `sisfo%401` (URL encoded dari `sisfo@1`)
- Cek file `/workspaces/Docs/secrets/pg_password.txt` isinya `sisfo@1`

### Port Forwarding di Codespace
1. Di VS Code Codespace, buka tab "Ports" (bawah)
2. Cari port 5432
3. Klik kanan → Port Visibility → **Public**

## Alternatif: SSH Tunnel (Lebih Aman)

Kalau mau lebih aman (tanpa expose port public), pakai SSH tunnel:

### Di HP (Termux Ubuntu):
```bash
# Forward port 5432 lokal ke Codespace
ssh -L 5432:localhost:5432 -N vscode@<CODESPACE_URL>

# Di terminal lain, set DATABASE_URL lokal
export DATABASE_URL='postgres://pguser:sisfo%401@localhost/pgdb'
cargo run --release
```

## Tips

1. **Auto-start PostgreSQL**: Di Codespace, tambah ke `.bashrc`:
   ```bash
   docker compose up -d postgres
   ```

2. **Simpan DATABASE_URL**: Di HP, tambah ke `~/.bashrc`:
   ```bash
   export DATABASE_URL='postgres://pguser:sisfo%401@<URL>-5432.app.github.dev/pgdb'
   ```

3. **Git Sync**: Sebelum pakai di HP, pull dulu:
   ```bash
   git pull origin main
   ```

## Keuntungan Setup Ini

✅ Data sinkron otomatis (satu database)  
✅ Bisa pakai dari HP dan PC  
✅ Tidak perlu manage 2 database terpisah  
✅ PostgreSQL production-ready di Codespace  
✅ Backup otomatis (volume Docker)
