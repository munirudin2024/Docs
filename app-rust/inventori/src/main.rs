use sqlx::postgres::PgPoolOptions;
use std::io::{self, Write};
use std::fs;
use std::path::Path;
use chrono::{Local, Duration, NaiveDateTime};
use tabled::{Table, Tabled};

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
    id: usize,
    name: String,
}

// Predefined users (semua petugas inventori)
fn get_users() -> Vec<User> {
    vec![
        User { id: 1, name: "Munir".to_string() },
        User { id: 2, name: "Baru".to_string() },
    ]
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let db_url = "postgres://pguser:sisfo%401@postgres_pgdb/pgdb";
    let pool = PgPoolOptions::new().max_connections(5).connect(db_url).await?;

    // Create tables
    init_database(&pool).await?;

    // Login
    let current_user = login()?;
    println!("✅ Login berhasil,sebagai Petugas Inventori: {}", current_user.name);

    loop {
        println!("SISTEM PPIC");
        println!("Petugas: {}", format!("{}", current_user.name).chars().take(30).collect::<String>());
        println!("\nMENU");
        println!("1. Kedatangan");
        println!("2. Permintaan");
        println!("3. Laporan");
        println!("4. Exit");
        print!("\nPilih menu (1-4): ");
        io::stdout().flush()?;

        let mut choice = String::new();
        io::stdin().read_line(&mut choice)?;

        match choice.trim() {
            "1" => input_transaction(&pool, "IN", &current_user).await?,
            "2" => input_transaction(&pool, "OUT", &current_user).await?,
            "3" => show_report(&pool, &current_user).await?,
            "4" => {
                println!("\nTerima kasih telah menggunakan sistem ini!");
                break;
            }
            _ => println!("❌ Pilihan tidak valid!"),
        }
    }

    Ok(())
}

async fn init_database(pool: &sqlx::PgPool) -> Result<(), sqlx::Error> {
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
        println!("📊 Database initialized: {} transactions, {} items", trans_count, items_count);

    Ok(())
}

fn login() -> Result<User, String> {
    let users = get_users();
    
    loop {
        println!("\n╔════════════════════════════════╗");
        println!("║    LOGIN PETUGAS INVENTORI     ║");
        println!("╚════════════════════════════════╝");
        println!("\nPetugas 👤");
        
        for (idx, user) in users.iter().enumerate() {
            println!("{}. {}", idx + 1, user.name);
        }
        
        print!("\nPilih nomor (1-5): ");
        io::stdout().flush().ok();

        let mut input = String::new();
        io::stdin().read_line(&mut input).ok();

        if let Ok(choice) = input.trim().parse::<usize>() {
            if choice >= 1 && choice <= users.len() {
                return Ok(users[choice - 1].clone());
            }
        }
        println!("❌ Input tidak valid!");
    }
}

async fn input_transaction(
    pool: &sqlx::PgPool,
    trans_type: &str,
    servant: &User,
) -> Result<(), Box<dyn std::error::Error>> {
    println!("\n╔══════════════════════════════════════");
    println!("║  BARANG {} Petugas: {}          ", trans_type, servant.name);
    println!("╚══════════════════════════════════════");

    // Get requester, role, and location once (untuk multiple items)
    let (requester, req_role, location) = if trans_type == "IN" {
        // Untuk kedatangan: tanya No P.O satu kali, role default "-"
        print!("No P.O: ");
        io::stdout().flush()?;
        let mut po_number = String::new();
        io::stdin().read_line(&mut po_number)?;
        (po_number.trim().to_string(), "-".to_string(), "".to_string())
    } else {
        // Untuk permintaan: tanya requester + role + lokasi satu kali
        print!("Nama requester: ");
        io::stdout().flush()?;
        let mut requester = String::new();
        io::stdin().read_line(&mut requester)?;
        let requester = requester.trim();

        println!("\nRole:");
        println!("1. RAW");
        println!("2. PM");
        println!("3. ORDER");
        println!("4. TITIPAN");
        println!("5. NO STOK");
        print!("Pilih role (1-5): ");
        io::stdout().flush()?;
        let mut req_role_choice = String::new();
        io::stdin().read_line(&mut req_role_choice)?;
        
        let req_role = match req_role_choice.trim() {
            "1" => "RAW",
            "2" => "PM",
            "3" => "ORDER",
            "4" => "TITIPAN",
            "5" => "NO STOK",
            _ => {
                println!("❌ Pilihan role tidak valid!");
                return Ok(());
            }
        };

        print!("\nLokasi penggunaan: ");
        io::stdout().flush()?;
        let mut location = String::new();
        io::stdin().read_line(&mut location)?;

        (requester.to_string(), req_role.to_string(), location.trim().to_string())
    };

    // Loop untuk input multiple items
    loop {
        print!("\nCode item: ");
        io::stdout().flush()?;
        let mut code = String::new();
        io::stdin().read_line(&mut code)?;
        let code = code.trim().to_uppercase();

        print!("Nama item: ");
        io::stdout().flush()?;
        let mut item_name = String::new();
        io::stdin().read_line(&mut item_name)?;
        let item_name = item_name.trim();

        print!("Jumlah: ");
        io::stdout().flush()?;
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

        println!("\nberhasil disimpan");
        println!("   Kode: {}", code);
        println!("   Barang: {}", item_name);
        println!("   Jumlah: {} {} → Sisa: {}", quantity, trans_type, new_stock);

        // Tanya tambah item lagi?
        print!("\nTambah item lagi? (y/n): ");
        io::stdout().flush()?;
        let mut add_more = String::new();
        io::stdin().read_line(&mut add_more)?;
        if add_more.trim().to_lowercase() != "y" {
            break;
        }
    }

    Ok(())
}

