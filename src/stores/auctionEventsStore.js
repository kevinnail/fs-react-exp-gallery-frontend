// src/stores/auctionEventsStore.js
import { create } from 'zustand';
import websocketService from '../services/websocket.js';

let listenersAttached = false;

export const useAuctionEventsStore = create((set, get) => ({
  // event signals
  lastBidUpdate: null,
  lastBuyNowId: null,
  lastAuctionEnded: null,
  lastAuctionCreated: null, // stores the auction object

  // actions
  setBid: (auctionId) => set({ lastBidUpdate: { id: Number(auctionId), t: Date.now() } }),

  setBuyNow: (auctionId) => set({ lastBuyNowId: Number(auctionId) }),
  setEnded: (auctionId) => set({ lastAuctionEnded: Number(auctionId) }),
  setCreated: (auction) => set({ lastAuctionCreated: auction }),

  // one-time listener attach
  attachListeners: () => {
    if (listenersAttached) return;
    listenersAttached = true;

    websocketService.on('bid-placed', ({ auctionId }) => {
      get().setBid(auctionId);
    });

    websocketService.on('auction-BIN', (auctionId) => {
      get().setBuyNow(auctionId);
    });

    websocketService.on('auction-ended', ({ auctionId }) => {
      get().setEnded(auctionId);
    });

    websocketService.on('auction-created', ({ auction }) => {
      get().setCreated(auction);
    });
  },
}));

// attach immediately when module loads
useAuctionEventsStore.getState().attachListeners();
