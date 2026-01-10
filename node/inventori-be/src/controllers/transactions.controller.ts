import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';

export const getAllTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, start_date, end_date, requester, role, code } = req.query;

    let query = `
      SELECT t.*, 
             i.nama_barang as item_name, 
             i.kode_barang as item_code,
             i.qty as item_qty
      FROM transactions t
      LEFT JOIN items i ON t.item_id = i.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (type && type !== 'ALL') {
      query += ` AND t.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (start_date) {
      query += ` AND t.created_at >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND t.created_at <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    if (requester) {
      query += ` AND t.requester ILIKE $${paramIndex}`;
      params.push(`%${requester}%`);
      paramIndex++;
    }

    if (role && role !== '-') {
      query += ` AND t.requester_role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    if (code) {
      query += ` AND t.code = $${paramIndex}`;
      params.push(code);
      paramIndex++;
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};

export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { code, item_name, type, quantity, requester, requester_role, location } = req.body;
  const user = (req as any).user;

  try {
    // Insert atau update item
    await pool.query(
      `INSERT INTO items (code, name, stock) 
       VALUES ($1, $2, 0) 
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name`,
      [code, item_name]
    );

    // Get current stock
    const itemResult = await pool.query(
      'SELECT id, COALESCE(stock, 0) as stock FROM items WHERE code = $1',
      [code]
    );

    if (itemResult.rows.length === 0) {
      res.status(404).json({ error: 'Item tidak ditemukan' });
      return;
    }

    const { id: item_id, stock: current_stock } = itemResult.rows[0];
    const new_stock = type === 'IN' 
      ? current_stock + quantity 
      : Math.max(0, current_stock - quantity);

    // Update stock
    await pool.query(
      'UPDATE items SET stock = $1, updated_at = NOW() WHERE id = $2',
      [new_stock, item_id]
    );

    // Insert transaction
    const result = await pool.query(
      `INSERT INTO transactions 
       (code, item_id, type, quantity, stock_after, requester, requester_role, servant, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [code, item_id, type, quantity, new_stock, requester, requester_role || '-', user.username, location || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};

export const getTransactionsByItem = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.params;

  try {
    const result = await pool.query(
      `SELECT t.*, i.name as item_name 
       FROM transactions t
       JOIN items i ON t.item_id = i.id
       WHERE t.code = $1
       ORDER BY t.created_at ASC`,
      [code]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get transactions by item error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};

export const getStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params: any[] = [];
    if (start_date && end_date) {
      dateFilter = 'WHERE created_at BETWEEN $1 AND $2';
      params.push(start_date, end_date);
    }

    const totalItemsResult = await pool.query('SELECT COUNT(*) FROM items');
    const totalStockResult = await pool.query('SELECT COALESCE(SUM(stock), 0) FROM items');
    
    const totalInResult = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) FROM transactions WHERE type = 'IN' ${dateFilter}`,
      params
    );
    
    const totalOutResult = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) FROM transactions WHERE type = 'OUT' ${dateFilter}`,
      params
    );

    const transCountResult = await pool.query(
      `SELECT COUNT(*) FROM transactions ${dateFilter}`,
      params
    );

    res.json({
      total_items: parseInt(totalItemsResult.rows[0].count),
      total_stock: parseInt(totalStockResult.rows[0].coalesce),
      total_in: parseInt(totalInResult.rows[0].coalesce),
      total_out: parseInt(totalOutResult.rows[0].coalesce),
      total_transactions: parseInt(transCountResult.rows[0].count),
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};
