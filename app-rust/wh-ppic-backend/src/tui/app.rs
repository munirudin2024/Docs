use sqlx::PgPool;
use crate::models::stok::StokHarian;

pub enum ActiveTab {
    Stok,
    Barang,
    Expired,
}

pub struct App {
    pub pool:        PgPool,
    pub active_tab:  ActiveTab,
    pub stok_data:   Vec<StokHarian>,
    pub selected:    usize,
    pub should_quit: bool,
    pub status_msg:  String,
}

impl App {
    pub fn new(pool: PgPool) -> Self {
        Self {
            pool,
            active_tab:  ActiveTab::Stok,
            stok_data:   vec![],
            selected:    0,
            should_quit: false,
            status_msg:  "Tekan 'q' untuk keluar | Tab: ganti menu | r: refresh".to_string(),
        }
    }

    pub async fn load_stok(&mut self) {
        match sqlx::query_as!(
            StokHarian,
            r#"
            SELECT nama_gudang, nama_zona, kode_barang, nama_barang,
                   satuan, stok_tersedia, stok_reserved, stok_quarantine,
                   stok_total, stok_minimum, status_stok
            FROM vw_stok_harian
            ORDER BY nama_gudang, kode_barang
            "#,
        )
        .fetch_all(&self.pool)
        .await
        {
            Ok(data) => {
                self.stok_data = data;
                self.status_msg = format!(
                    "{} item | q: keluar | Tab: menu | r: refresh",
                    self.stok_data.len()
                );
            }
            Err(e) => {
                self.status_msg = format!("Error load stok: {}", e);
            }
        }
    }

    pub fn next(&mut self) {
        if !self.stok_data.is_empty() {
            self.selected = (self.selected + 1) % self.stok_data.len();
        }
    }

    pub fn prev(&mut self) {
        if !self.stok_data.is_empty() {
            if self.selected == 0 {
                self.selected = self.stok_data.len() - 1;
            } else {
                self.selected -= 1;
            }
        }
    }
}