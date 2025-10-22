import { useUserStore } from '../../stores/userStore.js';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const { user, loading, isAdmin } = useUserStore();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return children;
}
