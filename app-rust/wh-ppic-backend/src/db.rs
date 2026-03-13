use sqlx::{postgres::PgPoolOptions, PgPool};
use anyhow::Result;

pub async fn create_pool() -> Result<PgPool> {
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL harus diset di .env");

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .acquire_timeout(std::time::Duration::from_secs(5))
        .connect(&database_url)
        .await?;

    println!("✅ Database terkoneksi!");
    Ok(pool)
}