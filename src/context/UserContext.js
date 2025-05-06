import { createContext, useEffect, useState } from 'react';
import { getUser } from '../services/fetch-utils.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUser();
        setUser(user);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
        toast.error(`Error getting user: ${e.message}`, {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'postCard-1',
          autoClose: false,
        });
      }
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, error, setError, loading, setLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
