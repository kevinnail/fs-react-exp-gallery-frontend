import { useUserStore } from '../stores/userStore.js';
import { useProfileStore } from '../stores/profileStore.js';

export const useSignedUpAt = () => {
  const user = useUserStore((state) => state.user);
  const profileCreatedAt = useProfileStore((state) => state.profile?.createdAt);

  return user ? (profileCreatedAt ?? null) : null;
};
