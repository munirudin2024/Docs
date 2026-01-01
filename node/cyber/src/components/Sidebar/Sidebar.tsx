import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: '🏠',
    path: '/dashboard'
  },
  {
    id: 'helpdesk',
    label: 'Helpdesk Request',
    icon: '📞',
    path: '/helpdesk'
  },
  {
    id: 'meeting',
    label: 'Meeting Room',
    icon: '📅',
    path: '/meeting'
  },
  {
    id: 'ehrm',
    label: 'eHRM',
    icon: '👥',
    path: '/ehrm',
    children: [
      { id: 'ehrm-profile', label: 'Profile', icon: '👤', path: '/ehrm/profile' },
      { id: 'ehrm-leave', label: 'Leave Management', icon: '📋', path: '/ehrm/leave' },
      { id: 'ehrm-attendance', label: 'Attendance', icon: '⏰', path: '/ehrm/attendance' }
    ]
  },
  {
    id: 'supply',
    label: 'eSupplyChain',
    icon: '📦',
    path: '/supply',
    children: [
      { id: 'supply-order', label: 'Purchase Order', icon: '🛒', path: '/supply/order' },
      { id: 'supply-vendor', label: 'Vendor', icon: '🏢', path: '/supply/vendor' }
    ]
  },
  {
    id: 'warehouse',
    label: 'Warehouse',
    icon: '🏭',
    path: '/warehouse',
    children: [
      { id: 'warehouse-inventory', label: 'Inventory', icon: '📊', path: '/warehouse/inventory' },
      { id: 'warehouse-stock', label: 'Stock Movement', icon: '📈', path: '/warehouse/stock' }
    ]
  }
];

export const Sidebar: React.FC = () => {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const location = useLocation();

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          <span className="avatar-icon">👤</span>
        </div>
        <div className="sidebar-user-info">
          <span className="user-name">Spare Part User</span>
          <span className="user-status">
            <span className="status-dot"></span> Online
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-title">MAIN NAVIGATION</span>
        </div>

        {menuItems.map(item => (
          <div key={item.id} className="nav-item-wrapper">
            {item.children ? (
              <>
                <button
                  className={`nav-item has-children ${expandedMenus.includes(item.id) ? 'expanded' : ''}`}
                  onClick={() => toggleMenu(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-arrow">❯</span>
                </button>
                {expandedMenus.includes(item.id) && (
                  <div className="nav-children">
                    {item.children.map(child => (
                      <Link
                        key={child.id}
                        to={child.path}
                        className={`nav-child ${isActive(child.path) ? 'active' : ''}`}
                      >
                        <span className="nav-icon">{child.icon}</span>
                        <span className="nav-label">{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};