async fn show_report(
    pool: &sqlx::PgPool,
    _current_user: &User,
) -> Result<(), Box<dyn std::error::Error>> {

    println!("\n╔════════════════════════════════╗");
    println!("║        LAPORAN TRANSAKSI       ║");
    println!("╚════════════════════════════════╝");

    println!("\nlihat laporan:");
    println!("1. Cari PO");
    println!("2. Cari Requester");
    println!("3. Lihat ( po/in/out/all )");
    print!("Pilih (1-3): ");
    io::stdout().flush()?;

    let mut search_choice = String::new();
    io::stdin().read_line(&mut search_choice)?;

    let (type_filter, is_po, search_po, search_requester) = match search_choice.trim() {
        "1" => {
            // Cari berdasarkan No PO
            print!("\nMasukkan No PO: ");
            io::stdout().flush()?;
            let mut po = String::new();
            io::stdin().read_line(&mut po)?;
            ("IN", true, Some(po.trim().to_uppercase()), None)
        },
        "2" => {
            // Cari berdasarkan Requester
            print!("\nMasukkan nama Requester: ");
            io::stdout().flush()?;
            let mut req = String::new();
            io::stdin().read_line(&mut req)?;
            ("OUT", false, None, Some(req.trim().to_string()))
        },
        _ => {
            // Filter by Type (seperti sekarang)
            println!("\n🔍:");
            println!("1. p.o");
            println!("2. in");
            println!("3. out");
            println!("4. all");
            print!("Pilih tipe (1-4): ");
            io::stdout().flush()?;

            let mut type_choice = String::new();
            io::stdin().read_line(&mut type_choice)?;

            match type_choice.trim() {
                "1" => ("IN", true, None, None),   // P.O = IN dengan role "-"
                "2" => ("IN", false, None, None),  // IN tanpa filter
                "3" => ("OUT", false, None, None), // OUT
                _ => ("ALL", false, None, None),   // ALL
            }
        }
    };

    // Jika filter type OUT, tanya role (hanya jika tidak search requester)
    let out_role_filter = if type_filter == "OUT" && search_requester.is_none() && search_choice.trim() == "3" {
        println!("\nkategori");
        println!("1. raw");
        println!("2. pm");
        println!("3. order");
        println!("4. titipan");
        println!("5. no stok");
        println!("6. Semua Role");
        print!("Pilih role (1-6): ");
        io::stdout().flush()?;

        let mut role_choice = String::new();
        io::stdin().read_line(&mut role_choice)?;

        match role_choice.trim() {
            "1" => Some("raw"),
            "2" => Some("pm"),
            "3" => Some("order"),
            "4" => Some("titipan"),
            "5" => Some("no stok"),
            _ => None,
        }
    } else {
        None
    };

    // Tanya periode (hanya jika filter by type, tidak search)
    let (start_date, end_date) = if search_po.is_some() || search_requester.is_some() {
        // Jika search, langsung show semua periode
        (NaiveDateTime::from_timestamp_opt(0, 0).unwrap(), Local::now().naive_local())
    } else {
        // Jika filter, tanya periode
        println!("\nPeriode:");
        println!("1. Hari ini");
        println!("2. 7 hari terakhir");
        println!("3. 30 hari terakhir");
        println!("4. 365 hari terakhir");
        println!("5. Semua");
        print!("Pilih periode (1-5): ");
        io::stdout().flush()?;

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
                (NaiveDateTime::from_timestamp_opt(0, 0).unwrap(), now.naive_local())
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
        println!("\nHASIL LAPORAN ({} record)", rows.len());
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