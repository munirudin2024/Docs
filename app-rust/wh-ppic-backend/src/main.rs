mod db;
mod errors;
mod models;
mod handlers;
mod routes;
mod tui;

use dotenv::dotenv;
use crossterm::{
    event::{self, Event, KeyCode},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode,
               EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::Terminal;
use ratatui::prelude::CrosstermBackend;
use std::io;
use tui::{app::App, ui};

#[tokio::main]
async fn main() {
    dotenv().ok();

    let pool = db::create_pool()
        .await
        .expect("Gagal koneksi ke database");

    let args: Vec<String> = std::env::args().collect();
    let mode = args.get(1).map(|s| s.as_str()).unwrap_or("--tui");

    match mode {
        "--api" => run_api(pool).await,
        "--tui" => run_tui(pool).await,
        _ => {
            eprintln!("Usage: wh-ppic-backend [--api|--tui]");
        }
    }
}

async fn run_api(pool: sqlx::PgPool) {
    let app = routes::api::create_router(pool);
    let host = std::env::var("HOST").unwrap_or("0.0.0.0".to_string());
    let port = std::env::var("PORT").unwrap_or("8080".to_string());
    let addr = format!("{}:{}", host, port);

    println!("🚀 API Server jalan di http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn run_tui(pool: sqlx::PgPool) {
    enable_raw_mode().unwrap();
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen).unwrap();
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend).unwrap();

    let mut app = App::new(pool);
    app.load_stok().await;

    loop {
        terminal.draw(|f| ui::draw(f, &mut app)).unwrap();

        if event::poll(std::time::Duration::from_millis(250)).unwrap() {
            if let Event::Key(key) = event::read().unwrap() {
                match key.code {
                    KeyCode::Char('q') => break,
                    KeyCode::Char('r') => app.load_stok().await,
                    KeyCode::Down | KeyCode::Char('j') => app.next(),
                    KeyCode::Up   | KeyCode::Char('k') => app.prev(),
                    KeyCode::Tab => {
                        app.active_tab = match app.active_tab {
                            tui::app::ActiveTab::Stok    => tui::app::ActiveTab::Barang,
                            tui::app::ActiveTab::Barang  => tui::app::ActiveTab::Expired,
                            tui::app::ActiveTab::Expired => tui::app::ActiveTab::Stok,
                        };
                        app.load_stok().await;
                    }
                    _ => {}
                }
            }
        }
    }

    disable_raw_mode().unwrap();
    execute!(terminal.backend_mut(), LeaveAlternateScreen).unwrap();
    terminal.show_cursor().unwrap();
    println!("👋 Bye!");
}
