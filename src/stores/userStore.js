// stores/userStore.js (or wherever you want to place it)
import { create } from 'zustand';
import { getUser } from '../services/fetch-utils.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const useUserStore = create((set) => ({
  user: null,
  error: '',
  loading: true,

  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  fetchUser: async () => {
    try {
      const user = await getUser();
      set({ user, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
      toast.error(`Error getting user: ${e.message}`, {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'postCard-1',
        autoClose: false,
      });
    }
  },
}));
