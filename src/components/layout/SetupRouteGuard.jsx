import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ALLOWED_ROLES = ['owner', 'admin_full', 'admin'];

export default function SetupRouteGuard({ children }) {
  const { user, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="page-section">
        <div className="page-section-body flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </div>
    );
  }

  if (!user?.email || !ALLOWED_ROLES.includes(user?.role)) {
    return <Navigate to="/aridos" replace state={{ from: location }} />;
  }

  return children;
}
