use sqlx::postgres::PgPoolOptions;
use std::io::{self, Write};
use std::fs;
use std::path::Path;
use std::env;
use std::collections::HashSet;
use chrono::{Local, Duration, NaiveDateTime, Utc, TimeZone};
use chrono::Datelike;
use tabled::{Table, Tabled};

const BANNER_WIDTH: usize = 34;

// ANSI styles
const RESET: &str = "\x1b[0m";
const BOLD: &str = "\x1b[1m";
const DIM: &str = "\x1b[2m";
const FG_BLUE: &str = "\x1b[34m";
const FG_CYAN: &str = "\x1b[36m";
const FG_YELLOW: &str = "\x1b[33m";
const FG_GREEN: &str = "\x1b[32m";
const FG_RED: &str = "\x1b[31m";
const FG_WHITE: &str = "\x1b[37m";

struct Theme {
    success: &'static str,
    error: &'static str,
    info: &'static str,
}

fn get_theme() -> Theme {
    match std::env::var("APP_THEME").unwrap_or_else(|_| "dark".to_string()).to_lowercase().as_str() {
        "light" => Theme {
            success: FG_GREEN,
            error: FG_RED,
            info: FG_CYAN,
        },
        _ => Theme { // dark
            success: FG_GREEN,
            error: FG_RED,
            info: FG_CYAN,
        },
    }
}

fn get_width(default: usize) -> usize {
    if let Ok(v) = std::env::var("APP_WIDTH") {
        if let Ok(n) = v.parse::<usize>() { return n.max(10); }
    }
    default
}

fn clear_screen() {
    // ANSI clear screen and move cursor home
    print!("\x1B[2J\x1B[H");
    io::stdout().flush().ok();
}

// Define structs
#[derive(Tabled, Clone)]
struct TransactionRow {
    id: i32,
    code: String,
    item_name: String,
    t_type: String,
    quantity: i32,
    stock: i32,
    #[tabled(rename = "requester/po")]
    requester: String,
    requester_role: String,
    servant: String,
    location: String,
    created_at: String,
}

#[derive(Clone)]
struct User {
    name: String,
}

// Predefined users (semua petugas inventori)
fn get_users() -> Vec<User> {
    vec![
        User { name: "munir".to_string() },
        User { name: "munirudin".to_string() },
    ]
}

fn truncate_to_width(value: &str, max_chars: usize) -> String {
    value.chars().take(max_chars).collect()
}

fn unix_epoch_naive() -> NaiveDateTime {
    Utc.timestamp_opt(0, 0).single().unwrap().naive_utc()
}

fn pallet_coords(pallet_no: i32) -> (i32, i32) {
    let n = pallet_no.clamp(1, 400);
    let row = (n - 1) / 20 + 1;
    let col = (n - 1) % 20 + 1;
    (row, col)
}

fn print_center_line_colored(text: &str, inner_width: usize, color: &str, extra: &str) {
    let safe = truncate_to_width(text, inner_width);
    let padding = inner_width.saturating_sub(safe.chars().count());
    let pad_left = padding / 2;
    let pad_right = padding - pad_left;
    println!(
        "║{}{}{}{}{}{}║",
        " ".repeat(pad_left),
        extra,
        color,
        safe,
        RESET,
        " ".repeat(pad_right)
    );
}

fn print_menu_combined(title: &str, subtitle: &str, section: &str, options: &[&str], width: usize) {
    let inner = width.saturating_sub(2);
    let border = "═".repeat(inner);
    // Top border
    println!("\n{}{}╔{}╗{}", BOLD, FG_BLUE, border, RESET);
    // Title + subtitle centered
    print_center_line_colored(title, inner, FG_CYAN, BOLD);
    print_center_line_colored(subtitle, inner, FG_YELLOW, "");
    // Section divider and centered section title (e.g., MENU)
    println!("{}{}╠{}╣{}", BOLD, FG_BLUE, border, RESET);
    print_center_line_colored(section, inner, FG_CYAN, BOLD);
    // Options left-aligned
    for opt in options {
        let safe = truncate_to_width(opt, inner);
        let padding = inner.saturating_sub(safe.chars().count());
        println!("║{}{}{}{}║", FG_WHITE, safe, RESET, " ".repeat(padding));
    }
    // Bottom border
    println!("{}{}╚{}╝{}", BOLD, FG_BLUE, border, RESET);
}

fn print_success(theme: &Theme, msg: &str) {
    println!("{}{}{} {}{}", BOLD, theme.success, "✅", msg, RESET);
}

fn print_error(theme: &Theme, msg: &str) {
    println!("{}{}{} {}{}", BOLD, theme.error, "❌", msg, RESET);
}

fn print_info(theme: &Theme, msg: &str) {
    println!("{}{}{}{}", DIM, theme.info, msg, RESET);
}

fn prompt(label: &str) -> io::Result<()> {
    print!("{}{}▶ {}{}", BOLD, FG_YELLOW, label, RESET);
    io::stdout().flush()
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Get database URL from environment variable or use default (for Docker network)
    let db_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://pguser:sisfo%401@postgres_pgdb/pgdb".to_string());
    
    println!("{}{}menghubungi database...{}", DIM, FG_CYAN, RESET);
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .map_err(|e| {
            eprintln!("{}{}❌ Database connection failed: {}{}", BOLD, FG_RED, e, RESET);
            eprintln!("{}{}💡 Tip: Set DATABASE_URL untuk remote connection{}", DIM, FG_YELLOW, RESET);
            e
        })?;
    
    println!("{}{}terhubung ke database!{}", BOLD, FG_GREEN, RESET);

    // Create tables
    init_database(&pool).await?;

    // Login
    let current_user = login()?;
    println!("✅ Login berhasil,sebagai Petugas Inventori: {}", current_user.name);

    loop {
        let theme = get_theme();
        let width = get_width(BANNER_WIDTH);
        clear_screen();
        // Menu 4 langkah yang ringkas
        let subtitle = format!("Petugas: {}", current_user.name);
        print_menu_combined(
            "SISTEM PPIC",
            &subtitle,
            "MENU",
            &["1) Transaksi (IN/OUT)", "2) Stok & Opname", "3) Laporan", "4) Daftar Semua Item", "5) Keluar"],
            width,
        );

        prompt("Pilih menu (1-4): ")?;

        let mut choice = String::new();
        io::stdin().read_line(&mut choice)?;

        match choice.trim() {
            "1" => menu_transaksi(&pool, &current_user).await?,
            "2" => menu_stok_opname(&pool, &current_user).await?,
            "3" => menu_laporan(&pool, &current_user).await?,
            "4" => list_all_items(&pool).await?,
            "5" => {
                println!("\nTerima kasih telah menggunakan sistem ini!");
                break;
            }
            _ => print_error(&theme, "Pilihan tidak valid!"),
        }
    }

    Ok(())
}

// Menu untuk menampilkan semua item di database
async fn list_all_items(pool: &sqlx::PgPool) -> Result<(), Box<dyn std::error::Error>> {
    clear_screen();
    let theme = get_theme();
    println!("{}{}DAFTAR SEMUA ITEM DI DATABASE:{}", BOLD, FG_CYAN, RESET);
    let items: Vec<(Option<String>, Option<String>, Option<i32>)> = sqlx::query_as(
        "SELECT code, name, stock FROM items ORDER BY code"
    )
    .fetch_all(pool)
    .await?;
    if items.is_empty() {
        println!("{}{}Tidak ada item di database.{}", BOLD, FG_YELLOW, RESET);
    } else {
        println!("{:<10} {:<30} {:>8}", "Kode", "Nama", "Stok");
        for (code, name, stock) in items {
            let code = code.unwrap_or_else(|| "".to_string());
            let name = name.unwrap_or_else(|| "".to_string());
            let stock = stock.unwrap_or(0);
            println!("{:<10} {:<30} {:>8}", code, name, stock);
        }
    }
    prompt("Tekan Enter untuk kembali...")?;
    let mut _dummy = String::new();
    io::stdin().read_line(&mut _dummy).ok();
    Ok(())
}

