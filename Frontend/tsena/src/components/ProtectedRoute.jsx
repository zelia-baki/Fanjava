import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const ProtectedRoute = ({ children, userType }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // if (userType && user.user_type !== userType) {
  //   return <Navigate to="/" />;
  // }
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