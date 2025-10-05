// stores/userStore.js (or wherever you want to place it)
import { create } from 'zustand';
import {
  getUser,
  fetchUserProfile,
  uploadImageToS3,
  updateProfileWithImage,
} from '../services/fetch-utils.js';
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

  // Single profile update method: optionally upload image, then update full profile
  updateUserProfile: async ({ firstName, lastName, file, existingImageUrl }) => {
    try {
      set({ loading: true });

      let finalImageUrl = existingImageUrl || null;
      const previousImageUrl = existingImageUrl || null;
      if (file) {
        const uploadResult = await uploadImageToS3(file);
        finalImageUrl = uploadResult.secure_url;
      }

      const updatedProfile = await updateProfileWithImage(
        finalImageUrl,
        firstName,
        lastName,
        file ? existingImageUrl : null
      );
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
