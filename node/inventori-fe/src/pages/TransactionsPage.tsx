import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { transactionsService } from '@/services/transactionsService';
import { Transaction } from '@/types';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiFilter, FiDownload } from 'react-icons/fi';

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [transType, setTransType] = useState<'IN' | 'OUT'>('IN');
  
  // Filters
  const [filterType, setFilterType] = useState('ALL');
  const [filterRole, setFilterRole] = useState('');
  const [filterRequester, setFilterRequester] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    code: '',
    item_name: '',
    quantity: 0,
    requester: '',
    requester_role: '',
    location: '',
  });

  useEffect(() => {
    loadTransactions();
  }, [filterType, filterRole, filterRequester, filterCode]);

  const loadTransactions = async () => {
    try {
      const filters: any = {};
      if (filterType !== 'ALL') filters.type = filterType;
      if (filterRole) filters.role = filterRole;
      if (filterRequester) filters.requester = filterRequester;
      if (filterCode) filters.code = filterCode;

      const data = await transactionsService.getAllTransactions(filters);
      setTransactions(data);
    } catch (error) {
      toast.error('Gagal memuat data transaksi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await transactionsService.createTransaction({
        ...formData,
        type: transType,
      });
      toast.success('Transaksi berhasil disimpan');
      setShowModal(false);
      resetForm();
      loadTransactions();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal menyimpan transaksi');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      item_name: '',
      quantity: 0,
      requester: '',
      requester_role: '',
      location: '',
    });
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Kode', 'Item', 'Type', 'Qty', 'Stock', 'Requester', 'Role', 'Petugas', 'Lokasi', 'Tanggal'];
    const rows = transactions.map(t => [
      t.id,
      t.code || t.item_code || '',
      t.item_name || '',
      t.type,
      t.quantity,
      t.stock_after,
      t.requester,
      t.requester_role,
      t.servant,
      t.location,
      new Date(t.created_at).toLocaleString('id-ID'),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaksi_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Transaksi PPIC</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <FiFilter /> Filter
            </button>
            <button
              onClick={exportToCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <FiDownload /> Export
            </button>
            <button
              onClick={() => {
                setTransType('IN');
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FiPlus /> Barang Masuk
            </button>
            <button
              onClick={() => {
                setTransType('OUT');
                resetForm();
                setShowModal(true);
              }}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <FiPlus /> Barang Keluar
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-4 grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="ALL">Semua</option>
                <option value="IN">Masuk</option>
                <option value="OUT">Keluar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Semua</option>
                <option value="maintenance">Maintenance</option>
                <option value="production">Production</option>
                <option value="order">Order</option>
                <option value="titipan">Titipan</option>
                <option value="tidak stok">Tidak Stok</option>
                <option value="-">P.O (Masuk)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requester/PO</label>
              <input
                type="text"
                value={filterRequester}
                onChange={(e) => setFilterRequester(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Cari requester..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Item</label>
              <input
                type="text"
                value={filterCode}
                onChange={(e) => setFilterCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Cari kode..."
              />
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Petugas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  transactions.map((trans) => (
                    <tr key={trans.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{trans.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{trans.code || trans.item_code}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{trans.item_name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            trans.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {trans.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{trans.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{trans.stock_after}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{trans.requester}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{trans.requester_role}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{trans.servant}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(trans.created_at).toLocaleString('id-ID', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {transType === 'IN' ? 'Barang Masuk' : 'Barang Keluar'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Item *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Item *
                </label>
                <input
                  type="text"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {transType === 'IN' ? 'No P.O *' : 'Requester *'}
                </label>
                <input
                  type="text"
                  value={formData.requester}
                  onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              {transType === 'OUT' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      value={formData.requester_role}
                      onChange={(e) => setFormData({ ...formData, requester_role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Pilih role...</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="production">Production</option>
                      <option value="order">Order</option>
                      <option value="titipan">Titipan</option>
                      <option value="tidak stok">Tidak Stok</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lokasi Penggunaan
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};
