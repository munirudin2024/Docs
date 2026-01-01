import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth.utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    // Redirect ke login jika belum login
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
