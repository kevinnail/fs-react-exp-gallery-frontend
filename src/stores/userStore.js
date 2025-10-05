// stores/userStore.js (or wherever you want to place it)
import { create } from 'zustand';
import {
  getUser,
  // fetchUserProfile,
  // uploadImageToS3,
  // updateProfileWithImage,
} from '../services/fetch-utils.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const useUserStore = create((set) => ({
  user: null,
  error: '',
  loading: false,
  isAdmin: false,
  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  signout: () => set({ user: null, isAdmin: undefined, error: '', loading: false }),
  fetchUser: async () => {
    try {
      const data = await getUser();
      console.log('data', data);
      if (data) {
        // Handle different possible data structures
        const user = data.user?.user || data.user || data;
        const isAdmin = data.isAdmin || false;
        set({ user, loading: false, isAdmin });
      }
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
