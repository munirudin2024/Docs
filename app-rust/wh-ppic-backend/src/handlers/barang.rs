use axum::{
    extract::{Path, Query, State},
    Json,
};
use sqlx::PgPool;
use serde::Deserialize;
use crate::{
    errors::AppResult,
    models::barang::{Barang, CreateBarang, UpdateBarang},
};

#[derive(Deserialize)]
pub struct BarangQuery {
    pub kategori: Option<String>,
    pub search:   Option<String>,
    pub limit:    Option<i64>,
    pub offset:   Option<i64>,
}

pub async fn get_all(
    State(pool): State<PgPool>,
    Query(q): Query<BarangQuery>,
) -> AppResult<Json<Vec<Barang>>> {
    let rows = sqlx::query_as!(
        Barang,
        r#"
        SELECT id_barang, kode_barang, nama_barang,
               kategori, satuan, harga_beli,
               stok_minimum, is_active, created_at
        FROM barang
        WHERE is_active = true
        AND ($1::text IS NULL OR kategori = $1)
        AND ($2::text IS NULL OR nama_barang ILIKE '%' || $2 || '%'
                              OR kode_barang ILIKE '%' || $2 || '%')
        ORDER BY kode_barang
        LIMIT $3 OFFSET $4
        "#,
        q.kategori,
        q.search,
        q.limit.unwrap_or(50),
        q.offset.unwrap_or(0),
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(rows))
}

pub async fn get_by_id(
    State(pool): State<PgPool>,
    Path(id): Path<i32>,
) -> AppResult<Json<Barang>> {
    let row = sqlx::query_as!(
        Barang,
        r#"
        SELECT id_barang, kode_barang, nama_barang,
               kategori, satuan, harga_beli,
               stok_minimum, is_active, created_at
        FROM barang WHERE id_barang = $1
        "#,
        id
    )
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| crate::errors::AppError::NotFound(
        format!("Barang id {} tidak ditemukan", id)
    ))?;

    Ok(Json(row))
}

pub async fn create(
    State(pool): State<PgPool>,
    Json(body): Json<CreateBarang>,
) -> AppResult<Json<Barang>> {
    let row = sqlx::query_as!(
        Barang,
        r#"
        INSERT INTO barang (
            kode_barang, nama_barang, kategori,
            satuan, harga_beli, stok_minimum, id_supplier
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id_barang, kode_barang, nama_barang,
                  kategori, satuan, harga_beli,
                  stok_minimum, is_active, created_at
        "#,
        body.kode_barang,
        body.nama_barang,
        body.kategori,
        body.satuan,
        body.harga_beli,
        body.stok_minimum,
        body.id_supplier,
    )
    .fetch_one(&pool)
    .await?;

    Ok(Json(row))
}

pub async fn update(
    State(pool): State<PgPool>,
    Path(id): Path<i32>,
    Json(body): Json<UpdateBarang>,
) -> AppResult<Json<Barang>> {
    let row = sqlx::query_as!(
        Barang,
        r#"
        UPDATE barang SET
            nama_barang  = COALESCE($1, nama_barang),
            harga_beli   = COALESCE($2, harga_beli),
            stok_minimum = COALESCE($3, stok_minimum),
            is_active    = COALESCE($4, is_active)
        WHERE id_barang = $5
        RETURNING id_barang, kode_barang, nama_barang,
                  kategori, satuan, harga_beli,
                  stok_minimum, is_active, created_at
        "#,
        body.nama_barang,
        body.harga_beli,
        body.stok_minimum,
        body.is_active,
        id,
    )
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| crate::errors::AppError::NotFound(
        format!("Barang id {} tidak ditemukan", id)
    ))?;

    Ok(Json(row))
}

pub async fn delete(
    State(pool): State<PgPool>,
    Path(id): Path<i32>,
) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!(
        "UPDATE barang SET is_active = false WHERE id_barang = $1",
        id
    )
    .execute(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "message": "Barang berhasil dinonaktifkan",
        "id": id
    })))
}