async fn init_database(pool: &sqlx::PgPool) -> Result<(), sqlx::Error> {
    let theme = get_theme();
    // Users table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL
        )"
    ).execute(pool).await?;

    // Items table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS items (
            id SERIAL PRIMARY KEY,
            code TEXT UNIQUE,
            name TEXT UNIQUE NOT NULL,
            stock INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )"
    ).execute(pool).await?;

    // Add code column if not exists (migration)
    sqlx::query(
        "ALTER TABLE items ADD COLUMN IF NOT EXISTS code TEXT UNIQUE"
    ).execute(pool).await?;

    // Transactions table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            code TEXT,
            item_id INTEGER,
            type TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            stock_after INTEGER NOT NULL,
            requester TEXT NOT NULL,
            requester_role TEXT NOT NULL,
            servant TEXT NOT NULL,
            location TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )"
    ).execute(pool).await?;

    // Add missing columns to transactions if not exists (migration)
    sqlx::query("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS code TEXT").execute(pool).await?;
    sqlx::query("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS item_id INTEGER").execute(pool).await?;
    sqlx::query("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS requester_role TEXT").execute(pool).await?;
    sqlx::query("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS location TEXT").execute(pool).await?;
    sqlx::query("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS stock_after INTEGER DEFAULT 0").execute(pool).await?;
    sqlx::query("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS servant TEXT").execute(pool).await?;
    
        // Ensure created_at has default and not null
        sqlx::query("ALTER TABLE transactions ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP").execute(pool).await.ok();
        sqlx::query("UPDATE transactions SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL").execute(pool).await.ok();
    
        // Verify data
        let (trans_count,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM transactions").fetch_one(pool).await?;
        let (items_count,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM items").fetch_one(pool).await?;
        print_info(&theme, &format!("memeriksa Database: {} transaksi, {} barang", trans_count, items_count));

    // Stock opname log table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS stock_opname (
            id SERIAL PRIMARY KEY,
            warehouse TEXT NOT NULL,
            item_id INTEGER,
            code TEXT,
            item_name TEXT,
            location TEXT,
            pallet_no INTEGER,
            expected_qty INTEGER,
            counted_qty INTEGER,
            diff INTEGER,
            checked_by TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )"
    ).execute(pool).await?;

    // Add pallet_no column if not exists (migration)
    sqlx::query("ALTER TABLE stock_opname ADD COLUMN IF NOT EXISTS pallet_no INTEGER").execute(pool).await?;

    // Pallet registry per gudang (20x20 grid, nomor 1..400)
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS pallets (
            id SERIAL PRIMARY KEY,
            warehouse TEXT NOT NULL,
            pallet_no INTEGER NOT NULL,
            description TEXT,
            last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_seen_by TEXT,
            UNIQUE(warehouse, pallet_no)
        )"
    ).execute(pool).await?;

    Ok(())
}

// ==================== AUTO-SUGGEST ITEM ====================
async fn search_items(pool: &sqlx::PgPool, keyword: &str) -> Result<Vec<(String, String, i32)>, sqlx::Error> {
    let pattern = format!("%{}%", keyword.to_uppercase());
    let items: Vec<(String, String, i32)> = sqlx::query_as(
        "SELECT code, COALESCE(name,''), COALESCE(stock,0) FROM items 
         WHERE code ILIKE $1 OR name ILIKE $1 
         ORDER BY code LIMIT 10"
    )
    .bind(&pattern)
    .fetch_all(pool)
    .await?;
    Ok(items)
}

async fn select_or_create_item(pool: &sqlx::PgPool) -> Result<Option<(String, String, i32)>, Box<dyn std::error::Error>> {
    prompt("Kode item (ketik untuk cari): ")?;
    let mut input = String::new();
    io::stdin().read_line(&mut input)?;
    let keyword = input.trim().to_uppercase();
    
    if keyword.is_empty() {
        return Ok(None);
    }

    // Cari item yang cocok
    let matches = search_items(pool, &keyword).await?;
    
    if matches.is_empty() {
        // Item baru
        println!("{}{}Item baru. Masukkan nama:{}", DIM, FG_YELLOW, RESET);
        prompt("Nama item: ")?;
        let mut name = String::new();
        io::stdin().read_line(&mut name)?;
        let name = name.trim().to_string();
        
        // Insert item baru
        sqlx::query("INSERT INTO items (code, name, stock) VALUES ($1, $2, 0) ON CONFLICT (code) DO NOTHING")
            .bind(&keyword)
            .bind(&name)
            .execute(pool)
            .await?;
        
        return Ok(Some((keyword, name, 0)));
    }
    
    // Tampilkan pilihan
    println!("\n{}{}Hasil pencarian:{}", BOLD, FG_CYAN, RESET);
    for (i, (code, name, stock)) in matches.iter().enumerate() {
        println!("  {}) {} - {} (stok: {})", i + 1, code, name, stock);
    }
    println!("  0) Input item baru");
    
    prompt("Pilih (0-{}): ")?;
    let mut choice = String::new();
    io::stdin().read_line(&mut choice)?;
    
    match choice.trim().parse::<usize>() {
        Ok(0) => {
            // Input item baru
            prompt("Kode item baru: ")?;
            let mut new_code = String::new();
            io::stdin().read_line(&mut new_code)?;
            let new_code = new_code.trim().to_uppercase();
            
            prompt("Nama item: ")?;
            let mut name = String::new();
            io::stdin().read_line(&mut name)?;
            let name = name.trim().to_string();
            
            sqlx::query("INSERT INTO items (code, name, stock) VALUES ($1, $2, 0) ON CONFLICT (code) DO NOTHING")
                .bind(&new_code)
                .bind(&name)
                .execute(pool)
                .await?;
            
            Ok(Some((new_code, name, 0)))
        }
        Ok(n) if n >= 1 && n <= matches.len() => {
            Ok(Some(matches[n - 1].clone()))
        }
        _ => Ok(None)
    }
}

// ==================== FIFO INFO ====================
async fn show_fifo_info(pool: &sqlx::PgPool, item_id: i32) {
    let fifo_rows: Result<Vec<(Option<NaiveDateTime>, Option<i32>, Option<String>)>, _> = sqlx::query_as(
        "SELECT created_at, quantity, requester
         FROM transactions
         WHERE item_id = $1 AND type = 'IN'
         ORDER BY created_at ASC
         LIMIT 5"
    )
    .bind(item_id)
    .fetch_all(pool)
    .await;

    if let Ok(rows) = fifo_rows {
        if !rows.is_empty() {
            println!("\n{}{}📦 FIFO - Gunakan batch tertua dulu:{}", BOLD, FG_GREEN, RESET);
            for (i, (ts, qty, req)) in rows.iter().enumerate() {
                let ts_str = ts.map(|t| t.format("%Y-%m-%d").to_string()).unwrap_or("-".to_string());
                let qty_val = qty.unwrap_or(0);
                let req_str = req.as_deref().unwrap_or("-");
                let marker = if i == 0 { " ← PRIORITAS" } else { "" };
                println!("   {} | qty: {:>4} | PO: {}{}", ts_str, qty_val, req_str, marker);
            }
        }
    }
}

// ==================== MENU 1: TRANSAKSI ====================
async fn menu_transaksi(
    pool: &sqlx::PgPool,
    current_user: &User,
) -> Result<(), Box<dyn std::error::Error>> {
    clear_screen();
    let _theme = get_theme();
    let width = get_width(BANNER_WIDTH);
    let subtitle = format!("Petugas: {}", current_user.name);
    print_menu_combined("SISTEM PPIC", &subtitle, "TRANSAKSI", 
        &["1) Barang Masuk (IN)", "2) Barang Keluar (OUT)", "0) Kembali"], width);
    
    prompt("Pilih: ")?;
    let mut choice = String::new();
    io::stdin().read_line(&mut choice)?;
    
    match choice.trim() {
        "1" => input_transaction_v2(pool, "IN", current_user).await?,
        "2" => input_transaction_v2(pool, "OUT", current_user).await?,
        _ => {}
    }
    Ok(())
}

