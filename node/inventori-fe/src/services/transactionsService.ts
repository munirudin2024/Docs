import api from '@/lib/axios';
import { Transaction, Statistics } from '@/types';

export const transactionsService = {
  async getAllTransactions(filters?: {
    type?: string;
    start_date?: string;
    end_date?: string;
    requester?: string;
    role?: string;
    code?: string;
  }): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>('/transactions', { params: filters });
    return response.data;
  },

  async getTransactionsByItem(code: string): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>(`/transactions/item/${code}`);
    return response.data;
  },

  async createTransaction(data: {
    code: string;
    item_name: string;
    type: 'IN' | 'OUT';
    quantity: number;
    requester: string;
    requester_role?: string;
    location?: string;
  }): Promise<Transaction> {
    const response = await api.post<Transaction>('/transactions', data);
    return response.data;
  },

  async getStatistics(filters?: {
    start_date?: string;
    end_date?: string;
  }): Promise<Statistics> {
    const response = await api.get<Statistics>('/transactions/statistics', { params: filters });
    return response.data;
  },
};
