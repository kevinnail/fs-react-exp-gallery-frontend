import { useContext } from 'react';
import { UserContext } from '../context/UserContext.js';
import { authUser } from '../services/auth.js';

export function useUser() {
  const { user, setUser, loading, error, setError, setLoading } = useContext(UserContext);

  const logInUser = async (email, password, type) => {
    const user = await authUser(email, password, type);
    setUser(user);
  };

  return { user, setUser, error, setError, logInUser, loading, setLoading };
}
