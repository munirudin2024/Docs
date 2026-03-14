import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "http://172.19.0.8:8080";

// --- Types ---
export interface ApiBarang {
  id_barang: number;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  unit: string;
  min_stok: number;
  created_at: string;
  harga_beli?: string;
  satuan?: string;
  stok_minimum?: number;
}

export interface ApiSupplier {
  id: number;
  id_supplier?: number;
  kode_supplier?: string;
  nama_supplier: string;
  alamat: string;
  no_telp: string;
  no_telepon?: string;
  email: string;
  created_at: string;
  kota?: string;
  website?: string;
  contact_person?: string;
}

export interface ApiStok {
  id: number;
  kode_barang: string;
  nama_barang: string;
  lokasi: string;
  jumlah: number;
  updated_at: string;
  status_stok?: string;
  stok_tersedia?: number;
  satuan?: string;
}

export interface ApiExpired {
  id: number;
  kode_barang: string;
  nama_barang: string;
  lokasi: string;
  jumlah: number;
  expired_date: string;
  hari_tersisa: number;
  sisa_hari?: number;
}

// --- Fetcher Helper ---
async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  const json = await res.json();
  // Handle wrapped response { data: [...] }
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as any).data as T;
  }
  return json as T;
}

// --- Barang Hooks ---
export function useBarang(options?: { search?: string; kategori?: string }) {
  return useQuery({
    queryKey: ["barang", options?.search, options?.kategori],
    queryFn: () => {
      const params = new URLSearchParams();
      if (options?.search) params.append("search", options.search);
      if (options?.kategori) params.append("kategori", options.kategori);
      const query = params.toString() ? `?${params.toString()}` : "";
      return fetcher<ApiBarang[]>(`/api/barang${query}`);
    },
  });
}

export function useBarangById(id: number) {
  return useQuery({
    queryKey: ["barang", id],
    queryFn: () => fetcher<ApiBarang>(`/api/barang/${id}`),
    enabled: !!id,
  });
}

export function useCreateBarang() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { data: any }) =>
      fetcher<ApiBarang>("/api/barang", { method: "POST", body: JSON.stringify(data.data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["barang"] }),
  });
}

export function useUpdateBarang() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      fetcher<ApiBarang>(`/api/barang/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["barang"] }),
  });
}

export function useDeleteBarang() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      fetcher<void>(`/api/barang/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["barang"] }),
  });
}

// --- Supplier Hooks ---
export function useSuppliers(options?: { search?: string }) {
  return useQuery({
    queryKey: ["supplier", options?.search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (options?.search) params.append("search", options.search);
      const query = params.toString() ? `?${params.toString()}` : "";
      return fetcher<ApiSupplier[]>(`/api/supplier${query}`);
    },
  });
}

export function useSupplierById(id: number) {
  return useQuery({
    queryKey: ["supplier", id],
    queryFn: () => fetcher<ApiSupplier>(`/api/supplier/${id}`),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { data: any }) =>
      fetcher<ApiSupplier>("/api/supplier", { method: "POST", body: JSON.stringify(data.data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier"] }),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      fetcher<ApiSupplier>(`/api/supplier/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier"] }),
  });
}

// --- Stok Hooks ---
export function useStokHarian() {
  return useQuery({
    queryKey: ["stok"],
    queryFn: () => fetcher<ApiStok[]>("/api/stok"),
  });
}

export function useStokExpired() {
  return useQuery({
    queryKey: ["stok-expired"],
    queryFn: () => fetcher<ApiExpired[]>("/api/stok/expired"),
  });
}

// --- Aliases for backward compatibility ---
export const useListBarang = useBarang;
export const useListStok = useStokHarian;
export const useListSupplier = useSuppliers;
export const useListStokExpired = useStokExpired;

// --- Generic Hooks ---
export function useApiGet<T>(endpoint: string) {
  return useQuery({
    queryKey: [endpoint],
    queryFn: () => fetcher<T>(endpoint),
  });
}

export function useApiPost<T, D = unknown>(endpoint: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: D) =>
      fetcher<T>(endpoint, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [endpoint] }),
  });
}

export function useApiPut<T, D = unknown>(endpoint: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: D }) =>
      fetcher<T>(`${endpoint}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [endpoint] }),
  });
}

export function useApiDelete(endpoint: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      fetcher<void>(`${endpoint}/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [endpoint] }),
  });
}