use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::NaiveDateTime;
use bigdecimal::BigDecimal;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Stok {
    pub id_stok:         i32,
    pub id_barang:       i32,
    pub id_gudang:       i32,
    pub id_lokasi:       i32,
    pub stok_tersedia:   Option<BigDecimal>,
    pub stok_reserved:   Option<BigDecimal>,
    pub stok_quarantine: Option<BigDecimal>,
    pub stok_total:      Option<BigDecimal>,
    pub updated_at:      Option<NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct StokHarian {
    pub nama_gudang:     Option<String>,
    pub nama_zona:       Option<String>,
    pub kode_barang:     Option<String>,
    pub nama_barang:     Option<String>,
    pub satuan:          Option<String>,
    pub stok_tersedia:   Option<BigDecimal>,
    pub stok_reserved:   Option<BigDecimal>,
    pub stok_quarantine: Option<BigDecimal>,
    pub stok_total:      Option<BigDecimal>,
    pub stok_minimum:    Option<i32>,
    pub status_stok:     Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct BarangExpired {
    pub kode_barang:     Option<String>,
    pub nama_barang:     Option<String>,
    pub no_label:        Option<i32>,
    pub no_batch:        Option<String>,
    pub jumlah:          Option<BigDecimal>,
    pub tanggal_expired: Option<chrono::NaiveDate>,
    pub sisa_hari:       Option<i32>,
    pub kode_lokasi:     Option<String>,
    pub nama_gudang:     Option<String>,
    pub level_alert:     Option<String>,
}