import { MainLayout } from '../../../components';
import './InventoryPage.css';

export const InventoryPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="inventory-page">
        <div className="page-header">
          <div>
            <h1>📦 Inventory Management</h1>
            <p>Monitor stock dan inventory</p>
          </div>
          <button className="btn btn-primary">+ Add Item</button>
        </div>

        <div className="inventory-summary">
          <div className="summary-card">
            <div className="summary-icon">📦</div>
            <div className="summary-info">
              <h4>Total Items</h4>
              <div className="summary-value">1,234</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">⚠️</div>
            <div className="summary-info">
              <h4>Low Stock</h4>
              <div className="summary-value warning">23</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🚫</div>
            <div className="summary-info">
              <h4>Out of Stock</h4>
              <div className="summary-value danger">8</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">💰</div>
            <div className="summary-info">
              <h4>Total Value</h4>
              <div className="summary-value">Rp 2.5B</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>📋 Inventory List</h3>
            <div className="filters">
              <select className="form-control-sm">
                <option>All Categories</option>
                <option>Raw Materials</option>
                <option>Finished Goods</option>
                <option>Packaging</option>
                <option>Spare Parts</option>
              </select>
              <select className="form-control-sm">
                <option>All Status</option>
                <option>In Stock</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
              </select>
              <input type="search" className="form-control-sm" placeholder="Search items..." />
            </div>
          </div>

          <div className="table-responsive">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Min Stock</th>
                  <th>Location</th>
                  <th>Unit Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>SKU-001</strong></td>
                  <td>Material A</td>
                  <td>Raw Materials</td>
                  <td>
                    <div className="stock-bar">
                      <div className="stock-progress" style={{width: '75%'}}></div>
                      <span className="stock-text">750 units</span>
                    </div>
                  </td>
                  <td>200</td>
                  <td>Rak A1</td>
                  <td>Rp 50,000</td>
                  <td><span className="badge badge-success">In Stock</span></td>
                  <td>
                    <button className="btn-icon">✏️</button>
                    <button className="btn-icon">📊</button>
                  </td>
                </tr>
                <tr>
                  <td><strong>SKU-002</strong></td>
                  <td>Product X</td>
                  <td>Finished Goods</td>
                  <td>
                    <div className="stock-bar">
                      <div className="stock-progress warning" style={{width: '25%'}}></div>
                      <span className="stock-text">125 units</span>
                    </div>
                  </td>
                  <td>100</td>
                  <td>Rak B2</td>
                  <td>Rp 250,000</td>
                  <td><span className="badge badge-warning">Low Stock</span></td>
                  <td>
                    <button className="btn-icon">✏️</button>
                    <button className="btn-icon">📊</button>
                  </td>
                </tr>
                <tr>
                  <td><strong>SKU-003</strong></td>
                  <td>Packaging Box</td>
                  <td>Packaging</td>
                  <td>
                    <div className="stock-bar">
                      <div className="stock-progress danger" style={{width: '0%'}}></div>
                      <span className="stock-text">0 units</span>
                    </div>
                  </td>
                  <td>500</td>
                  <td>Rak C1</td>
                  <td>Rp 5,000</td>
                  <td><span className="badge badge-danger">Out of Stock</span></td>
                  <td>
                    <button className="btn-icon">✏️</button>
                    <button className="btn-icon">📊</button>
                  </td>
                </tr>
                <tr>
                  <td><strong>SKU-004</strong></td>
                  <td>Spare Part Y</td>
                  <td>Spare Parts</td>
                  <td>
                    <div className="stock-bar">
                      <div className="stock-progress" style={{width: '60%'}}></div>
                      <span className="stock-text">180 units</span>
                    </div>
                  </td>
                  <td>50</td>
                  <td>Rak D3</td>
                  <td>Rp 125,000</td>
                  <td><span className="badge badge-success">In Stock</span></td>
                  <td>
                    <button className="btn-icon">✏️</button>
                    <button className="btn-icon">📊</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
