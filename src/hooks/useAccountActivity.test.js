import { renderHook, waitFor, act } from '@testing-library/react';
import { useAccountActivity } from './useAccountActivity.js';
import { getUserAuctions } from '../services/fetch-auctions.js';
import { getUserSales } from '../services/fetch-sales.js';
import websocketService from '../services/websocket.js';
import { SALE_CREATED, SALE_PAID } from '../services/salesEvents.js';

jest.mock('../services/fetch-auctions.js', () => ({
  getUserAuctions: jest.fn(),
}));

jest.mock('../services/fetch-sales.js', () => ({
  getUserSales: jest.fn(),
}));

jest.mock('../services/websocket.js', () => ({
  __esModule: true,
  default: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
}));

jest.mock('../stores/auctionEventsStore.js', () => ({
  useAuctionEventsStore: () => null,
}));

jest.mock('react-toastify', () => ({
  toast: { error: jest.fn() },
}));

const USER_ID = 3;

const unpaidTwoPieceOrder = {
  id: 5,
  buyer_id: USER_ID,
  shipping_cost: '11.00',
  is_paid: false,
  tracking_number: null,
  items: [
    { id: 9, post_id: 42, price: '250.00', post_title: 'Blue Wrap Rig' },
    { id: 10, post_id: 17, price: '90.00', post_title: 'Slyme Spoon' },
  ],
};

const paidOrder = {
  id: 6,
  buyer_id: USER_ID,
  shipping_cost: '10.00',
  is_paid: true,
  tracking_number: null,
  items: [{ id: 11, post_id: 8, price: '60.00', post_title: 'Fume Pendant' }],
};

const unpaidWin = { auctionId: 77, title: 'Lot 77', finalBid: 400, isPaid: false };

// grabs the handler the hook registered for one websocket event
const handlerFor = (eventName) => {
  const registration = websocketService.on.mock.calls.find(([name]) => name === eventName);
  return registration[1];
};

const renderActivity = async () => {
  const view = renderHook(() => useAccountActivity(USER_ID));
  await waitFor(() => expect(view.result.current.loading).toBe(false));
  return view;
};

describe('useAccountActivity unpaid totals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getUserAuctions.mockResolvedValue({ activeAuctionBids: [], wonAuctions: [] });
    getUserSales.mockResolvedValue([]);
  });

  it('charges the shipping stored on the order, not an estimate over its pieces', async () => {
    getUserSales.mockResolvedValue([unpaidTwoPieceOrder]);

    const { result } = await renderActivity();

    const { unpaidData } = result.current;
    expect(unpaidData.purchaseSubtotal).toBe(340);
    // the order's own $11, not $10 + $1 recomputed over two pieces
    expect(unpaidData.purchaseShipping).toBe(11);
    expect(unpaidData.auctionShipping).toBe(0);
    expect(unpaidData.shipping).toBe(11);
    expect(unpaidData.total).toBe(351);
  });

  it('keeps the estimate for auction wins and adds it to real order shipping once', async () => {
    getUserSales.mockResolvedValue([unpaidTwoPieceOrder]);
    getUserAuctions.mockResolvedValue({ activeAuctionBids: [], wonAuctions: [unpaidWin] });

    const { result } = await renderActivity();

    const { unpaidData } = result.current;
    expect(unpaidData.auctionSubtotal).toBe(400);
    // one win estimates at the first-item rate; the order still contributes its own 11
    expect(unpaidData.auctionShipping).toBe(10);
    expect(unpaidData.shipping).toBe(21);
    expect(unpaidData.total).toBe(761);
  });

  it('leaves paid orders out of the amount due', async () => {
    getUserSales.mockResolvedValue([unpaidTwoPieceOrder, paidOrder]);

    const { result } = await renderActivity();

    const { unpaidData } = result.current;
    expect(unpaidData.unpaidPurchases).toHaveLength(1);
    expect(unpaidData.purchaseSubtotal).toBe(340);
    expect(unpaidData.total).toBe(351);
  });

  it('charges nothing when there is nothing unpaid', async () => {
    getUserSales.mockResolvedValue([paidOrder]);

    const { result } = await renderActivity();

    expect(result.current.unpaidData.shipping).toBe(0);
    expect(result.current.unpaidData.total).toBe(0);
  });
});

describe('useAccountActivity live sale events', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getUserAuctions.mockResolvedValue({ activeAuctionBids: [], wonAuctions: [] });
    getUserSales.mockResolvedValue([]);
  });

  it('adds a newly created order from the nested websocket payload', async () => {
    const { result } = await renderActivity();

    act(() => {
      handlerFor(SALE_CREATED)({
        type: 'sale',
        orderId: 12,
        userId: USER_ID,
        shippingCost: '11.00',
        trackingNumber: null,
        isPaid: false,
        created_at: '2026-09-02T12:00:00.000Z',
        items: [
          {
            saleId: 20,
            postId: 42,
            price: '250.00',
            post_title: 'Blue Wrap Rig',
            post_image_url: 'https://cdn.example.com/a.jpg',
          },
        ],
      });
    });

    expect(result.current.sales).toHaveLength(1);
    const [order] = result.current.sales;
    expect(order.id).toBe(12);
    expect(order.shipping_cost).toBe('11.00');
    expect(order.items).toEqual([
      {
        id: 20,
        post_id: 42,
        price: '250.00',
        post_title: 'Blue Wrap Rig',
        post_image_url: 'https://cdn.example.com/a.jpg',
      },
    ]);
    expect(result.current.unpaidData.total).toBe(261);
  });

  it('ignores an order created for a different buyer', async () => {
    const { result } = await renderActivity();

    act(() => {
      handlerFor(SALE_CREATED)({
        orderId: 13,
        userId: USER_ID + 1,
        shippingCost: '10.00',
        isPaid: false,
        items: [{ saleId: 21, postId: 1, price: '20.00' }],
      });
    });

    expect(result.current.sales).toHaveLength(0);
  });

  it('marks an existing order paid when the order id matches', async () => {
    getUserSales.mockResolvedValue([unpaidTwoPieceOrder]);

    const { result } = await renderActivity();

    act(() => {
      handlerFor(SALE_PAID)({ type: 'sale', orderId: 5, userId: USER_ID, isPaid: true });
    });

    expect(result.current.sales[0].is_paid).toBe(true);
    expect(result.current.unpaidData.total).toBe(0);
  });
});
