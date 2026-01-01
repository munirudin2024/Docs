-- Useful report queries. Run and export with COPY ... TO 'file.csv' CSV HEADER
-- Examples:

-- 1) Total stock per item (all warehouses)
SELECT i.sku, i.name, SUM(b.remaining_qty) AS qty_on_hand, SUM(b.remaining_qty * COALESCE(b.cost_each,0)) AS fifo_value
FROM items i
LEFT JOIN batches b ON b.item_id = i.id
GROUP BY i.sku, i.name
ORDER BY i.sku;

-- 2) Total stock per warehouse, per item
SELECT w.code AS warehouse_code, i.sku, i.name, SUM(b.remaining_qty) AS qty_on_hand
FROM batches b
JOIN items i ON i.id = b.item_id
JOIN warehouses w ON w.id = b.warehouse_id
GROUP BY w.code, i.sku, i.name
ORDER BY w.code, i.sku;

-- 3) Stock per location (rack/box)
SELECT w.code AS warehouse, l.code AS location_code, i.sku, i.name, SUM(b.remaining_qty) AS qty
FROM batches b
JOIN items i ON i.id = b.item_id
JOIN locations l ON l.id = b.location_id
JOIN warehouses w ON w.id = l.warehouse_id
GROUP BY w.code, l.code, i.sku, i.name
ORDER BY w.code, l.code, i.sku;

-- 4) FIFO list: per item, list batches with remaining qty ordered by received_at
SELECT i.sku, b.id AS batch_id, b.received_at, b.expiration_date, b.remaining_qty, b.cost_each, b.warehouse_id, b.location_id
FROM batches b
JOIN items i ON i.id = b.item_id
WHERE b.remaining_qty > 0
ORDER BY i.sku, b.received_at;

-- 5) FEFO list (batches ordered by expiration)
SELECT i.sku, b.id AS batch_id, b.received_at, b.expiration_date, b.remaining_qty, b.cost_each
FROM batches b
JOIN items i ON i.id = b.item_id
WHERE b.remaining_qty > 0
ORDER BY i.sku, COALESCE(b.expiration_date,'9999-12-31') ASC, b.received_at;

-- 6) Empty containers (sum qty per container = 0)
SELECT c.barcode, c.container_type, l.code as location_code, w.code as warehouse_code
FROM containers c
LEFT JOIN (
  SELECT container_id, SUM(remaining_qty) AS sum_qty
  FROM batches
  GROUP BY container_id
) s ON s.container_id = c.id
LEFT JOIN locations l ON l.id = c.current_location_id
LEFT JOIN warehouses w ON w.id = l.warehouse_id
WHERE COALESCE(s.sum_qty,0) = 0;

-- 7) Stock-out items (zero on hand)
SELECT i.sku, i.name
FROM items i
LEFT JOIN (
  SELECT item_id, SUM(remaining_qty) AS qty FROM batches GROUP BY item_id
) t ON t.item_id = i.id
WHERE COALESCE(t.qty,0) = 0;

-- 8) Fast / slow movers: consumption over period (OUT negative movements)
-- example: last 30 days
WITH outflows AS (
  SELECT item_id, abs(sum(qty)) AS qty_out
  FROM stock_movements
  WHERE movement_type IN ('sale','transfer_out') AND created_at >= now() - interval '30 days'
  GROUP BY item_id
)
SELECT i.sku, i.name, COALESCE(o.qty_out,0) AS qty_30d
FROM items i
LEFT JOIN outflows o ON o.item_id = i.id
ORDER BY COALESCE(o.qty_out,0) DESC NULLS LAST
LIMIT 100;

-- 9) PO / supplier report: join purchase_orders -> batches -> suppliers
SELECT po.po_number, s.name as supplier, po.order_date, b.item_id, i.sku, i.name, b.received_qty, b.remaining_qty, b.received_at
FROM purchase_orders po
LEFT JOIN suppliers s ON s.id = po.supplier_id
LEFT JOIN batches b ON b.po_id = po.id
LEFT JOIN items i ON i.id = b.item_id
ORDER BY po.order_date DESC;

-- 10) Reconciliation: compare physical_counts with system
SELECT pc.counted_at, pc.counted_by, w.code as warehouse, l.code as location, i.sku, i.name,
  pc.counted_qty,
  COALESCE(sys.qty_on_hand,0) AS system_qty,
  (pc.counted_qty - COALESCE(sys.qty_on_hand,0)) AS delta
FROM physical_counts pc
LEFT JOIN items i ON i.id = pc.item_id
LEFT JOIN warehouses w ON w.id = pc.warehouse_id
LEFT JOIN locations l ON l.id = pc.location_id
LEFT JOIN (
  SELECT warehouse_id, location_id, item_id, SUM(remaining_qty) AS qty_on_hand
  FROM batches
  GROUP BY warehouse_id, location_id, item_id
) sys ON sys.warehouse_id = pc.warehouse_id AND sys.location_id = pc.location_id AND sys.item_id = pc.item_id
ORDER BY pc.counted_at DESC;

-- 11) Export-ready: example copy total per warehouse to CSV
-- COPY (
--   SELECT w.code AS warehouse_code, i.sku, i.name, SUM(b.remaining_qty) AS qty_on_hand
--   FROM batches b
--   JOIN items i ON i.id = b.item_id
--   JOIN warehouses w ON w.id = b.warehouse_id
--   GROUP BY w.code, i.sku, i.name
--   ORDER BY w.code, i.sku
-- ) TO '/tmp/stock_per_warehouse.csv' WITH CSV HEADER;