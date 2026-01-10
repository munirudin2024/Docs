import api from '@/lib/axios';
import { StockOpname, Pallet } from '@/types';

export const opnameService = {
  async getAllStockOpname(filters?: {
    warehouse?: string;
    code?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<StockOpname[]> {
    const response = await api.get<StockOpname[]>('/opname', { params: filters });
    return response.data;
  },

  async getStockOpnameAudit(code: string, filters?: {
    start_date?: string;
    end_date?: string;
  }): Promise<any> {
    const response = await api.get(`/opname/audit/${code}`, { params: filters });
    return response.data;
  },

  async createStockOpname(data: {
    warehouse: string;
    code: string;
    location?: string;
    pallet_no?: number;
    counted_qty: number;
  }): Promise<StockOpname> {
    const response = await api.post<StockOpname>('/opname', data);
    return response.data;
  },

  async getPallets(warehouse?: string): Promise<Pallet[]> {
    const response = await api.get<Pallet[]>('/opname/pallets', { 
      params: warehouse ? { warehouse } : undefined 
    });
    return response.data;
  },
};
