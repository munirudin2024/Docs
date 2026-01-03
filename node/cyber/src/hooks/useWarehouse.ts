import { useState, useEffect, useCallback } from 'react';
import { inventoryService, stockMovementService, warehouseStatsService } from '../services';
import type {
  InventoryItem,
  StockMovement,
  InventoryFormData,
  StockMovementFormData,
  WarehouseStats,
  InventoryReport,
  StockMovementReport,
} from '../types';

// ===================================
// Inventory Hooks
// ===================================

export const useInventoryItem = (itemId: string) => {
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getItem(itemId);
      setItem(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch item');
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    if (itemId) {
      fetchItem();
    }
  }, [itemId, fetchItem]);

  return { item, loading, error, refetch: fetchItem };
};

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getAllItems();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const createItem = useCallback(async (data: InventoryFormData) => {
    try {
      await inventoryService.createItem(data);
      await fetchItems();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
      return false;
    }
  }, [fetchItems]);

  const updateItem = useCallback(async (itemId: string, data: Partial<InventoryFormData>) => {
    try {
      await inventoryService.updateItem(itemId, data);
      await fetchItems();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      return false;
    }
  }, [fetchItems]);

  const deleteItem = useCallback(async (itemId: string) => {
    try {
      await inventoryService.deleteItem(itemId);
      await fetchItems();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      return false;
    }
  }, [fetchItems]);

  const discontinueItem = useCallback(async (itemId: string) => {
    try {
      await inventoryService.discontinueItem(itemId);
      await fetchItems();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to discontinue item');
      return false;
    }
  }, [fetchItems]);

  return { items, loading, error, createItem, updateItem, deleteItem, discontinueItem, refetch: fetchItems };
};

export const useLowStockItems = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await inventoryService.getLowStockItems();
        setItems(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch low stock items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return { items, loading, error };
};

export const useInventoryByCategory = (category: string) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await inventoryService.getItemsByCategory(category);
        setItems(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch items by category');
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchItems();
    }
  }, [category]);

  return { items, loading, error };
};

export const useInventorySearch = (searchTerm: string) => {
  const [results, setResults] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchItems = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const data = await inventoryService.searchItems(searchTerm);
        setResults(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search items');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      searchItems();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  return { results, loading, error };
};

export const useInventoryReport = (warehouseLocation?: string) => {
  const [report, setReport] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getInventoryReport(warehouseLocation);
      setReport(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory report');
    } finally {
      setLoading(false);
    }
  }, [warehouseLocation]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { report, loading, error, refetch: fetchReport };
};

// ===================================
// Stock Movement Hooks
// ===================================

export const useStockMovement = (movementId: string) => {
  const [movement, setMovement] = useState<StockMovement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovement = useCallback(async () => {
    try {
      setLoading(true);
      const data = await stockMovementService.getMovement(movementId);
      setMovement(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movement');
    } finally {
      setLoading(false);
    }
  }, [movementId]);

  useEffect(() => {
    if (movementId) {
      fetchMovement();
    }
  }, [movementId, fetchMovement]);

  return { movement, loading, error, refetch: fetchMovement };
};

export const useStockMovements = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(async () => {
    try {
      setLoading(true);
      const data = await stockMovementService.getAllMovements();
      setMovements(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const createMovement = useCallback(async (
    performedBy: string,
    performedById: string,
    data: StockMovementFormData
  ) => {
    try {
      await stockMovementService.createMovement(performedBy, performedById, data);
      await fetchMovements();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create movement');
      return false;
    }
  }, [fetchMovements]);

  const approveMovement = useCallback(async (movementId: string, approvedBy: string) => {
    try {
      await stockMovementService.approveMovement(movementId, approvedBy);
      await fetchMovements();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve movement');
      return false;
    }
  }, [fetchMovements]);

  const cancelMovement = useCallback(async (movementId: string) => {
    try {
      await stockMovementService.cancelMovement(movementId);
      await fetchMovements();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel movement');
      return false;
    }
  }, [fetchMovements]);

  const deleteMovement = useCallback(async (movementId: string) => {
    try {
      await stockMovementService.deleteMovement(movementId);
      await fetchMovements();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete movement');
      return false;
    }
  }, [fetchMovements]);

  return {
    movements,
    loading,
    error,
    createMovement,
    approveMovement,
    cancelMovement,
    deleteMovement,
    refetch: fetchMovements,
  };
};

export const useItemMovements = (itemId: string) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        setLoading(true);
        const data = await stockMovementService.getMovementsByItem(itemId);
        setMovements(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch item movements');
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchMovements();
    }
  }, [itemId]);

  return { movements, loading, error };
};

export const useStockMovementReport = (startDate: string, endDate: string) => {
  const [report, setReport] = useState<StockMovementReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await stockMovementService.getStockMovementReport(startDate, endDate);
      setReport(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movement report');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport();
    }
  }, [startDate, endDate, fetchReport]);

  return { report, loading, error, refetch: fetchReport };
};

// ===================================
// Warehouse Stats Hook
// ===================================

export const useWarehouseStats = () => {
  const [stats, setStats] = useState<WarehouseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await warehouseStatsService.getWarehouseStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch warehouse stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};
