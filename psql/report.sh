#!/usr/bin/env bash
# run_reports_all.sh
# Export several reports from postgres container (via docker exec) and optionally combine CSV -> XLSX.
# Usage:
#   ./run_reports_all.sh
# Or skip XLSX conversion:
#   SKIP_XLSX=1 ./run_reports_all.sh
set -euo pipefail

# --- CONFIG: sesuaikan bila perlu ---
CONTAINER="${CONTAINER:-postgres_pgdb}"
DB_USER="${DB_USER:-pguser}"
DB_NAME="${DB_NAME:-pgdb}"
OUT_DIR="${OUT_DIR:-reports_out}"
VENV_DIR="${VENV_DIR:-.venv_reports}"
OUT_XLSX="${OUT_XLSX:-combined_reports.xlsx}"
SKIP_XLSX="${SKIP_XLSX:-0}"   # set to 1 untuk skip conversion
# ------------------------------

mkdir -p "$OUT_DIR"
echo "Writing CSV reports to $OUT_DIR ... (container=$CONTAINER db=$DB_NAME user=$DB_USER)"

# helper function to run a psql \copy query and pipe to local file
run_copy() {
  local sql="$1"
  local outfile="$2"
  echo "- Exporting $outfile"
  docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "\copy ($sql) TO STDOUT WITH CSV HEADER" > "$OUT_DIR/$outfile"
}

# 1) total per item
run_copy "SELECT i.sku, i.name, COALESCE(SUM(b.remaining_qty),0) AS qty_on_hand, COALESCE(SUM(b.remaining_qty*COALESCE(b.cost_each,0)),0) AS fifo_value FROM items i LEFT JOIN batches b ON b.item_id = i.id GROUP BY i.sku, i.name ORDER BY i.sku" "total_per_item.csv"

# 2) stock per warehouse
run_copy "SELECT w.code AS warehouse_code, i.sku, i.name, COALESCE(SUM(b.remaining_qty),0) AS qty_on_hand FROM batches b JOIN items i ON i.id = b.item_id JOIN warehouses w ON w.id = b.warehouse_id GROUP BY w.code, i.sku, i.name ORDER BY w.code, i.sku" "stock_per_warehouse.csv"

# 3) stock per location (rack/box)
run_copy "SELECT w.code AS warehouse, l.code AS location_code, i.sku, i.name, COALESCE(SUM(b.remaining_qty),0) AS qty FROM batches b JOIN items i ON i.id = b.item_id JOIN locations l ON l.id = b.location_id JOIN warehouses w ON w.id = l.warehouse_id GROUP BY w.code, l.code, i.sku, i.name ORDER BY w.code, l.code, i.sku" "stock_per_location.csv"

# 4) FIFO batches
run_copy "SELECT i.sku, b.id AS batch_id, b.received_at, b.expiration_date, b.remaining_qty, b.cost_each, b.warehouse_id, b.location_id FROM batches b JOIN items i ON i.id = b.item_id WHERE b.remaining_qty > 0 ORDER BY i.sku, b.received_at" "fifo_batches.csv"

# 5) empty containers
run_copy "SELECT c.barcode, c.container_type, l.code AS location_code, w.code AS warehouse_code FROM containers c LEFT JOIN (SELECT container_id, SUM(remaining_qty) AS sum_qty FROM batches GROUP BY container_id) s ON s.container_id = c.id LEFT JOIN locations l ON l.id = c.current_location_id LEFT JOIN warehouses w ON w.id = l.warehouse_id WHERE COALESCE(s.sum_qty,0) = 0" "empty_containers.csv"

# 6) fast movers (example last 30 days)
run_copy "WITH outflows AS (SELECT item_id, abs(sum(qty)) AS qty_out FROM stock_movements WHERE movement_type IN ('sale','transfer_out') AND created_at >= now() - interval '30 days' GROUP BY item_id) SELECT i.sku, i.name, COALESCE(o.qty_out,0) AS qty_30d FROM items i LEFT JOIN outflows o ON o.item_id = i.id ORDER BY COALESCE(o.qty_out,0) DESC NULLS LAST" "fast_movers_30d.csv"

# 7) PO / supplier report
run_copy "SELECT po.po_number, s.name as supplier, po.order_date, b.item_id, i.sku, i.name, b.received_qty, b.remaining_qty, b.received_at FROM purchase_orders po LEFT JOIN suppliers s ON s.id = po.supplier_id LEFT JOIN batches b ON b.po_id = po.id LEFT JOIN items i ON i.id = b.item_id ORDER BY po.order_date DESC" "po_supplier_batches.csv"

echo "CSV export complete."

if [ "$SKIP_XLSX" = "1" ]; then
  echo "SKIP_XLSX=1 set -> skipping CSV->XLSX conversion. Done."
  exit 0
fi

# --- CSV -> XLSX conversion using Python pandas/openpyxl ---
# check python3
if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 not found in PATH. Please install python3 to convert CSV -> XLSX, or set SKIP_XLSX=1 to skip."
  exit 2
fi

# setup venv if not exists
if [ ! -d "$VENV_DIR" ]; then
  echo "Creating venv in $VENV_DIR and installing pandas,openpyxl..."
  python3 -m venv "$VENV_DIR"
  # shellcheck disable=SC1090
  source "$VENV_DIR/bin/activate"
  pip install --upgrade pip >/dev/null
  pip install pandas openpyxl >/dev/null
else
  # activate
  # shellcheck disable=SC1090
  source "$VENV_DIR/bin/activate"
fi

echo "Combining CSV files into $OUT_XLSX ..."
python3 - <<PYCODE
import os, glob, pandas as pd
out_dir = os.environ.get('OUT_DIR', '${OUT_DIR}')
out_xlsx = os.environ.get('OUT_XLSX', '${OUT_XLSX}')
csvs = sorted(glob.glob(os.path.join(out_dir, '*.csv')))
if not csvs:
    print('No CSV files found in', out_dir)
    raise SystemExit(0)
with pd.ExcelWriter(out_xlsx, engine='openpyxl') as writer:
    for p in csvs:
        name = os.path.splitext(os.path.basename(p))[0][:31]
        try:
            df = pd.read_csv(p)
        except Exception as e:
            print('Failed to read', p, ':', e)
            continue
        df.to_excel(writer, sheet_name=name, index=False)
        print('Added', p, '-> sheet', name)
print('Written', out_xlsx)
PYCODE

deactivate 2>/dev/null || true
echo "All done. CSV files in $OUT_DIR, Excel file: $OUT_XLSX"