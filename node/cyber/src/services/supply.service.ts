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
import type { Vendor, PurchaseOrder, PurchaseOrderItem, PurchaseRequisition, VendorFormData, PurchaseOrderFormData, SupplyChainStats } from '../types';

// ===================================
// Vendor Service
// ===================================
class VendorService {
  private collectionName = 'vendors';

  // Get vendor by ID
  async getVendor(vendorId: string): Promise<Vendor | null> {
    try {
      const docRef = doc(db, this.collectionName, vendorId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Vendor;
      }
      return null;
    } catch (error) {
      console.error('Error getting vendor:', error);
      throw error;
    }
  }

  // Get all vendors
  async getAllVendors(): Promise<Vendor[]> {
    try {
      const q = query(collection(db, this.collectionName), orderBy('companyName'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vendor));
    } catch (error) {
      console.error('Error getting vendors:', error);
      throw error;
    }
  }

  // Get active vendors
  async getActiveVendors(): Promise<Vendor[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', 'active'),
        orderBy('companyName')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vendor));
    } catch (error) {
      console.error('Error getting active vendors:', error);
      throw error;
    }
  }

  // Get vendors by category
  async getVendorsByCategory(category: Vendor['category']): Promise<Vendor[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('category', '==', category),
        orderBy('companyName')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vendor));
    } catch (error) {
      console.error('Error getting vendors by category:', error);
      throw error;
    }
  }

  // Create vendor
  async createVendor(data: VendorFormData): Promise<string> {
    try {
      // Generate vendor code
      const vendorCode = `VND-${Date.now().toString().slice(-6)}`;
      
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        vendorCode,
        status: 'active',
        rating: 0,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  }

  // Update vendor
  async updateVendor(vendorId: string, data: Partial<VendorFormData>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, vendorId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  }

  // Delete vendor
  async deleteVendor(vendorId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, vendorId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  }

  // Update vendor status
  async updateVendorStatus(vendorId: string, status: Vendor['status']): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, vendorId);
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error updating vendor status:', error);
      throw error;
    }
  }

  // Update vendor rating
  async updateVendorRating(vendorId: string, rating: number): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, vendorId);
      await updateDoc(docRef, {
        rating: Math.min(5, Math.max(0, rating)), // Ensure rating is between 0-5
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error updating vendor rating:', error);
      throw error;
    }
  }

  // Search vendors
  async searchVendors(searchTerm: string): Promise<Vendor[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simple implementation that searches by company name
      const q = query(
        collection(db, this.collectionName),
        orderBy('companyName')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Vendor))
        .filter(vendor => 
          vendor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.vendorCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } catch (error) {
      console.error('Error searching vendors:', error);
      throw error;
    }
  }
}

// ===================================
// Purchase Order Service
// ===================================
class PurchaseOrderService {
  private collectionName = 'purchase_orders';

