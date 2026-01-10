import api from '@/lib/axios';
import { AuditLog } from '@/types';

export const auditService = {
  async getAllAuditLogs(): Promise<AuditLog[]> {
    const response = await api.get<AuditLog[]>('/audit');
    return response.data;
  },

  async getAuditLogsByItem(itemId: number): Promise<AuditLog[]> {
    const response = await api.get<AuditLog[]>(`/audit/item/${itemId}`);
    return response.data;
  },

  async getAuditLogsByUser(userId: number): Promise<AuditLog[]> {
    const response = await api.get<AuditLog[]>(`/audit/user/${userId}`);
    return response.data;
  },
};
