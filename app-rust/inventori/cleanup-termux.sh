#!/bin/bash
# Cleanup script untuk Termux & Proot Ubuntu
# Jalankan ini di Termux (bukan di proot!)

echo "=== TERMUX CLEANUP ==="

# Package yang TIDAK PERLU (contoh, sesuaikan dengan kondisi kamu)
UNNECESSARY=(
    "postgresql"
    "docker"
    "nodejs-lts"
    "python"
)

echo "Package yang akan dihapus dari Termux:"
for pkg in "${UNNECESSARY[@]}"; do
    if pkg list-installed | grep -q "^$pkg"; then
        echo "  - $pkg"
    fi
done

read -p "Lanjut hapus? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    for pkg in "${UNNECESSARY[@]}"; do
        pkg uninstall -y "$pkg" 2>/dev/null
    done
    pkg clean
    echo "✓ Termux cleaned!"
fi

echo ""
echo "=== UBUNTU CLEANUP ==="
echo "Jalankan command ini di dalam proot Ubuntu:"
echo ""
echo "proot-distro login ubuntu"
echo "apt remove postgresql postgresql-* --purge -y"
echo "apt autoremove -y"
echo "apt clean"
echo ""
echo "=== STORAGE INFO ==="
du -sh $PREFIX 2>/dev/null || du -sh /data/data/com.termux
