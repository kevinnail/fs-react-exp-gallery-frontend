import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import Admin from './Admin.js';
import { usePosts } from '../../hooks/usePosts.js';
import { useActiveAuctions } from '../../hooks/useActiveAuctions.js';
import { getAllSales } from '../../services/fetch-sales.js';

jest.mock('../../hooks/usePosts.js', () => ({
  usePosts: jest.fn(),
}));

jest.mock('../../hooks/useActiveAuctions.js', () => ({
  useActiveAuctions: jest.fn(),
}));

jest.mock('../../services/fetch-sales.js', () => ({
  getAllSales: jest.fn(),
}));

const galleryOrder = (id, isPaid, trackingNumber) => ({
  id,
  is_paid: isPaid,
  tracking_number: trackingNumber,
  items: [],
});

const activeAuctionsWith = (auctionsToShipCount) => ({
  auctions: [],
  auctionsToShipCount,
  loading: false,
  error: null,
});

const renderDashboard = () =>
  render(
    <ThemeProvider theme={createTheme()}>
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    </ThemeProvider>
  );

describe('Admin dashboard to-ship notice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePosts.mockReturnValue({ posts: [], loading: false, setPosts: jest.fn() });
  });

  // Otherwise a paid order sits unshipped until the admin happens to open the sales page.
  it('shows paid, untracked gallery orders and auctions as links to the sales page', async () => {
    getAllSales.mockResolvedValue([
      galleryOrder(1, true, null),
      galleryOrder(2, true, '0'),
      galleryOrder(3, true, '9400111'),
      galleryOrder(4, false, null),
    ]);
    useActiveAuctions.mockReturnValue(activeAuctionsWith(1));

    renderDashboard();

    const galleryLink = await screen.findByRole('link', { name: '2 gallery orders to ship' });
    const auctionLink = screen.getByRole('link', { name: '1 auction to ship' });
    expect(galleryLink).toHaveAttribute('href', '/admin/sales');
    expect(auctionLink).toHaveAttribute('href', '/admin/sales');
  });

  // Otherwise the dashboard nags about shipping when there is nothing to ship.
  it('shows no notice when nothing is waiting to ship', async () => {
    getAllSales.mockResolvedValue([galleryOrder(1, true, '9400111'), galleryOrder(2, false, null)]);
    useActiveAuctions.mockReturnValue(activeAuctionsWith(0));

    renderDashboard();
    // Lets the orders request resolve so the check runs against loaded counts.
    await act(async () => {});

    expect(getAllSales).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/to ship/)).not.toBeInTheDocument();
  });

  // Otherwise a failed check looks the same as having nothing to ship.
  it('says the gallery check failed instead of hiding the notice', async () => {
    getAllSales.mockRejectedValue(new Error('Network down'));
    useActiveAuctions.mockReturnValue(activeAuctionsWith(0));

    renderDashboard();

    expect(
      await screen.findByText('Could not check gallery orders to ship: Network down')
    ).toBeInTheDocument();
  });
});
