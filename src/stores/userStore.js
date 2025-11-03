// stores/userStore.js (or wherever you want to place it)
import { create } from 'zustand';
import { getUser } from '../services/fetch-utils.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import websocketService from '../services/websocket.js';

export const useUserStore = create((set) => ({
  user: null,
  error: '',
  loading: false,
  isAdmin: false,
  unreadMessageCount: 0,
  setUser: (user) => {
    set({ user });
    if (user) {
      websocketService.connect();
    }
  },
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setUnreadMessageCount: (fn) =>
    set((state) => ({
      unreadMessageCount: typeof fn === 'function' ? fn(state.unreadMessageCount) : fn,
    })),
  signout: () => {
    websocketService.disconnect?.();
    set({
      user: null,
      isAdmin: undefined,
      error: '',
      loading: false,
      unreadMessageCount: 0,
    });
  },

  fetchUser: async () => {
    try {
      const data = await getUser();
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
