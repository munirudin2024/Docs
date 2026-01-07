use sqlx::postgres::PgPoolOptions;
use std::io::{self, Write};
use std::fs;
use std::path::Path;
use std::env;
use std::collections::HashSet;
use chrono::{Local, Duration, NaiveDateTime, Utc, TimeZone};
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
        // Gabungkan header (SISTEM PPIC) + Petugas + label MENU (center) + opsi (left)
        let subtitle = format!("Petugas: {}", current_user.name);
        print_menu_combined(
            "SISTEM PPIC",
            &subtitle,
            "MENU",
            &["1) Received", "2) Issued", "3) Report", "4) Audit data transaksi", "5) Stock Opname", "6) Audit Stock fisik", "7) Exit"],
            width,
        );

        prompt("Pilih menu (1-7): ")?;

        let mut choice = String::new();
        io::stdin().read_line(&mut choice)?;

        match choice.trim() {
            "1" => input_transaction(&pool, "IN", &current_user).await?,
            "2" => input_transaction(&pool, "OUT", &current_user).await?,
            "3" => show_report(&pool, &current_user).await?,
            "4" => audit_item(&pool, &current_user).await?,
            "5" => stok_opname(&pool, &current_user).await?,
            "6" => audit_opname(&pool, &current_user).await?,
            "7" => {
                println!("\nTerima kasih telah menggunakan sistem ini!");
                break;
            }
            _ => print_error(&theme, "Pilihan tidak valid!"),
        }
    }

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

