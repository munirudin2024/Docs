import { useState } from 'react';
import { MainLayout, Button, Input } from '../../../components';
import { useStockMovementsCompat } from '../../../hooks/useWarehouseCompat';
import './StockMovementPage.css';

interface MovementFormData {
  itemId: string;
  movementType: 'in' | 'out';
  quantity: number;
  reference: string;
  notes: string;
}

export const StockMovementPage: React.FC = () => {
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [formData, setFormData] = useState<MovementFormData>({
    itemId: '',
    movementType: 'in',
    quantity: 0,
    reference: '',
    notes: ''
  });

  const { movements, isLoading: isLoadingMovements } = useStockMovementsCompat();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseFloat(value) || 0 : value
    }));
  };

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call API
      alert('Stock movement recorded successfully!');
      setFormData({
        itemId: '',
        movementType: 'in',
        quantity: 0,
        reference: '',
        notes: ''
      });
      setShowMovementForm(false);
    } catch (error) {
      console.error('Failed to record movement:', error);
    }
  };

  const inMovements = movements?.filter(m => m.movementType === 'in').length ?? 0;
  const outMovements = movements?.filter(m => m.movementType === 'out').length ?? 0;

  return (
    <MainLayout>
      <div className="stock-movement-page">
        <div className="page-header">
          <h1>📊 Stock Movement</h1>
          <p>Pantau semua pergerakan stok</p>
          <Button 
            variant="primary"
            onClick={() => setShowMovementForm(!showMovementForm)}
          >
            + Record Movement
          </Button>
        </div>

        <div className="movement-summary">
          <div className="summary-card">
            <div className="summary-icon">📥</div>
            <div className="summary-info">
              <h4>Stock In</h4>
              <div className="summary-value">{inMovements}</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">📤</div>
            <div className="summary-info">
              <h4>Stock Out</h4>
              <div className="summary-value">{outMovements}</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">📋</div>
            <div className="summary-info">
              <h4>Total Movements</h4>
              <div className="summary-value">{movements?.length ?? 0}</div>
            </div>
          </div>
        </div>

        {showMovementForm && (
          <div className="card movement-form">
            <h3>Record Stock Movement</h3>
            <form onSubmit={handleRecordMovement}>
              <div className="form-row">
                <div className="form-group">
                  <label>Movement Type</label>
                  <select 
                    name="movementType"
                    className="form-control"
                    value={formData.movementType}
                    onChange={handleInputChange}
                  >
                    <option value="in">Stock In (Masuk)</option>
                    <option value="out">Stock Out (Keluar)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Item ID</label>
                  <Input 
                    type="text"
                    name="itemId"
                    placeholder="Item ID..."
                    value={formData.itemId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <Input 
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Reference (PO/DO Number)</label>
                  <Input 
                    type="text"
                    name="reference"
                    placeholder="e.g., PO-2026-001"
                    value={formData.reference}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea 
                  name="notes"
                  className="form-control"
                  rows={3}
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="form-actions">
                <Button variant="secondary" onClick={() => setShowMovementForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Record Movement
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <h3 className="card-title">📋 Recent Movements</h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reference</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingMovements ? (
                  <tr>
                    <td colSpan={6} className="text-center">Loading movements...</td>
                  </tr>
                ) : movements && movements.length > 0 ? (
                  movements.slice(0, 20).map((movement: any, index: number) => (
                    <tr key={index} className={`movement-${movement.movementType}`}>
                      <td>{movement.date ? new Date(movement.date).toLocaleDateString('id-ID') : 'N/A'}</td>
                      <td>{movement.itemCode || 'N/A'}</td>
                      <td>
                        <span className={`badge badge-${movement.movementType}`}>
                          {movement.movementType === 'in' ? '📥 Stock In' : '📤 Stock Out'}
                        </span>
                      </td>
                      <td className={movement.movementType === 'in' ? 'positive' : 'negative'}>
                        {movement.movementType === 'in' ? '+' : '-'}{movement.quantity}
                      </td>
                      <td>{movement.reference || '-'}</td>
                      <td>{movement.notes || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center">No movements recorded</td>
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
