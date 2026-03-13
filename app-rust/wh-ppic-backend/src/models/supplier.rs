use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::NaiveDateTime;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Supplier {
    pub id_supplier:    i32,
    pub kode_supplier:  String,
    pub nama_supplier:  String,
    pub alamat:         Option<String>,
    pub kota:           Option<String>,
    pub email:          Option<String>,
    pub no_telepon:     Option<String>,
    pub website:        Option<String>,
    pub contact_person: Option<String>,
    pub is_active:      Option<bool>,
    pub created_at:     Option<NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateSupplier {
    pub kode_supplier:  String,
    pub nama_supplier:  String,
    pub alamat:         Option<String>,
    pub kota:           Option<String>,
    pub email:          Option<String>,
    pub no_telepon:     Option<String>,
    pub website:        Option<String>,
    pub contact_person: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateSupplier {
    pub nama_supplier:  Option<String>,
    pub alamat:         Option<String>,
    pub kota:           Option<String>,
    pub email:          Option<String>,
    pub no_telepon:     Option<String>,
    pub website:        Option<String>,
    pub contact_person: Option<String>,
    pub is_active:      Option<bool>,
}