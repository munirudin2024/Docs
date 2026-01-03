import { useState } from 'react';
import { MainLayout, Button } from '../../../components';
import { usePurchaseOrders } from '../../../hooks';
import './PurchaseOrderPage.css';

export const PurchaseOrderPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { purchaseOrders, loading: isLoading } = usePurchaseOrders();
  
  const filteredOrders = purchaseOrders?.filter(po => {
    const statusMatch = selectedStatus === 'all' || po.status === selectedStatus;
    const searchMatch = po.poNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       po.vendorName?.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const stats = {
    total: purchaseOrders?.length ?? 156,
    pending: purchaseOrders?.filter(p => p.status === 'pending').length ?? 23,
    inProgress: purchaseOrders?.filter(p => p.status === 'processing' || p.status === 'shipped').length ?? 45,
    completed: purchaseOrders?.filter(p => p.status === 'delivered').length ?? 88
  };

  return (
    <MainLayout>
      <div className="po-page">
        <div className="page-header">
          <h1>🛒 Purchase Orders</h1>
          <p>Kelola purchase order dan procurement</p>
          <Button className="btn-primary">+ Create New PO</Button>
        </div>

        <div className="po-stats">
          <div className="stat-card">
            <h4>Total POs</h4>
            <div className="stat-value">{stats.total}</div>
            <span className="stat-trend up">+12 this month</span>
          </div>
          <div className="stat-card">
            <h4>Pending</h4>
            <div className="stat-value">{stats.pending}</div>
            <span className="stat-trend">Awaiting approval</span>
          </div>
          <div className="stat-card">
            <h4>In Progress</h4>
            <div className="stat-value">{stats.inProgress}</div>
            <span className="stat-trend">Being processed</span>
          </div>
          <div className="stat-card">
            <h4>Completed</h4>
            <div className="stat-value">{stats.completed}</div>
            <span className="stat-trend up">+8 this week</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>📋 Purchase Orders List</h3>
            <div className="filters">
              <select 
                className="form-control-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <input 
                type="search" 
                className="form-control-sm" 
                placeholder="Search PO..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Vendor</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center">Loading...</td>
                  </tr>
                ) : filteredOrders && filteredOrders.length > 0 ? (
                  filteredOrders.map((po, index) => (
                    <tr key={index}>
                      <td><strong>{po.poNumber}</strong></td>
                      <td>{po.vendorName}</td>
                      <td>{new Date(po.createdAt || '').toLocaleDateString('id-ID')}</td>
                      <td>{po.items?.length ?? 0}</td>
                      <td>Rp {((po.items?.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0)) || 0).toLocaleString('id-ID')}</td>
                      <td>
                        <span className={`badge badge-${po.status || 'pending'}`}>
                          {po.status?.charAt(0).toUpperCase() + po.status?.slice(1) || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <Button className="btn-icon">👁️</Button>
                        <Button className="btn-icon">✏️</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center">No purchase orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