async fn input_transaction_v2(
    pool: &sqlx::PgPool,
    trans_type: &str,
    servant: &User,
) -> Result<(), Box<dyn std::error::Error>> {
    clear_screen();
    let theme = get_theme();
    let width = get_width(BANNER_WIDTH);
    let title = if trans_type == "IN" { "BARANG MASUK" } else { "BARANG KELUAR" };
    let subtitle = format!("Petugas: {}", servant.name);
    print_menu_combined("SISTEM PPIC", &subtitle, title, &[], width);

    // Header info sekali saja
    let (requester, req_role, location) = if trans_type == "IN" {
        prompt("No P.O: ")?;
        let mut po = String::new();
        io::stdin().read_line(&mut po)?;
        (po.trim().to_string(), "-".to_string(), "".to_string())
    } else {
        prompt("Requester: ")?;
        let mut req = String::new();
        io::stdin().read_line(&mut req)?;
        
        println!("\nRole: 1)maintenance 2)production 3)order 4)titipan 5)tidak stok");
        prompt("Pilih (1-5): ")?;
        let mut role_choice = String::new();
        io::stdin().read_line(&mut role_choice)?;
        let role = match role_choice.trim() {
            "1" => "maintenance", "2" => "production", "3" => "order", 
            "4" => "titipan", "5" => "tidak stok", _ => "production"
        };
        
        prompt("Lokasi: ")?;
        let mut loc = String::new();
        io::stdin().read_line(&mut loc)?;
        
        (req.trim().to_string(), role.to_string(), loc.trim().to_string())
    };

    // Loop input items dengan auto-suggest
    loop {
        println!("\n{}{}--- Input Item (kosong untuk selesai) ---{}", DIM, FG_CYAN, RESET);
        
        let item = select_or_create_item(pool).await?;
        if item.is_none() {
            break;
        }
        let (code, item_name, current_stock) = item.unwrap();

        // Untuk OUT, tampilkan FIFO
        if trans_type == "OUT" {
            let item_id: Option<(i32,)> = sqlx::query_as("SELECT id FROM items WHERE code = $1")
                .bind(&code)
                .fetch_optional(pool)
                .await?;
            if let Some((id,)) = item_id {
                show_fifo_info(pool, id).await;
            }
        }

        println!("Stok saat ini: {}", current_stock);
        prompt("Jumlah: ")?;
        let mut qty_s = String::new();
        io::stdin().read_line(&mut qty_s)?;
        let quantity: i32 = qty_s.trim().parse().unwrap_or(0);

        if quantity <= 0 {
            print_error(&theme, "Jumlah harus > 0");
            continue;
        }

        // Validasi stok untuk OUT
        if trans_type == "OUT" && quantity > current_stock {
            print_error(&theme, &format!("Stok tidak cukup! (tersedia: {})", current_stock));
            continue;
        }

        let new_stock = if trans_type == "IN" {
            current_stock + quantity
        } else {
            current_stock - quantity
        };

        // Update stok
        sqlx::query("UPDATE items SET stock = $1 WHERE code = $2")
            .bind(new_stock)
            .bind(&code)
            .execute(pool)
            .await?;

        let (item_id,): (i32,) = sqlx::query_as("SELECT id FROM items WHERE code = $1")
            .bind(&code)
            .fetch_one(pool)
            .await?;

        // Simpan transaksi
        sqlx::query(
            "INSERT INTO transactions (code, item_id, type, quantity, stock_after, requester, requester_role, servant, location)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"
        )
        .bind(&code)
        .bind(item_id)
        .bind(trans_type)
        .bind(quantity)
        .bind(new_stock)
        .bind(&requester)
        .bind(&req_role)
        .bind(&servant.name)
        .bind(&location)
        .execute(pool)
        .await?;

        print_success(&theme, &format!("{} {} | {} {} → Sisa: {}", code, item_name, quantity, trans_type, new_stock));
    }

    println!("\n{}{}Transaksi selesai!{}", BOLD, FG_GREEN, RESET);
    prompt("Tekan Enter...")?;
    let mut _dummy = String::new();
    io::stdin().read_line(&mut _dummy).ok();
    Ok(())
}

// ==================== MENU 2: STOK & OPNAME ====================
async fn menu_stok_opname(
    pool: &sqlx::PgPool,
    current_user: &User,
) -> Result<(), Box<dyn std::error::Error>> {
    clear_screen();
    let width = get_width(BANNER_WIDTH);
    let subtitle = format!("Petugas: {}", current_user.name);
    print_menu_combined("SISTEM PPIC", &subtitle, "STOK & OPNAME", 
        &["1) Input Stock Opname", "2) Lihat Hasil Opname", "3) Lihat Semua Hasil Opname", "4) Cek Stok Item", "0) Kembali"], width);

    prompt("Pilih: ")?;
    let mut choice = String::new();
    io::stdin().read_line(&mut choice)?;

    match choice.trim() {
        "1" => stok_opname(pool, current_user).await?,
        "2" => audit_opname(pool, current_user).await?,
        "3" => lihat_semua_opname(pool).await?,
        "4" => cek_stok_cepat(pool).await?,
        _ => {}
    }
    Ok(())
}

// ==================== LIHAT SEMUA HASIL OPNAME ====================
async fn lihat_semua_opname(pool: &sqlx::PgPool) -> Result<(), Box<dyn std::error::Error>> {
    clear_screen();
    println!("{}{}LIHAT SEMUA HASIL OPNAME{}", BOLD, FG_CYAN, RESET);
    prompt("Filter gudang (kosong untuk semua): ")?;
    let mut wh = String::new();
    io::stdin().read_line(&mut wh)?;
    let wh = wh.trim();
    prompt("Periode (YYYY-MM-DD, kosong untuk semua): ")?;
    let mut tgl = String::new();
    io::stdin().read_line(&mut tgl)?;
    let tgl = tgl.trim();

    let mut query = "SELECT warehouse, code, item_name, location, counted_qty, expected_qty, diff, checked_by, to_char(created_at, 'YYYY-MM-DD HH24:MI') as ts FROM stock_opname WHERE 1=1".to_string();
    let mut params: Vec<String> = Vec::new();
    if !wh.is_empty() {
        query.push_str(" AND warehouse = $1");
        params.push(wh.to_string());
    }
    if !tgl.is_empty() {
        query.push_str(" AND to_char(created_at, 'YYYY-MM-DD') = $2");
        params.push(tgl.to_string());
    }
    query.push_str(" ORDER BY created_at DESC LIMIT 100");

    let rows = if params.len() == 2 {
        sqlx::query_as::<_, (String, String, String, String, i32, i32, i32, String, String)>(&query)
            .bind(&params[0])
            .bind(&params[1])
            .fetch_all(pool)
            .await?
    } else if params.len() == 1 {
        sqlx::query_as::<_, (String, String, String, String, i32, i32, i32, String, String)>(&query)
            .bind(&params[0])
            .fetch_all(pool)
            .await?
    } else {
        sqlx::query_as::<_, (String, String, String, String, i32, i32, i32, String, String)>(&query)
            .fetch_all(pool)
            .await?
    };

    if rows.is_empty() {
        println!("Tidak ada data opname.");
    } else {
        println!("\n{:<12} {:<10} {:<15} {:<12} {:>6} {:>6} {:>6} {:<10} {}", "Gudang", "Kode", "Item", "Lokasi", "Hitung", "Sistem", "Selisih", "Petugas", "Tanggal");
        println!("{}", "-".repeat(90));
        for (wh, code, name, loc, counted, expected, diff, petugas, ts) in &rows {
            println!("{:<12} {:<10} {:<15} {:<12} {:>6} {:>6} {:>6} {:<10} {}", wh, code, truncate_to_width(name, 15), truncate_to_width(loc, 12), counted, expected, diff, petugas, ts);
        }
    }
    prompt("\nTekan Enter...")?;
    let mut _dummy = String::new();
    io::stdin().read_line(&mut _dummy).ok();
    Ok(())
}

async fn cek_stok_cepat(pool: &sqlx::PgPool) -> Result<(), Box<dyn std::error::Error>> {
    clear_screen();
    println!("{}{}CEK STOK CEPAT{}", BOLD, FG_CYAN, RESET);
    
    let item = select_or_create_item(pool).await?;
    if let Some((code, name, stock)) = item {
        println!("\n{}{}════════════════════════════{}", BOLD, FG_GREEN, RESET);
        println!("Kode  : {}", code);
        println!("Nama  : {}", name);
        println!("Stok  : {}", stock);
        println!("{}{}════════════════════════════{}", BOLD, FG_GREEN, RESET);
        
        // Tampilkan FIFO
        let item_id: Option<(i32,)> = sqlx::query_as("SELECT id FROM items WHERE code = $1")
            .bind(&code)
            .fetch_optional(pool)
            .await?;
        if let Some((id,)) = item_id {
            show_fifo_info(pool, id).await;
        }
    }
    
    prompt("\nTekan Enter...")?;
    let mut _dummy = String::new();
    io::stdin().read_line(&mut _dummy).ok();
    Ok(())
}

// ==================== MENU 3: LAPORAN ====================
async fn menu_laporan(
    pool: &sqlx::PgPool,
    current_user: &User,
) -> Result<(), Box<dyn std::error::Error>> {
    clear_screen();
    let width = get_width(BANNER_WIDTH);
    let subtitle = format!("Petugas: {}", current_user.name);
    print_menu_combined("SISTEM PPIC", &subtitle, "LAPORAN", 
        &["1) Laporan Transaksi", "2) Histori Item", "3) Cari PO/Requester", "0) Kembali"], width);
    
    prompt("Pilih: ")?;
    let mut choice = String::new();
    io::stdin().read_line(&mut choice)?;
    
    match choice.trim() {
        "1" => show_report(pool, current_user).await?,
        "2" => audit_item(pool, current_user).await?,
        "3" => cari_transaksi(pool).await?,
        _ => {}
    }
    Ok(())
}

