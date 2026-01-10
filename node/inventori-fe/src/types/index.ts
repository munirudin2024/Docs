export interface User {
  id: number;
  username: string;
  nama_lengkap: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Item {
  id: number;
  code?: string;
  name?: string;
  stock?: number;
  kode_barang?: string;
  nama_barang?: string;
  kategori?: string;
  lokasi?: string;
  qty?: number;
  satuan?: string;
  keterangan?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  code?: string;
  item_id: number;
  item_name?: string;
  item_code?: string;
  type: 'IN' | 'OUT';
  quantity: number;
  stock_after: number;
  requester: string;
  requester_role: string;
  servant: string;
  location: string;
  created_at: string;
}

export interface StockOpname {
  id: number;
  warehouse: string;
  item_id: number;
  code?: string;
  item_name?: string;
  location?: string;
  pallet_no?: number;
  expected_qty: number;
  counted_qty: number;
  diff: number;
  checked_by?: string;
  created_at: string;
}

export interface Pallet {
  id: number;
  warehouse: string;
  pallet_no: number;
  description?: string;
  last_seen_at: string;
  last_seen_by?: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  item_id: number;
  action: 'scan' | 'tambah' | 'kurang' | 'update';
  qty_before?: number;
  qty_after?: number;
  keterangan?: string;
  created_at: string;
  username?: string;
  nama_lengkap?: string;
  kode_barang?: string;
  nama_barang?: string;
}

export interface Statistics {
  total_items: number;
  total_stock: number;
  total_in: number;
  total_out: number;
  total_transactions: number;
}
