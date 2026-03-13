use ratatui::{
    Frame,
    layout::{Constraint, Direction, Layout},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Cell, Paragraph, Row, Table, TableState, Tabs},
};
use crate::tui::app::{ActiveTab, App};

pub fn draw(f: &mut Frame, app: &mut App) {
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(3),
            Constraint::Min(0),
            Constraint::Length(3),
        ])
        .split(f.area());

    draw_tabs(f, app, chunks[0]);
    draw_content(f, app, chunks[1]);
    draw_status(f, app, chunks[2]);
}

fn draw_tabs(f: &mut Frame, app: &App, area: ratatui::layout::Rect) {
    let tab_titles = vec!["[1] Stok Harian", "[2] Barang", "[3] Hampir Expired"];
    let selected = match app.active_tab {
        ActiveTab::Stok    => 0,
        ActiveTab::Barang  => 1,
        ActiveTab::Expired => 2,
    };

    let tabs = Tabs::new(tab_titles)
        .block(Block::default().borders(Borders::ALL).title(" WH PPIC Dashboard "))
        .select(selected)
        .style(Style::default().fg(Color::White))
        .highlight_style(Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD));

    f.render_widget(tabs, area);
}

fn draw_content(f: &mut Frame, app: &mut App, area: ratatui::layout::Rect) {
    match app.active_tab {
        ActiveTab::Stok    => draw_stok_table(f, app, area),
        ActiveTab::Barang  => draw_placeholder(f, area, "Barang - Coming Soon"),
        ActiveTab::Expired => draw_placeholder(f, area, "Hampir Expired - Coming Soon"),
    }
}

fn draw_stok_table(f: &mut Frame, app: &mut App, area: ratatui::layout::Rect) {
    let header = Row::new(vec![
        Cell::from("Gudang").style(Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD)),
        Cell::from("Zona").style(Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD)),
        Cell::from("Kode").style(Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD)),
        Cell::from("Nama Barang").style(Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD)),
        Cell::from("Tersedia").style(Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD)),
        Cell::from("Total").style(Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD)),
        Cell::from("Status").style(Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD)),
    ])
    .height(1);

    let rows: Vec<Row> = app.stok_data.iter().map(|s| {
        // unwrap semua Option<String> dulu
        let gudang  = s.nama_gudang.clone().unwrap_or_default();
        let zona    = s.nama_zona.clone().unwrap_or_default();
        let kode    = s.kode_barang.clone().unwrap_or_default();
        let nama    = s.nama_barang.clone().unwrap_or_default();
        let tersedia = s.stok_tersedia.as_ref()
            .map(|v| v.to_string()).unwrap_or_else(|| "0".to_string());
        let total   = s.stok_total.as_ref()
            .map(|v| v.to_string()).unwrap_or_else(|| "0".to_string());
        let status  = s.status_stok.clone().unwrap_or_default();

        let status_color = match status.as_str() {
            "HABIS"         => Color::Red,
            "HAMPIR HABIS"  => Color::Yellow,
            "PERHATIAN"     => Color::Magenta,
            _               => Color::Green,
        };

        Row::new(vec![
            Cell::from(gudang),
            Cell::from(zona),
            Cell::from(kode),
            Cell::from(nama),
            Cell::from(tersedia),
            Cell::from(total),
            Cell::from(status).style(Style::default().fg(status_color)),
        ])
    }).collect();

    let mut state = TableState::default();
    state.select(Some(app.selected));

    let table = Table::new(
        rows,
        [
            Constraint::Length(15),
            Constraint::Length(20),
            Constraint::Length(12),
            Constraint::Min(20),
            Constraint::Length(10),
            Constraint::Length(10),
            Constraint::Length(14),
        ],
    )
    .header(header)
    .block(Block::default().borders(Borders::ALL).title(" Stok Harian "))
    .row_highlight_style(Style::default().bg(Color::DarkGray))
    .highlight_symbol("▶ ");

    f.render_stateful_widget(table, area, &mut state);
}

fn draw_placeholder(f: &mut Frame, area: ratatui::layout::Rect, text: &str) {
    let p = Paragraph::new(text)
        .block(Block::default().borders(Borders::ALL))
        .style(Style::default().fg(Color::DarkGray));
    f.render_widget(p, area);
}

fn draw_status(f: &mut Frame, app: &App, area: ratatui::layout::Rect) {
    let spans = Line::from(vec![
        Span::styled(" ● ", Style::default().fg(Color::Green)),
        Span::raw(app.status_msg.as_str()),
    ]);

    let p = Paragraph::new(spans)
        .block(Block::default().borders(Borders::ALL));
    f.render_widget(p, area);
}