async fn cari_transaksi(pool: &sqlx::PgPool) -> Result<(), Box<dyn std::error::Error>> {
    clear_screen();
    let theme = get_theme();
    println!("{}{}CARI TRANSAKSI{}", BOLD, FG_CYAN, RESET);
    println!("1) Cari No PO");
    println!("2) Cari Requester");
    prompt("Pilih: ")?;
    
    let mut choice = String::new();
    io::stdin().read_line(&mut choice)?;
    
    let search_value = match choice.trim() {
        "1" => {
            prompt("No PO: ")?;
            let mut v = String::new();
            io::stdin().read_line(&mut v)?;
            v.trim().to_uppercase()
        }
        "2" => {
            prompt("Nama Requester: ")?;
            let mut v = String::new();
            io::stdin().read_line(&mut v)?;
            v.trim().to_string()
        }
        _ => return Ok(())
    };

    let rows: Vec<(i32, String, String, String, i32, i32, String, String)> = sqlx::query_as(
        "SELECT t.id, t.code, i.name, t.type, t.quantity, t.stock_after, t.requester, 
                to_char(t.created_at, 'YYYY-MM-DD HH24:MI') as ts
         FROM transactions t
         JOIN items i ON t.item_id = i.id
         WHERE t.requester ILIKE $1
         ORDER BY t.created_at DESC
         LIMIT 50"
    )
    .bind(format!("%{}%", search_value))
    .fetch_all(pool)
    .await?;

    if rows.is_empty() {
        print_error(&theme, "Tidak ditemukan");
    } else {
        println!("\n{}{}Hasil: {} transaksi{}", BOLD, FG_GREEN, rows.len(), RESET);
        println!("{:<5} {:<10} {:<15} {:<4} {:>6} {:>6} {:<12} {}", "ID", "Kode", "Item", "Tipe", "Qty", "Stok", "Requester", "Tanggal");
        println!("{}", "-".repeat(80));
        for (id, code, name, ttype, qty, stock, req, ts) in &rows {
            println!("{:<5} {:<10} {:<15} {:<4} {:>6} {:>6} {:<12} {}", 
                id, code, truncate_to_width(name, 15), ttype, qty, stock, truncate_to_width(req, 12), ts);
        }
    }
    
    prompt("\nTekan Enter...")?;
    let mut _dummy = String::new();
    io::stdin().read_line(&mut _dummy).ok();
    Ok(())
}

fn login() -> Result<User, String> {
    let users = get_users();
    
    loop {
        clear_screen();
        let width = get_width(BANNER_WIDTH);
        let opts: Vec<String> = users
            .iter()
            .enumerate()
            .map(|(i, u)| format!("{}) {}", i + 1, u.name))
            .collect();
        let opts_ref: Vec<&str> = opts.iter().map(|s| s.as_str()).collect();
        print_menu_combined("SISTEM PPIC", "Login Petugas", "LOGIN", &opts_ref, width);

        let _ = prompt(&format!("Pilih nomor (1-{}): ", users.len()));

        let mut input = String::new();
        io::stdin().read_line(&mut input).ok();

        if let Ok(choice) = input.trim().parse::<usize>() {
            if choice >= 1 && choice <= users.len() {
                return Ok(users[choice - 1].clone());
            }
        }
        println!("{}{}❌ Input tidak valid!{}", BOLD, FG_RED, RESET);
    }
}

async fn show_report(
    pool: &sqlx::PgPool,
    current_user: &User,
) -> Result<(), Box<dyn std::error::Error>> {
    clear_screen();
    let theme = get_theme();
    let width = get_width(BANNER_WIDTH);
    let subtitle = format!("Petugas: {}", current_user.name);
    let options = [
        "1) Cari PO",
        "2) Cari Requester",
        "3) Cetak laporan",
    ];
    print_menu_combined("SISTEM PPIC", &subtitle, "LAPORAN", &options, width);
    prompt("")?;

    let mut search_choice = String::new();
    io::stdin().read_line(&mut search_choice)?;

    let (type_filter, is_po, search_po, search_requester) = match search_choice.trim() {
        "1" => {
            // Cari berdasarkan No PO
            prompt("\nMasukkan No PO: ")?;
            let mut po = String::new();
            io::stdin().read_line(&mut po)?;
            ("IN", true, Some(po.trim().to_uppercase()), None)
        },
        "2" => {
            // Cari berdasarkan Requester
            prompt("Masukkan nama Requester: ")?;
            let mut req = String::new();
            io::stdin().read_line(&mut req)?;
            ("OUT", false, None, Some(req.trim().to_string()))
        },
        _ => {
            // Cetak laporan (in/out/all)
            //println!("\n🔍:");
            println!("1. barang masuk");
            println!("2. barang keluar");
            println!("3. semua");
            prompt("Pilih tipe (1-3): ")?;

            let mut type_choice = String::new();
            io::stdin().read_line(&mut type_choice)?;

            match type_choice.trim() {
                "1" => ("IN", false, None, None),  // IN tanpa filter
                "2" => ("OUT", false, None, None), // OUT
                _ => ("ALL", false, None, None),   // ALL
            }
        }
    };

    // Jika filter type OUT, tanya role (selama bukan mode search requester)
    let out_role_filter = if type_filter == "OUT" && search_requester.is_none() {
        println!("\nkategori");
        println!("1. maintenance");
        println!("2. production");
        println!("3. order");
        println!("4. titipan");
        println!("5. tidak stok");
        println!("6. Semua Role");
        prompt("Pilih role (1-6): ")?;

        let mut role_choice = String::new();
        io::stdin().read_line(&mut role_choice)?;

        match role_choice.trim() {
            "1" => Some("maintenance"),
            "2" => Some("production"),
            "3" => Some("order"),
            "4" => Some("titipan"),
            "5" => Some("tidak stok"),
            _ => None,
        }
    } else {
        None
    };

    // Tanya periode (hanya jika filter by type, tidak search)
    let (start_date, end_date) = if search_po.is_some() || search_requester.is_some() {
        // Jika search, langsung show semua periode
        (unix_epoch_naive(), Local::now().naive_local())
    } else {
        // Jika filter, tanya periode
        println!("\nPeriode:");
        println!("1. Custom (pilih tanggal/bulan/tahun)");
        println!("2. Semua");
        prompt("Pilih periode (1-2): ")?;

        let mut period_choice = String::new();
        io::stdin().read_line(&mut period_choice)?;

        let now = Local::now();
        match period_choice.trim() {
            "1" => {
                println!("\nPilih mode custom:");
                println!("1. Tanggal (YYYY-MM-DD)");
                println!("2. Bulan (YYYY-MM)");
                println!("3. Tahun (YYYY)");
                prompt("Pilih mode (1-3): ")?;
                let mut mode = String::new();
                io::stdin().read_line(&mut mode)?;
                match mode.trim() {
                    "1" => {
                        prompt("Masukkan tanggal (YYYY-MM-DD): ")?;
                        let mut tgl = String::new();
                        io::stdin().read_line(&mut tgl)?;
                        let tgl = tgl.trim();
                        if let Ok(date) = chrono::NaiveDate::parse_from_str(tgl, "%Y-%m-%d") {
                            (date.and_hms_opt(0,0,0).unwrap(), date.and_hms_opt(23,59,59).unwrap())
                        } else {
                            println!("Format tanggal salah, gunakan YYYY-MM-DD. Menampilkan semua.");
                            (unix_epoch_naive(), now.naive_local())
                        }
                    },
                    "2" => {
                        prompt("Masukkan bulan (YYYY-MM): ")?;
                        let mut bln = String::new();
                        io::stdin().read_line(&mut bln)?;
                        let bln = bln.trim();
                        if let Ok(date) = chrono::NaiveDate::parse_from_str(&format!("{}-01", bln), "%Y-%m-%d") {
                            let start = date.and_hms_opt(0,0,0).unwrap();
                            // Cari jumlah hari di bulan tsb
                            let last_day = match date.month() {
                                1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
                                4 | 6 | 9 | 11 => 30,
                                2 => if chrono::NaiveDate::from_ymd_opt(date.year(), 2, 29).is_some() { 29 } else { 28 },
                                _ => 28
                            };
                            let end = chrono::NaiveDate::from_ymd_opt(date.year(), date.month(), last_day).unwrap().and_hms_opt(23,59,59).unwrap();
                            (start, end)
                        } else {
                            println!("Format bulan salah, gunakan YYYY-MM. Menampilkan semua.");
                            (unix_epoch_naive(), now.naive_local())
                        }
                    },
                    "3" => {
                        prompt("Masukkan tahun (YYYY): ")?;
                        let mut th = String::new();
                        io::stdin().read_line(&mut th)?;
                        let th = th.trim();
                        if let Ok(year) = th.parse::<i32>() {
                            let start = chrono::NaiveDate::from_ymd_opt(year, 1, 1).unwrap().and_hms_opt(0,0,0).unwrap();
                            let end = chrono::NaiveDate::from_ymd_opt(year, 12, 31).unwrap().and_hms_opt(23,59,59).unwrap();
                            (start, end)
                        } else {
                            println!("Format tahun salah, gunakan YYYY. Menampilkan semua.");
                            (unix_epoch_naive(), now.naive_local())
                        }
                    },
                    _ => {
                        println!("Pilihan tidak valid. Menampilkan semua.");
                        (unix_epoch_naive(), now.naive_local())
                    }
                }
            },
            _ => {
                (unix_epoch_naive(), now.naive_local())
            }
        }
    };

    // Build query
    let mut query = "SELECT t.id, t.code, i.name as item_name, t.type as t_type, t.quantity, t.stock_after as stock, 
                           t.requester, t.requester_role, t.servant, t.location, t.created_at
                     FROM transactions t 
                     JOIN items i ON t.item_id = i.id
                     WHERE t.created_at BETWEEN $1 AND $2".to_string();

    if type_filter != "ALL" {
        query.push_str(&format!(" AND t.type = '{}'", type_filter));
    }

    // Filter P.O = IN dengan role "-"
    if is_po {
        query.push_str(" AND t.requester_role = '-'");
    }
    
    // Search PO
    if let Some(po) = &search_po {
        query.push_str(&format!(" AND t.requester = '{}'", po));
    }

    // Search Requester
    if let Some(req) = &search_requester {
        query.push_str(&format!(" AND t.requester ILIKE '%{}%'", req));
    }
    
    if let Some(role) = out_role_filter {
        query.push_str(&format!(" AND t.requester_role = '{}'", role));
    }

    query.push_str(" ORDER BY t.created_at DESC");

    // Fetch raw data first
    #[derive(sqlx::FromRow)]
    struct RawTransaction {
        id: i32,
        code: Option<String>,
        item_name: String,
        t_type: String,
        quantity: i32,
        stock: i32,
        requester: String,
        requester_role: Option<String>,
        servant: Option<String>,
        location: Option<String>,
        created_at: NaiveDateTime,
    }

    let raw_rows = sqlx::query_as::<_, RawTransaction>(&query)
        .bind(start_date)
        .bind(end_date)
        .fetch_all(pool)
        .await?;

    // Convert to display rows
    let rows: Vec<TransactionRow> = raw_rows.into_iter().map(|r| {
        TransactionRow {
            id: r.id,
            code: r.code.unwrap_or_default(),
            item_name: r.item_name,
            t_type: r.t_type,
            quantity: r.quantity,
            stock: r.stock,
            requester: r.requester,
            requester_role: r.requester_role.unwrap_or_default(),
            servant: r.servant.unwrap_or_default(),
            location: r.location.unwrap_or_default(),
            created_at: r.created_at.format("%Y-%m-%d %H:%M:%S").to_string(),
        }
    }).collect();

    if rows.is_empty() {
        println!("\n❌ Tidak ada data untuk laporan ini");
    } else {
        // Ringkasan cepat: transaksi, qty IN/OUT, unique item
        let mut total_in_qty = 0i32;
        let mut total_out_qty = 0i32;
        let mut items: HashSet<String> = HashSet::new();
        for r in &rows {
            items.insert(r.code.clone());
            if r.t_type == "IN" {
                total_in_qty += r.quantity;
            } else if r.t_type == "OUT" {
                total_out_qty += r.quantity;
            }
        }
        println!("\n{}{}Ringkasan:{} trans: {}, IN qty: {}, OUT qty: {}, item unik: {}", BOLD, theme.info, RESET, rows.len(), total_in_qty, total_out_qty, items.len());

        println!("\n{}{}HASIL LAPORAN ({} record){}", BOLD, theme.success, rows.len(), RESET);
        println!("{}", Table::new(rows.clone()).to_string());
        
        // Export ke file txt
        let filename = generate_filename(search_choice.trim(), search_po.as_deref(), search_requester.as_deref(), &type_filter);
        export_to_txt(&rows, &filename)?;
    }

    Ok(())
}

