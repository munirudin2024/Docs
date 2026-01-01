-- Functions: receipt helper, allocate_outgoing (FIFO/FEFO), create_snapshot
-- Run: psql -f functions.sql

BEGIN;

-- helper: create receipt batch and stock_movement
CREATE OR REPLACE FUNCTION receipt_batch(
  p_item_id bigint,
  p_qty bigint,
  p_warehouse_id bigint,
  p_location_id bigint,
  p_container_id bigint DEFAULT NULL,
  p_cost_each numeric DEFAULT 0,
  p_po_id bigint DEFAULT NULL,
  p_expiration_date date DEFAULT NULL,
  p_owner_type text DEFAULT 'OWNED',
  p_created_by text DEFAULT NULL
) RETURNS bigint AS $$
DECLARE
  v_batch_id bigint;
  v_movement_id bigint;
BEGIN
  INSERT INTO batches(item_id, received_qty, remaining_qty, warehouse_id, location_id, container_id, cost_each, po_id, expiration_date, owner_type)
  VALUES (p_item_id, p_qty, p_qty, p_warehouse_id, p_location_id, p_container_id, p_cost_each, p_po_id, p_expiration_date, p_owner_type)
  RETURNING id INTO v_batch_id;

  INSERT INTO stock_movements(item_id, qty, movement_type, dst_warehouse_id, dst_location_id, related_container_id, po_id, supplier_id, created_by)
  VALUES (p_item_id, p_qty, 'receipt', p_warehouse_id, p_location_id, p_container_id, p_po_id, NULL, p_created_by)
  RETURNING id INTO v_movement_id;

  RETURN v_batch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- allocate_outgoing: allocate qty for an outgoing movement using FIFO or FEFO
-- parameters:
-- p_item_id: item to allocate
-- p_qty: positive integer quantity to allocate (will be recorded as negative movement)
-- p_src_warehouse_id: warehouse from which to allocate
-- p_src_location_id: optional location scope (NULL = any location in warehouse)
-- p_mode: 'FIFO' or 'FEFO'
-- p_movement_type: movement type string (e.g., 'sale', 'transfer_out')
-- p_created_by: user
CREATE OR REPLACE FUNCTION allocate_outgoing(
  p_item_id bigint,
  p_qty bigint,
  p_src_warehouse_id bigint,
  p_src_location_id bigint DEFAULT NULL,
  p_mode text DEFAULT 'FIFO',
  p_movement_type text DEFAULT 'sale',
  p_po_id bigint DEFAULT NULL,
  p_created_by text DEFAULT NULL
) RETURNS bigint AS $$
DECLARE
  v_need bigint := p_qty;
  v_batch RECORD;
  v_movement_id bigint;
  v_order_clause text;
  v_sql text;
BEGIN
  IF p_qty <= 0 THEN
    RAISE EXCEPTION 'p_qty must be > 0';
  END IF;

  -- create outgoing movement (negative qty)
  INSERT INTO stock_movements(item_id, qty, movement_type, src_warehouse_id, src_location_id, po_id, created_by)
  VALUES (p_item_id, -p_qty, p_movement_type, p_src_warehouse_id, p_src_location_id, p_po_id, p_created_by)
  RETURNING id INTO v_movement_id;

  -- choose order
  IF upper(p_mode) = 'FEFO' THEN
    -- expiration_date then received_at
    v_sql := format($f$
      SELECT id, remaining_qty FROM batches
      WHERE item_id = %s AND warehouse_id = %s AND remaining_qty > 0
      %s
      ORDER BY COALESCE(expiration_date, '9999-12-31') ASC, received_at ASC
      FOR UPDATE SKIP LOCKED
    $f$, p_item_id, p_src_warehouse_id,
        CASE WHEN p_src_location_id IS NOT NULL THEN format(' AND location_id = %s ', p_src_location_id) ELSE '' END);
  ELSE
    -- FIFO by received_at
    v_sql := format($f$
      SELECT id, remaining_qty FROM batches
      WHERE item_id = %s AND warehouse_id = %s AND remaining_qty > 0
      %s
      ORDER BY received_at ASC
      FOR UPDATE SKIP LOCKED
    $f$, p_item_id, p_src_warehouse_id,
        CASE WHEN p_src_location_id IS NOT NULL THEN format(' AND location_id = %s ', p_src_location_id) ELSE '' END);
  END IF;

  FOR v_batch IN EXECUTE v_sql
  LOOP
    IF v_need <= 0 THEN
      EXIT;
    END IF;

    IF v_batch.remaining_qty >= v_need THEN
      -- consume partial or full from this batch
      UPDATE batches SET remaining_qty = remaining_qty - v_need WHERE id = v_batch.id;
      INSERT INTO allocations(movement_id, batch_id, qty) VALUES (v_movement_id, v_batch.id, v_need);
      v_need := 0;
      EXIT;
    ELSE
      -- consume entire batch
      INSERT INTO allocations(movement_id, batch_id, qty) VALUES (v_movement_id, v_batch.id, v_batch.remaining_qty);
      v_need := v_need - v_batch.remaining_qty;
      UPDATE batches SET remaining_qty = 0 WHERE id = v_batch.id;
    END IF;
  END LOOP;

  IF v_need > 0 THEN
    -- not enough stock; you can decide policy: allow negative (backorder) or throw
    -- Here we record partial allocation and return movement id; caller should handle shortfall.
    RAISE NOTICE 'Not enough stock for item %, short by %', p_item_id, v_need;
    -- Optionally, insert an adjustment negative or leave as is.
  END IF;

  RETURN v_movement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Snapshot generator: create snapshot for current state
CREATE OR REPLACE FUNCTION create_inventory_snapshot(p_snapshot_date date DEFAULT current_date) RETURNS void AS $$
BEGIN
  DELETE FROM inventory_snapshot WHERE snapshot_date = p_snapshot_date;

  INSERT INTO inventory_snapshot(snapshot_date, warehouse_id, location_id, item_id, qty, fifo_value)
  SELECT
    p_snapshot_date::date,
    b.warehouse_id,
    b.location_id,
    b.item_id,
    SUM(b.remaining_qty) AS qty,
    SUM(b.remaining_qty * COALESCE(b.cost_each,0)) AS fifo_value
  FROM batches b
  GROUP BY b.warehouse_id, b.location_id, b.item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;