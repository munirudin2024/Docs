-- Schema: inventory system for multi-warehouse, containers, batches, serials, PO & suppliers
-- Run: psql -f schema.sql

BEGIN;

-- extension (optional) for geometry if wanted later
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- warehouses
CREATE TABLE warehouses (
  id bigserial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  latitude double precision,
  longitude double precision,
  address text,
  created_at timestamptz DEFAULT now()
);

-- storage types (PALLET, RACK, BOX, BIN, FLOOR)
CREATE TABLE storage_types (
  id smallserial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  description text
);

-- locations (hierarchical)
CREATE TABLE locations (
  id bigserial PRIMARY KEY,
  warehouse_id bigint NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  parent_location_id bigint REFERENCES locations(id) ON DELETE SET NULL,
  code text NOT NULL,
  storage_type_id smallint REFERENCES storage_types(id),
  capacity bigint,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(warehouse_id, code)
);

-- physical containers (boxes, pallets)
CREATE TABLE containers (
  id bigserial PRIMARY KEY,
  barcode text UNIQUE,
  container_type text, -- e.g. BOX, PALLET
  capacity bigint,
  current_location_id bigint REFERENCES locations(id),
  status text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- items (master)
CREATE TABLE items (
  id bigserial PRIMARY KEY,
  sku text NOT NULL UNIQUE,
  name text NOT NULL,
  item_type text NOT NULL DEFAULT 'PRODUCT', -- PRODUCT, RAW_MATERIAL, CONSIGNMENT, NON_STOCK
  track_serial boolean DEFAULT false,
  uom text DEFAULT 'EA',
  unit_per_box integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- suppliers
CREATE TABLE suppliers (
  id bigserial PRIMARY KEY,
  code text UNIQUE,
  name text NOT NULL,
  contact jsonb,
  created_at timestamptz DEFAULT now()
);

-- purchase orders (basic)
CREATE TABLE purchase_orders (
  id bigserial PRIMARY KEY,
  po_number text NOT NULL UNIQUE,
  supplier_id bigint REFERENCES suppliers(id),
  order_date date,
  expected_date date,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- batches / lots (inbound)
CREATE TABLE batches (
  id bigserial PRIMARY KEY,
  item_id bigint NOT NULL REFERENCES items(id),
  po_id bigint REFERENCES purchase_orders(id),
  container_id bigint REFERENCES containers(id),
  warehouse_id bigint NOT NULL REFERENCES warehouses(id),
  location_id bigint REFERENCES locations(id),
  received_qty bigint NOT NULL CHECK (received_qty >= 0),
  remaining_qty bigint NOT NULL CHECK (remaining_qty >= 0),
  cost_each numeric(14,4) DEFAULT 0,
  received_at timestamptz DEFAULT now(),
  expiration_date date,
  owner_type text DEFAULT 'OWNED', -- OWNED or CONSIGNMENT
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- serial numbers (if per-unit tracking)
CREATE TABLE serial_numbers (
  id bigserial PRIMARY KEY,
  batch_id bigint REFERENCES batches(id) ON DELETE CASCADE,
  item_id bigint NOT NULL REFERENCES items(id),
  serial text NOT NULL,
  status text DEFAULT 'AVAILABLE', -- AVAILABLE, ASSIGNED, SOLD, LOST
  created_at timestamptz DEFAULT now(),
  UNIQUE(item_id, serial)
);

-- stock movements (logs)
CREATE TABLE stock_movements (
  id bigserial PRIMARY KEY,
  item_id bigint REFERENCES items(id),
  qty bigint NOT NULL,  -- IN positive, OUT negative
  movement_type text NOT NULL, -- receipt, sale, transfer_out, transfer_in, adjust
  src_warehouse_id bigint REFERENCES warehouses(id),
  dst_warehouse_id bigint REFERENCES warehouses(id),
  src_location_id bigint REFERENCES locations(id),
  dst_location_id bigint REFERENCES locations(id),
  related_container_id bigint REFERENCES containers(id),
  po_id bigint REFERENCES purchase_orders(id),
  supplier_id bigint REFERENCES suppliers(id),
  created_by text,
  created_at timestamptz DEFAULT now(),
  notes text
);

-- allocations: mapping outgoing movement to batches consumed
CREATE TABLE allocations (
  id bigserial PRIMARY KEY,
  movement_id bigint NOT NULL REFERENCES stock_movements(id) ON DELETE CASCADE,
  batch_id bigint NOT NULL REFERENCES batches(id),
  qty bigint NOT NULL CHECK (qty > 0),
  created_at timestamptz DEFAULT now()
);

-- physical counts (cycle counts)
CREATE TABLE physical_counts (
  id bigserial PRIMARY KEY,
  counted_at timestamptz DEFAULT now(),
  counted_by text,
  warehouse_id bigint REFERENCES warehouses(id),
  location_id bigint REFERENCES locations(id),
  item_id bigint REFERENCES items(id),
  counted_qty bigint,
  notes text
);

-- inventory snapshot (monthly or ad-hoc)
CREATE TABLE inventory_snapshot (
  snapshot_date date NOT NULL,
  warehouse_id bigint NOT NULL REFERENCES warehouses(id),
  location_id bigint REFERENCES locations(id),
  item_id bigint NOT NULL REFERENCES items(id),
  qty bigint NOT NULL,
  fifo_value numeric(18,4) DEFAULT 0,
  PRIMARY KEY (snapshot_date, warehouse_id, location_id, item_id)
);

-- indexes for performance
CREATE INDEX idx_batches_item_warehouse_remaining ON batches(item_id, warehouse_id, remaining_qty);
CREATE INDEX idx_batches_item_expire_received ON batches(item_id, expiration_date, received_at);
CREATE INDEX idx_movements_item_time ON stock_movements(item_id, created_at);
CREATE INDEX idx_allocations_batch ON allocations(batch_id);
CREATE INDEX idx_serial_item ON serial_numbers(item_id);

COMMIT;