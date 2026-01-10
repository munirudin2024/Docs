-- Create users table (kompatibel dengan Rust app)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    nama_lengkap VARCHAR(100),
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create items table (kompatibel dengan Rust app)
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE,
    name TEXT UNIQUE NOT NULL,
    stock INTEGER DEFAULT 0,
    kode_barang VARCHAR(50),
    nama_barang VARCHAR(200),
    kategori VARCHAR(100),
    lokasi VARCHAR(100),
    qty INTEGER,
    satuan VARCHAR(20),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sync columns (code <-> kode_barang, name <-> nama_barang, stock <-> qty)
CREATE OR REPLACE FUNCTION sync_item_columns()
RETURNS TRIGGER AS $$
BEGIN
    NEW.code := COALESCE(NEW.code, NEW.kode_barang);
    NEW.kode_barang := COALESCE(NEW.kode_barang, NEW.code);
    NEW.name := COALESCE(NEW.name, NEW.nama_barang);
    NEW.nama_barang := COALESCE(NEW.nama_barang, NEW.name);
    NEW.stock := COALESCE(NEW.stock, NEW.qty, 0);
    NEW.qty := COALESCE(NEW.qty, NEW.stock, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_items_trigger ON items;
CREATE TRIGGER sync_items_trigger
BEFORE INSERT OR UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION sync_item_columns();

-- Create transactions table (kompatibel dengan Rust app)
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    code TEXT,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
    quantity INTEGER NOT NULL,
    stock_after INTEGER NOT NULL DEFAULT 0,
    requester TEXT NOT NULL,
    requester_role TEXT NOT NULL DEFAULT '-',
    servant TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stock_opname table
CREATE TABLE IF NOT EXISTS stock_opname (
    id SERIAL PRIMARY KEY,
    warehouse TEXT NOT NULL,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    code TEXT,
    item_name TEXT,
    location TEXT,
    pallet_no INTEGER,
    expected_qty INTEGER NOT NULL DEFAULT 0,
    counted_qty INTEGER NOT NULL DEFAULT 0,
    diff INTEGER NOT NULL DEFAULT 0,
    checked_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create pallets table
CREATE TABLE IF NOT EXISTS pallets (
    id SERIAL PRIMARY KEY,
    warehouse TEXT NOT NULL,
    pallet_no INTEGER NOT NULL,
    description TEXT,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_by TEXT,
    UNIQUE(warehouse, pallet_no)
);

-- Create audit_logs table (untuk web app)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('scan', 'tambah', 'kurang', 'update')),
    qty_before INTEGER,
    qty_after INTEGER,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_items_code ON items(code);
CREATE INDEX IF NOT EXISTS idx_items_kode_barang ON items(kode_barang);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_nama_barang ON items(nama_barang);
CREATE INDEX IF NOT EXISTS idx_transactions_item_id ON transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_code ON transactions(code);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_opname_code ON stock_opname(code);
CREATE INDEX IF NOT EXISTS idx_stock_opname_warehouse ON stock_opname(warehouse);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_item_id ON audit_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Insert sample users (untuk web app login dengan password)
INSERT INTO users (name, username, password, nama_lengkap, role) 
VALUES 
    ('admin', 'admin', '$2b$10$rKZE.zO7EqE8qYqh5qYqh.zO7EqE8qYqh5qYqh5qYqh5qYqh5qYqh', 'Administrator', 'admin'),
    ('munir', 'munir', '$2b$10$rKZE.zO7EqE8qYqh5qYqh.zO7EqE8qYqh5qYqh5qYqh5qYqh5qYqh', 'Munir', 'user'),
    ('munirudin', 'munirudin', '$2b$10$rKZE.zO7EqE8qYqh5qYqh.zO7EqE8qYqh5qYqh5qYqh5qYqh5qYqh', 'Munirudin', 'user')
ON CONFLICT (username) DO NOTHING;

-- Insert sample users untuk Rust app (tanpa password)
INSERT INTO users (name, role) 
VALUES 
    ('munir', 'user'),
    ('munirudin', 'user')
ON CONFLICT (name) DO NOTHING;