fn generate_filename(search_choice: &str, po: Option<&str>, requester: Option<&str>, type_filter: &str) -> String {
    let now = Local::now();
    let timestamp = now.format("%Y%m%d_%H%M%S").to_string();
    
    match search_choice {
        "1" => format!("laporan_po_{}_{}.txt", po.unwrap_or("all"), timestamp),
        "2" => format!("laporan_requester_{}_{}.txt", requester.unwrap_or("all").replace(" ", "_"), timestamp),
        _ => format!("laporan_{}_{}.txt", type_filter.to_lowercase(), timestamp),
    }
}

struct AuditLine {
    ts: NaiveDateTime,
    t_type: String,
    qty: i32,
    requester: String,
    servant: String,
    location: String,
    stock_after: i32,
}

struct OpnameLine {
    code: String,
    item_name: String,
    location: String,
    expected: i32,
    counted: i32,
    diff: i32,
    fifo: Vec<String>,
}

async fn audit_item(
    pool: &sqlx::PgPool,
    current_user: &User,
) -> Result<(), Box<dyn std::error::Error>> {
    clear_screen();
    let width = get_width(BANNER_WIDTH);
    let subtitle = format!("Petugas: {}", current_user.name);
    print_menu_combined("SISTEM PPIC", &subtitle, "AUDIT ITEM", &[], width);

    prompt("Kode item: ")?;
    let mut code = String::new();
    io::stdin().read_line(&mut code)?;
    let code = code.trim().to_uppercase();

    // Ambil item
    let item_row = sqlx::query_as::<_, (i32, String, i32)>(
        "SELECT id, name, COALESCE(stock,0) FROM items WHERE code = $1"
    )
    .bind(&code)
    .fetch_optional(pool)
    .await?;

    if item_row.is_none() {
        println!("{}{}❌ Item tidak ditemukan{}", BOLD, FG_RED, RESET);
        prompt("Tekan Enter untuk kembali...")?;
        let mut _dummy = String::new();
        io::stdin().read_line(&mut _dummy).ok();
        return Ok(());
    }

    let (item_id, item_name, stock) = item_row.unwrap();

    println!("\n{}{}Info Item:{}", BOLD, FG_CYAN, RESET);
    println!("Kode   : {}", code);
    println!("Nama   : {}", item_name);
    println!("Stock  : {}", stock);

    // Ambil histori transaksi item - runtime query
    let history: Vec<(Option<NaiveDateTime>, Option<String>, Option<i32>, Option<String>, Option<String>, Option<String>, Option<String>, Option<i32>)> = sqlx::query_as(
        "SELECT created_at, type, quantity, requester, requester_role, servant, location, stock_after
         FROM transactions
         WHERE item_id = $1
         ORDER BY created_at ASC"
    )
    .bind(item_id)
    .fetch_all(pool)
    .await?;

    if history.is_empty() {
        println!("\n{}{}Tidak ada transaksi untuk item ini{}", BOLD, FG_YELLOW, RESET);
        return Ok(());
    }

    println!("\n{}{}Histori Transaksi:{}", BOLD, FG_CYAN, RESET);
    let lines: Vec<AuditLine> = history
        .iter()
        .map(|(ts, t_type, qty, requester, _requester_role, servant, location, stock_after)| AuditLine {
            ts: ts.unwrap_or_else(|| unix_epoch_naive()),
            t_type: t_type.clone().unwrap_or_else(|| "-".to_string()),
            qty: qty.unwrap_or(0),
            requester: truncate_to_width(requester.as_deref().unwrap_or("-"), 12),
            servant: truncate_to_width(servant.as_deref().unwrap_or("-"), 10),
            location: truncate_to_width(location.as_deref().unwrap_or("-"), 8),
            stock_after: stock_after.unwrap_or(0),
        })
        .collect();

    for h in &lines {
        println!(
            "- {} | {:<3} | qty {:>4} | req: {:<12} | petugas: {:<10} | lokasi: {:<8} | stok: {:>4}",
            h.ts.format("%Y-%m-%d %H:%M"),
            &h.t_type,
            h.qty,
            h.requester,
            h.servant,
            h.location,
            h.stock_after
        );
    }

    // FIFO/FEFO view (pakai kronologi IN paling lama dulu)
    let mut in_trans: Vec<_> = lines
        .iter()
        .filter(|h| h.t_type == "IN")
        .collect();
    if in_trans.is_empty() {
        println!("\n{}{}Tidak ada data IN untuk FIFO/FEFO{}", BOLD, FG_YELLOW, RESET);
        return Ok(());
    }
    in_trans.sort_by_key(|h| h.ts);
    println!("\n{}{}FIFO/FEFO (prioritas yang paling lama){}", BOLD, FG_GREEN, RESET);
    for (idx, h) in in_trans.iter().enumerate() {
        let marker = if idx == 0 { "<< PRIORITAS" } else { "" };
        println!(
            "- {} | qty {:>4} | req: {:<12} | petugas: {:<10} | lokasi: {:<8} {}",
            h.ts.format("%Y-%m-%d %H:%M"),
            h.qty,
            h.requester,
            h.servant,
            h.location,
            marker
        );
    }

    let saved_path = export_audit_to_txt(&code, &item_name, stock, &lines)?;
    println!("\n✅ Audit disimpan ke: {}", saved_path);

    Ok(())
}

