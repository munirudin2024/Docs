import { useState } from 'react';
import { MainLayout, Button, Input } from '../../components';
import { useHelpdeskCreateTicket, useHelpdeskMyTickets } from '../../hooks/useHelpdeskCompat';
import './HelpdeskPage.css';

interface TicketFormData {
  category: string;
  priority: string;
  title: string;
  description: string;
}

export const HelpdeskPage: React.FC = () => {
  const [formData, setFormData] = useState<TicketFormData>({
    category: 'hardware',
    priority: 'medium',
    title: '',
    description: ''
  });

  const { createTicket, isLoading: isSubmitting } = useHelpdeskCreateTicket();
  const { myTickets, isLoading: isLoadingTickets } = useHelpdeskMyTickets();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicket(formData);
      setFormData({
        category: 'hardware',
        priority: 'medium',
        title: '',
        description: ''
      });
      alert('Ticket created successfully!');
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

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
            <form className="ticket-form" onSubmit={handleSubmitTicket}>
              <div className="form-group">
                <label>Kategori</label>
                <select 
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                  <option value="network">Network</option>
                  <option value="access">Akses & Permission</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              <div className="form-group">
                <label>Prioritas</label>
                <select 
                  name="priority"
                  className="form-control"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Judul</label>
                <Input 
                  type="text" 
                  name="title"
                  placeholder="Judul masalah..."
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Deskripsi</label>
                <textarea 
                  name="description"
                  className="form-control" 
                  rows={4} 
                  placeholder="Jelaskan masalah Anda..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              <Button 
                type="submit" 
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Tiket'}
              </Button>
            </form>
          </div>

          <div className="card">
            <h3 className="card-title">📋 Tiket Saya</h3>
            <div className="tickets-list">
              {isLoadingTickets ? (
                <div className="loading">Loading tickets...</div>
              ) : myTickets && myTickets.length > 0 ? (
                myTickets.map((ticket: any, index: number) => (
                  <div key={index} className={`ticket-item status-${ticket.status || 'open'}`}>
                    <div className="ticket-header">
                      <span className="ticket-id">#{ticket.ticketNumber || 'N/A'}</span>
                      <span className={`ticket-status badge-${ticket.status || 'open'}`}>
                        {ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1) || 'Open'}
                      </span>
                    </div>
                    <h4 className="ticket-title">{ticket.title}</h4>
                    <p className="ticket-date">Dibuat: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('id-ID') : 'N/A'}</p>
                  </div>
                ))
              ) : (
                <div className="empty-state">No tickets yet. Create one to get started!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
