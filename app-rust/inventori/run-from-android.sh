#!/bin/bash
# Script untuk jalankan app inventori dari HP Android (Termux + proot Ubuntu)
# 
# Prerequisites:
# 1. Clone repo: git clone https://github.com/munirudin2024/Docs.git
# 2. Install Rust di Termux Ubuntu: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# 3. Set DATABASE_URL yang point ke Codespace PostgreSQL

set -e

echo "🚀 Inventori App - Android Runner"
echo "=================================="

# Cek apakah DATABASE_URL sudah diset
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL belum diset!"
    echo ""
    echo "📝 Cara set DATABASE_URL:"
    echo "1. Buka Codespace kamu di browser"
    echo "2. Lihat URL Codespace, contoh: sturdy-space-guacamole-xxxxxx.app.github.dev"
    echo "3. Export DATABASE_URL dengan format:"
    echo "   export DATABASE_URL='postgres://pguser:sisfo%401@<CODESPACE_NAME>-5432.app.github.dev/pgdb'"
    echo ""
    echo "Contoh lengkap:"
    echo "   export DATABASE_URL='postgres://pguser:sisfo%401@sturdy-space-guacamole-xxxxxx-5432.app.github.dev/pgdb'"
    echo ""
    echo "Atau buat file .env dan isi dengan DATABASE_URL di atas"
    exit 1
fi

echo "✅ DATABASE_URL: $DATABASE_URL"
echo ""

# Load .env jika ada
if [ -f .env ]; then
    echo "📄 Loading .env file..."
    export $(cat .env | xargs)
fi

echo "🔨 Building app..."
cargo build --release

echo ""
echo "▶️  Running app..."
cargo run --release
