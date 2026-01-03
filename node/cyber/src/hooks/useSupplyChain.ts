import { useState, useEffect, useCallback } from 'react';
import { vendorService, purchaseOrderService } from '../services';
import type {
  Vendor,
  PurchaseOrder,
  VendorFormData,
  PurchaseOrderFormData,
  SupplyChainStats,
} from '../types';

// ===================================
// Vendor Hooks
// ===================================

export const useVendor = (vendorId: string) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const data = await vendorService.getVendor(vendorId);
        setVendor(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vendor');
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      fetchVendor();
    }
  }, [vendorId]);

  return { vendor, loading, error };
};

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await vendorService.getAllVendors();
      setVendors(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const createVendor = useCallback(async (data: VendorFormData) => {
    try {
      await vendorService.createVendor(data);
      await fetchVendors();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vendor');
      return false;
    }
  }, [fetchVendors]);

  const updateVendor = useCallback(async (vendorId: string, data: Partial<VendorFormData>) => {
    try {
      await vendorService.updateVendor(vendorId, data);
      await fetchVendors();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor');
      return false;
    }
  }, [fetchVendors]);

  const deleteVendor = useCallback(async (vendorId: string) => {
    try {
      await vendorService.deleteVendor(vendorId);
      await fetchVendors();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vendor');
      return false;
    }
  }, [fetchVendors]);

  const updateVendorStatus = useCallback(async (vendorId: string, status: Vendor['status']) => {
    try {
      await vendorService.updateVendorStatus(vendorId, status);
      await fetchVendors();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor status');
      return false;
    }
  }, [fetchVendors]);

  return { vendors, loading, error, createVendor, updateVendor, deleteVendor, updateVendorStatus, refetch: fetchVendors };
};

export const useActiveVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const data = await vendorService.getActiveVendors();
        setVendors(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch active vendors');
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  return { vendors, loading, error };
};

// ===================================
// Purchase Order Hooks
// ===================================

export const usePurchaseOrder = (poId: string) => {
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPO = useCallback(async () => {
    try {
      setLoading(true);
      const data = await purchaseOrderService.getPurchaseOrder(poId);
      setPurchaseOrder(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch purchase order');
    } finally {
      setLoading(false);
    }
  }, [poId]);

  useEffect(() => {
    if (poId) {
      fetchPO();
    }
  }, [poId, fetchPO]);

  return { purchaseOrder, loading, error, refetch: fetchPO };
};

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPOs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await purchaseOrderService.getAllPurchaseOrders();
      setPurchaseOrders(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPOs();
  }, [fetchPOs]);

  const createPO = useCallback(async (vendorName: string, createdBy: string, data: PurchaseOrderFormData) => {
    try {
      await purchaseOrderService.createPurchaseOrder(vendorName, createdBy, data);
      await fetchPOs();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create purchase order');
      return false;
    }
  }, [fetchPOs]);

  const updatePO = useCallback(async (poId: string, data: Partial<PurchaseOrderFormData>) => {
    try {
      await purchaseOrderService.updatePurchaseOrder(poId, data);
      await fetchPOs();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update purchase order');
      return false;
    }
  }, [fetchPOs]);

  const deletePO = useCallback(async (poId: string) => {
    try {
      await purchaseOrderService.deletePurchaseOrder(poId);
      await fetchPOs();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete purchase order');
      return false;
    }
  }, [fetchPOs]);

  const updatePOStatus = useCallback(async (poId: string, status: PurchaseOrder['status']) => {
    try {
      await purchaseOrderService.updatePOStatus(poId, status);
      await fetchPOs();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update PO status');
      return false;
    }
  }, [fetchPOs]);

  const approvePO = useCallback(async (poId: string, approvedBy: string) => {
    try {
      await purchaseOrderService.approvePurchaseOrder(poId, approvedBy);
      await fetchPOs();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve purchase order');
      return false;
    }
  }, [fetchPOs]);

  const updatePaymentStatus = useCallback(async (poId: string, paymentStatus: PurchaseOrder['paymentStatus'], paymentMethod?: string) => {
    try {
      await purchaseOrderService.updatePaymentStatus(poId, paymentStatus, paymentMethod);
      await fetchPOs();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment status');
      return false;
    }
  }, [fetchPOs]);

  return {
    purchaseOrders,
    loading,
    error,
    createPO,
    updatePO,
    deletePO,
    updatePOStatus,
    approvePO,
    updatePaymentStatus,
    refetch: fetchPOs,
  };
};

export const usePurchaseOrdersByStatus = (status: PurchaseOrder['status']) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPOs = async () => {
      try {
        setLoading(true);
        const data = await purchaseOrderService.getPurchaseOrdersByStatus(status);
        setPurchaseOrders(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch purchase orders');
      } finally {
        setLoading(false);
      }
    };

    fetchPOs();
  }, [status]);

  return { purchaseOrders, loading, error };
};

export const usePurchaseOrdersByVendor = (vendorId: string) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPOs = async () => {
      try {
        setLoading(true);
        const data = await purchaseOrderService.getPurchaseOrdersByVendor(vendorId);
        setPurchaseOrders(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch purchase orders');
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      fetchPOs();
    }
  }, [vendorId]);

  return { purchaseOrders, loading, error };
};

// ===================================
// Supply Chain Stats Hook
// ===================================

export const useSupplyChainStats = () => {
  const [stats, setStats] = useState<SupplyChainStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await purchaseOrderService.getSupplyChainStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch supply chain stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};