fn export_audit_to_txt(
    code: &str,
    item_name: &str,
    stock: i32,
    history: &[AuditLine],
) -> Result<String, Box<dyn std::error::Error>> {
    let data_dir = "src/data";
    if !Path::new(data_dir).exists() {
        fs::create_dir_all(data_dir)?;
    }

    let timestamp = Local::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("audit_{}_{}.txt", code.to_lowercase(), timestamp);
    let filepath = format!("{}/{}", data_dir, filename);

    let mut content = String::new();
    content.push_str("═══════════════════════════════════════════════════════\n");
    content.push_str("AUDIT ITEM\n");
    content.push_str(&format!("Generated: {}\n", Local::now().format("%Y-%m-%d %H:%M:%S")));
    content.push_str(&format!("Item   : {} ({})\n", code, item_name));
    content.push_str(&format!("Stok   : {}\n", stock));
    content.push_str("═══════════════════════════════════════════════════════\n\n");

    content.push_str("Histori:\n");
    for h in history {
        content.push_str(&format!(
            "- {} | {:<3} | qty {:>4} | req: {:<12} | petugas: {:<10} | lokasi: {:<8} | stok: {:>4}\n",
            h.ts.format("%Y-%m-%d %H:%M"),
            h.t_type,
            h.qty,
            h.requester,
            h.servant,
            h.location,
            h.stock_after
        ));
    }

    fs::write(&filepath, content)?;
    Ok(filepath)
}

async fn stok_opname(
    pool: &sqlx::PgPool,
    current_user: &User,
) -> Result<(), Box<dyn std::error::Error>> {

    clear_screen();
    let width = get_width(BANNER_WIDTH);
    let subtitle = format!("Petugas: {}", current_user.name);
    print_menu_combined("SISTEM PPIC", &subtitle, "INPUT STOCK OPNAME", &[], width);

    prompt("Nama gudang: ")?;
    let mut warehouse = String::new();
    io::stdin().read_line(&mut warehouse)?;
    let warehouse = warehouse.trim().to_string();

    let mut lines: Vec<OpnameLine> = Vec::new();
    let mut default_loc_type = "1".to_string();

    loop {
        println!("\n(Enter kosong untuk selesai, 'b' untuk batal)");
        // 1. Pilih lokasi dulu
        println!("Tipe lokasi: [1] Rak, [2] Palet");
        prompt(&format!("Pilih (default {}): ", default_loc_type))?;
        let mut loc_type = String::new();
        io::stdin().read_line(&mut loc_type)?;
        let loc_type = if loc_type.trim().is_empty() { &default_loc_type } else { loc_type.trim() };

        let loc = match loc_type {
            "1" => {
                prompt("Kode rak (default R1): ")?;
                let mut r = String::new();
                io::stdin().read_line(&mut r)?;
                let r = if r.trim().is_empty() { "R1" } else { r.trim() };
                format!("RAK {}", r)
            },
            "2" => {
                prompt("Nomor palet (1..400, default 1): ")?;
                let mut p = String::new();
                io::stdin().read_line(&mut p)?;
                let p_no: i32 = p.trim().parse().unwrap_or(1).clamp(1, 400);
                let (row, col) = pallet_coords(p_no);
                sqlx::query(
                    "INSERT INTO pallets (warehouse, pallet_no, last_seen_by) VALUES ($1,$2,$3)
                     ON CONFLICT (warehouse, pallet_no) DO UPDATE SET last_seen_at = CURRENT_TIMESTAMP, last_seen_by = EXCLUDED.last_seen_by"
                )
                .bind(&warehouse)
                .bind(p_no)
                .bind(&current_user.name)
                .execute(pool)
                .await?;
                format!("PALET #{:03} (R{} C{})", p_no, row, col)
            },
            _ => "RAK R1".to_string(),
        };

        // 2. Input kode item (auto-suggest)
        let item = select_or_create_item(pool).await?;
        if item.is_none() {
            break;
        }
        let (code, item_name, expected_stock) = item.unwrap();

        // 3. Input jumlah hitung
        prompt(&format!("Jumlah hasil hitung (stok sistem: {}): ", expected_stock))?;
        let mut qty_s = String::new();
        io::stdin().read_line(&mut qty_s)?;
        let counted: i32 = qty_s.trim().parse().unwrap_or(0);
        if counted < 0 {
            print_error(&get_theme(), "Jumlah tidak boleh negatif!");
            continue;
        }

        // FIFO info
        let item_id: Option<(i32,)> = sqlx::query_as("SELECT id FROM items WHERE code = $1")
            .bind(&code)
            .fetch_optional(pool)
            .await?;
        let mut fifo_desc = Vec::new();
        if let Some((item_id,)) = item_id {
            let fifo_rows: Vec<(Option<NaiveDateTime>, Option<i32>, Option<String>)> = sqlx::query_as(
                "SELECT created_at, quantity, location FROM transactions WHERE item_id = $1 AND type = 'IN' ORDER BY created_at ASC LIMIT 5"
            )
            .bind(item_id)
            .fetch_all(pool)
            .await?;
            fifo_desc = fifo_rows.into_iter().map(|(ts, qty, loc_in)| {
                let ts_val = ts.unwrap_or_else(|| unix_epoch_naive());
                let qty_val = qty.unwrap_or(0);
                let loc_val = loc_in.unwrap_or_else(|| "-".to_string());
                format!("{} | qty {:>4} | lok: {}", ts_val.format("%Y-%m-%d"), qty_val, truncate_to_width(&loc_val, 12))
            }).collect();
        }

        let diff = counted - expected_stock;

        lines.push(OpnameLine {
            code: code.clone(),
            item_name: item_name.clone(),
            location: loc.clone(),
            expected: expected_stock,
            counted,
            diff,
            fifo: fifo_desc,
        });

        println!("-> {} ({}) | lokasi: {} | stok sistem {} | hitung {} | selisih {}", code, item_name, loc, expected_stock, counted, diff);
    }

    if lines.is_empty() {
        println!("Tidak ada data opname.");
        return Ok(());
    }

    // Ringkasan dan opsi edit/hapus sebelum simpan
    loop {
        println!("\n{}{}Ringkasan Input Stock Opname:{}", BOLD, FG_CYAN, RESET);
        for (i, l) in lines.iter().enumerate() {
            println!("{}. {} ({}) | lokasi: {} | sistem: {} | hitung: {} | selisih: {}", i+1, l.code, l.item_name, l.location, l.expected, l.counted, l.diff);
            if !l.fifo.is_empty() {
                println!("   FIFO: {}", l.fifo.join(", "));
            }
        }
        let total_expected: i32 = lines.iter().map(|l| l.expected).sum();
        let total_counted: i32 = lines.iter().map(|l| l.counted).sum();
        let total_diff: i32 = lines.iter().map(|l| l.diff).sum();
        println!("\nTotal sistem : {}", total_expected);
        println!("Total hitung : {}", total_counted);
        println!("Total selisih: {}", total_diff);

        println!("\nKetik nomor item untuk edit/hapus, atau tekan Enter untuk lanjut simpan.");
        prompt("Edit/hapus item nomor: ")?;
        let mut edit_input = String::new();
        io::stdin().read_line(&mut edit_input)?;
        let edit_input = edit_input.trim();
        if edit_input.is_empty() {
            break;
        }
        if let Ok(idx) = edit_input.parse::<usize>() {
            if idx >= 1 && idx <= lines.len() {
                let i = idx - 1;
                println!("1) Edit item\n2) Hapus item\n0) Batal");
                prompt("Pilih aksi: ")?;
                let mut aksi = String::new();
                io::stdin().read_line(&mut aksi)?;
                match aksi.trim() {
                    "1" => {
                        // Edit item
                        prompt("Jumlah baru: ")?;
                        let mut qty_s = String::new();
                        io::stdin().read_line(&mut qty_s)?;
                        let counted: i32 = qty_s.trim().parse().unwrap_or(lines[i].counted);
                        let diff = counted - lines[i].expected;
                        lines[i].counted = counted;
                        lines[i].diff = diff;
                        println!("Item berhasil diupdate.");
                    },
                    "2" => {
                        lines.remove(i);
                        println!("Item dihapus.");
                    },
                    _ => println!("Batal.")
                }
            }
        }
    }

    if lines.is_empty() {
        println!("Tidak ada data opname.");
        return Ok(());
    }

    prompt("Simpan hasil opname? (y/n): ")?;
    let mut confirm = String::new();
    io::stdin().read_line(&mut confirm)?;
    if confirm.trim().to_lowercase() != "y" {
        println!("Opname dibatalkan.");
        return Ok(());
    }

    // Simpan ke database
    for l in &lines {
        // pastikan item ada
        sqlx::query("INSERT INTO items (code, name) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING")
            .bind(&l.code)
            .bind(&l.item_name)
            .execute(pool)
            .await?;

        let item_id: Option<(i32,)> = sqlx::query_as("SELECT id FROM items WHERE code = $1")
            .bind(&l.code)
            .fetch_optional(pool)
            .await?;
        if let Some((item_id,)) = item_id {
            sqlx::query(
                "INSERT INTO stock_opname (warehouse, item_id, code, item_name, location, expected_qty, counted_qty, diff, checked_by)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)"
            )
            .bind(&warehouse)
            .bind(item_id)
            .bind(&l.code)
            .bind(&l.item_name)
            .bind(&l.location)
            .bind(l.expected)
            .bind(l.counted)
            .bind(l.diff)
            .bind(&current_user.name)
            .execute(pool)
            .await?;
        }
    }

    let saved = export_opname_to_txt(&warehouse, &current_user.name, &lines)?;
    println!("✅ Opname disimpan ke: {}", saved);

    Ok(())
}

