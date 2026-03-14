import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// --- MOCK USERS ---
export interface MockUser {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  department: string;
  is_active: boolean;
  last_login: string;
}

let mockUsersDB: MockUser[] = [
  { id: 1, username: "admin", name: "System Admin", email: "admin@whppic.com", role: "ADMIN", department: "IT", is_active: true, last_login: "2025-01-20T10:30:00Z" },
  { id: 2, username: "budi", name: "Budi Santoso", email: "budi@whppic.com", role: "WH_SUPERVISOR", department: "Gudang", is_active: true, last_login: "2025-01-22T08:15:00Z" },
  { id: 3, username: "andi", name: "Andi Saputra", email: "andi@whppic.com", role: "WH_STAFF", department: "Gudang", is_active: true, last_login: "2025-01-22T09:00:00Z" },
  { id: 4, username: "siti", name: "Siti Rahma", email: "siti@whppic.com", role: "PPIC", department: "PPIC", is_active: true, last_login: "2025-01-21T14:20:00Z" },
  { id: 5, username: "qc", name: "Dewi Lestari", email: "dewi@whppic.com", role: "QC", department: "Quality Control", is_active: true, last_login: "2025-01-21T11:00:00Z" },
  { id: 6, username: "security", name: "Bambang Pamungkas", email: "bambang@whppic.com", role: "SECURITY", department: "Security", is_active: true, last_login: "2025-01-22T07:00:00Z" },
  { id: 7, username: "prod", name: "Rudi Hartono", email: "rudi@whppic.com", role: "BYPRODUCT", department: "Byproduct", is_active: true, last_login: "2025-01-22T08:30:00Z" },
  { id: 8, username: "mtc", name: "Hendra Wijaya", email: "hendra@whppic.com", role: "MAINTENANCE", department: "Maintenance", is_active: true, last_login: "2025-01-21T16:45:00Z" },
];

export function useMockUsers() {
  return useQuery({
    queryKey: ["mock-users"],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 600)); // simulate latency
      return [...mockUsersDB];
    }
  });
}

export function useCreateMockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<MockUser, "id" | "last_login">) => {
      await new Promise(r => setTimeout(r, 600));
      const newUser = { ...data, id: Date.now(), last_login: "-" };
      mockUsersDB.push(newUser);
      return newUser;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mock-users"] })
  });
}

export function useUpdateMockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<MockUser> & { id: number }) => {
      await new Promise(r => setTimeout(r, 600));
      const idx = mockUsersDB.findIndex(u => u.id === id);
      if (idx > -1) {
        mockUsersDB[idx] = { ...mockUsersDB[idx], ...data };
      }
      return mockUsersDB[idx];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mock-users"] })
  });
}

export function useDeleteMockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await new Promise(r => setTimeout(r, 600));
      mockUsersDB = mockUsersDB.filter(u => u.id !== id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mock-users"] })
  });
}

// --- MOCK ALERTS ---
export interface MockAlert {
  id: number;
  type: "WARNING" | "CRITICAL" | "INFO";
  title: string;
  message: string;
  related_item?: string;
  created_at: string;
  status: "UNREAD" | "READ" | "RESOLVED";
}

let mockAlertsDB: MockAlert[] = [
  { id: 1, type: "CRITICAL", title: "Stok Habis", message: "Stok RAW-001 (Resin A) telah habis di Gudang Utama.", related_item: "RAW-001", created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: "UNREAD" },
  { id: 2, type: "WARNING", title: "Barang Hampir Expired", message: "Label 4521 (Hardener) akan expired dalam 15 hari.", related_item: "MTC-112", created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: "UNREAD" },
  { id: 3, type: "INFO", title: "Penerimaan Selesai", message: "PO-2025-001 telah selesai diterima oleh staff gudang.", related_item: "PO-2025-001", created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: "READ" },
];

export function useMockAlerts() {
  return useQuery({
    queryKey: ["mock-alerts"],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 400));
      return [...mockAlertsDB];
    }
  });
}

export function useUpdateMockAlertStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number, status: MockAlert["status"] }) => {
      await new Promise(r => setTimeout(r, 300));
      const idx = mockAlertsDB.findIndex(a => a.id === id);
      if (idx > -1) mockAlertsDB[idx].status = status;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mock-alerts"] })
  });
}

export function useMarkAllAlertsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await new Promise(r => setTimeout(r, 400));
      mockAlertsDB = mockAlertsDB.map(a => a.status === "UNREAD" ? { ...a, status: "READ" } : a);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mock-alerts"] })
  });
}
