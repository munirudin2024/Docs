-- minimal sample data to try system
-- Run: psql -f sample_data.sql

BEGIN;

-- storage types
INSERT INTO storage_types(code, description) VALUES ('PALLET','Pallet'), ('RACK','Rack'), ('BOX','Box') ON CONFLICT DO NOTHING;

-- warehouses
INSERT INTO warehouses(code, name, latitude, longitude) VALUES ('WH1','Gudang Utama',-6.200000,106.816666) ON CONFLICT DO NOTHING;
INSERT INTO warehouses(code, name) VALUES ('WH2','Gudang Cabang') ON CONFLICT DO NOTHING;

-- locations
INSERT INTO locations(warehouse_id, code, storage_type_id) VALUES
(1,'R1', (SELECT id FROM storage_types WHERE code='RACK')),
(1,'B1', (SELECT id FROM storage_types WHERE code='BOX')),
(2,'R1', (SELECT id FROM storage_types WHERE code='RACK'))
ON CONFLICT DO NOTHING;

-- items
INSERT INTO items(sku, name, item_type, track_serial, unit_per_box) VALUES
('SKU-ABC','Widget A','PRODUCT', true, 1),
('SKU-BND','Bundle B','PRODUCT', false, 8),
('RAW-1','Raw Material X','RAW_MATERIAL', false, 1),
('CONS-1','Consignment Item','CONSIGNMENT', false, 1)
ON CONFLICT DO NOTHING;

-- suppliers and PO
INSERT INTO suppliers(code, name) VALUES ('SUP1','PT Supplier Satu') ON CONFLICT DO NOTHING;
INSERT INTO purchase_orders(po_number, supplier_id, order_date) VALUES ('PO-1001', (SELECT id FROM suppliers WHERE code='SUP1'), current_date - 10) ON CONFLICT DO NOTHING;

-- containers
INSERT INTO containers(barcode, container_type, current_location_id) VALUES ('BOX-0001','BOX', (SELECT id FROM locations WHERE code='B1' AND warehouse_id=1)) ON CONFLICT DO NOTHING;

-- receipts: create batches
SELECT receipt_batch(
  (SELECT id FROM items WHERE sku='SKU-ABC'),
  5,
  1,
  (SELECT id FROM locations WHERE code='B1' AND warehouse_id=1),
  (SELECT id FROM containers WHERE barcode='BOX-0001'),
  10.50,
  (SELECT id FROM purchase_orders WHERE po_number='PO-1001'),
  NULL,
  'OWNED',
  'operator1'
);

-- another batch with expiration
SELECT receipt_batch(
  (SELECT id FROM items WHERE sku='SKU-BND'),
  3,
  1,
  (SELECT id FROM locations WHERE code='R1' AND warehouse_id=1),
  NULL,
  80.00,
  NULL,
  (current_date + 120),
  'OWNED',
  'operator1'
);

-- create serials for SKU-ABC
INSERT INTO serial_numbers(batch_id, item_id, serial) VALUES
((SELECT id FROM batches WHERE item_id=(SELECT id FROM items WHERE sku='SKU-ABC') LIMIT 1), (SELECT id FROM items WHERE sku='SKU-ABC'), 'S-ABC-001')
ON CONFLICT DO NOTHING;

COMMIT;