import { MainLayout } from '../../components';
import './HelpdeskPage.css';

export const HelpdeskPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="helpdesk-page">
        <div className="page-header">
          <h1>📞 Helpdesk Request</h1>
          <p>Submit dan kelola tiket helpdesk Anda</p>
        </div>

        <div className="page-grid">
          <div className="card">
            <h3 className="card-title">📝 Buat Tiket Baru</h3>
            <form className="ticket-form">
              <div className="form-group">
                <label>Kategori</label>
                <select className="form-control">
                  <option>Hardware</option>
                  <option>Software</option>
                  <option>Network</option>
                  <option>Akses & Permission</option>
                  <option>Lainnya</option>
                </select>
              </div>

              <div className="form-group">
                <label>Prioritas</label>
                <select className="form-control">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Judul</label>
                <input type="text" className="form-control" placeholder="Judul masalah..." />
              </div>

              <div className="form-group">
                <label>Deskripsi</label>
                <textarea className="form-control" rows={4} placeholder="Jelaskan masalah Anda..."></textarea>
              </div>

              <button type="submit" className="btn btn-primary">Submit Tiket</button>
            </form>
          </div>

          <div className="card">
            <h3 className="card-title">📋 Tiket Saya</h3>
            <div className="tickets-list">
              <div className="ticket-item status-open">
                <div className="ticket-header">
                  <span className="ticket-id">#TKT-001</span>
                  <span className="ticket-status badge-open">Open</span>
                </div>
                <h4 className="ticket-title">Printer tidak berfungsi</h4>
                <p className="ticket-date">Dibuat: 1 Jan 2026</p>
              </div>

              <div className="ticket-item status-progress">
                <div className="ticket-header">
                  <span className="ticket-id">#TKT-002</span>
                  <span className="ticket-status badge-progress">In Progress</span>
                </div>
                <h4 className="ticket-title">Request akses ke system baru</h4>
                <p className="ticket-date">Dibuat: 31 Des 2025</p>
              </div>

              <div className="ticket-item status-resolved">
                <div className="ticket-header">
                  <span className="ticket-id">#TKT-003</span>
                  <span className="ticket-status badge-resolved">Resolved</span>
                </div>
                <h4 className="ticket-title">Email tidak bisa login</h4>
                <p className="ticket-date">Dibuat: 29 Des 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
