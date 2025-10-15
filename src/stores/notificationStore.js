import { create } from 'zustand';
import {
  getUnreadAuctionNotifications,
  markAuctionNotificationsRead,
} from '../services/fetch-auction-notifications.js';

export const useNotificationStore = create((set) => ({
  unreadAuctionCount: 0,
  unreadMessageCount: 0,
  wonAuctionCount: 0,

  incrementWonAuction: () =>
    set((state) => ({
      wonAuctionCount: state.wonAuctionCount + 1,
    })),

  resetWonAuction: () => set({ wonAuctionCount: 0 }),

  // --- Auction notifications ---
  fetchUnreadAuctions: async () => {
    try {
      const notifications = await getUnreadAuctionNotifications();
      set({ unreadAuctionCount: notifications.length });
    } catch (e) {
      console.error('Error fetching unread auction notifications:', e);
    }
  },

  markAuctionsRead: async () => {
    try {
      await markAuctionNotificationsRead();
      set({ unreadAuctionCount: 0 });
    } catch (e) {
      console.error('Error marking auctions as read:', e);
    }
  },

  incrementAuction: () =>
    set((state) => ({
      unreadAuctionCount: state.unreadAuctionCount + 1,
    })),

  resetAuction: () => set({ unreadAuctionCount: 0 }),

  // --- Message notifications (for future use) ---
  incrementMessage: () =>
    set((state) => ({
      unreadMessageCount: state.unreadMessageCount + 1,
    })),

  resetMessage: () => set({ unreadMessageCount: 0 }),
}));