async fn input_transaction(
    pool: &sqlx::PgPool,
    trans_type: &str,
    servant: &User,
) -> Result<(), Box<dyn std::error::Error>> {
    clear_screen();
    let theme = get_theme();
    let width = get_width(BANNER_WIDTH);
    let title = match trans_type {
        "IN" => "TRANSAKSI MASUK",
        "OUT" => "TRANSAKSI KELUAR",
        _ => "TRANSAKSI",
    };
    // Tampilkan header konsisten dengan section spesifik
    let subtitle = format!("Petugas: {}", servant.name);
    print_menu_combined("SISTEM PPIC", &subtitle, title, &[], width);

    // Get requester, role, and location once (untuk multiple items)
    let (requester, req_role, location) = if trans_type == "IN" {
        // Untuk kedatangan: tanya No P.O satu kali, role default "-"
        prompt("No P.O: ")?;
        let mut po_number = String::new();
        io::stdin().read_line(&mut po_number)?;
        (po_number.trim().to_string(), "-".to_string(), "".to_string())
    } else {
        // Untuk permintaan: tanya requester + role + lokasi satu kali
        prompt("Nama requester: ")?;
        let mut requester = String::new();
        io::stdin().read_line(&mut requester)?;
        let requester = requester.trim();

        println!("\nRole:");
        println!("1. maintenance");
        println!("2. production");
        println!("3. order");
        println!("4. titipan");
        println!("5. tidak stok");
        prompt("Pilih role (1-5): ")?;
        let mut req_role_choice = String::new();
        io::stdin().read_line(&mut req_role_choice)?;
        
        let req_role = match req_role_choice.trim() {
            "1" => "maintenance",
            "2" => "production",
            "3" => "order",
            "4" => "titipan",
            "5" => "tidak stok",
            _ => {
                println!("{}{}❌ Pilihan role tidak valid!{}", BOLD, FG_RED, RESET);
                return Ok(());
            }
        };

        prompt("Lokasi penggunaan: ")?;
        let mut location = String::new();
        io::stdin().read_line(&mut location)?;

        (requester.to_string(), req_role.to_string(), location.trim().to_string())
    };

    // Loop untuk input multiple items
    loop {
        prompt("Code item: ")?;
        let mut code = String::new();
        io::stdin().read_line(&mut code)?;
        let code = code.trim().to_uppercase();

        prompt("Nama item: ")?;
        let mut item_name = String::new();
        io::stdin().read_line(&mut item_name)?;
        let item_name = item_name.trim();

        prompt("Jumlah: ")?;
        let mut qty_s = String::new();
        io::stdin().read_line(&mut qty_s)?;
        let quantity: i32 = qty_s.trim().parse().unwrap_or(0);

        // Insert item if not exists
        sqlx::query(
            "INSERT INTO items (code, name) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING"
        )
        .bind(&code)
        .bind(item_name)
        .execute(pool)
        .await?;

        // Get current stock
        let result = sqlx::query_as::<_, (i32,)>(
            "SELECT COALESCE(stock, 0) FROM items WHERE code = $1"
        )
        .bind(&code)
        .fetch_optional(pool)
        .await?;

        let current_stock = match result {
            Some((stock,)) => stock,
            None => {
                sqlx::query("INSERT INTO items (code, name, stock) VALUES ($1, $2, 0)")
                    .bind(&code)
                    .bind(item_name)
                    .execute(pool)
                    .await?;
                0
            }
        };

        let new_stock = if trans_type == "IN" {
            current_stock + quantity
        } else {
            (current_stock - quantity).max(0)
        };

        sqlx::query("UPDATE items SET stock = $1 WHERE code = $2")
            .bind(new_stock)
            .bind(&code)
            .execute(pool)
            .await?;

        let (item_id,): (i32,) = sqlx::query_as(
            "SELECT id FROM items WHERE code = $1"
        )
        .bind(&code)
        .fetch_one(pool)
        .await?;

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

        print_success(&theme, "Berhasil disimpan");
        println!("   Kode: {}", code);
        println!("   Barang: {}", item_name);
        println!("   Jumlah: {} {} → Sisa: {}", quantity, trans_type, new_stock);

        // Tanya tambah item lagi?
        prompt("Tambah lagi? (y/n): ")?;
        let mut add_more = String::new();
        io::stdin().read_line(&mut add_more)?;
        if add_more.trim().to_lowercase() != "y" {
            break;
        }
    }

    clear_screen();

    Ok(())
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
        println!("1. Hari ini");
        println!("2. 7 hari terakhir");
        println!("3. 30 hari terakhir");
        println!("4. 365 hari terakhir");
        println!("5. Semua");
        prompt("Pilih periode (1-5): ")?;

        let mut period_choice = String::new();
        io::stdin().read_line(&mut period_choice)?;

        let now = Local::now();
        match period_choice.trim() {
            "1" => {
                let today = now.date_naive();
                (today.and_hms_opt(0, 0, 0).unwrap(), today.and_hms_opt(23, 59, 59).unwrap())
            },
            "2" => {
                let week_ago = now - Duration::days(7);
                (week_ago.naive_local(), now.naive_local())
            },
            "3" => {
                let month_ago = now - Duration::days(30);
                (month_ago.naive_local(), now.naive_local())
            },
            "4" => {
                let year_ago = now - Duration::days(365);
                (year_ago.naive_local(), now.naive_local())
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
    print_menu_combined("SISTEM PPIC", &subtitle, "STOCK OPNAME", &[], width);

    prompt("Nama gudang: ")?;
    let mut warehouse = String::new();
    io::stdin().read_line(&mut warehouse)?;
    let warehouse = warehouse.trim().to_string();

    let mut lines: Vec<OpnameLine> = Vec::new();

    loop {
        println!("\n(Enter kosong untuk selesai)");
        prompt("Kode item: ")?;
        let mut code = String::new();
        io::stdin().read_line(&mut code)?;
        let code = code.trim().to_uppercase();
        if code.is_empty() {
            break;
        }

        println!("\nTipe lokasi:");
        println!("1. Rak");
        println!("2. Palet (1..400)");
        prompt("Pilih (1-2): ")?;
        let mut loc_type = String::new();
        io::stdin().read_line(&mut loc_type)?;
        let loc = match loc_type.trim() {
            "1" => {
                prompt("Kode rak: ")?;
                let mut r = String::new();
                io::stdin().read_line(&mut r)?;
                format!("RAK {}", r.trim())
            },
            "2" => {
                prompt("Nomor palet (1..400): ")?;
                let mut p = String::new();
                io::stdin().read_line(&mut p)?;
                let p_no: i32 = p.trim().parse().unwrap_or(1).clamp(1, 400);
                let (row, col) = pallet_coords(p_no);
                // upsert pallet registry
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
            _ => {
                prompt("Nomor palet (1..400): ")?;
                let mut p = String::new();
                io::stdin().read_line(&mut p)?;
                let p_no: i32 = p.trim().parse().unwrap_or(1).clamp(1, 400);
                let (row, col) = pallet_coords(p_no);
                // upsert pallet registry
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
            }
        };

        prompt("Jumlah hasil hitung: ")?;
        let mut qty_s = String::new();
        io::stdin().read_line(&mut qty_s)?;
        let counted: i32 = qty_s.trim().parse().unwrap_or(0);

        // pastikan item ada
        sqlx::query("INSERT INTO items (code, name) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING")
            .bind(&code)
            .bind(&code)
            .execute(pool)
            .await?;

        let (item_id, item_name, expected_stock): (i32, String, i32) = sqlx::query_as(
            "SELECT id, COALESCE(name,''), COALESCE(stock,0) FROM items WHERE code = $1"
        )
        .bind(&code)
        .fetch_one(pool)
        .await?;

        // ambil FIFO (top 5 IN) - runtime query
        let fifo_rows: Vec<(Option<NaiveDateTime>, Option<i32>, Option<String>)> = sqlx::query_as(
            "SELECT created_at, quantity, location
             FROM transactions
             WHERE item_id = $1 AND type = 'IN'
             ORDER BY created_at ASC
             LIMIT 5"
        )
        .bind(item_id)
        .fetch_all(pool)
        .await?;

        let fifo_desc: Vec<String> = fifo_rows
            .into_iter()
            .map(|(ts, qty, loc_in)| {
                let ts_val = ts.unwrap_or_else(|| unix_epoch_naive());
                let qty_val = qty.unwrap_or(0);
                let loc_val = loc_in.unwrap_or_else(|| "-".to_string());
                format!("{} | qty {:>4} | lok: {}", ts_val.format("%Y-%m-%d"), qty_val, truncate_to_width(&loc_val, 12))
            })
            .collect();

        let diff = counted - expected_stock;

        // simpan ke tabel stock_opname
        sqlx::query(
            "INSERT INTO stock_opname (warehouse, item_id, code, item_name, location, expected_qty, counted_qty, diff, checked_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)"
        )
        .bind(&warehouse)
        .bind(item_id)
        .bind(&code)
        .bind(&item_name)
        .bind(&loc)
        .bind(expected_stock)
        .bind(counted)
        .bind(diff)
        .bind(&current_user.name)
        .execute(pool)
        .await?;

        lines.push(OpnameLine {
            code: code.clone(),
            item_name: item_name.clone(),
            location: loc.clone(),
            expected: expected_stock,
            counted,
            diff,
            fifo: fifo_desc,
        });

        println!("-> {} ({}) | stok sistem {} | hitung {} | selisih {}", code, item_name, expected_stock, counted, diff);
    }

    if lines.is_empty() {
        println!("Tidak ada data opname.");
        return Ok(());
    }

    // ringkasan
    let total_expected: i32 = lines.iter().map(|l| l.expected).sum();
    let total_counted: i32 = lines.iter().map(|l| l.counted).sum();
    let total_diff: i32 = lines.iter().map(|l| l.diff).sum();

    println!("\nRingkasan Opname {}:", warehouse);
    println!("Total sistem : {}", total_expected);
    println!("Total hitung : {}", total_counted);
    println!("Total selisih: {}", total_diff);

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
    println!("1. Hari ini");
    println!("2. 7 hari terakhir");
    println!("3. 30 hari terakhir");
    println!("4. 365 hari terakhir");
    println!("5. Semua");
    prompt("Pilih periode (1-5): ")?;
    let mut period_choice = String::new();
    io::stdin().read_line(&mut period_choice)?;

    let now = Local::now();
    let (start_date, end_date) = match period_choice.trim() {
        "1" => {
            let today = now.date_naive();
            (today.and_hms_opt(0, 0, 0).unwrap(), today.and_hms_opt(23, 59, 59).unwrap())
        },
        "2" => {
            let week_ago = now - Duration::days(7);
            (week_ago.naive_local(), now.naive_local())
        },
        "3" => {
            let month_ago = now - Duration::days(30);
            (month_ago.naive_local(), now.naive_local())
        },
        "4" => {
            let year_ago = now - Duration::days(365);
            (year_ago.naive_local(), now.naive_local())
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