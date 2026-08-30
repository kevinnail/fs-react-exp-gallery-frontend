import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const REQUEST_CART_STORAGE_KEY = 'slg-request-items';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (piece) => {
        if (!piece || piece.postId === undefined || piece.postId === null) return;

        const postId = Number(piece.postId);
        if (get().items.some((item) => item.postId === postId)) return;

        set((state) => ({
          items: [
            ...state.items,
            {
              postId,
              title: piece.title ?? '',
              category: piece.category ?? '',
              price: piece.price ?? null,
              discountedPrice: piece.discountedPrice ?? null,
              imageUrl: piece.imageUrl ?? null,
              url: piece.url ?? null,
            },
          ],
        }));
      },

      removeItem: (postId) =>
        set((state) => ({
          items: state.items.filter((item) => item.postId !== Number(postId)),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: REQUEST_CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Selector helpers so components subscribe to the narrowest slice they need.
export const selectItemCount = (state) => state.items.length;

export const selectIsInCart = (postId) => (state) =>
  state.items.some((item) => item.postId === Number(postId));