fn export_opname_to_txt(
    warehouse: &str,
    user: &str,
    lines: &[OpnameLine],
) -> Result<String, Box<dyn std::error::Error>> {
    let data_dir = "src/data";
    if !Path::new(data_dir).exists() {
        fs::create_dir_all(data_dir)?;
    }

    let timestamp = Local::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("opname_{}_{}.txt", warehouse.replace(" ", "_").to_lowercase(), timestamp);
    let filepath = format!("{}/{}", data_dir, filename);

    let total_expected: i32 = lines.iter().map(|l| l.expected).sum();
    let total_counted: i32 = lines.iter().map(|l| l.counted).sum();
    let total_diff: i32 = lines.iter().map(|l| l.diff).sum();

    let mut content = String::new();
    content.push_str("═══════════════════════════════════════════════════════\n");
    content.push_str("STOCK OPNAME\n");
    content.push_str(&format!("Generated: {}\n", Local::now().format("%Y-%m-%d %H:%M:%S")));
    content.push_str(&format!("Gudang  : {}\n", warehouse));
    content.push_str(&format!("Petugas : {}\n", user));
    content.push_str("═══════════════════════════════════════════════════════\n\n");

    for l in lines {
        content.push_str(&format!(
            "Item {} ({})\nLokasi: {}\nSistem: {} | Hitung: {} | Selisih: {}\n",
            l.code, l.item_name, l.location, l.expected, l.counted, l.diff
        ));
        if !l.fifo.is_empty() {
            content.push_str("FIFO (IN tertua dulu):\n");
            for f in &l.fifo {
                content.push_str(&format!("  {}\n", f));
            }
            content.push_str("Rekomendasi OUT: gunakan batch tertua terlebih dulu; tahan batch baru jika masih ada stok batch lama.\n");
        }
        content.push_str("-------------------------------------------------------\n");
    }

    content.push_str(&format!("Total Sistem : {}\n", total_expected));
    content.push_str(&format!("Total Hitung : {}\n", total_counted));
    content.push_str(&format!("Total Selisih: {}\n", total_diff));

    fs::write(&filepath, content)?;
    Ok(filepath)
}

async fn audit_opname(
    pool: &sqlx::PgPool,
    current_user: &User,
) -> Result<(), Box<dyn std::error::Error>> {
    clear_screen();
    let width = get_width(BANNER_WIDTH);
    let subtitle = format!("Petugas: {}", current_user.name);
    print_menu_combined("SISTEM PPIC", &subtitle, "AUDIT STOCK OPNAME", &[], width);

    prompt("Kode item: ")?;
    let mut code = String::new();
    io::stdin().read_line(&mut code)?;
    let code = code.trim().to_uppercase();

    // Periode
    println!("\nPeriode:");
    println!("1. Custom (pilih tanggal/bulan/tahun)");
    println!("2. Semua");
    prompt("Pilih periode (1-2): ")?;
    let mut period_choice = String::new();
    io::stdin().read_line(&mut period_choice)?;

    let now = Local::now();
    let (start_date, end_date) = match period_choice.trim() {
        "1" => {
            println!("\nPilih mode custom:");
            println!("1. Tanggal (YYYY-MM-DD)");
            println!("2. Bulan (YYYY-MM)");
            println!("3. Tahun (YYYY)");
            prompt("Pilih mode (1-3): ")?;
            let mut mode = String::new();
            io::stdin().read_line(&mut mode)?;
            match mode.trim() {
                "1" => {
                    prompt("Masukkan tanggal (YYYY-MM-DD): ")?;
                    let mut tgl = String::new();
                    io::stdin().read_line(&mut tgl)?;
                    let tgl = tgl.trim();
                    if let Ok(date) = chrono::NaiveDate::parse_from_str(tgl, "%Y-%m-%d") {
                        (date.and_hms_opt(0,0,0).unwrap(), date.and_hms_opt(23,59,59).unwrap())
                    } else {
                        println!("Format tanggal salah, gunakan YYYY-MM-DD. Menampilkan semua.");
                        (unix_epoch_naive(), now.naive_local())
                    }
                },
                "2" => {
                    prompt("Masukkan bulan (YYYY-MM): ")?;
                    let mut bln = String::new();
                    io::stdin().read_line(&mut bln)?;
                    let bln = bln.trim();
                    if let Ok(date) = chrono::NaiveDate::parse_from_str(&format!("{}-01", bln), "%Y-%m-%d") {
                        let start = date.and_hms_opt(0,0,0).unwrap();
                        let last_day = match date.month() {
                            1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
                            4 | 6 | 9 | 11 => 30,
                            2 => if chrono::NaiveDate::from_ymd_opt(date.year(), 2, 29).is_some() { 29 } else { 28 },
                            _ => 28
                        };
                        let end = chrono::NaiveDate::from_ymd_opt(date.year(), date.month(), last_day).unwrap().and_hms_opt(23,59,59).unwrap();
                        (start, end)
                    } else {
                        println!("Format bulan salah, gunakan YYYY-MM. Menampilkan semua.");
                        (unix_epoch_naive(), now.naive_local())
                    }
                },
                "3" => {
                    prompt("Masukkan tahun (YYYY): ")?;
                    let mut th = String::new();
                    io::stdin().read_line(&mut th)?;
                    let th = th.trim();
                    if let Ok(year) = th.parse::<i32>() {
                        let start = chrono::NaiveDate::from_ymd_opt(year, 1, 1).unwrap().and_hms_opt(0,0,0).unwrap();
                        let end = chrono::NaiveDate::from_ymd_opt(year, 12, 31).unwrap().and_hms_opt(23,59,59).unwrap();
                        (start, end)
                    } else {
                        println!("Format tahun salah, gunakan YYYY. Menampilkan semua.");
                        (unix_epoch_naive(), now.naive_local())
                    }
                },
                _ => {
                    println!("Pilihan tidak valid. Menampilkan semua.");
                    (unix_epoch_naive(), now.naive_local())
                }
            }
        },
        _ => {
            (unix_epoch_naive(), now.naive_local())
        }
    };

    // Info item dari database - runtime query
    let item_info: Option<(Option<String>, Option<i32>)> = sqlx::query_as(
        "SELECT name, stock FROM items WHERE code = $1"
    )
    .bind(&code)
    .fetch_optional(pool)
    .await?;

    let (item_name, system_stock) = if let Some((name, stock)) = item_info {
        (name.unwrap_or_else(|| "-".to_string()), stock.unwrap_or(0))
    } else {
        ("-".to_string(), 0)
    };

    // Total opname agregat - runtime query
    let totals: (Option<i64>, Option<i64>, Option<i64>) = sqlx::query_as(
        "SELECT COALESCE(SUM(expected_qty),0) as exp, COALESCE(SUM(counted_qty),0) as cnt, COALESCE(SUM(diff),0) as dif
         FROM stock_opname
         WHERE code = $1 AND created_at BETWEEN $2 AND $3"
    )
    .bind(&code)
    .bind(start_date)
    .bind(end_date)
    .fetch_one(pool)
    .await?;

    let total_expected = totals.0.unwrap_or(0);
    let total_counted = totals.1.unwrap_or(0);
    let total_diff = totals.2.unwrap_or(0);

    println!("\n{}{}ITEM:{} {} ({})", BOLD, FG_CYAN, RESET, code, &item_name);
    println!("{}{}Periode:{} {} s/d {}", BOLD, FG_CYAN, RESET, start_date, end_date);
    println!("{}{}Stok DB:{} {}", BOLD, FG_CYAN, RESET, system_stock);
    println!("{}{}Opname:{} sistem {}, hitung {}, selisih {}", BOLD, FG_CYAN, RESET, total_expected, total_counted, total_diff);

    // Per gudang - runtime query
    let per_wh: Vec<(String, Option<i64>, Option<i64>, Option<NaiveDateTime>)> = sqlx::query_as(
        "SELECT warehouse, COALESCE(SUM(counted_qty),0) as qty, COALESCE(SUM(diff),0) as dif, MAX(created_at) as last_dt
         FROM stock_opname
         WHERE code = $1 AND created_at BETWEEN $2 AND $3
         GROUP BY warehouse
         ORDER BY warehouse"
    )
    .bind(&code)
    .bind(start_date)
    .bind(end_date)
    .fetch_all(pool)
    .await?;

    println!("\n{}{}Sebaran per Gudang:{}", BOLD, FG_GREEN, RESET);
    for (wh, qty, dif, ts) in &per_wh {
        let qty_val = qty.unwrap_or(0);
        let dif_val = dif.unwrap_or(0);
        let ts_val = ts.unwrap_or_else(|| unix_epoch_naive());
        println!("- {:<12} | hitung {:>6} | selisih {:>6} | terakhir {}", wh, qty_val, dif_val, ts_val.format("%Y-%m-%d %H:%M"));
    }

    // Kategori lokasi - runtime query (hanya rak & palet)
    let per_loc_type: Vec<(Option<String>, Option<i64>)> = sqlx::query_as(
        "SELECT 
            CASE 
              WHEN lower(location) LIKE '%palet%' OR lower(location) LIKE '%pallet%' THEN 'palet'
              ELSE 'rak'
            END as loc_type,
            COALESCE(SUM(counted_qty),0) as qty
         FROM stock_opname
         WHERE code = $1 AND created_at BETWEEN $2 AND $3
         GROUP BY loc_type
         ORDER BY loc_type"
    )
    .bind(&code)
    .bind(start_date)
    .bind(end_date)
    .fetch_all(pool)
    .await?;

    println!("\n{}{}Kategori Lokasi:{}", BOLD, FG_GREEN, RESET);
    for (lt, qty) in &per_loc_type {
        let loc_type = lt.as_deref().unwrap_or("rak");
        let qty_val = qty.unwrap_or(0);
        println!("- {:<7}: {:>6}", loc_type, qty_val);
    }

    // Detail gudang + lokasi - runtime query
    let details: Vec<(String, Option<String>, Option<i64>, Option<NaiveDateTime>)> = sqlx::query_as(
        "SELECT warehouse, location, COALESCE(SUM(counted_qty),0) as qty, MAX(created_at) as last_dt
         FROM stock_opname
         WHERE code = $1 AND created_at BETWEEN $2 AND $3
         GROUP BY warehouse, location
         ORDER BY warehouse, location"
    )
    .bind(&code)
    .bind(start_date)
    .bind(end_date)
    .fetch_all(pool)
    .await?;

    println!("\n{}{}Detail Lokasi (Gudang/Location):{}", BOLD, FG_GREEN, RESET);
    for (wh, loc, qty, ts) in &details {
        let loc_str = truncate_to_width(loc.as_deref().unwrap_or("-"), 16);
        let qty_val = qty.unwrap_or(0);
        let ts_val = ts.unwrap_or_else(|| unix_epoch_naive());
        println!("- {:<12} / {:<16} | {:>6} | {}", wh, loc_str, qty_val, ts_val.format("%Y-%m-%d %H:%M"));
    }

    // Build lines for export
    let per_wh_lines: Vec<String> = per_wh.iter().map(|(wh, qty, dif, ts)| {
        let qty_val = qty.unwrap_or(0);
        let dif_val = dif.unwrap_or(0);
        let ts_val = ts.unwrap_or_else(|| unix_epoch_naive());
        format!("- {:<12} | hitung {:>6} | selisih {:>6} | terakhir {}", wh, qty_val, dif_val, ts_val.format("%Y-%m-%d %H:%M"))
    }).collect();

    let per_loc_type_lines: Vec<String> = per_loc_type.iter().map(|(lt, qty)| {
        let loc_type = lt.as_deref().unwrap_or("-");
        let qty_val = qty.unwrap_or(0);
        format!("- {:<7}: {:>6}", loc_type, qty_val)
    }).collect();

    let detail_lines: Vec<String> = details.iter().map(|(wh, loc, qty, ts)| {
        let loc_str = truncate_to_width(loc.as_deref().unwrap_or("-"), 16);
        let qty_val = qty.unwrap_or(0);
        let ts_val = ts.unwrap_or_else(|| unix_epoch_naive());
        format!("- {:<12} / {:<16} | {:>6} | {}", wh, loc_str, qty_val, ts_val.format("%Y-%m-%d %H:%M"))
    }).collect();

    let saved = export_opname_audit_to_txt(
        &code,
        &item_name,
        system_stock as i32,
        start_date,
        end_date,
        &per_wh_lines,
        &per_loc_type_lines,
        &detail_lines,
    )?;
    println!("\n✅ Audit opname disimpan ke: {}", saved);

    Ok(())
}

