use ratatui::{
    backend::CrosstermBackend,
    layout::{Constraint, Direction, Layout},
    widgets::{Block, Borders, Paragraph, Row, Table, Cell},
    style::{Color, Modifier, Style},
    Terminal,
};
use crossterm::{
    event::{self, DisableMouseCapture, EnableMouseCapture, Event, KeyCode},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use sqlx::postgres::PgPoolOptions;
use std::io;

// Struct untuk menyimpan data State aplikasi
struct App {
    user_name: String,
    items: Vec<Vec<String>>,
}

#[tokio::main] // Penting agar sqlx (async) bisa jalan
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // --- 1. SETUP DATABASE (Pakai logika kodingan lama kamu) ---
    let db_url = "postgres://pguser:sisfo%401@postgres_pgdb/pgdb";
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(db_url)
        .await?;

    // Ambil data awal dari database
    let rows = sqlx::query!("SELECT code, name, stock FROM items ORDER BY code LIMIT 20")
        .fetch_all(&pool)
        .await?;

    let item_list = rows.into_iter().map(|r| vec![
        r.code.unwrap_or_default(),
        r.name,
        r.stock.unwrap_or(0).to_string(),
    ]).collect();

    let mut app = App {
        user_name: "Munir (IT SFM)".to_string(),
        items: item_list,
    };

    // --- 2. SETUP TERMINAL RATATUI ---
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen, EnableMouseCapture)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    // --- 3. MAIN LOOP ---
    loop {
        terminal.draw(|f| {
            let area = f.area();
            let chunks = Layout::default()
                .direction(Direction::Vertical)
                .constraints([
                    Constraint::Length(3), // Header
                    Constraint::Min(0),    // Table
                    Constraint::Length(3), // Footer
                ])
                .split(area);

            // Header
            let header = Paragraph::new(format!(" SRIBOGA PPIC SYSTEM | Petugas: {} ", app.user_name))
                .style(Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD))
                .block(Block::default().borders(Borders::ALL));
            f.render_widget(header, chunks[0]);

            // Table (Data dari PostgreSQL)
            let header_cells = ["KODE", "NAMA BARANG", "STOK"]
                .iter()
                .map(|h| Cell::from(*h).style(Style::default().fg(Color::Yellow)));
            
            let table_rows: Vec<Row> = app.items.iter().map(|item| {
                Row::new(item.iter().map(|c| Cell::from(c.as_str())))
            }).collect();

            let table = Table::new(table_rows, [
                Constraint::Percentage(20),
                Constraint::Percentage(60),
                Constraint::Percentage(20),
            ])
            .header(Row::new(header_cells).style(Style::default().bg(Color::Blue)))
            .block(Block::default().title(" [ Stok Gudang Real-time ] ").borders(Borders::ALL));

            f.render_widget(table, chunks[1]);

            // Footer
            let footer = Paragraph::new("Tekan 'q' untuk keluar | 'r' untuk refresh database")
                .alignment(ratatui::layout::Alignment::Center)
                .block(Block::default().borders(Borders::ALL));
            f.render_widget(footer, chunks[2]);
        })?;

        // Handle Input
        if event::poll(std::time::Duration::from_millis(100))? {
            if let Event::Key(key) = event::read()? {
                if let KeyCode::Char('q') = key.code {
                    break;
                }
                // Logika Refresh Data
                if let KeyCode::Char('r') = key.code {
                    let rows = sqlx::query!("SELECT code, name, stock FROM items ORDER BY code LIMIT 20")
                        .fetch_all(&pool)
                        .await?;
                    app.items = rows.into_iter().map(|r| vec![
                        r.code.unwrap_or_default(),
                        r.name,
                        r.stock.unwrap_or(0).to_string(),
                    ]).collect();
                }
            }
        }
    }

    // --- 4. RESTORE TERMINAL ---
    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen, DisableMouseCapture)?;
    terminal.show_cursor()?;

    Ok(())
}