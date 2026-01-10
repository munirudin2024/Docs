import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';

export const createStockOpname = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { warehouse, code, location, pallet_no, counted_qty } = req.body;
  const user = (req as any).user;

  try {
    // Get item info
    const itemResult = await pool.query(
      'SELECT id, name, COALESCE(stock, 0) as stock FROM items WHERE code = $1',
      [code]
    );

    if (itemResult.rows.length === 0) {
      res.status(404).json({ error: 'Item tidak ditemukan' });
      return;
    }

    const { id: item_id, name: item_name, stock: expected_qty } = itemResult.rows[0];
    const diff = counted_qty - expected_qty;

    // Insert stock opname
    const result = await pool.query(
      `INSERT INTO stock_opname 
       (warehouse, item_id, code, item_name, location, pallet_no, expected_qty, counted_qty, diff, checked_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [warehouse, item_id, code, item_name, location, pallet_no, expected_qty, counted_qty, diff, user.username]
    );

    // Update pallet registry if pallet_no provided
    if (pallet_no) {
      await pool.query(
        `INSERT INTO pallets (warehouse, pallet_no, last_seen_by)
         VALUES ($1, $2, $3)
         ON CONFLICT (warehouse, pallet_no) 
         DO UPDATE SET last_seen_at = CURRENT_TIMESTAMP, last_seen_by = EXCLUDED.last_seen_by`,
        [warehouse, pallet_no, user.username]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create stock opname error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};

export const getAllStockOpname = async (req: Request, res: Response): Promise<void> => {
  try {
    const { warehouse, code, start_date, end_date } = req.query;

    let query = 'SELECT * FROM stock_opname WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (warehouse) {
      query += ` AND warehouse = $${paramIndex}`;
      params.push(warehouse);
      paramIndex++;
    }

    if (code) {
      query += ` AND code = $${paramIndex}`;
      params.push(code);
      paramIndex++;
    }

    if (start_date) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get all stock opname error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};

export const getStockOpnameAudit = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.params;
  const { start_date, end_date } = req.query;

  try {
    // Get item info
    const itemResult = await pool.query(
      'SELECT name, COALESCE(stock, 0) as stock FROM items WHERE code = $1',
      [code]
    );

    if (itemResult.rows.length === 0) {
      res.status(404).json({ error: 'Item tidak ditemukan' });
      return;
    }

    const { name: item_name, stock: system_stock } = itemResult.rows[0];

    // Date params
    const params: any[] = [code];
    let dateFilter = '';
    if (start_date && end_date) {
      dateFilter = 'AND created_at BETWEEN $2 AND $3';
      params.push(start_date, end_date);
    }

    // Get aggregated totals
    const totalsResult = await pool.query(
      `SELECT 
        COALESCE(SUM(expected_qty), 0) as total_expected,
        COALESCE(SUM(counted_qty), 0) as total_counted,
        COALESCE(SUM(diff), 0) as total_diff
       FROM stock_opname
       WHERE code = $1 ${dateFilter}`,
      params
    );

    // Per warehouse
    const perWarehouseResult = await pool.query(
      `SELECT 
        warehouse,
        COALESCE(SUM(counted_qty), 0) as qty,
        COALESCE(SUM(diff), 0) as diff,
        MAX(created_at) as last_seen
       FROM stock_opname
       WHERE code = $1 ${dateFilter}
       GROUP BY warehouse
       ORDER BY warehouse`,
      params
    );

    // Per location type
    const perLocationTypeResult = await pool.query(
      `SELECT 
        CASE 
          WHEN lower(location) LIKE '%palet%' OR lower(location) LIKE '%pallet%' THEN 'palet'
          ELSE 'rak'
        END as loc_type,
        COALESCE(SUM(counted_qty), 0) as qty
       FROM stock_opname
       WHERE code = $1 ${dateFilter}
       GROUP BY loc_type
       ORDER BY loc_type`,
      params
    );

    // Details
    const detailsResult = await pool.query(
      `SELECT 
        warehouse,
        location,
        COALESCE(SUM(counted_qty), 0) as qty,
        MAX(created_at) as last_seen
       FROM stock_opname
       WHERE code = $1 ${dateFilter}
       GROUP BY warehouse, location
       ORDER BY warehouse, location`,
      params
    );

    res.json({
      item_code: code,
      item_name,
      system_stock,
      totals: totalsResult.rows[0],
      per_warehouse: perWarehouseResult.rows,
      per_location_type: perLocationTypeResult.rows,
      details: detailsResult.rows,
    });
  } catch (error) {
    console.error('Get stock opname audit error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};

export const getPallets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { warehouse } = req.query;

    let query = 'SELECT * FROM pallets';
    const params: any[] = [];

    if (warehouse) {
      query += ' WHERE warehouse = $1';
      params.push(warehouse);
    }

    query += ' ORDER BY warehouse, pallet_no';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get pallets error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};
