import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="layout-content">
        <Header userName="Spare Part User" />
        <main className="main-content">
          {children}
        </main>
        <footer className="app-footer">
          <p>Copyright © 2026 <strong>PT. Sriboga Flour Mill</strong>. Version DS 1.1</p>
        </footer>
      </div>
    </div>
  );
};
