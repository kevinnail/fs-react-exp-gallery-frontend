import { useEffect, useMemo, useState } from 'react';
import { getUserAuctions } from '../services/fetch-auctions.js';
import { getUserSales } from '../services/fetch-sales.js';
import websocketService from '../services/websocket.js';
import { SALE_PAID, SALE_TRACKING_INFO, SALE_CREATED } from '../services/salesEvents.js';
import { useAuctionEventsStore } from '../stores/auctionEventsStore.js';
import { getOrderItemsSubtotal, getOrderShipping } from '../services/salesOrder.js';
import { toast } from 'react-toastify';

const FIRST_ITEM_SHIPPING = 10;
const ADDITIONAL_ITEM_SHIPPING = 1;

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
      if (!data || typeof data.orderId === 'undefined') return;
      setSales((previous) =>
        previous.map((order) =>
          order.id === data.orderId ? { ...order, is_paid: data.isPaid } : order
        )
      );
    };

    const handleSaleTracking = (data) => {
      if (!data || typeof data.orderId === 'undefined') return;
      setSales((previous) =>
        previous.map((order) =>
          order.id === data.orderId ? { ...order, tracking_number: data.trackingNumber } : order
        )
      );
    };

    const handleSaleCreated = (data) => {
      const payload = data?.order || data;
      if (!payload) return;

      const mapped = {
        id: payload.orderId,
        buyer_id: payload.userId,
        shipping_cost: payload.shippingCost,
        tracking_number: payload.trackingNumber ?? '0',
        is_paid: payload.isPaid ?? false,
        created_at: payload.created_at,
        items: Array.isArray(payload.items)
          ? payload.items.map((item) => ({
              id: item.saleId,
              post_id: item.postId,
              price: item.price,
              post_title: item.post_title,
              post_image_url: item.post_image_url,
            }))
          : [],
      };

      if (!mapped.id) {
        console.error('[useAccountActivity] sale-created payload missing an order id', data);
        return;
      }
      // ensure the order belongs to this user
      if (mapped.buyer_id && userId && Number(mapped.buyer_id) !== Number(userId)) return;
      setSales((previous) =>
        previous.some((order) => order.id === mapped.id) ? previous : [mapped, ...previous]
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
    const unpaidPurchases = sales.filter((order) => !order.is_paid);

    const auctionSubtotal = unpaidWins.reduce(
      (accumulated, auction) => accumulated + (auction.finalBid || 0),
      0
    );
    const purchaseSubtotal = unpaidPurchases.reduce(
      (accumulated, order) => accumulated + getOrderItemsSubtotal(order),
      0
    );

    // A gallery order carries the shipping the admin actually charged. An auction win
    // has no order behind it and no stored shipping, so it keeps the estimate.
    const purchaseShipping = unpaidPurchases.reduce(
      (accumulated, order) => accumulated + getOrderShipping(order),
      0
    );
    let auctionShipping = 0;
    if (unpaidWins.length > 0) {
      auctionShipping = FIRST_ITEM_SHIPPING + (unpaidWins.length - 1) * ADDITIONAL_ITEM_SHIPPING;
    }
    const shipping = purchaseShipping + auctionShipping;

    const itemCount = unpaidWins.length + unpaidPurchases.length;
    const total = auctionSubtotal + purchaseSubtotal + shipping;

    return {
      unpaidWins,
      unpaidPurchases,
      auctionSubtotal,
      purchaseSubtotal,
      auctionShipping,
      purchaseShipping,
      itemCount,
      shipping,
      total,
    };
  }, [wonAuctions, sales]);

  return { loading, activeAuctionBids, wonAuctions, sales, unpaidData };
};

export { FIRST_ITEM_SHIPPING, ADDITIONAL_ITEM_SHIPPING };
