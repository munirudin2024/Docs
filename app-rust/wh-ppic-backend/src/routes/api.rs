use axum::{routing::get, Router};
use sqlx::PgPool;
use crate::handlers::{barang, supplier, stok};

pub fn create_router(pool: PgPool) -> Router {
    Router::new()
        // Barang
        .route("/api/barang",     get(barang::get_all).post(barang::create))
        .route("/api/barang/{id}", get(barang::get_by_id)
                                  .put(barang::update)
                                  .delete(barang::delete))
        // Supplier
        .route("/api/supplier",     get(supplier::get_all).post(supplier::create))
        .route("/api/supplier/{id}", get(supplier::get_by_id)
                                    .put(supplier::update))
        // Stok
        .route("/api/stok",          get(stok::get_stok_harian))
        .route("/api/stok/expired",  get(stok::get_hampir_expired))

        .with_state(pool)
}