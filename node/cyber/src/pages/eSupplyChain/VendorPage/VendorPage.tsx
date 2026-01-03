import { useState } from 'react';
import { MainLayout, Button } from '../../../components';
import { useVendors, useActiveVendors } from '../../../hooks';
import './VendorPage.css';

export const VendorPage: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  
  const { vendors, loading: isLoading } = useVendors();

  const displayVendors = filterCategory === 'all' 
    ? vendors 
    : vendors?.filter(v => v.category === filterCategory);

  return (
    <MainLayout>
      <div className="vendor-page">
        <div className="page-header">
          <div>
            <h1>🏢 Vendor Management</h1>
            <p>Kelola dan monitor vendor</p>
          </div>
          <Button 
            className="btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            + Add New Vendor
          </Button>
        </div>

        {showAddForm && (
          <div className="card add-vendor-form">
            <h3>Add New Vendor</h3>
            <form>
              <div className="form-row">
                <div className="form-group">
                  <label>Vendor Name</label>
                  <input type="text" className="form-control" placeholder="PT. Vendor" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" className="form-control" placeholder="Raw Materials" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-control" placeholder="vendor@email.com" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" className="form-control" placeholder="+62-xxx-xxx-xxxx" />
                </div>
              </div>
              <div className="form-actions">
                <Button className="btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-primary">
                  Add Vendor
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="filter-section">
          <label>Filter by Category:</label>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-control"
          >
            <option value="all">All Categories</option>
            <option value="raw-materials">Raw Materials</option>
            <option value="packaging">Packaging</option>
            <option value="equipment">Equipment</option>
            <option value="spare-parts">Spare Parts</option>
          </select>
        </div>

        <div className="vendor-grid">
          {isLoading ? (
            <div className="loading">Loading vendors...</div>
          ) : displayVendors && displayVendors.length > 0 ? (
            displayVendors.map((vendor, index) => (
              <div key={index} className="vendor-card">
                <div className="vendor-logo">🏢</div>
                <h3>{vendor.name}</h3>
                <p className="vendor-category">{vendor.category}</p>
                <div className="vendor-rating">
                  ⭐ <span>{vendor.rating?.toFixed(1) ?? 4.5}/5.0</span>
                </div>
                <div className="vendor-stats">
                  <div className="vendor-stat">
                    <span className="stat-label">Status</span>
                    <span className="stat-value">{vendor.status || 'Active'}</span>
                  </div>
                  <div className="vendor-stat">
                    <span className="stat-label">Contact</span>
                    <span className="stat-value">{vendor.email || '-'}</span>
                  </div>
                </div>
                <div className="vendor-actions">
                  <Button className="btn-sm btn-outline">View Details</Button>
                  <Button className="btn-sm btn-primary">New Order</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No vendors found</div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
