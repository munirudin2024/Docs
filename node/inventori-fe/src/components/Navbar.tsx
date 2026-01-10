import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { FiLogOut, FiPackage, FiFileText, FiBarChart2, FiActivity, FiClipboard } from 'react-icons/fi';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <FiPackage size={24} />
            Sistem PPIC
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-blue-200 flex items-center gap-1">
              <FiBarChart2 />
              Dashboard
            </Link>
            <Link to="/transactions" className="hover:text-blue-200 flex items-center gap-1">
              <FiActivity />
              Transaksi
            </Link>
            <Link to="/items" className="hover:text-blue-200 flex items-center gap-1">
              <FiPackage />
              Items
            </Link>
            <Link to="/opname" className="hover:text-blue-200 flex items-center gap-1">
              <FiClipboard />
              Stock Opname
            </Link>
            <Link to="/audit" className="hover:text-blue-200 flex items-center gap-1">
              <FiFileText />
              Audit
            </Link>

            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-blue-400">
              <span className="text-sm">
                {user?.nama_lengkap} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="hover:text-blue-200 flex items-center gap-1"
              >
                <FiLogOut />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
