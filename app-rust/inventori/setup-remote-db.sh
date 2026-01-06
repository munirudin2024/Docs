#!/bin/bash
# Quick setup untuk expose port PostgreSQL ke public di Codespace

echo "🔧 Setting up PostgreSQL for remote access..."

# Start PostgreSQL
docker compose up -d postgres

echo "✅ PostgreSQL started and port 5432 exposed"
echo ""
echo "📝 Next steps untuk akses dari HP:"
echo "1. Di VS Code, buka tab 'PORTS' (di bawah)"
echo "2. Cari port 5432"
echo "3. Klik kanan → 'Port Visibility' → 'Public'"
echo ""
echo "🔗 Codespace URL kamu:"
gh codespace list --limit 1 | tail -1 | awk '{print $3}'
echo ""
echo "📱 Set di HP (Termux Ubuntu):"
CODESPACE_URL=$(gh codespace list --limit 1 | tail -1 | awk '{print $3}' | sed 's/https:\/\///')
echo "export DATABASE_URL='postgres://pguser:sisfo%401@${CODESPACE_URL}-5432.app.github.dev/pgdb'"
