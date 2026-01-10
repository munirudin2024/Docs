import api from '@/lib/axios';
import { Item } from '@/types';

export const itemsService = {
  async getAllItems(): Promise<Item[]> {
    const response = await api.get<Item[]>('/items');
    return response.data;
  },

  async getItemById(id: number): Promise<Item> {
    const response = await api.get<Item>(`/items/${id}`);
    return response.data;
  },

  async searchItems(query: string): Promise<Item[]> {
    const response = await api.get<Item[]>(`/items/search/${query}`);
    return response.data;
  },

  async createItem(item: Partial<Item>): Promise<Item> {
    const response = await api.post<Item>('/items', item);
    return response.data;
  },

  async updateItem(id: number, item: Partial<Item>): Promise<Item> {
    const response = await api.put<Item>(`/items/${id}`, item);
    return response.data;
  },

  async deleteItem(id: number): Promise<void> {
    await api.delete(`/items/${id}`);
  },

  async scanItem(kode_barang: string): Promise<Item> {
    const response = await api.post<Item>(`/items/scan/${kode_barang}`);
    return response.data;
  },
};
