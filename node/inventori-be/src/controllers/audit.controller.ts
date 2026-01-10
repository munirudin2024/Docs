import { Request, Response } from 'express';
import pool from '../config/database';

export const getAllAuditLogs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT al.*, u.username, u.nama_lengkap, i.kode_barang, i.nama_barang
       FROM audit_logs al
       JOIN users u ON al.user_id = u.id
       JOIN items i ON al.item_id = i.id
       ORDER BY al.created_at DESC
       LIMIT 100`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get all audit logs error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};

export const getAuditLogsByItem = async (req: Request, res: Response): Promise<void> => {
  const { itemId } = req.params;

  try {
    const result = await pool.query(
      `SELECT al.*, u.username, u.nama_lengkap
       FROM audit_logs al
       JOIN users u ON al.user_id = u.id
       WHERE al.item_id = $1
       ORDER BY al.created_at DESC`,
      [itemId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get audit logs by item error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};

export const getAuditLogsByUser = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT al.*, i.kode_barang, i.nama_barang
       FROM audit_logs al
       JOIN items i ON al.item_id = i.id
       WHERE al.user_id = $1
       ORDER BY al.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get audit logs by user error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};
