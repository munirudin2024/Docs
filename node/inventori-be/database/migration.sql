-- Migration script untuk kompatibilitas Rust CLI <-> Web App
-- Safe migration yang tidak akan error jika kolom sudah ada

-- 1. Tambah kolom di users untuk web app
DO $$ 
BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(100);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
END $$;

-- 2. Tambah kolom di items untuk web app
DO $$
BEGIN
    ALTER TABLE items ADD COLUMN IF NOT EXISTS kode_barang VARCHAR(50);
    ALTER TABLE items ADD COLUMN IF NOT EXISTS nama_barang VARCHAR(200);
    ALTER TABLE items ADD COLUMN IF NOT EXISTS kategori VARCHAR(100);
    ALTER TABLE items ADD COLUMN IF NOT EXISTS lokasi VARCHAR(100);
    ALTER TABLE items ADD COLUMN IF NOT EXISTS qty INTEGER;
    ALTER TABLE items ADD COLUMN IF NOT EXISTS satuan VARCHAR(20);
    ALTER TABLE items ADD COLUMN IF NOT EXISTS keterangan TEXT;
    ALTER TABLE items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
END $$;

-- 3. Create sync function untuk items
CREATE OR REPLACE FUNCTION sync_item_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync code <-> kode_barang
    IF NEW.code IS NOT NULL THEN
        NEW.kode_barang := NEW.code;
    ELSIF NEW.kode_barang IS NOT NULL THEN
        NEW.code := NEW.kode_barang;
    END IF;
    
    -- Sync name <-> nama_barang
    IF NEW.name IS NOT NULL THEN
        NEW.nama_barang := NEW.name;
    ELSIF NEW.nama_barang IS NOT NULL THEN
        NEW.name := NEW.nama_barang;
    END IF;
    
    -- Sync stock <-> qty
    IF NEW.stock IS NOT NULL THEN
        NEW.qty := NEW.stock;
    ELSIF NEW.qty IS NOT NULL THEN
        NEW.stock := NEW.qty;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger
DROP TRIGGER IF EXISTS sync_items_trigger ON items;
CREATE TRIGGER sync_items_trigger
BEFORE INSERT OR UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION sync_item_columns();

-- 5. Create audit_logs table untuk web app (jika belum ada)
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

-- 6. Sync data yang sudah ada (code -> kode_barang, name -> nama_barang, stock -> qty)
UPDATE items SET kode_barang = code WHERE kode_barang IS NULL AND code IS NOT NULL;
UPDATE items SET nama_barang = name WHERE nama_barang IS NULL AND name IS NOT NULL;
UPDATE items SET qty = stock WHERE qty IS NULL AND stock IS NOT NULL;
UPDATE items SET code = kode_barang WHERE code IS NULL AND kode_barang IS NOT NULL;
UPDATE items SET name = nama_barang WHERE name IS NULL AND nama_barang IS NOT NULL;
UPDATE items SET stock = qty WHERE stock IS NULL AND qty IS NOT NULL;

-- 7. Insert sample users untuk web app (dengan error handling)
DO $$
BEGIN
    -- Cek apakah user admin sudah ada
    IF NOT EXISTS (SELECT 1 FROM users WHERE name = 'admin') THEN
        INSERT INTO users (name, username, password, nama_lengkap, role)
        VALUES ('admin', 'admin', '$2b$10$rKZE.zO7EqE8qYqh5qYqh.zO7EqE8qYqh5qYqh5qYqh5qYqh5qYqh', 'Administrator', 'admin');
    ELSE
        -- Update user admin yang sudah ada
        UPDATE users SET 
            username = 'admin',
            password = '$2b$10$rKZE.zO7EqE8qYqh5qYqh.zO7EqE8qYqh5qYqh5qYqh5qYqh5qYqh',
            nama_lengkap = 'Administrator'
        WHERE name = 'admin' AND username IS NULL;
    END IF;
    
    -- Update existing users dengan password default
    UPDATE users SET 
        username = name,
        password = '$2b$10$rKZE.zO7EqE8qYqh5qYqh.zO7EqE8qYqh5qYqh5qYqh5qYqh5qYqh',
        nama_lengkap = INITCAP(name)
    WHERE username IS NULL;
END $$;

-- 8. Create indexes
CREATE INDEX IF NOT EXISTS idx_items_kode_barang ON items(kode_barang);
CREATE INDEX IF NOT EXISTS idx_items_nama_barang ON items(nama_barang);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_item_id ON audit_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Verification
SELECT 'Migration completed!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_items FROM items;
SELECT COUNT(*) as total_transactions FROM transactions;
