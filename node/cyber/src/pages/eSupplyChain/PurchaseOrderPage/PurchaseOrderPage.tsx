import { MainLayout } from '../../../components';
import './PurchaseOrderPage.css';

export const PurchaseOrderPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="po-page">
        <div className="page-header">
          <h1>🛒 Purchase Orders</h1>
          <p>Kelola purchase order dan procurement</p>
          <button className="btn btn-primary">+ Create New PO</button>
        </div>

        <div className="po-stats">
          <div className="stat-card">
            <h4>Total POs</h4>
            <div className="stat-value">156</div>
            <span className="stat-trend up">+12 this month</span>
          </div>
          <div className="stat-card">
            <h4>Pending</h4>
            <div className="stat-value">23</div>
            <span className="stat-trend">Awaiting approval</span>
          </div>
          <div className="stat-card">
            <h4>In Progress</h4>
            <div className="stat-value">45</div>
            <span className="stat-trend">Being processed</span>
          </div>
          <div className="stat-card">
            <h4>Completed</h4>
            <div className="stat-value">88</div>
            <span className="stat-trend up">+8 this week</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>📋 Purchase Orders List</h3>
            <div className="filters">
              <select className="form-control-sm">
                <option>All Status</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
              <input type="search" className="form-control-sm" placeholder="Search PO..." />
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
                <tr>
                  <td><strong>PO-2026-001</strong></td>
                  <td>PT. Supplier Utama</td>
                  <td>1 Jan 2026</td>
                  <td>15</td>
                  <td>Rp 45,000,000</td>
                  <td><span className="badge badge-warning">Pending</span></td>
                  <td>
                    <button className="btn-icon">👁️</button>
                    <button className="btn-icon">✏️</button>
                  </td>
                </tr>
                <tr>
                  <td><strong>PO-2025-358</strong></td>
                  <td>CV. Mitra Jaya</td>
                  <td>31 Des 2025</td>
                  <td>8</td>
                  <td>Rp 22,500,000</td>
                  <td><span className="badge badge-info">In Progress</span></td>
                  <td>
                    <button className="btn-icon">👁️</button>
                    <button className="btn-icon">✏️</button>
                  </td>
                </tr>
                <tr>
                  <td><strong>PO-2025-357</strong></td>
                  <td>PT. Global Supply</td>
                  <td>30 Des 2025</td>
                  <td>25</td>
                  <td>Rp 120,000,000</td>
                  <td><span className="badge badge-success">Completed</span></td>
                  <td>
                    <button className="btn-icon">👁️</button>
                    <button className="btn-icon">📄</button>
                  </td>
                </tr>
                <tr>
                  <td><strong>PO-2025-356</strong></td>
                  <td>UD. Sumber Makmur</td>
                  <td>29 Des 2025</td>
                  <td>12</td>
                  <td>Rp 35,750,000</td>
                  <td><span className="badge badge-success">Completed</span></td>
                  <td>
                    <button className="btn-icon">👁️</button>
                    <button className="btn-icon">📄</button>
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
