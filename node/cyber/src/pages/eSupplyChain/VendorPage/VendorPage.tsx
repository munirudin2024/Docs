import { MainLayout } from '../../../components';
import './VendorPage.css';

export const VendorPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="vendor-page">
        <div className="page-header">
          <div>
            <h1>🏢 Vendor Management</h1>
            <p>Kelola dan monitor vendor</p>
          </div>
          <button className="btn btn-primary">+ Add New Vendor</button>
        </div>

        <div className="vendor-grid">
          <div className="vendor-card">
            <div className="vendor-logo">🏢</div>
            <h3>PT. Supplier Utama</h3>
            <p className="vendor-category">Raw Materials</p>
            <div className="vendor-rating">
              ⭐⭐⭐⭐⭐ <span>4.8/5.0</span>
            </div>
            <div className="vendor-stats">
              <div className="vendor-stat">
                <span className="stat-label">Total Orders</span>
                <span className="stat-value">234</span>
              </div>
              <div className="vendor-stat">
                <span className="stat-label">On-Time %</span>
                <span className="stat-value">96%</span>
              </div>
            </div>
            <div className="vendor-actions">
              <button className="btn btn-sm btn-outline">View Details</button>
              <button className="btn btn-sm btn-primary">New Order</button>
            </div>
          </div>

          <div className="vendor-card">
            <div className="vendor-logo">🏪</div>
            <h3>CV. Mitra Jaya</h3>
            <p className="vendor-category">Packaging</p>
            <div className="vendor-rating">
              ⭐⭐⭐⭐ <span>4.2/5.0</span>
            </div>
            <div className="vendor-stats">
              <div className="vendor-stat">
                <span className="stat-label">Total Orders</span>
                <span className="stat-value">156</span>
              </div>
              <div className="vendor-stat">
                <span className="stat-label">On-Time %</span>
                <span className="stat-value">89%</span>
              </div>
            </div>
            <div className="vendor-actions">
              <button className="btn btn-sm btn-outline">View Details</button>
              <button className="btn btn-sm btn-primary">New Order</button>
            </div>
          </div>

          <div className="vendor-card">
            <div className="vendor-logo">🏭</div>
            <h3>PT. Global Supply</h3>
            <p className="vendor-category">Equipment</p>
            <div className="vendor-rating">
              ⭐⭐⭐⭐⭐ <span>4.9/5.0</span>
            </div>
            <div className="vendor-stats">
              <div className="vendor-stat">
                <span className="stat-label">Total Orders</span>
                <span className="stat-value">89</span>
              </div>
              <div className="vendor-stat">
                <span className="stat-label">On-Time %</span>
                <span className="stat-value">98%</span>
              </div>
            </div>
            <div className="vendor-actions">
              <button className="btn btn-sm btn-outline">View Details</button>
              <button className="btn btn-sm btn-primary">New Order</button>
            </div>
          </div>

          <div className="vendor-card">
            <div className="vendor-logo">🏗️</div>
            <h3>UD. Sumber Makmur</h3>
            <p className="vendor-category">Spare Parts</p>
            <div className="vendor-rating">
              ⭐⭐⭐⭐ <span>4.5/5.0</span>
            </div>
            <div className="vendor-stats">
              <div className="vendor-stat">
                <span className="stat-label">Total Orders</span>
                <span className="stat-value">312</span>
              </div>
              <div className="vendor-stat">
                <span className="stat-label">On-Time %</span>
                <span className="stat-value">92%</span>
              </div>
            </div>
            <div className="vendor-actions">
              <button className="btn btn-sm btn-outline">View Details</button>
              <button className="btn btn-sm btn-primary">New Order</button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">📊 Vendor Performance</h3>
          <div className="performance-chart">
            <div className="chart-placeholder">
              📈 Performance chart visualization will be displayed here
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
