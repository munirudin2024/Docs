use axum::{
    extract::{Path, Query, State},
    Json,
};
use sqlx::PgPool;
use serde::Deserialize;
use crate::{
    errors::AppResult,
    models::supplier::{Supplier, CreateSupplier, UpdateSupplier},
};

#[derive(Deserialize)]
pub struct SupplierQuery {
    pub search: Option<String>,
    pub kota:   Option<String>,
    pub limit:  Option<i64>,
    pub offset: Option<i64>,
}

pub async fn get_all(
    State(pool): State<PgPool>,
    Query(q): Query<SupplierQuery>,
) -> AppResult<Json<Vec<Supplier>>> {
    let rows = sqlx::query_as!(
        Supplier,
        r#"
        SELECT id_supplier, kode_supplier, nama_supplier,
               alamat, kota, email, no_telepon,
               website, contact_person, is_active, created_at
        FROM supplier
        WHERE is_active = true
        AND ($1::text IS NULL OR nama_supplier ILIKE '%' || $1 || '%'
                              OR kode_supplier ILIKE '%' || $1 || '%')
        AND ($2::text IS NULL OR kota = $2)
        ORDER BY nama_supplier
        LIMIT $3 OFFSET $4
        "#,
        q.search,
        q.kota,
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
) -> AppResult<Json<Supplier>> {
    let row = sqlx::query_as!(
        Supplier,
        r#"
        SELECT id_supplier, kode_supplier, nama_supplier,
               alamat, kota, email, no_telepon,
               website, contact_person, is_active, created_at
        FROM supplier WHERE id_supplier = $1
        "#,
        id
    )
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| crate::errors::AppError::NotFound(
        format!("Supplier id {} tidak ditemukan", id)
    ))?;

    Ok(Json(row))
}

pub async fn create(
    State(pool): State<PgPool>,
    Json(body): Json<CreateSupplier>,
) -> AppResult<Json<Supplier>> {
    let row = sqlx::query_as!(
        Supplier,
        r#"
        INSERT INTO supplier (
            kode_supplier, nama_supplier, alamat, kota,
            email, no_telepon, website, contact_person
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id_supplier, kode_supplier, nama_supplier,
                  alamat, kota, email, no_telepon,
                  website, contact_person, is_active, created_at
        "#,
        body.kode_supplier,
        body.nama_supplier,
        body.alamat,
        body.kota,
        body.email,
        body.no_telepon,
        body.website,
        body.contact_person,
    )
    .fetch_one(&pool)
    .await?;

    Ok(Json(row))
}

pub async fn update(
    State(pool): State<PgPool>,
    Path(id): Path<i32>,
    Json(body): Json<UpdateSupplier>,
) -> AppResult<Json<Supplier>> {
    let row = sqlx::query_as!(
        Supplier,
        r#"
        UPDATE supplier SET
            nama_supplier  = COALESCE($1, nama_supplier),
            alamat         = COALESCE($2, alamat),
            kota           = COALESCE($3, kota),
            email          = COALESCE($4, email),
            no_telepon     = COALESCE($5, no_telepon),
            website        = COALESCE($6, website),
            contact_person = COALESCE($7, contact_person),
            is_active      = COALESCE($8, is_active)
        WHERE id_supplier = $9
        RETURNING id_supplier, kode_supplier, nama_supplier,
                  alamat, kota, email, no_telepon,
                  website, contact_person, is_active, created_at
        "#,
        body.nama_supplier,
        body.alamat,
        body.kota,
        body.email,
        body.no_telepon,
        body.website,
        body.contact_person,
        body.is_active,
        id,
    )
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| crate::errors::AppError::NotFound(
        format!("Supplier id {} tidak ditemukan", id)
    ))?;

    Ok(Json(row))
}