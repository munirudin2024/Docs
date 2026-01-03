// ===================================
// eSupplyChain Types
// ===================================

// Vendor Management Types
export interface Vendor {
  id: string;
  vendorCode: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  category: 'raw-material' | 'equipment' | 'service' | 'logistics' | 'other';
  status: 'active' | 'inactive' | 'blacklisted';
  rating: number; // 1-5
  paymentTerms: string;
  taxId?: string;
  website?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Purchase Order Types
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  status: 'draft' | 'pending' | 'approved' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paymentMethod?: string;
  shippingAddress: string;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  approvalDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  productCode: string;
  productName: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  tax: number;
  totalPrice: number;
}

// Purchase Requisition Types
export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  requestedBy: string;
  department: string;
  requestDate: string;
  requiredDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'converted-to-po';
  items: RequisitionItem[];
  justification: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  convertedToPO?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequisitionItem {
  id: string;
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  suggestedVendor?: string;
}

// Form Data Types
export interface VendorFormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  category: Vendor['category'];
  paymentTerms: string;
  taxId?: string;
  website?: string;
  notes?: string;
}

export interface PurchaseOrderFormData {
  vendorId: string;
  orderDate: string;
  expectedDelivery: string;
  items: Omit<PurchaseOrderItem, 'id' | 'totalPrice'>[];
  shipping: number;
  discount: number;
  shippingAddress: string;
  notes?: string;
}

// Statistics Types
export interface SupplyChainStats {
  totalVendors: number;
  activeVendors: number;
  totalPurchaseOrders: number;
  pendingOrders: number;
  totalSpending: number;
  averageOrderValue: number;
}
