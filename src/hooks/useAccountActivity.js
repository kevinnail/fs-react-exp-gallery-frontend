import { useEffect, useMemo, useState } from 'react';
import { getUserAuctions } from '../services/fetch-auctions.js';
import { getUserSales } from '../services/fetch-sales.js';
import websocketService from '../services/websocket.js';
import { SALE_PAID, SALE_TRACKING_INFO, SALE_CREATED } from '../services/salesEvents.js';
import { useAuctionEventsStore } from '../stores/auctionEventsStore.js';
import { toast } from 'react-toastify';

const FIRST_ITEM_SHIPPING = 9;
const ADDITIONAL_ITEM_SHIPPING = 1;

/**
 * Single source of truth for the signed-in user's auction and purchase activity on
 * the account page. Loads both feeds once, keeps them current over websockets and
 * the auction events store, and derives what is still owed. The summary tab, the
 * tab badges, and the auctions/purchases tabs all read from this one instance so
 * the page makes one round trip per feed instead of one per tab.
 */
export const useAccountActivity = (userId) => {
  const [activeAuctionBids, setActiveAuctionBids] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const lastAuctionPaid = useAuctionEventsStore((state) => state.lastAuctionPaid);
  const lastTrackingUpdate = useAuctionEventsStore((state) => state.lastTrackingUpdate);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        let auctionsResponse = { activeAuctionBids: [], wonAuctions: [] };
        if (userId) {
          auctionsResponse = await getUserAuctions(userId);
        }

        const salesResponse = await getUserSales();

        if (!isMounted) return;

        let rawActive = [];
        if (auctionsResponse && Array.isArray(auctionsResponse.activeAuctionBids)) {
          rawActive = auctionsResponse.activeAuctionBids;
        }

        let rawWon = [];
        if (auctionsResponse && Array.isArray(auctionsResponse.wonAuctions)) {
          rawWon = auctionsResponse.wonAuctions;
        }

        let rawSales = [];
        if (Array.isArray(salesResponse)) {
          rawSales = salesResponse;
        }

        setActiveAuctionBids(rawActive);
        setWonAuctions(rawWon);
        setSales(rawSales);
      } catch (error) {
        console.error('Error loading account activity:', error);
        toast.error(`${error.message}` || 'Error loading your account activity', {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'account-activity-load',
          autoClose: 3000,
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Real-time purchase updates (paid status, tracking, and newly created sales)
  useEffect(() => {
    const handleSalePaid = (data) => {
      if (!data || typeof data.saleId === 'undefined') return;
      setSales((previous) =>
        previous.map((sale) => (sale.id === data.saleId ? { ...sale, is_paid: data.isPaid } : sale))
      );
    };

    const handleSaleTracking = (data) => {
      if (!data || typeof data.saleId === 'undefined') return;
      setSales((previous) =>
        previous.map((sale) =>
          sale.id === data.saleId ? { ...sale, tracking_number: data.trackingNumber } : sale
        )
      );
    };

    const handleSaleCreated = (data) => {
      const payload = data?.sale || data;
      if (!payload) return;
      const mapped = {
        id: payload.id ?? payload.saleId,
        post_id: payload.post_id ?? payload.postId,
        user_id: payload.user_id ?? payload.userId,
        price: payload.price,
        tracking_number: payload.tracking_number ?? payload.trackingNumber ?? '0',
        is_paid: payload.is_paid ?? payload.isPaid ?? false,
        created_at: payload.created_at,
        post_title: payload.post_title,
        post_image_url: payload.post_image_url,
        buyer_email: payload.buyer_email,
      };
      if (!mapped.id) {
        console.error('[useAccountActivity] sale-created payload missing id', data);
        return;
      }
      // ensure the sale belongs to this user
      if (mapped.user_id && userId && Number(mapped.user_id) !== Number(userId)) return;
      setSales((previous) =>
        previous.some((sale) => sale.id === mapped.id) ? previous : [mapped, ...previous]
      );
    };

    websocketService.on(SALE_PAID, handleSalePaid);
    websocketService.on(SALE_TRACKING_INFO, handleSaleTracking);
    websocketService.on(SALE_CREATED, handleSaleCreated);
    return () => {
      websocketService.off(SALE_PAID, handleSalePaid);
      websocketService.off(SALE_TRACKING_INFO, handleSaleTracking);
      websocketService.off(SALE_CREATED, handleSaleCreated);
    };
  }, [userId]);

  // Live auction paid updates come through the auction events store
  useEffect(() => {
    if (!lastAuctionPaid) return;
    const { id, isPaid } = lastAuctionPaid;
    setWonAuctions((previous) =>
      previous.map((auction) =>
        auction.auctionId === id || auction.id === id ? { ...auction, isPaid } : auction
      )
    );
  }, [lastAuctionPaid]);

  useEffect(() => {
    if (!lastTrackingUpdate) return;
    const { id, trackingNumber } = lastTrackingUpdate;
    setWonAuctions((previous) =>
      previous.map((auction) =>
        auction.auctionId === id || auction.id === id ? { ...auction, trackingNumber } : auction
      )
    );
  }, [lastTrackingUpdate]);

  const unpaidData = useMemo(() => {
    const unpaidWins = wonAuctions.filter((auction) => !auction.isPaid);
    const unpaidPurchases = sales.filter((sale) => !sale.is_paid);

    const auctionSubtotal = unpaidWins.reduce(
      (accumulated, auction) => accumulated + (auction.finalBid || 0),
      0
    );
    const purchaseSubtotal = unpaidPurchases.reduce(
      (accumulated, sale) => accumulated + (Number(sale.price) || 0),
      0
    );

    const itemCount = unpaidWins.length + unpaidPurchases.length;
    let shipping = 0;
    if (itemCount > 0) {
      shipping = FIRST_ITEM_SHIPPING + Math.max(0, itemCount - 1) * ADDITIONAL_ITEM_SHIPPING;
    }
    const total = auctionSubtotal + purchaseSubtotal + shipping;

    return {
      unpaidWins,
      unpaidPurchases,
      auctionSubtotal,
      purchaseSubtotal,
      itemCount,
      shipping,
      total,
    };
  }, [wonAuctions, sales]);

  return { loading, activeAuctionBids, wonAuctions, sales, unpaidData };
};

export { FIRST_ITEM_SHIPPING, ADDITIONAL_ITEM_SHIPPING };
