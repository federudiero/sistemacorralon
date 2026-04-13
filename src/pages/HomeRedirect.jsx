import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function HomeRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/aridos' : '/login'} replace />;
}
