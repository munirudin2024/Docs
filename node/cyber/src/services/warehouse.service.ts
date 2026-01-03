import { db } from '../config/firebase.config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import type {
  InventoryItem,
  StockMovement,
  StockOpname,
  OpnameItem,
  BatchTracking,
  InventoryFormData,
  StockMovementFormData,
  OpnameFormData,
  WarehouseStats,
  InventoryReport,
  StockMovementReport,
  WarehouseLocation
} from '../types';

// ===================================
// Inventory Service
// ===================================
class InventoryService {
  private collectionName = 'inventory_items';

  // Generate SKU
  private generateSKU(category: string, itemCode: string): string {
    const categoryPrefix = category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${categoryPrefix}-${itemCode}-${timestamp}`;
  }

  // Calculate stock status
  private calculateStatus(quantity: number, minStock: number, maxStock: number): InventoryItem['status'] {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= minStock) return 'low-stock';
    return 'in-stock';
  }

  // Get item by ID
  async getItem(itemId: string): Promise<InventoryItem | null> {
    try {
      const docRef = doc(db, this.collectionName, itemId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as InventoryItem;
      }
      return null;
    } catch (error) {
      console.error('Error getting item:', error);
      throw error;
    }
  }

  // Get all items
  async getAllItems(): Promise<InventoryItem[]> {
    try {
      const q = query(collection(db, this.collectionName), orderBy('itemName'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as InventoryItem));
    } catch (error) {
      console.error('Error getting items:', error);
      throw error;
    }
  }

  // Get items by category
  async getItemsByCategory(category: string): Promise<InventoryItem[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('category', '==', category),
        orderBy('itemName')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as InventoryItem));
    } catch (error) {
      console.error('Error getting items by category:', error);
      throw error;
    }
  }

  // Get items by status
  async getItemsByStatus(status: InventoryItem['status']): Promise<InventoryItem[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', status),
        orderBy('itemName')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as InventoryItem));
    } catch (error) {
      console.error('Error getting items by status:', error);
      throw error;
    }
  }

  // Get low stock items
  async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      const items = await this.getAllItems();
      return items.filter(item => item.quantity <= item.minStock && item.status !== 'discontinued');
    } catch (error) {
      console.error('Error getting low stock items:', error);
      throw error;
    }
  }

  // Get items by warehouse location
  async getItemsByLocation(warehouse: string): Promise<InventoryItem[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('location.warehouse', '==', warehouse),
        orderBy('itemName')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as InventoryItem));
    } catch (error) {
      console.error('Error getting items by location:', error);
      throw error;
    }
  }

  // Search items
  async searchItems(searchTerm: string): Promise<InventoryItem[]> {
    try {
      const allItems = await this.getAllItems();
      
      return allItems.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching items:', error);
      throw error;
    }
  }

  // Create item
  async createItem(data: InventoryFormData): Promise<string> {
    try {
      const sku = this.generateSKU(data.category, data.itemCode);
      const status = this.calculateStatus(data.quantity, data.minStock, data.maxStock);
      const totalValue = data.quantity * data.unitPrice;
      
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        sku,
        status,
        totalValue,
        lastRestocked: Timestamp.now().toDate().toISOString(),
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  // Update item
  async updateItem(itemId: string, data: Partial<InventoryFormData>): Promise<void> {
    try {
      const currentItem = await this.getItem(itemId);
      if (!currentItem) {
        throw new Error('Item not found');
      }

      const quantity = data.quantity !== undefined ? data.quantity : currentItem.quantity;
      const minStock = data.minStock !== undefined ? data.minStock : currentItem.minStock;
      const maxStock = data.maxStock !== undefined ? data.maxStock : currentItem.maxStock;
      const unitPrice = data.unitPrice !== undefined ? data.unitPrice : currentItem.unitPrice;

      const status = this.calculateStatus(quantity, minStock, maxStock);
      const totalValue = quantity * unitPrice;

      const docRef = doc(db, this.collectionName, itemId);
      await updateDoc(docRef, {
        ...data,
        status,
        totalValue,
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  // Update item quantity
  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    try {
      const item = await this.getItem(itemId);
      if (!item) {
        throw new Error('Item not found');
      }

      const status = this.calculateStatus(quantity, item.minStock, item.maxStock);
      const totalValue = quantity * item.unitPrice;

      const docRef = doc(db, this.collectionName, itemId);
      await updateDoc(docRef, {
        quantity,
        status,
        totalValue,
        lastRestocked: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw error;
    }
  }

  // Delete item
  async deleteItem(itemId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, itemId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }

  // Mark item as discontinued
  async discontinueItem(itemId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, itemId);
      await updateDoc(docRef, {
        status: 'discontinued',
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error discontinuing item:', error);
      throw error;
    }
  }

  // Get inventory report
  async getInventoryReport(warehouseLocation?: string): Promise<InventoryReport> {
    try {
      let items = await this.getAllItems();
      
      if (warehouseLocation) {
        items = items.filter(item => item.location.warehouse === warehouseLocation);
      }

      const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
      
      const itemsByCategory: Record<string, number> = {};
      items.forEach(item => {
        itemsByCategory[item.category] = (itemsByCategory[item.category] || 0) + 1;
      });

      const stockStatus = {
        inStock: items.filter(i => i.status === 'in-stock').length,
        lowStock: items.filter(i => i.status === 'low-stock').length,
        outOfStock: items.filter(i => i.status === 'out-of-stock').length,
      };

      const topItems = items
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 10)
        .map(item => ({
          itemName: item.itemName,
          quantity: item.quantity,
          value: item.totalValue,
        }));

      const report: InventoryReport = {
        reportDate: Timestamp.now().toDate().toISOString(),
        warehouseLocation: warehouseLocation || 'All Warehouses',
        totalItems: items.length,
        totalValue,
        itemsByCategory,
        stockStatus,
        topItems,
        slowMovingItems: [], // To be implemented with movement data
      };

      return report;
    } catch (error) {
      console.error('Error getting inventory report:', error);
      throw error;
    }
  }
}

// ===================================
// Stock Movement Service
// ===================================
class StockMovementService {
  private collectionName = 'stock_movements';
  private inventoryService = new InventoryService();

  // Generate movement number
  private generateMovementNumber(type: StockMovement['movementType']): string {
    const typePrefix = type === 'in' ? 'IN' : type === 'out' ? 'OUT' : 'TRF';
    const timestamp = Date.now().toString().slice(-8);
    return `${typePrefix}-${timestamp}`;
  }

  // Get movement by ID
  async getMovement(movementId: string): Promise<StockMovement | null> {
    try {
      const docRef = doc(db, this.collectionName, movementId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as StockMovement;
      }
      return null;
    } catch (error) {
      console.error('Error getting movement:', error);
      throw error;
    }
  }

  // Get all movements
  async getAllMovements(): Promise<StockMovement[]> {
    try {
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockMovement));
    } catch (error) {
      console.error('Error getting movements:', error);
      throw error;
    }
  }

  // Get movements by item
  async getMovementsByItem(itemId: string): Promise<StockMovement[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('itemId', '==', itemId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockMovement));
    } catch (error) {
      console.error('Error getting movements by item:', error);
      throw error;
    }
  }

  // Get movements by type
  async getMovementsByType(movementType: StockMovement['movementType']): Promise<StockMovement[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('movementType', '==', movementType),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockMovement));
    } catch (error) {
      console.error('Error getting movements by type:', error);
      throw error;
    }
  }

  // Get movements by date range
  async getMovementsByDateRange(startDate: string, endDate: string): Promise<StockMovement[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockMovement));
    } catch (error) {
      console.error('Error getting movements by date range:', error);
      throw error;
    }
  }

  // Create stock movement
  async createMovement(
    performedBy: string,
    performedById: string,
    data: StockMovementFormData
  ): Promise<string> {
    try {
      const item = await this.inventoryService.getItem(data.itemId);
      if (!item) {
        throw new Error('Item not found');
      }

      const movementNumber = this.generateMovementNumber(data.movementType);

      const docRef = await addDoc(collection(db, this.collectionName), {
        movementNumber,
        itemId: data.itemId,
        itemName: item.itemName,
        sku: item.sku,
        movementType: data.movementType,
        transactionType: data.transactionType,
        quantity: data.quantity,
        unit: item.unit,
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        referenceNumber: data.referenceNumber,
        reason: data.reason,
        performedBy,
        performedById,
        status: 'pending',
        cost: data.cost,
        notes: data.notes,
        attachments: data.attachments ? [] : undefined,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating movement:', error);
      throw error;
    }
  }

  // Approve and execute movement
  async approveMovement(movementId: string, approvedBy: string): Promise<void> {
    try {
      const movement = await this.getMovement(movementId);
      if (!movement) {
        throw new Error('Movement not found');
      }

      const item = await this.inventoryService.getItem(movement.itemId);
      if (!item) {
        throw new Error('Item not found');
      }

      // Calculate new quantity
      let newQuantity = item.quantity;
      
      if (movement.movementType === 'in') {
        newQuantity += movement.quantity;
      } else if (movement.movementType === 'out') {
        if (item.quantity < movement.quantity) {
          throw new Error('Insufficient stock');
        }
        newQuantity -= movement.quantity;
      } else if (movement.movementType === 'adjustment') {
        newQuantity = movement.quantity;
      }

      // Update inventory quantity
      await this.inventoryService.updateItemQuantity(movement.itemId, newQuantity);

      // Update movement status
      const docRef = doc(db, this.collectionName, movementId);
      await updateDoc(docRef, {
        status: 'completed',
        approvedBy,
        approvalDate: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error approving movement:', error);
      throw error;
    }
  }

  // Cancel movement
  async cancelMovement(movementId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, movementId);
      await updateDoc(docRef, {
        status: 'cancelled',
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error cancelling movement:', error);
      throw error;
    }
  }

  // Delete movement
  async deleteMovement(movementId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, movementId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting movement:', error);
      throw error;
    }
  }

  // Get stock movement report
  async getStockMovementReport(startDate: string, endDate: string): Promise<StockMovementReport> {
    try {
      const movements = await this.getMovementsByDateRange(startDate, endDate);

      const movementsByType: Record<StockMovement['movementType'], number> = {
        'in': 0,
        'out': 0,
        'transfer': 0,
        'adjustment': 0,
        'return': 0,
      };

      const movementsByTransaction: Record<StockMovement['transactionType'], number> = {
        'purchase': 0,
        'sale': 0,
        'production': 0,
        'damage': 0,
        'theft': 0,
        'found': 0,
        'expired': 0,
        'other': 0,
      };

      const itemMovements: Record<string, { itemName: string; totalQuantity: number; movements: number }> = {};

      movements.forEach(movement => {
        movementsByType[movement.movementType]++;
        movementsByTransaction[movement.transactionType]++;

        if (!itemMovements[movement.itemId]) {
          itemMovements[movement.itemId] = {
            itemName: movement.itemName,
            totalQuantity: 0,
            movements: 0,
          };
        }

        itemMovements[movement.itemId].totalQuantity += movement.quantity;
        itemMovements[movement.itemId].movements++;
      });

      const topMovedItems = Object.values(itemMovements)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 10);

      const report: StockMovementReport = {
        reportDate: Timestamp.now().toDate().toISOString(),
        period: {
          start: startDate,
          end: endDate,
        },
        totalMovements: movements.length,
        movementsByType,
        movementsByTransaction,
        topMovedItems,
      };

      return report;
    } catch (error) {
      console.error('Error getting stock movement report:', error);
      throw error;
    }
  }
}

// ===================================
// Warehouse Statistics Service
// ===================================
class WarehouseStatsService {
  private inventoryService = new InventoryService();
  private movementService = new StockMovementService();

  async getWarehouseStats(): Promise<WarehouseStats> {
    try {
      const items = await this.inventoryService.getAllItems();
      
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const endOfMonth = new Date().toISOString();

      const movementsToday = await this.movementService.getMovementsByDateRange(
        today,
        new Date().toISOString()
      );

      const movementsThisMonth = await this.movementService.getMovementsByDateRange(
        startOfMonth,
        endOfMonth
      );

      const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
      const activeItems = items.filter(i => i.status !== 'discontinued');

      const stats: WarehouseStats = {
        totalItems: activeItems.length,
        totalValue,
        lowStockItems: items.filter(i => i.status === 'low-stock').length,
        outOfStockItems: items.filter(i => i.status === 'out-of-stock').length,
        totalMovementsToday: movementsToday.length,
        totalMovementsThisMonth: movementsThisMonth.length,
        stockAccuracy: 95, // This would be calculated from stock opname data
        turnoverRate: 0, // This would be calculated from movement history
        averageInventoryValue: totalValue / (activeItems.length || 1),
      };

      return stats;
    } catch (error) {
      console.error('Error getting warehouse stats:', error);
      throw error;
    }
  }
}

// ===================================
// Export Service Instances
// ===================================
export const inventoryService = new InventoryService();
export const stockMovementService = new StockMovementService();
export const warehouseStatsService = new WarehouseStatsService();
