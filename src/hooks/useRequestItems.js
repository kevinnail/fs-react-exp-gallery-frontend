import { useEffect, useState } from 'react';
import { getGalleryPostDetail } from '../services/fetch-utils.js';
import { useCartStore } from '../stores/cartStore.js';

export const useRequestItems = () => {
  const items = useCartStore((state) => state.items);
  const [refreshedItems, setRefreshedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      setLoading(true);

      const results = await Promise.all(
        items.map(async (item) => {
          try {
            const post = await getGalleryPostDetail(item.postId);

            if (!post) return { ...item, sold: true, unavailableReason: 'gone' };

            const isGone = Boolean(post.hide);
            const isSold = Boolean(post.sold);

            return {
              ...item,
              title: post.title ?? item.title,
              category: post.category ?? item.category,
              price: post.price ?? item.price,
              discountedPrice: post.discountedPrice ?? null,
              imageUrl: post.image_url ?? item.imageUrl,
              sold: isSold || isGone,
              unavailableReason: isSold ? 'sold' : isGone ? 'gone' : null,
            };
          } catch (error) {
            console.error(`Could not refresh piece ${item.postId}:`, error);
            return { ...item, sold: Boolean(item.sold), unavailableReason: null };
          }
        })
      );

      if (cancelled) return;
      setRefreshedItems(results);
      setLoading(false);
    };

    refresh();

    return () => {
      cancelled = true;
    };
  }, [items]);

  const availableItems = refreshedItems.filter((item) => !item.sold);
  const unavailableItems = refreshedItems.filter((item) => item.sold);

  const total = availableItems.reduce((runningTotal, item) => {
    const discounted = Number(item.discountedPrice);
    const listed = Number(item.price);
    const effective = discounted && discounted < listed ? discounted : listed;
    return runningTotal + (Number.isFinite(effective) ? effective : 0);
  }, 0);

  return { items: refreshedItems, availableItems, unavailableItems, total, loading };
};
