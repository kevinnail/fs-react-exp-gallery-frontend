import { useUserStore } from '../../stores/userStore.js';
import { Navigate } from 'react-router-dom';

export default function UserRoute({ children }) {
  const { user, loading } = useUserStore();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return children;
}
