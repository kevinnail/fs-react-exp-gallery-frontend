// stores/userStore.js (or wherever you want to place it)
import { create } from 'zustand';
import { getUser, updateUser, fetchUserProfile } from '../services/fetch-utils.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const useUserStore = create((set) => ({
  user: null,
  profile: null,
  error: '',
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
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

  updateUserProfile: async (userData) => {
    try {
      set({ loading: true });
      const updatedProfile = await updateUser(userData);
      set({ profile: updatedProfile, loading: false });
      toast.success('Profile updated successfully!', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'profile-update',
        autoClose: 3000,
      });
    } catch (e) {
      set({ error: e.message, loading: false });
      toast.error(`Error updating profile: ${e.message}`, {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'profile-update-error',
        autoClose: false,
      });
    }
  },

  fetchUserProfile: async () => {
    try {
      set({ loading: true });
      const profile = await fetchUserProfile();
      set({ profile: profile, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
      toast.error(`Error fetching profile: ${e.message}`, {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'profile-fetch-error',
        autoClose: false,
      });
    }
  },
}));
