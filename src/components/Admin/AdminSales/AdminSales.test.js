import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminSales from './AdminSales.js';
import { getAllSales } from '../../../services/fetch-sales.js';
import { getAllUsers } from '../../../services/fetch-utils.js';
import { getAdminAuctions } from '../../../services/fetch-auctions.js';
import { getBids } from '../../../services/fetch-bids.js';
import { usePosts } from '../../../hooks/usePosts.js';

jest.mock('../../../services/fetch-sales.js', () => ({
  getAllSales: jest.fn(),
  createSale: jest.fn(),
  updateSaleTracking: jest.fn(),
  updateSalePaidStatus: jest.fn(),
}));

jest.mock('../../../services/fetch-utils.js', () => ({
  getAllUsers: jest.fn(),
}));

jest.mock('../../../services/fetch-auctions.js', () => ({
  getAdminAuctions: jest.fn(),
  markAuctionPaid: jest.fn(),
  updateAuctionTracking: jest.fn(),
}));

jest.mock('../../../services/fetch-bids.js', () => ({
  getBids: jest.fn(),
}));

jest.mock('../../../services/websocket.js', () => ({
  __esModule: true,
  default: { on: jest.fn(), off: jest.fn() },
}));

jest.mock('../../../hooks/usePosts.js', () => ({
  usePosts: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const galleryOrder = (isPaid, trackingNumber = null) => ({
  id: 5,
  buyer_email: 'buyer@example.com',
  buyer_first_name: 'Dana',
  buyer_last_name: 'Reed',
  shipping_cost: '10.00',
  tracking_number: trackingNumber,
  is_paid: isPaid,
  items: [
    {
      id: 9,
      order_id: 5,
      post_id: 42,
      price: '250.00',
      post_title: 'Blue Wrap Rig',
      post_image_url: 'https://cdn.example.com/a.jpg',
    },
  ],
});

const endedAuction = (id, isPaid, trackingNumber = null) => ({
  id,
  title: `Fume Marble ${id}`,
  isPaid,
  isActive: false,
  trackingNumber,
  imageUrls: [],
});

const winningBid = {
  bidAmount: 80,
  user: { userId: 3, email: 'bidder@example.com', firstName: 'Sam', lastName: 'Lee' },
};

const renderSalesPage = async (initialEntry = '/admin/sales') => {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AdminSales />
    </MemoryRouter>
  );
  // Both panels have finished loading once each list heading is on the page.
  await screen.findByText('Gallery sales');
  await screen.findByText('Auction results');
};

const tabCount = (tabName, countName = 'unpaid') =>
  screen
    .getByRole('tab', { name: new RegExp(tabName) })
    .querySelector(`.admin-sales-tab-${countName}-count`);

describe('AdminSales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAllUsers.mockResolvedValue([]);
    getBids.mockResolvedValue([winningBid]);
    usePosts.mockReturnValue({ posts: [] });
  });

  // Otherwise an unpaid auction goes unnoticed while the admin is looking at gallery sales.
  it('shows unpaid counts on both tabs while the Gallery tab is selected', async () => {
    getAllSales.mockResolvedValue([galleryOrder(false)]);
    getAdminAuctions.mockResolvedValue([endedAuction(1, false), endedAuction(2, false)]);

    await renderSalesPage();

    expect(screen.getByRole('tab', { name: /Gallery/ })).toHaveAttribute('aria-selected', 'true');
    expect(tabCount('Gallery')).toHaveTextContent('1 unpaid');
    expect(tabCount('Auction')).toHaveTextContent('2 unpaid');
  });

  // Otherwise the tabs would nag about money that has already been collected.
  it('shows no unpaid count on either tab when everything is paid', async () => {
    getAllSales.mockResolvedValue([galleryOrder(true)]);
    getAdminAuctions.mockResolvedValue([endedAuction(1, true)]);

    await renderSalesPage();

    expect(tabCount('Gallery')).toBeNull();
    expect(tabCount('Auction')).toBeNull();
  });

  // Otherwise a paid auction waiting to ship goes unnoticed while the admin is shipping gallery orders.
  it('shows to-ship counts on both tabs while the Gallery tab is selected', async () => {
    getAllSales.mockResolvedValue([galleryOrder(true)]);
    getAdminAuctions.mockResolvedValue([endedAuction(1, true), endedAuction(2, true)]);

    await renderSalesPage();

    expect(tabCount('Gallery', 'to-ship')).toHaveTextContent('1 to ship');
    expect(tabCount('Auction', 'to-ship')).toHaveTextContent('2 to ship');
  });

  // Otherwise the tabs keep calling for shipping after the tracking number is saved.
  it('shows no to-ship count on either tab once tracking is saved', async () => {
    getAllSales.mockResolvedValue([galleryOrder(true, '9400111899223197428490')]);
    getAdminAuctions.mockResolvedValue([endedAuction(1, true, '9400111899223197428491')]);

    await renderSalesPage();

    expect(tabCount('Gallery', 'to-ship')).toBeNull();
    expect(tabCount('Auction', 'to-ship')).toBeNull();
  });

  // Otherwise an unpaid order would also be counted as ready to ship.
  it('counts an unpaid order only as unpaid, not as to ship', async () => {
    getAllSales.mockResolvedValue([galleryOrder(false)]);
    getAdminAuctions.mockResolvedValue([endedAuction(1, false)]);

    await renderSalesPage();

    expect(tabCount('Gallery')).toHaveTextContent('1 unpaid');
    expect(tabCount('Gallery', 'to-ship')).toBeNull();
    expect(tabCount('Auction', 'to-ship')).toBeNull();
  });

  // Otherwise the dashboard's "auction to ship" link lands on the gallery tab.
  it('opens the Auction tab when navigated to with that tab in state', async () => {
    getAllSales.mockResolvedValue([]);
    getAdminAuctions.mockResolvedValue([endedAuction(1, true)]);

    await renderSalesPage({ pathname: '/admin/sales', state: { tab: 'auctions' } });

    expect(screen.getByRole('tab', { name: /Auction/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /Gallery/ })).toHaveAttribute('aria-selected', 'false');
  });
});
