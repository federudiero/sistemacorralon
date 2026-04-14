import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function HomeRedirect() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-100 px-6 text-center">
        <div className="space-y-2">
          <div className="loading loading-spinner loading-lg text-primary" />
          <div className="text-sm text-base-content/70">Cargando sesión…</div>
        </div>
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? '/aridos' : '/login'} replace />;
}
