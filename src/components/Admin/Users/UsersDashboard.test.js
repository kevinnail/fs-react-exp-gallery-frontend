import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsersDashboard from './UsersDashboard.js';
import { getCustomerMetrics } from '../../../services/fetch-customers.js';

jest.mock('../../../services/fetch-customers.js', () => ({
  getCustomerMetrics: jest.fn(),
}));

const customerWith = (overrides) => ({
  id: 1,
  email: 'customer@example.com',
  firstName: null,
  lastName: null,
  imageUrl: null,
  isVerified: true,
  joinedAt: '2025-01-15T12:00:00.000Z',
  sendEmailNotifications: true,
  hasAddress: false,
  orderCount: 0,
  itemCount: 0,
  auctionsWon: 0,
  gross: 0,
  collected: 0,
  outstanding: 0,
  grossLast30Days: 0,
  grossPrior30Days: 0,
  largestOrder: 0,
  firstPurchaseAt: null,
  lastPurchaseAt: null,
  bidCount: 0,
  auctionsBidOn: 0,
  lastBidAt: null,
  messageCount: 0,
  lastMessageAt: null,
  isAdmin: false,
  ...overrides,
});

const buyer = customerWith({
  id: 2,
  email: 'buyer@example.com',
  firstName: 'Bea',
  lastName: 'Buyer',
  orderCount: 2,
  itemCount: 3,
  gross: 300,
  collected: 250,
  outstanding: 50,
  largestOrder: 200,
  firstPurchaseAt: '2025-02-01T12:00:00.000Z',
  lastPurchaseAt: '2025-03-01T12:00:00.000Z',
  bidCount: 4,
  hasAddress: true,
});

const browser = customerWith({ id: 3, email: 'browser@example.com' });

const rowFor = (email) => screen.getByText(email).closest('tr');

describe('UsersDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows each customer with lifetime spend, average order and outstanding', async () => {
    getCustomerMetrics.mockResolvedValue([buyer, browser]);
    render(<UsersDashboard />);

    await screen.findByText('buyer@example.com');
    const buyerRow = within(rowFor('buyer@example.com'));

    expect(buyerRow.getByText('Bea Buyer')).toBeInTheDocument();
    expect(buyerRow.getByText('$300.00')).toBeInTheDocument();
    expect(buyerRow.getByText('$150.00')).toBeInTheDocument();
    expect(buyerRow.getByText('$50.00')).toHaveClass('owes-money');
    expect(buyerRow.getByText('Mar 1, 2025')).toBeInTheDocument();
  });

  it('shows zeroes and "Never" for a customer who has not bought', async () => {
    getCustomerMetrics.mockResolvedValue([buyer, browser]);
    render(<UsersDashboard />);

    await screen.findByText('browser@example.com');
    const browserRow = within(rowFor('browser@example.com'));

    const zeroAmounts = browserRow.getAllByText('$0.00');
    expect(zeroAmounts).toHaveLength(3);
    expect(zeroAmounts[2]).not.toHaveClass('owes-money');
    expect(browserRow.getByText('Never')).toBeInTheDocument();
  });

  it('expands a customer to show the secondary metrics', async () => {
    getCustomerMetrics.mockResolvedValue([buyer, browser]);
    const user = userEvent.setup();
    render(<UsersDashboard />);

    await screen.findByText('buyer@example.com');
    await user.click(within(rowFor('buyer@example.com')).getByRole('button', { name: 'Details' }));

    const details = screen.getByText('Largest order').closest('dl');
    expect(within(details).getByText('$200.00')).toBeInTheDocument();
    expect(within(details).getByText('Bids placed').nextSibling).toHaveTextContent('4');
    expect(within(details).getByText('Shipping address on file').nextSibling).toHaveTextContent(
      'Yes'
    );
    expect(
      within(details).getByText('Days from signup to first purchase').nextSibling
    ).toHaveTextContent('17');
  });

  it('shows the error when the customers cannot be loaded', async () => {
    getCustomerMetrics.mockRejectedValue(new Error('Could not load customers (500)'));
    render(<UsersDashboard />);

    expect(await screen.findByText('Could not load customers (500)')).toBeInTheDocument();
    expect(screen.queryByText('No users found')).not.toBeInTheDocument();
  });
});