fn export_opname_audit_to_txt(
    code: &str,
    item_name: &str,
    system_stock: i32,
    start_date: NaiveDateTime,
    end_date: NaiveDateTime,
    per_wh_lines: &[String],
    per_loc_type_lines: &[String],
    details_lines: &[String],
) -> Result<String, Box<dyn std::error::Error>> {

    let data_dir = "src/data";
    if !Path::new(data_dir).exists() {
        fs::create_dir_all(data_dir)?;
    }
    let timestamp = Local::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("audit_stock_{}_{}.txt", code.to_lowercase(), timestamp);
    let filepath = format!("{}/{}", data_dir, filename);

    let mut content = String::new();
    content.push_str("═══════════════════════════════════════════════════════\n");
    content.push_str("AUDIT STOCK OPNAME\n");
    content.push_str(&format!("Item  : {} ({})\n", code, item_name));
    content.push_str(&format!("Periode: {} s/d {}\n", start_date, end_date));
    content.push_str(&format!("Stok DB: {}\n", system_stock));
    content.push_str("═══════════════════════════════════════════════════════\n\n");

    content.push_str("Sebaran per Gudang:\n");
    for line in per_wh_lines { content.push_str(line); content.push_str("\n"); }
    content.push_str("\nKategori Lokasi:\n");
    for line in per_loc_type_lines { content.push_str(line); content.push_str("\n"); }
    content.push_str("\nDetail Lokasi (Gudang/Location):\n");
    for line in details_lines { content.push_str(line); content.push_str("\n"); }

    fs::write(&filepath, content)?;
    Ok(filepath)
}

fn export_to_txt(rows: &[TransactionRow], filename: &str) -> Result<(), Box<dyn std::error::Error>> {
    // Buat folder data jika belum ada
    let data_dir = "src/data";
    if !Path::new(data_dir).exists() {
        fs::create_dir_all(data_dir)?;
    }

    let filepath = format!("{}/{}", data_dir, filename);
    
    let mut content = String::new();
    content.push_str(&format!("═══════════════════════════════════════════════════════\n"));
    content.push_str(&format!("LAPORAN INVENTORI PPIC\n"));
    content.push_str(&format!("Generated: {}\n", Local::now().format("%Y-%m-%d %H:%M:%S")));
    content.push_str(&format!("═══════════════════════════════════════════════════════\n\n"));
    
    // Header table
    content.push_str("| ID  | Kode     | Barang       | Tipe | Jumlah | Stok | Requester/PO | Role     | Petugas | Lokasi | Tanggal            |\n");
    content.push_str("|-----|----------|--------------|------|--------|------|--------------|----------|--------|--------|--------------------|\n");
    
    // Data rows
    for row in rows {
        content.push_str(&format!(
            "| {:3} | {:8} | {:12} | {:4} | {:6} | {:4} | {:12} | {:8} | {:6} | {:6} | {} |\n",
            row.id,
            row.code,
            &row.item_name[..row.item_name.len().min(12)],
            row.t_type,
            row.quantity,
            row.stock,
            &row.requester[..row.requester.len().min(12)],
            row.requester_role,
            row.servant,
            &row.location[..row.location.len().min(6)],
            row.created_at
        ));
    }
    
    content.push_str(&format!("\n═══════════════════════════════════════════════════════\n"));
    content.push_str(&format!("Total Records: {}\n", rows.len()));
    content.push_str(&format!("═══════════════════════════════════════════════════════\n"));
    
    fs::write(&filepath, content)?;
    println!("\n✅ Laporan disimpan ke: {}", filepath);
    
    Ok(())
}