  // Calculate totals
  private calculateTotals(items: Omit<PurchaseOrderItem, 'id' | 'totalPrice'>[], shipping: number, discount: number) {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = (item.quantity * item.unitPrice) - item.discount + item.tax;
      return sum + itemTotal;
    }, 0);
    
    const tax = items.reduce((sum, item) => sum + item.tax, 0);
    const total = subtotal + shipping - discount;
    
    return { subtotal, tax, total };
  }

  // Generate PO Number
  private generatePONumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PO-${year}${month}-${random}`;
  }

  // Get purchase order by ID
  async getPurchaseOrder(poId: string): Promise<PurchaseOrder | null> {
    try {
      const docRef = doc(db, this.collectionName, poId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as PurchaseOrder;
      }
      return null;
    } catch (error) {
      console.error('Error getting purchase order:', error);
      throw error;
    }
  }

  // Get all purchase orders
  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    try {
      const q = query(collection(db, this.collectionName), orderBy('orderDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PurchaseOrder));
    } catch (error) {
      console.error('Error getting purchase orders:', error);
      throw error;
    }
  }

  // Get purchase orders by status
  async getPurchaseOrdersByStatus(status: PurchaseOrder['status']): Promise<PurchaseOrder[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', status),
        orderBy('orderDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PurchaseOrder));
    } catch (error) {
      console.error('Error getting purchase orders by status:', error);
      throw error;
    }
  }

  // Get purchase orders by vendor
  async getPurchaseOrdersByVendor(vendorId: string): Promise<PurchaseOrder[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('vendorId', '==', vendorId),
        orderBy('orderDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PurchaseOrder));
    } catch (error) {
      console.error('Error getting purchase orders by vendor:', error);
      throw error;
    }
  }

  // Create purchase order
  async createPurchaseOrder(
    vendorName: string,
    createdBy: string,
    data: PurchaseOrderFormData
  ): Promise<string> {
    try {
      // Calculate item totals and add IDs
      const items: PurchaseOrderItem[] = data.items.map((item, index) => ({
        id: `item-${index + 1}`,
        ...item,
        totalPrice: (item.quantity * item.unitPrice) - item.discount + item.tax,
      }));

      // Calculate order totals
      const { subtotal, tax, total } = this.calculateTotals(data.items, data.shipping, data.discount);

      const poNumber = this.generatePONumber();

      const docRef = await addDoc(collection(db, this.collectionName), {
        poNumber,
        vendorId: data.vendorId,
        vendorName,
        orderDate: data.orderDate,
        expectedDelivery: data.expectedDelivery,
        status: 'draft',
        items,
        subtotal,
        tax,
        shipping: data.shipping,
        discount: data.discount,
        total,
        currency: 'IDR',
        paymentStatus: 'unpaid',
        shippingAddress: data.shippingAddress,
        notes: data.notes,
        createdBy,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  }

  // Update purchase order
  async updatePurchaseOrder(poId: string, data: Partial<PurchaseOrderFormData>): Promise<void> {
    try {
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now().toDate().toISOString(),
      };

      // Recalculate totals if items are updated
      if (data.items) {
        const items: PurchaseOrderItem[] = data.items.map((item, index) => ({
          id: `item-${index + 1}`,
          ...item,
          totalPrice: (item.quantity * item.unitPrice) - item.discount + item.tax,
        }));

        const { subtotal, tax, total } = this.calculateTotals(
          data.items,
          data.shipping || 0,
          data.discount || 0
        );

        updateData.items = items;
        updateData.subtotal = subtotal;
        updateData.tax = tax;
        updateData.total = total;
      }

      const docRef = doc(db, this.collectionName, poId);
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating purchase order:', error);
      throw error;
    }
  }

  // Delete purchase order
  async deletePurchaseOrder(poId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, poId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      throw error;
    }
  }

  // Update PO status
  async updatePOStatus(poId: string, status: PurchaseOrder['status']): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, poId);
      const updateData: any = {
        status,
        updatedAt: Timestamp.now().toDate().toISOString(),
      };

      if (status === 'delivered') {
        updateData.actualDelivery = Timestamp.now().toDate().toISOString();
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating PO status:', error);
      throw error;
    }
  }

  // Approve purchase order
  async approvePurchaseOrder(poId: string, approvedBy: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, poId);
      await updateDoc(docRef, {
        status: 'approved',
        approvedBy,
        approvalDate: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error approving purchase order:', error);
      throw error;
    }
  }

  // Update payment status
  async updatePaymentStatus(poId: string, paymentStatus: PurchaseOrder['paymentStatus'], paymentMethod?: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, poId);
      await updateDoc(docRef, {
        paymentStatus,
        paymentMethod: paymentMethod || '',
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Get supply chain statistics
  async getSupplyChainStats(): Promise<SupplyChainStats> {
    try {
      const vendorsSnapshot = await getDocs(collection(db, 'vendors'));
      const posSnapshot = await getDocs(collection(db, this.collectionName));
      
      const vendors = vendorsSnapshot.docs.map(doc => doc.data() as Vendor);
      const pos = posSnapshot.docs.map(doc => doc.data() as PurchaseOrder);
      
      const stats: SupplyChainStats = {
        totalVendors: vendors.length,
        activeVendors: vendors.filter(v => v.status === 'active').length,
        totalPurchaseOrders: pos.length,
        pendingOrders: pos.filter(po => po.status === 'pending' || po.status === 'approved').length,
        totalSpending: pos.reduce((sum, po) => sum + po.total, 0),
        averageOrderValue: pos.length > 0 ? pos.reduce((sum, po) => sum + po.total, 0) / pos.length : 0,
      };
      
      return stats;
    } catch (error) {
      console.error('Error getting supply chain stats:', error);
      throw error;
    }
  }
}

// ===================================
// Export Service Instances
// ===================================
export const vendorService = new VendorService();
export const purchaseOrderService = new PurchaseOrderService();
