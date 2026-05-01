import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items;
        if (!currentItems.find(i => i.productId === item.productId)) {
          set({ items: [...currentItems, item] });
        }
      },
      removeItem: (productId) => set({
        items: get().items.filter(item => item.productId !== productId)
      }),
      isInWishlist: (productId) => get().items.some(item => item.productId === productId),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
