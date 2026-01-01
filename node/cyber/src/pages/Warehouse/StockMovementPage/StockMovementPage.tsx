import { MainLayout } from '../../../components';
import './StockMovementPage.css';

export const StockMovementPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="stock-movement-page">
        <div className="page-header">
          <div>
            <h1>🔄 Stock Movement</h1>
            <p>Track pergerakan stock dan mutasi barang</p>
          </div>
          <button className="btn btn-primary">+ Record Movement</button>
        </div>

        <div className="movement-stats">
          <div className="stat-box in">
            <div className="stat-icon">📥</div>
            <div className="stat-details">
              <h4>Stock In</h4>
              <div className="stat-number">+3,450</div>
              <span className="stat-period">This month</span>
            </div>
          </div>
          <div className="stat-box out">
            <div className="stat-icon">📤</div>
            <div className="stat-details">
              <h4>Stock Out</h4>
              <div className="stat-number">-2,890</div>
              <span className="stat-period">This month</span>
            </div>
          </div>
          <div className="stat-box transfer">
            <div className="stat-icon">🔄</div>
            <div className="stat-details">
              <h4>Transfers</h4>
              <div className="stat-number">156</div>
              <span className="stat-period">This month</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>📊 Movement History</h3>
            <div className="filters">
              <select className="form-control-sm">
                <option>All Types</option>
                <option>Stock In</option>
                <option>Stock Out</option>
                <option>Transfer</option>
                <option>Adjustment</option>
              </select>
              <input type="date" className="form-control-sm" />
              <input type="search" className="form-control-sm" placeholder="Search..." />
            </div>
          </div>

          <div className="movement-timeline">
            <div className="timeline-item">
              <div className="timeline-badge in">📥</div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <h4>Stock In</h4>
                  <span className="timeline-date">1 Jan 2026, 10:30</span>
                </div>
                <div className="timeline-body">
                  <p><strong>Material A</strong> - SKU-001</p>
                  <p>Quantity: <span className="qty-in">+500 units</span></p>
                  <p>From: <strong>PT. Supplier Utama</strong></p>
                  <p>Reference: PO-2026-001</p>
                  <p>Notes: Pengiriman sesuai jadwal</p>
                </div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-badge out">📤</div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <h4>Stock Out</h4>
                  <span className="timeline-date">1 Jan 2026, 09:15</span>
                </div>
                <div className="timeline-body">
                  <p><strong>Product X</strong> - SKU-002</p>
                  <p>Quantity: <span className="qty-out">-200 units</span></p>
                  <p>To: <strong>Customer ABC</strong></p>
                  <p>Reference: SO-2026-045</p>
                  <p>Notes: Pengiriman via JNE</p>
                </div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-badge transfer">🔄</div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <h4>Transfer</h4>
                  <span className="timeline-date">31 Des 2025, 15:45</span>
                </div>
                <div className="timeline-body">
                  <p><strong>Spare Part Y</strong> - SKU-004</p>
                  <p>Quantity: <span className="qty-transfer">50 units</span></p>
                  <p>From: <strong>Rak D3</strong> → To: <strong>Rak A2</strong></p>
                  <p>Reference: TRF-2025-089</p>
                  <p>Notes: Reorganisasi gudang</p>
                </div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-badge adjustment">⚙️</div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <h4>Adjustment</h4>
                  <span className="timeline-date">31 Des 2025, 14:20</span>
                </div>
                <div className="timeline-body">
                  <p><strong>Material A</strong> - SKU-001</p>
                  <p>Quantity: <span className="qty-adjustment">-5 units</span></p>
                  <p>Reason: <strong>Stock Opname</strong></p>
                  <p>Reference: ADJ-2025-023</p>
                  <p>Notes: Penyesuaian hasil stock opname</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
