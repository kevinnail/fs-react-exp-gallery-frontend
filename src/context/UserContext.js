import { createContext, useEffect, useState } from 'react';
import { getUser } from '../services/fetch-utils.js';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUser();
        setUser(user);
      } catch (error) {
        if (error.message !== 'User not logged in') {
          setError(error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, setUser, error, setError, loading, setLoading, authError, setAuthError }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
