-- ============================================================
-- SCHEMA WH PPIC - WAREHOUSE & PRODUCTION PLANNING INVENTORY
-- ============================================================
-- Dibuat berdasarkan alur kerja nyata WH PPIC
-- Urutan eksekusi sudah diatur (parent table dulu, baru child)
-- ============================================================

-- Pastikan ekstensi UUID tersedia (opsional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 0. RESET (opsional, hati-hati di production!)
-- ============================================================
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;


-- ============================================================
-- 1. USERS & ROLES
-- ============================================================

CREATE TABLE roles (
    id_role     SERIAL PRIMARY KEY,
    nama_role   VARCHAR(50) UNIQUE NOT NULL,
    -- ADMIN, WH_STAFF, WH_SUPERVISOR, SECURITY, PPIC, QC,
    -- DEPT_HEAD, MAINTENANCE, PRODUKSI
    deskripsi   TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id_user         SERIAL PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    nama_lengkap    VARCHAR(100),
    email           VARCHAR(100),
    no_telepon      VARCHAR(20),
    id_role         INT NOT NULL,
    departemen      VARCHAR(50),
    is_active       BOOLEAN DEFAULT TRUE,
    last_login      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (id_role) REFERENCES roles(id_role)
);


-- ============================================================
-- 2. MASTER DATA: SUPPLIER
-- ============================================================

CREATE TABLE supplier (
    id_supplier     SERIAL PRIMARY KEY,
    kode_supplier   VARCHAR(20) UNIQUE NOT NULL,
    nama_supplier   VARCHAR(100) NOT NULL,
    alamat          TEXT,
    kota            VARCHAR(50),
    email           VARCHAR(100),
    no_telepon      VARCHAR(20),
    website         VARCHAR(100),
    contact_person  VARCHAR(100),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW()
);


-- ============================================================
-- 3. MASTER DATA: GUDANG & LOKASI
-- ============================================================

CREATE TABLE gudang (
    id_gudang       SERIAL PRIMARY KEY,
    kode_gudang     VARCHAR(10) UNIQUE NOT NULL,  -- GDG-01
    nama_gudang     VARCHAR(100) NOT NULL,
    alamat          TEXT,
    kapasitas       INT,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE zona_gudang (
    id_zona     SERIAL PRIMARY KEY,
    id_gudang   INT NOT NULL,
    kode_zona   VARCHAR(10) NOT NULL,   -- A, B, C
    nama_zona   VARCHAR(50),            -- Raw Material, Finished Good, Quarantine
    keterangan  TEXT,

    FOREIGN KEY (id_gudang) REFERENCES gudang(id_gudang)
);

CREATE TABLE lokasi_penyimpanan (
    id_lokasi       SERIAL PRIMARY KEY,
    id_zona         INT NOT NULL,
    jenis           VARCHAR(10) NOT NULL,        -- RAK / PALET / LANTAI
    kode_lokasi     VARCHAR(20) UNIQUE NOT NULL, -- GDG01-A-R01-L2
    no_rak          VARCHAR(10),
    no_palet        VARCHAR(10),
    baris           INT,
    kolom           INT,
    level           INT,
    kapasitas       NUMERIC(10,2),
    is_occupied     BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (id_zona) REFERENCES zona_gudang(id_zona)
);


-- ============================================================
-- 4. MASTER DATA: BARANG
-- ============================================================

CREATE TABLE barang (
    id_barang       SERIAL PRIMARY KEY,
    kode_barang     VARCHAR(20) UNIQUE NOT NULL,
    nama_barang     VARCHAR(100) NOT NULL,
    kategori        VARCHAR(10),         -- RAW (ADT) / BAG / MTC / NON-MTC
    satuan          VARCHAR(20),
    harga_beli      NUMERIC(15,2),
    harga_jual      NUMERIC(15,2),
    stok_minimum    INT DEFAULT 0,
    stok_maksimum   INT,
    id_supplier     INT,                 -- supplier utama
    masa_garansi_hari   INT,
    masa_pakai_hari     INT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (id_supplier) REFERENCES supplier(id_supplier)
);


-- ============================================================
-- 5. PURCHASE ORDER KE SUPPLIER
-- ============================================================

CREATE TABLE purchase_order (
    id_po           SERIAL PRIMARY KEY,
    no_po           VARCHAR(30) UNIQUE NOT NULL,
    id_supplier     INT NOT NULL,
    tanggal_po      DATE DEFAULT NOW(),
    tanggal_dibutuhkan DATE,
    status          VARCHAR(20) DEFAULT 'DRAFT',
    -- DRAFT → APPROVED → SENT → PARTIAL → RECEIVED → CLOSED / CANCELLED
    total_nilai     NUMERIC(15,2),
    dibuat_oleh     INT,
    approved_oleh   INT,
    catatan         TEXT,

    FOREIGN KEY (id_supplier)   REFERENCES supplier(id_supplier),
    FOREIGN KEY (dibuat_oleh)   REFERENCES users(id_user),
    FOREIGN KEY (approved_oleh) REFERENCES users(id_user)
);

CREATE TABLE detail_po (
    id_detail           SERIAL PRIMARY KEY,
    id_po               INT NOT NULL,
    id_barang           INT NOT NULL,
    jumlah_order        NUMERIC(10,2),
    jumlah_diterima     NUMERIC(10,2) DEFAULT 0,
    harga_satuan        NUMERIC(15,2),
    total               NUMERIC(15,2) GENERATED ALWAYS AS
                            (jumlah_order * harga_satuan) STORED,
    satuan              VARCHAR(20),
    catatan             TEXT,

    FOREIGN KEY (id_po)     REFERENCES purchase_order(id_po),
    FOREIGN KEY (id_barang) REFERENCES barang(id_barang)
);


-- ============================================================
-- 6. ALUR PENERIMAAN BARANG
-- ============================================================

-- Header penerimaan
CREATE TABLE penerimaan_barang (
    id_penerimaan   SERIAL PRIMARY KEY,
    no_penerimaan   VARCHAR(30) UNIQUE NOT NULL,
    id_supplier     INT NOT NULL,
    no_po           VARCHAR(30) NOT NULL,
    tanggal_datang  TIMESTAMP DEFAULT NOW(),
    status          VARCHAR(20) DEFAULT 'PENDING',
    -- PENDING → SECURITY_OK → PPIC_OK → QC_OK → WH_MASUK / REJECTED

    FOREIGN KEY (id_supplier) REFERENCES supplier(id_supplier)
);

-- Data ekspedisi / kendaraan pengantar
CREATE TABLE ekspedisi (
    id_ekspedisi    SERIAL PRIMARY KEY,
    id_penerimaan   INT NOT NULL,
    nama_ekspedisi  VARCHAR(100),
    jenis_kendaraan VARCHAR(50),
    no_polisi       VARCHAR(20),
    nama_pengemudi  VARCHAR(100),
    no_sim          VARCHAR(30),
    no_stnk         VARCHAR(30),
    created_at      TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (id_penerimaan) REFERENCES penerimaan_barang(id_penerimaan)
);

-- Checkpoint security
CREATE TABLE checkpoint_security (
    id_security     SERIAL PRIMARY KEY,
    id_penerimaan   INT NOT NULL,
    nama_petugas    VARCHAR(100),
    shift           VARCHAR(10),     -- PAGI / SIANG / MALAM
    tanggal_cek     TIMESTAMP DEFAULT NOW(),
    status          VARCHAR(20),     -- OK / REJECT
    catatan         TEXT,

    FOREIGN KEY (id_penerimaan) REFERENCES penerimaan_barang(id_penerimaan)
);

-- Checkpoint PPIC
CREATE TABLE checkpoint_ppic (
    id_ppic             SERIAL PRIMARY KEY,
    id_penerimaan       INT NOT NULL,
    nama_petugas        VARCHAR(100),
    no_po_konfirmasi    VARCHAR(30),
    tanggal_cek         TIMESTAMP DEFAULT NOW(),
    status              VARCHAR(20),     -- OK / REJECT
    catatan             TEXT,

    FOREIGN KEY (id_penerimaan) REFERENCES penerimaan_barang(id_penerimaan)
);

-- Detail barang yang datang (dicek PPIC)
CREATE TABLE detail_penerimaan (
    id_detail           SERIAL PRIMARY KEY,
    id_penerimaan       INT NOT NULL,
    id_barang           INT NOT NULL,
    jumlah_po           NUMERIC(10,2),   -- seharusnya berapa
    jumlah_datang       NUMERIC(10,2),   -- aktual yang datang
    satuan              VARCHAR(20),
    harga_satuan        NUMERIC(15,2),
    tanggal_produksi    DATE,
    tanggal_expired     DATE,
    no_batch            VARCHAR(50),

    FOREIGN KEY (id_penerimaan) REFERENCES penerimaan_barang(id_penerimaan),
    FOREIGN KEY (id_barang)     REFERENCES barang(id_barang)
);

-- Checkpoint QC
CREATE TABLE checkpoint_qc (
    id_qc               SERIAL PRIMARY KEY,
    id_penerimaan       INT NOT NULL,
    nama_petugas        VARCHAR(100),
    tanggal_inspeksi    TIMESTAMP DEFAULT NOW(),

    -- inspeksi kendaraan
    kondisi_kendaraan   VARCHAR(20),     -- OK / NOT OK
    catatan_kendaraan   TEXT,

    -- inspeksi barang
    jumlah_ok           NUMERIC(10,2),
    jumlah_reject       NUMERIC(10,2),
    alasan_reject       TEXT,

    -- keputusan akhir
    keputusan           VARCHAR(10),     -- OK / PARTIAL / REJECT
    catatan             TEXT,

    FOREIGN KEY (id_penerimaan) REFERENCES penerimaan_barang(id_penerimaan)
);

-- Retur barang (kalau QC reject)
CREATE TABLE retur_barang (
    id_retur        SERIAL PRIMARY KEY,
    id_penerimaan   INT NOT NULL,
    id_barang       INT NOT NULL,
    jumlah_retur    NUMERIC(10,2),
    alasan          VARCHAR(30),    -- EXPIRED / RUSAK / SALAH_ITEM / KURANG_MUTU
    tanggal_retur   TIMESTAMP DEFAULT NOW(),
    status_retur    VARCHAR(20),    -- DIKEMBALIKAN / MENUNGGU
    catatan         TEXT,

    FOREIGN KEY (id_penerimaan) REFERENCES penerimaan_barang(id_penerimaan),
    FOREIGN KEY (id_barang)     REFERENCES barang(id_barang)
);


-- ============================================================
-- 7. LABEL ITEM (nomor 1-1000, barcode)
-- ============================================================

CREATE TABLE label_item (
    id_label            SERIAL PRIMARY KEY,
    no_label            INT NOT NULL,            -- 1 s/d 1000, lalu reset
    id_transaksi_masuk  INT,                     -- diisi setelah masuk WH
    id_barang           INT NOT NULL,
    no_batch            VARCHAR(50),
    no_batch_supplier   VARCHAR(50),
    no_barcode          VARCHAR(100) UNIQUE,
    tanggal_masuk       DATE,
    tanggal_produksi    DATE,
    tanggal_expired     DATE,
    jumlah              NUMERIC(10,2),
    satuan              VARCHAR(20),
    id_lokasi           INT,
    status              VARCHAR(20) DEFAULT 'TERSEDIA',
    -- TERSEDIA / TERPAKAI / SEBAGIAN / QUARANTINE / EXPIRED

    FOREIGN KEY (id_barang) REFERENCES barang(id_barang),
    FOREIGN KEY (id_lokasi) REFERENCES lokasi_penyimpanan(id_lokasi)
);

-- Garansi & masa pakai per label/batch
CREATE TABLE garansi_barang (
    id_garansi              SERIAL PRIMARY KEY,
    id_label                INT NOT NULL,
    id_barang               INT NOT NULL,
    tanggal_mulai_garansi   DATE,
    tanggal_akhir_garansi   DATE,
    masa_pakai_hari         INT,
    tanggal_mulai_pakai     DATE,
    prediksi_akhir_pakai    DATE,
    status                  VARCHAR(20) DEFAULT 'AKTIF',
    -- AKTIF / HAMPIR_HABIS / EXPIRED / RUSAK

    FOREIGN KEY (id_label)  REFERENCES label_item(id_label),
    FOREIGN KEY (id_barang) REFERENCES barang(id_barang)
);


-- ============================================================
-- 8. TRANSAKSI MASUK (setelah QC OK)
-- ============================================================

CREATE TABLE transaksi_masuk (
    id_transaksi    SERIAL PRIMARY KEY,
    no_transaksi    VARCHAR(30) UNIQUE NOT NULL,
    id_penerimaan   INT NOT NULL,
    id_barang       INT NOT NULL,
    id_supplier     INT NOT NULL,
    jumlah          NUMERIC(10,2) NOT NULL,
    harga_satuan    NUMERIC(15,2),
    total_harga     NUMERIC(15,2) GENERATED ALWAYS AS
                        (jumlah * harga_satuan) STORED,
    tanggal_masuk   TIMESTAMP DEFAULT NOW(),
    tanggal_produksi    DATE,
    tanggal_expired     DATE,
    no_batch        VARCHAR(50),

    -- lokasi hierarki
    id_gudang       INT NOT NULL,
    id_zona         INT NOT NULL,
    id_lokasi       INT NOT NULL,

    no_po           VARCHAR(30),
    no_surat_jalan  VARCHAR(30),
    created_by      INT,

    FOREIGN KEY (id_penerimaan) REFERENCES penerimaan_barang(id_penerimaan),
    FOREIGN KEY (id_barang)     REFERENCES barang(id_barang),
    FOREIGN KEY (id_supplier)   REFERENCES supplier(id_supplier),
    FOREIGN KEY (id_gudang)     REFERENCES gudang(id_gudang),
    FOREIGN KEY (id_zona)       REFERENCES zona_gudang(id_zona),
    FOREIGN KEY (id_lokasi)     REFERENCES lokasi_penyimpanan(id_lokasi),
    FOREIGN KEY (created_by)    REFERENCES users(id_user)
);

-- Update foreign key label_item setelah transaksi_masuk dibuat
ALTER TABLE label_item
ADD CONSTRAINT fk_label_transaksi
FOREIGN KEY (id_transaksi_masuk) REFERENCES transaksi_masuk(id_transaksi);


-- ============================================================
-- 9. STOK REALTIME
-- ============================================================

CREATE TABLE stok (
    id_stok             SERIAL PRIMARY KEY,
    id_barang           INT NOT NULL,
    id_gudang           INT NOT NULL,
    id_lokasi           INT NOT NULL,
    stok_tersedia       NUMERIC(10,2) DEFAULT 0,
    stok_reserved       NUMERIC(10,2) DEFAULT 0,   -- sudah di-request
    stok_quarantine     NUMERIC(10,2) DEFAULT 0,   -- ditahan QC
    stok_total          NUMERIC(10,2) GENERATED ALWAYS AS
                            (stok_tersedia + stok_reserved + stok_quarantine) STORED,
    updated_at          TIMESTAMP DEFAULT NOW(),

    UNIQUE (id_barang, id_gudang, id_lokasi),
    FOREIGN KEY (id_barang) REFERENCES barang(id_barang),
    FOREIGN KEY (id_gudang) REFERENCES gudang(id_gudang),
    FOREIGN KEY (id_lokasi) REFERENCES lokasi_penyimpanan(id_lokasi)
);


-- ============================================================
-- 10. ALUR TRANSAKSI KELUAR
-- ============================================================

-- Jadwal produksi (titik awal semua permintaan)
CREATE TABLE jadwal_produksi (
    id_jadwal       SERIAL PRIMARY KEY,
    no_jadwal       VARCHAR(30) UNIQUE NOT NULL,
    tanggal_produksi DATE NOT NULL,
    shift           VARCHAR(10),
    nama_produk     VARCHAR(100),
    target_qty      NUMERIC(10,2),
    satuan          VARCHAR(20),
    status          VARCHAR(20) DEFAULT 'DRAFT',
    -- DRAFT / APPROVED / RUNNING / DONE
    dibuat_oleh     INT,
    approved_oleh   INT,
    created_at      TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (dibuat_oleh)   REFERENCES users(id_user),
    FOREIGN KEY (approved_oleh) REFERENCES users(id_user)
);

-- Permintaan barang dari tiap departemen
CREATE TABLE permintaan_barang (
    id_permintaan       SERIAL PRIMARY KEY,
    no_permintaan       VARCHAR(30) UNIQUE NOT NULL,
    id_jadwal           INT,                 -- linked ke jadwal (kalau produksi)
    kategori            VARCHAR(20) NOT NULL,
    -- PRODUKSI / MAINTENANCE / NON_MAINTENANCE
    area                VARCHAR(10),         -- RAW / PM (khusus produksi)
    departemen          VARCHAR(50) NOT NULL,
    digunakan_untuk     TEXT,
    tanggal_minta       TIMESTAMP DEFAULT NOW(),
    tanggal_dibutuhkan  DATE,
    status              VARCHAR(20) DEFAULT 'PENDING',
    -- PENDING → APPROVED_DEPT → APPROVED_WH → PROSES → SELESAI

    nama_peminta        VARCHAR(100),
    id_peminta          INT,

    -- approval kepala dept (anti-fraud)
    approved_by_dept    VARCHAR(100),
    tanggal_approval_dept TIMESTAMP,
    catatan_dept        TEXT,

    FOREIGN KEY (id_jadwal) REFERENCES jadwal_produksi(id_jadwal),
    FOREIGN KEY (id_peminta) REFERENCES users(id_user)
);

-- Detail item yang diminta
CREATE TABLE detail_permintaan (
    id_detail           SERIAL PRIMARY KEY,
    id_permintaan       INT NOT NULL,
    id_barang           INT NOT NULL,
    jumlah_minta        NUMERIC(10,2),
    satuan              VARCHAR(20),
    catatan             TEXT,

    -- diisi WH saat memproses
    jumlah_approved     NUMERIC(10,2),
    id_substitusi       INT,             -- item pengganti kalau habis

    FOREIGN KEY (id_permintaan) REFERENCES permintaan_barang(id_permintaan),
    FOREIGN KEY (id_barang)     REFERENCES barang(id_barang),
    FOREIGN KEY (id_substitusi) REFERENCES barang(id_barang)
);

-- Form serah terima (header)
CREATE TABLE form_serah_terima (
    id_serah_terima     SERIAL PRIMARY KEY,
    no_serah_terima     VARCHAR(30) UNIQUE NOT NULL,
    id_permintaan       INT NOT NULL,
    tanggal_kirim       TIMESTAMP DEFAULT NOW(),
    nama_pengirim       VARCHAR(100),
    nama_penerima       VARCHAR(100),
    status              VARCHAR(30) DEFAULT 'MENUNGGU_KONFIRMASI',
    -- MENUNGGU_KONFIRMASI → CONFIRMED → SELESAI

    -- konfirmasi 3 pihak (anti-fraud)
    konfirmasi_pengirim         BOOLEAN DEFAULT FALSE,
    waktu_konfirmasi_pengirim   TIMESTAMP,
    konfirmasi_penerima         BOOLEAN DEFAULT FALSE,
    waktu_konfirmasi_penerima   TIMESTAMP,
    konfirmasi_kepala_dept      BOOLEAN DEFAULT FALSE,
    waktu_konfirmasi_kepala     TIMESTAMP,

    catatan TEXT,

    FOREIGN KEY (id_permintaan) REFERENCES permintaan_barang(id_permintaan)
);

-- Detail item yang diserahterimakan
CREATE TABLE detail_serah_terima (
    id_detail           SERIAL PRIMARY KEY,
    id_serah_terima     INT NOT NULL,
    id_barang           INT NOT NULL,
    id_label            INT,                 -- label fisik (area RAW)
    no_barcode          VARCHAR(100),
    no_batch            VARCHAR(50),
    no_batch_supplier   VARCHAR(50),         -- fokus area PM
    tanggal_barang_datang DATE,
    tanggal_produksi    DATE,
    tanggal_expired     DATE,
    jumlah_diminta      NUMERIC(10,2),
    jumlah_dikirim      NUMERIC(10,2),
    jumlah_sisa         NUMERIC(10,2),       -- sisa di WH setelah pengiriman
    satuan              VARCHAR(20),
    jam_pengambilan     TIMESTAMP DEFAULT NOW(),
    digunakan_dimana    TEXT,
    keterangan          TEXT,

    FOREIGN KEY (id_serah_terima)   REFERENCES form_serah_terima(id_serah_terima),
    FOREIGN KEY (id_barang)         REFERENCES barang(id_barang),
    FOREIGN KEY (id_label)          REFERENCES label_item(id_label)
);


-- ============================================================
-- 11. STOCK OPNAME
-- ============================================================

CREATE TABLE stock_opname (
    id_opname       SERIAL PRIMARY KEY,
    no_opname       VARCHAR(30) UNIQUE NOT NULL,
    tanggal_opname  DATE NOT NULL,
    id_gudang       INT NOT NULL,
    jenis           VARCHAR(20),     -- FULL / PARTIAL / CYCLE_COUNT
    status          VARCHAR(20) DEFAULT 'DRAFT',
    -- DRAFT → COUNTING → REVIEW → APPROVED → CLOSED
    dibuat_oleh     INT,
    approved_oleh   INT,
    catatan         TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (id_gudang)     REFERENCES gudang(id_gudang),
    FOREIGN KEY (dibuat_oleh)   REFERENCES users(id_user),
    FOREIGN KEY (approved_oleh) REFERENCES users(id_user)
);

CREATE TABLE detail_stock_opname (
    id_detail       SERIAL PRIMARY KEY,
    id_opname       INT NOT NULL,
    id_barang       INT NOT NULL,
    id_lokasi       INT NOT NULL,
    stok_sistem     NUMERIC(10,2),
    stok_fisik      NUMERIC(10,2),
    selisih         NUMERIC(10,2) GENERATED ALWAYS AS
                        (stok_fisik - stok_sistem) STORED,
    keterangan_selisih TEXT,
    dihitung_oleh   INT,
    waktu_hitung    TIMESTAMP,

    FOREIGN KEY (id_opname)         REFERENCES stock_opname(id_opname),
    FOREIGN KEY (id_barang)         REFERENCES barang(id_barang),
    FOREIGN KEY (id_lokasi)         REFERENCES lokasi_penyimpanan(id_lokasi),
    FOREIGN KEY (dihitung_oleh)     REFERENCES users(id_user)
);


-- ============================================================
-- 12. ANALYTICS BARANG
-- ============================================================

CREATE TABLE analytics_barang (
    id_analytics            SERIAL PRIMARY KEY,
    id_barang               INT UNIQUE NOT NULL,
    rata_rata_lama_simpan   NUMERIC(10,2),   -- hari
    maks_lama_simpan        NUMERIC(10,2),
    total_keluar_30hari     NUMERIC(10,2),
    total_keluar_90hari     NUMERIC(10,2),
    rata_pemakaian_harian   NUMERIC(10,2),
    kategori_moving         VARCHAR(20),
    -- FAST / MEDIUM / SLOW / DEAD STOCK
    prediksi_habis          DATE,
    harus_beli_sebelum      DATE,
    updated_at              TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (id_barang) REFERENCES barang(id_barang)
);


-- ============================================================
-- 13. NOTIFIKASI & ALERT
-- ============================================================

CREATE TABLE notifikasi_alert (
    id_alert        SERIAL PRIMARY KEY,
    jenis_alert     VARCHAR(30) NOT NULL,
    -- STOK_MINIMUM / STOK_HABIS / HAMPIR_EXPIRED / SUDAH_EXPIRED
    -- GARANSI_HABIS / MASA_PAKAI_HABIS / REORDER_POINT
    id_barang       INT,
    id_label        INT,
    pesan           TEXT,
    level           VARCHAR(10),     -- INFO / WARNING / CRITICAL
    status          VARCHAR(20) DEFAULT 'UNREAD',
    ditujukan_ke    INT,
    created_at      TIMESTAMP DEFAULT NOW(),
    resolved_at     TIMESTAMP,
    resolved_by     INT,

    FOREIGN KEY (id_barang)     REFERENCES barang(id_barang),
    FOREIGN KEY (id_label)      REFERENCES label_item(id_label),
    FOREIGN KEY (ditujukan_ke)  REFERENCES users(id_user),
    FOREIGN KEY (resolved_by)   REFERENCES users(id_user)
);


-- ============================================================
-- 14. INDEX
-- ============================================================

-- Master data
CREATE INDEX idx_barang_kode        ON barang(kode_barang);
CREATE INDEX idx_barang_kategori    ON barang(kategori);
CREATE INDEX idx_supplier_kode      ON supplier(kode_supplier);
CREATE INDEX idx_users_username     ON users(username);

-- Lokasi
CREATE INDEX idx_zona_gudang        ON zona_gudang(id_gudang);
CREATE INDEX idx_lokasi_zona        ON lokasi_penyimpanan(id_zona);
CREATE INDEX idx_lokasi_occupied    ON lokasi_penyimpanan(is_occupied);

-- Penerimaan
CREATE INDEX idx_penerimaan_status      ON penerimaan_barang(status);
CREATE INDEX idx_penerimaan_supplier    ON penerimaan_barang(id_supplier);
CREATE INDEX idx_penerimaan_tgl         ON penerimaan_barang(tanggal_datang DESC);

-- Transaksi masuk
CREATE INDEX idx_trx_masuk_barang       ON transaksi_masuk(id_barang);
CREATE INDEX idx_trx_masuk_supplier     ON transaksi_masuk(id_supplier);
CREATE INDEX idx_trx_masuk_tanggal      ON transaksi_masuk(tanggal_masuk DESC);
CREATE INDEX idx_trx_masuk_penerimaan   ON transaksi_masuk(id_penerimaan);

-- Label item (paling sering diquery)
CREATE INDEX idx_label_barang_status    ON label_item(id_barang, status);
CREATE INDEX idx_label_barcode          ON label_item(no_barcode);
CREATE INDEX idx_label_fefo             ON label_item(id_barang, tanggal_expired)
    WHERE status = 'TERSEDIA';
CREATE INDEX idx_label_fifo             ON label_item(id_barang, tanggal_masuk)
    WHERE status = 'TERSEDIA';

-- Stok
CREATE INDEX idx_stok_barang            ON stok(id_barang);
CREATE INDEX idx_stok_barang_gudang     ON stok(id_barang, id_gudang);

-- Permintaan & serah terima
CREATE INDEX idx_permintaan_status      ON permintaan_barang(status);
CREATE INDEX idx_permintaan_dept        ON permintaan_barang(departemen);
CREATE INDEX idx_serah_terima_tgl       ON detail_serah_terima(jam_pengambilan DESC);
CREATE INDEX idx_serah_terima_barang    ON detail_serah_terima(id_barang);

-- Alert
CREATE INDEX idx_alert_status   ON notifikasi_alert(status);
CREATE INDEX idx_alert_barang   ON notifikasi_alert(id_barang);


-- ============================================================
-- 15. TRIGGER: AUTO UPDATE STOK
-- ============================================================

-- Trigger stok MASUK
CREATE OR REPLACE FUNCTION fn_update_stok_masuk()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO stok (id_barang, id_gudang, id_lokasi, stok_tersedia)
    VALUES (NEW.id_barang, NEW.id_gudang, NEW.id_lokasi, NEW.jumlah)
    ON CONFLICT (id_barang, id_gudang, id_lokasi)
    DO UPDATE SET
        stok_tersedia = stok.stok_tersedia + NEW.jumlah,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stok_masuk
AFTER INSERT ON transaksi_masuk
FOR EACH ROW EXECUTE FUNCTION fn_update_stok_masuk();

-- Trigger stok KELUAR
CREATE OR REPLACE FUNCTION fn_update_stok_keluar()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE stok SET
        stok_tersedia = stok_tersedia - NEW.jumlah_dikirim,
        updated_at = NOW()
    WHERE id_barang = NEW.id_barang;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stok_keluar
AFTER INSERT ON detail_serah_terima
FOR EACH ROW EXECUTE FUNCTION fn_update_stok_keluar();

-- Trigger alert stok minimum
CREATE OR REPLACE FUNCTION fn_cek_stok_minimum()
RETURNS TRIGGER AS $$
DECLARE
    v_stok_min  INT;
    v_nama      VARCHAR;
BEGIN
    SELECT b.stok_minimum, b.nama_barang
    INTO v_stok_min, v_nama
    FROM barang b WHERE b.id_barang = NEW.id_barang;

    IF NEW.stok_tersedia <= v_stok_min THEN
        INSERT INTO notifikasi_alert (jenis_alert, id_barang, pesan, level)
        VALUES (
            CASE WHEN NEW.stok_tersedia = 0 THEN 'STOK_HABIS' ELSE 'STOK_MINIMUM' END,
            NEW.id_barang,
            'Stok ' || v_nama || ' tersisa ' || NEW.stok_tersedia,
            CASE WHEN NEW.stok_tersedia = 0 THEN 'CRITICAL' ELSE 'WARNING' END
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cek_stok_minimum
AFTER UPDATE ON stok
FOR EACH ROW EXECUTE FUNCTION fn_cek_stok_minimum();

-- Trigger alert hampir expired
CREATE OR REPLACE FUNCTION fn_cek_expired()
RETURNS TRIGGER AS $$
DECLARE
    v_nama VARCHAR;
    v_sisa INT;
BEGIN
    v_sisa := NEW.tanggal_expired - CURRENT_DATE;

    SELECT nama_barang INTO v_nama
    FROM barang WHERE id_barang = NEW.id_barang;

    IF v_sisa <= 30 AND NEW.status = 'TERSEDIA' THEN
        INSERT INTO notifikasi_alert (jenis_alert, id_barang, id_label, pesan, level)
        VALUES (
            CASE WHEN v_sisa <= 0 THEN 'SUDAH_EXPIRED' ELSE 'HAMPIR_EXPIRED' END,
            NEW.id_barang,
            NEW.id_label,
            v_nama || ' batch ' || NEW.no_batch || ' expired dalam ' || v_sisa || ' hari',
            CASE WHEN v_sisa <= 7 THEN 'CRITICAL' ELSE 'WARNING' END
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cek_expired
AFTER INSERT OR UPDATE ON label_item
FOR EACH ROW EXECUTE FUNCTION fn_cek_expired();


-- ============================================================
-- 16. VIEWS
-- ============================================================

-- Stok harian per gudang
CREATE VIEW vw_stok_harian AS
SELECT
    g.nama_gudang,
    z.nama_zona,
    b.kode_barang,
    b.nama_barang,
    b.satuan,
    s.stok_tersedia,
    s.stok_reserved,
    s.stok_quarantine,
    s.stok_total,
    b.stok_minimum,
    CASE
        WHEN s.stok_tersedia = 0                      THEN 'HABIS'
        WHEN s.stok_tersedia <= b.stok_minimum        THEN 'HAMPIR HABIS'
        WHEN s.stok_tersedia <= b.stok_minimum * 1.5  THEN 'PERHATIAN'
        ELSE                                               'AMAN'
    END AS status_stok
FROM stok s
INNER JOIN barang b              ON s.id_barang = b.id_barang
INNER JOIN gudang g              ON s.id_gudang = g.id_gudang
INNER JOIN lokasi_penyimpanan lp ON s.id_lokasi = lp.id_lokasi
INNER JOIN zona_gudang z         ON lp.id_zona  = z.id_zona;

-- Barang hampir expired
CREATE VIEW vw_barang_hampir_expired AS
SELECT
    b.kode_barang,
    b.nama_barang,
    li.no_label,
    li.no_batch,
    li.jumlah,
    li.tanggal_expired,
    (li.tanggal_expired - CURRENT_DATE) AS sisa_hari,
    lp.kode_lokasi,
    g.nama_gudang,
    CASE
        WHEN li.tanggal_expired < CURRENT_DATE             THEN 'SUDAH EXPIRED'
        WHEN (li.tanggal_expired - CURRENT_DATE) <= 7      THEN 'KRITIS'
        WHEN (li.tanggal_expired - CURRENT_DATE) <= 30     THEN 'WARNING'
        ELSE                                                    'PERHATIAN'
    END AS level_alert
FROM label_item li
INNER JOIN barang b              ON li.id_barang = b.id_barang
INNER JOIN lokasi_penyimpanan lp ON li.id_lokasi = lp.id_lokasi
INNER JOIN zona_gudang z         ON lp.id_zona   = z.id_zona
INNER JOIN gudang g              ON z.id_gudang  = g.id_gudang
WHERE li.status = 'TERSEDIA'
AND li.tanggal_expired <= CURRENT_DATE + INTERVAL '90 days';

-- Fast/slow moving analysis
CREATE VIEW vw_moving_analysis AS
WITH pemakaian AS (
    SELECT
        id_barang,
        SUM(jumlah_dikirim) FILTER (
            WHERE jam_pengambilan >= NOW() - INTERVAL '30 days'
        ) AS keluar_30hari,
        SUM(jumlah_dikirim) FILTER (
            WHERE jam_pengambilan >= NOW() - INTERVAL '90 days'
        ) AS keluar_90hari
    FROM detail_serah_terima
    GROUP BY id_barang
)
SELECT
    b.kode_barang,
    b.nama_barang,
    b.kategori,
    COALESCE(p.keluar_30hari, 0) AS keluar_30hari,
    COALESCE(p.keluar_90hari, 0) AS keluar_90hari,
    ROUND(COALESCE(p.keluar_90hari / 90.0, 0), 2) AS rata_per_hari,
    CASE
        WHEN COALESCE(p.keluar_90hari, 0) = 0  THEN 'DEAD STOCK'
        WHEN p.keluar_90hari < 10               THEN 'SLOW MOVING'
        WHEN p.keluar_90hari < 100              THEN 'MEDIUM MOVING'
        ELSE                                         'FAST MOVING'
    END AS kategori_moving
FROM barang b
LEFT JOIN pemakaian p ON b.id_barang = p.id_barang;

-- Laporan penerimaan lengkap
CREATE VIEW vw_penerimaan_lengkap AS
SELECT
    pb.no_penerimaan,
    pb.tanggal_datang,
    pb.status,
    s.nama_supplier,
    s.no_telepon        AS telp_supplier,
    e.nama_ekspedisi,
    e.jenis_kendaraan,
    e.no_polisi,
    e.nama_pengemudi,
    cs.nama_petugas     AS petugas_security,
    cs.shift,
    cs.status           AS status_security,
    cp.nama_petugas     AS petugas_ppic,
    cp.status           AS status_ppic,
    cq.nama_petugas     AS petugas_qc,
    cq.keputusan        AS keputusan_qc,
    cq.jumlah_ok,
    cq.jumlah_reject
FROM penerimaan_barang pb
INNER JOIN supplier s              ON pb.id_supplier   = s.id_supplier
LEFT  JOIN ekspedisi e             ON pb.id_penerimaan = e.id_penerimaan
LEFT  JOIN checkpoint_security cs  ON pb.id_penerimaan = cs.id_penerimaan
LEFT  JOIN checkpoint_ppic cp      ON pb.id_penerimaan = cp.id_penerimaan
LEFT  JOIN checkpoint_qc cq        ON pb.id_penerimaan = cq.id_penerimaan;


-- ============================================================
-- 17. FUNCTIONS
-- ============================================================

-- Cek stok tersedia
CREATE OR REPLACE FUNCTION fn_cek_stok(
    p_id_barang INT,
    p_id_gudang INT DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE v_stok NUMERIC;
BEGIN
    SELECT COALESCE(SUM(stok_tersedia), 0) INTO v_stok
    FROM stok
    WHERE id_barang = p_id_barang
    AND (p_id_gudang IS NULL OR id_gudang = p_id_gudang);
    RETURN v_stok;
END;
$$ LANGUAGE plpgsql;

-- Prediksi stok habis
CREATE OR REPLACE FUNCTION fn_prediksi_habis(p_id_barang INT)
RETURNS DATE AS $$
DECLARE
    v_stok          NUMERIC;
    v_rata_per_hari NUMERIC;
BEGIN
    SELECT COALESCE(SUM(stok_tersedia), 0) INTO v_stok
    FROM stok WHERE id_barang = p_id_barang;

    SELECT COALESCE(SUM(jumlah_dikirim) / 30.0, 0) INTO v_rata_per_hari
    FROM detail_serah_terima
    WHERE id_barang = p_id_barang
    AND jam_pengambilan >= NOW() - INTERVAL '30 days';

    IF v_rata_per_hari = 0 THEN RETURN NULL; END IF;
    RETURN CURRENT_DATE + (v_stok / v_rata_per_hari)::INT;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 18. STORED PROCEDURE: PROSES BARANG MASUK
-- ============================================================

CREATE OR REPLACE PROCEDURE proses_barang_masuk(
    p_id_penerimaan     INT,
    p_id_barang         INT,
    p_jumlah            NUMERIC,
    p_id_gudang         INT,
    p_id_zona           INT,
    p_id_lokasi         INT,
    p_tgl_produksi      DATE,
    p_tgl_expired       DATE,
    p_no_batch          VARCHAR,
    p_harga_satuan      NUMERIC,
    p_no_surat_jalan    VARCHAR DEFAULT NULL,
    p_created_by        INT DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
    v_no_transaksi  VARCHAR;
    v_status_qc     VARCHAR;
    v_no_label      INT;
    v_max_label     INT;
    v_id_supplier   INT;
    v_no_po         VARCHAR;
BEGIN
    -- Validasi: status QC harus OK
    SELECT status, id_supplier, no_po
    INTO v_status_qc, v_id_supplier, v_no_po
    FROM penerimaan_barang
    WHERE id_penerimaan = p_id_penerimaan;

    IF v_status_qc != 'QC_OK' THEN
        RAISE EXCEPTION 'Barang belum di-approve QC! Status saat ini: %', v_status_qc;
    END IF;

    -- Generate no transaksi
    v_no_transaksi := 'TM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-'
                      || LPAD(p_id_penerimaan::TEXT, 4, '0');

    -- Generate no label (1-1000 cycling)
    SELECT COALESCE(MAX(no_label), 0) INTO v_max_label FROM label_item;
    v_no_label := CASE WHEN v_max_label >= 1000 THEN 1 ELSE v_max_label + 1 END;

    -- Insert transaksi masuk
    INSERT INTO transaksi_masuk (
        no_transaksi, id_penerimaan, id_barang, id_supplier,
        jumlah, harga_satuan, tanggal_produksi, tanggal_expired,
        no_batch, id_gudang, id_zona, id_lokasi,
        no_po, no_surat_jalan, created_by
    ) VALUES (
        v_no_transaksi, p_id_penerimaan, p_id_barang, v_id_supplier,
        p_jumlah, p_harga_satuan, p_tgl_produksi, p_tgl_expired,
        p_no_batch, p_id_gudang, p_id_zona, p_id_lokasi,
        v_no_po, p_no_surat_jalan, p_created_by
    );

    -- Insert label item
    INSERT INTO label_item (
        no_label, id_barang, no_batch,
        tanggal_masuk, tanggal_produksi, tanggal_expired,
        jumlah, id_lokasi, status
    ) VALUES (
        v_no_label, p_id_barang, p_no_batch,
        CURRENT_DATE, p_tgl_produksi, p_tgl_expired,
        p_jumlah, p_id_lokasi, 'TERSEDIA'
    );

    -- Update status penerimaan
    UPDATE penerimaan_barang
    SET status = 'WH_MASUK'
    WHERE id_penerimaan = p_id_penerimaan;

    -- Update lokasi jadi occupied
    UPDATE lokasi_penyimpanan
    SET is_occupied = TRUE
    WHERE id_lokasi = p_id_lokasi;

    RAISE NOTICE 'Sukses! No Transaksi: %, No Label: %', v_no_transaksi, v_no_label;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Gagal proses barang masuk: %', SQLERRM;
END;
$$;


-- ============================================================
-- 19. DATA AWAL (SEED)
-- ============================================================

-- Roles
INSERT INTO roles (nama_role, deskripsi) VALUES
    ('ADMIN',           'Administrator sistem'),
    ('WH_STAFF',        'Staff gudang'),
    ('WH_SUPERVISOR',   'Supervisor gudang'),
    ('SECURITY',        'Petugas keamanan'),
    ('PPIC',            'Production Planning Inventory Control'),
    ('QC',              'Quality Control'),
    ('DEPT_HEAD',       'Kepala departemen'),
    ('MAINTENANCE',     'Staff maintenance'),
    ('PRODUKSI',        'Staff produksi');

-- Admin user (password: admin123 - ganti di production!)
INSERT INTO users (username, password_hash, nama_lengkap, id_role, departemen)
VALUES ('admin', '$2b$12$placeholder_hash_ganti_ini', 'Administrator', 1, 'IT');

-- Gudang
INSERT INTO gudang (kode_gudang, nama_gudang) VALUES
    ('GDG-01', 'Gudang Raw Material'),
    ('GDG-02', 'Gudang Packaging'),
    ('GDG-03', 'Gudang Maintenance');

-- Zona
INSERT INTO zona_gudang (id_gudang, kode_zona, nama_zona) VALUES
    (1, 'A', 'Area ADT - Raw Material'),
    (1, 'B', 'Area BAG - Packaging'),
    (1, 'Q', 'Quarantine Area'),
    (2, 'A', 'Area PM - Production Material'),
    (3, 'A', 'Area MTC - Maintenance');

-- ============================================================
-- SELESAI!
-- Total tabel  : 30
-- Total index  : 20+
-- Total trigger: 4
-- Total view   : 4
-- Total function/procedure: 3
-- ============================================================
