use ratatui::{prelude::*, widgets::*};
use crossterm::event::{self, Event, KeyCode};

pub fn run_tui_menu() -> Result<usize, Box<dyn std::error::Error>> {
    let mut terminal = Terminal::new(CrosstermBackend::new(std::io::stdout()))?;
    let menu_items = vec![
        "Transaksi (IN/OUT)",
        "Stok & Opname",
        "Laporan",
        "Daftar Semua Item",
        "Keluar",
    ];
    let mut selected = 0;
    terminal.clear()?;
    loop {
        terminal.draw(|f| {
            let size = f.size();
            let block = Block::default()
                .title("SISTEM PPIC - TUI Mode")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::Cyan));
            f.render_widget(block, size);
            let items: Vec<ListItem> = menu_items
                .iter()
                .enumerate()
                .map(|(i, m)| {
                    let style = if i == selected {
                        Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD)
                    } else {
                        Style::default()
                    };
                    ListItem::new(m.to_string()).style(style)
                })
                .collect();
            let list = List::new(items)
                .block(Block::default().title("Menu").borders(Borders::ALL))
                .highlight_style(Style::default().bg(Color::Blue));
            let area = Rect {
                x: size.x + 5,
                y: size.y + 3,
                width: size.width - 10,
                height: size.height - 6,
            };
            f.render_widget(list, area);
        })?;
        if event::poll(std::time::Duration::from_millis(200))? {
            if let Event::Key(key) = event::read()? {
                match key.code {
                    KeyCode::Up => {
                        if selected > 0 { selected -= 1; }
                    }
                    KeyCode::Down => {
                        if selected < menu_items.len() - 1 { selected += 1; }
                    }
                    KeyCode::Enter => {
                        return Ok(selected + 1);
                    }
                    KeyCode::Char('q') => return Ok(menu_items.len()),
                    _ => {}
                }
            }
        }
    }
}
