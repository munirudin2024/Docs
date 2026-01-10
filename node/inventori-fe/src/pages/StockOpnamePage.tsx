import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { opnameService } from '@/services/opnameService';
import { StockOpname } from '@/types';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch } from 'react-icons/fi';

export const StockOpnamePage = () => {
  const [opnameList, setOpnameList] = useState<StockOpname[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    warehouse: '',
    code: '',
    location: '',
    location_type: 'rak',
    pallet_no: 0,
    counted_qty: 0,
  });

  useEffect(() => {
    loadOpname();
  }, []);

  const loadOpname = async () => {
    try {
      const data = await opnameService.getAllStockOpname();
      setOpnameList(data);
    } catch (error) {
      toast.error('Gagal memuat data stock opname');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const location = formData.location_type === 'rak' 
      ? `RAK ${formData.location}` 
      : `PALET #${String(formData.pallet_no).padStart(3, '0')}`;

    try {
      await opnameService.createStockOpname({
        warehouse: formData.warehouse,
        code: formData.code.toUpperCase(),
        location,
        pallet_no: formData.location_type === 'palet' ? formData.pallet_no : undefined,
        counted_qty: formData.counted_qty,
      });
      toast.success('Stock opname berhasil disimpan');
      setShowModal(false);
      resetForm();
      loadOpname();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal menyimpan stock opname');
    }
  };

  const resetForm = () => {
    setFormData({
      warehouse: '',
      code: '',
      location: '',
      location_type: 'rak',
      pallet_no: 0,
      counted_qty: 0,
    });
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
          <h1 className="text-3xl font-bold text-gray-800">Stock Opname</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus /> Tambah Opname
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Pengecekan</p>
            <p className="text-3xl font-bold text-gray-800">{opnameList.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Selisih (+)</p>
            <p className="text-3xl font-bold text-green-600">
              {opnameList.filter(o => o.diff > 0).reduce((sum, o) => sum + o.diff, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Selisih (-)</p>
            <p className="text-3xl font-bold text-red-600">
              {Math.abs(opnameList.filter(o => o.diff < 0).reduce((sum, o) => sum + o.diff, 0))}
            </p>
          </div>
        </div>

        {/* Opname Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gudang</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokasi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Counted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diff</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Petugas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {opnameList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  opnameList.map((opname) => (
                    <tr key={opname.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{opname.warehouse}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{opname.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{opname.item_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{opname.location}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{opname.expected_qty}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{opname.counted_qty}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`font-medium ${
                            opname.diff > 0
                              ? 'text-green-600'
                              : opname.diff < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {opname.diff > 0 ? '+' : ''}{opname.diff}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{opname.checked_by}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(opname.created_at).toLocaleString('id-ID', {
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
            <h2 className="text-xl font-bold mb-4">Stock Opname Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Gudang *
                </label>
                <input
                  type="text"
                  value={formData.warehouse}
                  onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
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
                  Tipe Lokasi *
                </label>
                <select
                  value={formData.location_type}
                  onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="rak">Rak</option>
                  <option value="palet">Palet</option>
                </select>
              </div>
              {formData.location_type === 'rak' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Rak *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Palet (1-400) *
                  </label>
                  <input
                    type="number"
                    value={formData.pallet_no}
                    onChange={(e) => setFormData({ ...formData, pallet_no: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                    min="1"
                    max="400"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Hasil Hitung *
                </label>
                <input
                  type="number"
                  value={formData.counted_qty}
                  onChange={(e) => setFormData({ ...formData, counted_qty: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                  min="0"
                />
              </div>
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
