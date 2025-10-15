import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  unreadAuctionCount: 0,
  unreadMessageCount: 0,
  incrementAuction: () =>
    set((state) => ({
      unreadAuctionCount: state.unreadAuctionCount + 1,
    })),
  resetAuction: () => set({ unreadAuctionCount: 0 }),
  incrementMessage: () =>
    set((state) => ({
      unreadMessageCount: state.unreadMessageCount + 1,
    })),
  resetMessage: () => set({ unreadMessageCount: 0 }),
}));
