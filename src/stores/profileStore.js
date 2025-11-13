// stores/userStore.js (or wherever you want to place it)
import { create } from 'zustand';
import {
  fetchUserProfile,
  uploadImageToS3,
  updateProfileWithImage,
} from '../services/fetch-utils.js';
import { compressImageToJpeg } from '../services/image-compress.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const useProfileStore = create((set) => ({
  profile: null,
  error: '',
  loading: false,

  setProfile: (profile) => set({ profile }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  // Single profile update method: optionally upload image, then update full profile
  updateUserProfile: async ({
    firstName,
    lastName,
    file,
    existingImageUrl,
    sendEmailNotifications,
  }) => {
    try {
      set({ loading: true });

      let finalImageUrl = existingImageUrl || null;
      if (file) {
        let fileToUpload = file;
        try {
          fileToUpload = await compressImageToJpeg(file, { maxWidth: 256, quality: 0.68 });
        } catch (compressionError) {
          console.error('Avatar compression failed, using original file:', compressionError);
        }

        const uploadResult = await uploadImageToS3(fileToUpload);
        finalImageUrl = uploadResult.secure_url;
      }

      const updatedProfile = await updateProfileWithImage(
        finalImageUrl,
        firstName,
        lastName,
        sendEmailNotifications
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

  // Minimal local setter for the welcome flag. Updates profile.showWelcome in-store only.
  setShowWelcome: (value) =>
    set((state) => ({ profile: { ...(state.profile || {}), showWelcome: value } })),
}));
