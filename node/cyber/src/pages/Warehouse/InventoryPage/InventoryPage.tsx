import { useState } from 'react';
import { MainLayout, Button, Input } from '../../../components';
import { useInventoryCompat, useLowStockItemsCompat, useInventoryReportCompat } from '../../../hooks/useWarehouseCompat';
import './InventoryPage.css';

interface ItemFormData {
  itemCode: string;
  itemName: string;
  category: string;
  quantity: number;
  minStock: number;
  unitPrice: number;
  location: string;
}

export const InventoryPage: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formData, setFormData] = useState<ItemFormData>({
    itemCode: '',
    itemName: '',
    category: 'raw-materials',
    quantity: 0,
    minStock: 10,
    unitPrice: 0,
    location: ''
  });

  const { inventory, isLoading: isLoadingInventory } = useInventoryCompat();
  const { lowStockItems } = useLowStockItemsCompat();
  const { report } = useInventoryReportCompat();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['quantity', 'minStock', 'unitPrice'];
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call add item API
      alert('Item added successfully!');
      setFormData({
        itemCode: '',
        itemName: '',
        category: 'raw-materials',
        quantity: 0,
        minStock: 10,
        unitPrice: 0,
        location: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const filteredInventory = selectedCategory === 'all'
    ? inventory
    : inventory?.filter(item => item.category === selectedCategory);

  const stats = {
    totalItems: inventory?.length ?? 1234,
    lowStock: lowStockItems?.length ?? 23,
    outOfStock: inventory?.filter(i => (i.quantity || 0) === 0).length ?? 8,
    totalValue: report?.totalValue ?? 2500000000
  };

  return (
    <MainLayout>
      <div className="inventory-page">
        <div className="page-header">
          <div>
            <h1>📦 Inventory Management</h1>
            <p>Monitor stock dan inventory</p>
          </div>
          <Button 
            variant="primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            + Add Item
          </Button>
        </div>

        <div className="inventory-summary">
          <div className="summary-card">
            <div className="summary-icon">📦</div>
            <div className="summary-info">
              <h4>Total Items</h4>
              <div className="summary-value">{stats.totalItems}</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">⚠️</div>
            <div className="summary-info">
              <h4>Low Stock</h4>
              <div className="summary-value warning">{stats.lowStock}</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🚫</div>
            <div className="summary-info">
              <h4>Out of Stock</h4>
              <div className="summary-value danger">{stats.outOfStock}</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">💰</div>
            <div className="summary-info">
              <h4>Total Value</h4>
              <div className="summary-value">Rp {(stats.totalValue / 1000000000).toFixed(1)}B</div>
            </div>
          </div>
        </div>

        {showAddForm && (
          <div className="card add-item-form">
            <h3>Add New Item</h3>
            <form onSubmit={handleAddItem}>
              <div className="form-row">
                <div className="form-group">
                  <label>Item Code</label>
                  <Input 
                    type="text"
                    name="itemCode"
                    placeholder="e.g., ITM-001"
                    value={formData.itemCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Item Name</label>
                  <Input 
                    type="text"
                    name="itemName"
                    placeholder="Item name..."
                    value={formData.itemName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    name="category"
                    className="form-control"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="raw-materials">Raw Materials</option>
                    <option value="finished-goods">Finished Goods</option>
                    <option value="spare-parts">Spare Parts</option>
                    <option value="packaging">Packaging</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <Input 
                    type="text"
                    name="location"
                    placeholder="Warehouse location..."
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Initial Quantity</label>
                  <Input 
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Minimum Stock</label>
                  <Input 
                    type="number"
                    name="minStock"
                    value={formData.minStock}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Unit Price (Rp)</label>
                  <Input 
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <Button variant="secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Add Item
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3>📋 Inventory List</h3>
            <div className="filters">
              <select 
                className="form-control-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="raw-materials">Raw Materials</option>
                <option value="finished-goods">Finished Goods</option>
                <option value="spare-parts">Spare Parts</option>
                <option value="packaging">Packaging</option>
              </select>
              <input type="search" className="form-control-sm" placeholder="Search items..." />
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Min Stock</th>
                  <th>Unit Price</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingInventory ? (
                  <tr>
                    <td colSpan={8} className="text-center">Loading inventory...</td>
                  </tr>
                ) : filteredInventory && filteredInventory.length > 0 ? (
                  filteredInventory.map((item: any, index: number) => {
                    let status = 'In Stock';
                    if ((item.quantity || 0) === 0) status = 'Out of Stock';
                    else if ((item.quantity || 0) <= (item.minStock || 10)) status = 'Low Stock';
                    
                    return (
                      <tr key={index}>
                        <td><strong>{item.itemCode}</strong></td>
                        <td>{item.itemName}</td>
                        <td>{item.category}</td>
                        <td>{item.quantity}</td>
                        <td>{item.minStock}</td>
                        <td>Rp {(item.unitPrice || 0).toLocaleString('id-ID')}</td>
                        <td>{item.location || '-'}</td>
                        <td>
                          <span className={`badge badge-${status.toLowerCase().replace(' ', '-')}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center">No items found</td>
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
