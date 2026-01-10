import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';

export const getAllItems = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT * FROM items ORDER BY nama_barang ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get all items error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};

export const getItemById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM items WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Item tidak ditemukan' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get item by id error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};

export const searchItems = async (req: Request, res: Response): Promise<void> => {
  const { query } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM items 
       WHERE kode_barang ILIKE $1 
       OR nama_barang ILIKE $1 
       OR kategori ILIKE $1 
       ORDER BY nama_barang ASC`,
      [`%${query}%`]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Search items error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};

export const createItem = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { kode_barang, nama_barang, kategori, lokasi, qty, satuan, keterangan } = req.body;

  try {
    // Check if kode_barang already exists
    const existing = await pool.query(
      'SELECT id FROM items WHERE kode_barang = $1',
      [kode_barang]
    );

    if (existing.rows.length > 0) {
      res.status(400).json({ error: 'Kode barang sudah ada' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO items (kode_barang, nama_barang, kategori, lokasi, qty, satuan, keterangan) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [kode_barang, nama_barang, kategori, lokasi, qty || 0, satuan, keterangan]
    );

    // Log audit
    const user = (req as any).user;
    await pool.query(
      `INSERT INTO audit_logs (user_id, item_id, action, qty_after, keterangan) 
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, result.rows[0].id, 'tambah', qty || 0, 'Item baru ditambahkan']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};

export const updateItem = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { id } = req.params;
  const { nama_barang, kategori, lokasi, qty, satuan, keterangan } = req.body;

  try {
    // Get current item
    const current = await pool.query('SELECT * FROM items WHERE id = $1', [id]);

    if (current.rows.length === 0) {
      res.status(404).json({ error: 'Item tidak ditemukan' });
      return;
    }

    const currentItem = current.rows[0];

    const result = await pool.query(
      `UPDATE items 
       SET nama_barang = COALESCE($1, nama_barang),
           kategori = COALESCE($2, kategori),
           lokasi = COALESCE($3, lokasi),
           qty = COALESCE($4, qty),
           satuan = COALESCE($5, satuan),
           keterangan = COALESCE($6, keterangan),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [nama_barang, kategori, lokasi, qty, satuan, keterangan, id]
    );

    // Log audit if qty changed
    if (qty !== undefined && qty !== currentItem.qty) {
      const user = (req as any).user;
      await pool.query(
        `INSERT INTO audit_logs (user_id, item_id, action, qty_before, qty_after, keterangan) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, id, 'update', currentItem.qty, qty, 'Update qty']
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Item tidak ditemukan' });
      return;
    }

    res.json({ message: 'Item berhasil dihapus', item: result.rows[0] });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};

export const scanItem = async (req: Request, res: Response): Promise<void> => {
  const { kode_barang } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM items WHERE kode_barang = $1',
      [kode_barang]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Item tidak ditemukan' });
      return;
    }

    const item = result.rows[0];

    // Log audit
    const user = (req as any).user;
    await pool.query(
      `INSERT INTO audit_logs (user_id, item_id, action, qty_after, keterangan) 
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, item.id, 'scan', item.qty, `Scan barcode: ${kode_barang}`]
    );

    res.json(item);
  } catch (error) {
    console.error('Scan item error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};
