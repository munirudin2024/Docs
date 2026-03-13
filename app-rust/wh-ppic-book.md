# Jalankan TUI dashboard ==============================================
cargo run -- --tui
------------------
↑↓ atau j/k     — navigasi baris
Tab             — ganti menu
r               — refresh data
q               — keluar
# Atau API server =====================================================
cargo run -- --api
# Test API ============================================================
# Test get semua barang
curl http://localhost:8080/api/barang | python3 -m json.tool
# Test get supplier
curl http://localhost:8080/api/supplier | python3 -m json.tool
# Test stok harian
curl http://localhost:8080/api/stok | python3 -m json.tool
# Test barang hampir expired
curl http://localhost:8080/api/stok/expired | python3 -m json.tool

#  test create barang =================================================
curl -X POST http://localhost:8080/api/barang \
  -H "Content-Type: application/json" \
  -d '{
    "kode_barang": "ADT-001",
    "nama_barang": "Tepung Tapioka",
    "kategori": "RAW",
    "satuan": "KG",
    "harga_beli": 15000,
    "stok_minimum": 100
  }' | python3 -m json.tool