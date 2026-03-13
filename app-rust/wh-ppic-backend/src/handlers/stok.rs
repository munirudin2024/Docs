use axum::{extract::{Query, State}, Json};
use sqlx::PgPool;
use serde::Deserialize;
use crate::{
    errors::AppResult,
    models::stok::{StokHarian, BarangExpired},
};

#[derive(Deserialize)]
pub struct StokQuery {
    pub gudang:  Option<String>,
    pub status:  Option<String>,
}

pub async fn get_stok_harian(
    State(pool): State<PgPool>,
    Query(q): Query<StokQuery>,
) -> AppResult<Json<Vec<StokHarian>>> {
    let rows = sqlx::query_as!(
        StokHarian,
        r#"
        SELECT nama_gudang, nama_zona, kode_barang, nama_barang,
               satuan, stok_tersedia, stok_reserved, stok_quarantine,
               stok_total, stok_minimum, status_stok
        FROM vw_stok_harian
        WHERE ($1::text IS NULL OR nama_gudang = $1)
        AND ($2::text IS NULL OR status_stok = $2)
        ORDER BY nama_gudang, kode_barang
        "#,
        q.gudang,
        q.status,
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(rows))
}

pub async fn get_hampir_expired(
    State(pool): State<PgPool>,
) -> AppResult<Json<Vec<BarangExpired>>> {
    let rows = sqlx::query_as!(
        BarangExpired,
        r#"
        SELECT kode_barang, nama_barang, no_label,
               no_batch, jumlah, tanggal_expired,
               sisa_hari, kode_lokasi, nama_gudang, level_alert
        FROM vw_barang_hampir_expired
        ORDER BY sisa_hari ASC
        "#,
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(rows))
}