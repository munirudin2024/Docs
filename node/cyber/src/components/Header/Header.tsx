import './Header.css';

interface HeaderProps {
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({ userName = 'User' }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <button className="menu-toggle" aria-label="Toggle menu">
          ☰
        </button>
        <h1 className="app-title">SISMAX</h1>
        <span className="app-subtitle">Sriboga Integrated System</span>
      </div>
      
      <div className="header-right">
        <div className="user-menu">
          <div className="user-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          <span className="user-name">{userName}</span>
        </div>
      </div>
    </header>
  );
};
