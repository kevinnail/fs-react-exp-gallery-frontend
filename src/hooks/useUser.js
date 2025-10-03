import { useContext } from 'react';
import { UserContext } from '../context/UserContext.js';
import { authUser } from '../services/auth.js';
import { toast } from 'react-toastify';

export function useUser() {
  const { user, setUser, loading, error, setError, setLoading } = useContext(UserContext);

  const logInUser = async (email, password, type) => {
    try {
      const user = await authUser(email, password, type);
      setUser(user);
    } catch (e) {
      toast.error(`Error logging in`, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    }
  };

  return { user, setUser, error, setError, logInUser, loading, setLoading };
}
