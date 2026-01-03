// ===================================
// Warehouse Management Types
// ===================================

// Inventory Types
export interface InventoryItem {
  id: string;
  sku: string;
  itemCode: string;
  itemName: string;
  description: string;
  category: string;
  subCategory?: string;
  unit: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  location: WarehouseLocation;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
  unitPrice: number;
  totalValue: number;
  supplier?: string;
  barcode?: string;
  images?: string[];
  attributes?: Record<string, string>;
  lastRestocked?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseLocation {
  warehouse: string;
  zone: string;
  aisle: string;
  rack: string;
  shelf: string;
  bin: string;
}

// Stock Movement Types
export interface StockMovement {
  id: string;
  movementNumber: string;
  itemId: string;
  itemName: string;
  sku: string;
  movementType: 'in' | 'out' | 'transfer' | 'adjustment' | 'return';
  transactionType: 'purchase' | 'sale' | 'production' | 'damage' | 'theft' | 'found' | 'expired' | 'other';
  quantity: number;
  unit: string;
  fromLocation?: WarehouseLocation;
  toLocation?: WarehouseLocation;
  referenceNumber?: string;
  reason: string;
  performedBy: string;
  performedById: string;
  approvedBy?: string;
  approvalDate?: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  cost?: number;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

// Stock Opname (Physical Count) Types
export interface StockOpname {
  id: string;
  opnameNumber: string;
  warehouseLocation: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  items: OpnameItem[];
  performedBy: string[];
  supervisor?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OpnameItem {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  systemQuantity: number;
  actualQuantity: number;
  difference: number;
  discrepancyReason?: string;
  status: 'matched' | 'over' | 'short' | 'missing';
  unit: string;
}

// Batch/Lot Tracking
export interface BatchTracking {
  id: string;
  batchNumber: string;
  itemId: string;
  itemName: string;
  quantity: number;
  manufactureDate: string;
  expiryDate?: string;
  receivedDate: string;
  supplier?: string;
  status: 'active' | 'expired' | 'recalled' | 'depleted';
  location: WarehouseLocation;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Form Data Types
export interface InventoryFormData {
  itemCode: string;
  itemName: string;
  description: string;
  category: string;
  subCategory?: string;
  unit: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  location: WarehouseLocation;
  unitPrice: number;
  supplier?: string;
  barcode?: string;
  expiryDate?: string;
  attributes?: Record<string, string>;
}

export interface StockMovementFormData {
  itemId: string;
  movementType: StockMovement['movementType'];
  transactionType: StockMovement['transactionType'];
  quantity: number;
  fromLocation?: WarehouseLocation;
  toLocation?: WarehouseLocation;
  referenceNumber?: string;
  reason: string;
  cost?: number;
  notes?: string;
  attachments?: File[];
}

export interface OpnameFormData {
  warehouseLocation: string;
  scheduledDate: string;
  itemsToCount: string[];
  supervisor?: string;
  notes?: string;
}

// Statistics Types
export interface WarehouseStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalMovementsToday: number;
  totalMovementsThisMonth: number;
  stockAccuracy: number;
  turnoverRate: number;
  averageInventoryValue: number;
}

// Report Types
export interface InventoryReport {
  reportDate: string;
  warehouseLocation: string;
  totalItems: number;
  totalValue: number;
  itemsByCategory: Record<string, number>;
  stockStatus: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  topItems: {
    itemName: string;
    quantity: number;
    value: number;
  }[];
  slowMovingItems: {
    itemName: string;
    quantity: number;
    lastMovement: string;
  }[];
}

export interface StockMovementReport {
  reportDate: string;
  period: {
    start: string;
    end: string;
  };
  totalMovements: number;
  movementsByType: Record<StockMovement['movementType'], number>;
  movementsByTransaction: Record<StockMovement['transactionType'], number>;
  topMovedItems: {
    itemName: string;
    totalQuantity: number;
    movements: number;
  }[];
}
