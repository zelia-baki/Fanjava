import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLoader from '@/components/ui/PageLoader';

export const ProtectedRoute = ({ children, userType }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    // Mémorise la page demandée : la connexion y ramène ensuite
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (userType) {
    if (userType === 'client' && !user.is_client) {
      return <Navigate to="/" replace />;
    }
    if (userType === 'entreprise' && !user.is_entreprise) {
      return <Navigate to="/" replace />;
    }
  }
  return children;
};
