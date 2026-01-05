#!/bin/bash
# Test script untuk inventory app

# Login pilihan 1 (Budi)
# Menu 3 (Laporan)
# Filter 3 (Semua)
# Periode 5 (Semua)

{
    echo "1"          # Login Budi
    sleep 1
    echo "3"          # Laporan
    sleep 1
    echo "3"          # Semua Transaksi
    sleep 1
    echo "5"          # Semua periode
    sleep 2
    echo "4"          # Logout
} | docker compose exec rust /workspace/inventori/target/release/inventori
