import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { itemsService } from '@/services/itemsService';
import { auditService } from '@/services/auditService';
import { Item, AuditLog } from '@/types';
import { FiPackage, FiActivity, FiTrendingUp, FiUsers } from 'react-icons/fi';

export const DashboardPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [itemsData, auditData] = await Promise.all([
        itemsService.getAllItems(),
        auditService.getAllAuditLogs(),
      ]);
      setItems(itemsData);
      setAuditLogs(auditData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = items.length;
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const lowStockItems = items.filter((item) => item.qty < 10).length;
  const recentScans = auditLogs.filter((log) => log.action === 'scan').length;

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-3xl font-bold text-gray-800">{totalItems}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiPackage size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Qty</p>
                <p className="text-3xl font-bold text-gray-800">{totalQty}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiTrendingUp size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-3xl font-bold text-gray-800">{lowStockItems}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <FiActivity size={24} className="text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recent Scans</p>
                <p className="text-3xl font-bold text-gray-800">{recentScans}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FiUsers size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Aktivitas Terakhir</h2>
          </div>
          <div className="p-6">
            {auditLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-800">{log.nama_barang}</p>
                  <p className="text-sm text-gray-600">
                    {log.action} oleh {log.nama_lengkap}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Items */}
        {lowStockItems > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-4">
              ⚠️ Items dengan Stok Rendah
            </h2>
            <div className="space-y-2">
              {items
                .filter((item) => item.qty < 10)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-white p-3 rounded"
                  >
                    <span className="font-medium">{item.nama_barang}</span>
                    <span className="text-red-600 font-bold">
                      {item.qty} {item.satuan}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
