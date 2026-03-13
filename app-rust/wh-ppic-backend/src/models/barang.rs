use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::NaiveDateTime;
use bigdecimal::BigDecimal;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Barang {
    pub id_barang:    i32,
    pub kode_barang:  String,
    pub nama_barang:  String,
    pub kategori:     Option<String>,
    pub satuan:       Option<String>,
    pub harga_beli:   Option<BigDecimal>,  // ← ganti f64
    pub stok_minimum: Option<i32>,
    pub is_active:    Option<bool>,
    pub created_at:   Option<NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateBarang {
    pub kode_barang:  String,
    pub nama_barang:  String,
    pub kategori:     Option<String>,
    pub satuan:       Option<String>,
    pub harga_beli:   Option<BigDecimal>,  // ← ganti f64
    pub stok_minimum: Option<i32>,
    pub id_supplier:  Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateBarang {
    pub nama_barang:  Option<String>,
    pub harga_beli:   Option<BigDecimal>,  // ← ganti f64
    pub stok_minimum: Option<i32>,
    pub is_active:    Option<bool>,
}