// Compatibility hooks for Warehouse integration
import { useState } from 'react';
import type { InventoryItem, StockMovement } from '../types';

export const useInventoryCompat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  return { inventory, isLoading };
};

export const useLowStockItemsCompat = () => {
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);

  return { lowStockItems };
};

export const useInventoryReportCompat = () => {
  const [report, setReport] = useState<any>(null);

  return { report };
};

export const useStockMovementsCompat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  return { movements, isLoading };
};

export const useItemMovementsCompat = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);

  return { movements };
};
