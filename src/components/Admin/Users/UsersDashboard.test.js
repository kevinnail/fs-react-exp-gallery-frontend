import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsersDashboard from './UsersDashboard.js';
import { getCustomerMetrics } from '../../../services/fetch-customers.js';
import { useUserStore } from '../../../stores/userStore.js';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

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
  emailPromotions: true,
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
    useUserStore.setState({ user: { email: 'admin@example.com' }, isAdmin: true });
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

  it('narrows the table to the chosen filter and leaves the admin out', async () => {
    const admin = customerWith({ id: 9, email: 'admin@example.com' });
    getCustomerMetrics.mockResolvedValue([buyer, browser, admin]);
    const user = userEvent.setup();
    render(<UsersDashboard />);

    await screen.findByText('buyer@example.com');
    expect(screen.queryByText('admin@example.com')).not.toBeInTheDocument();
    expect(screen.getByText('2 of 2 customers')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Owes money' }));

    expect(screen.getByText('1 of 2 customers')).toBeInTheDocument();
    expect(screen.getByText('buyer@example.com')).toBeInTheDocument();
    expect(screen.queryByText('browser@example.com')).not.toBeInTheDocument();
  });

  it('sends only the opted-in filtered customers to the email form', async () => {
    const optedOutDebtor = customerWith({
      id: '5',
      email: 'quiet-debtor@example.com',
      outstanding: 20,
      emailPromotions: false,
    });
    getCustomerMetrics.mockResolvedValue([buyer, browser, optedOutDebtor]);
    const user = userEvent.setup();
    render(<UsersDashboard />);

    await screen.findByText('buyer@example.com');
    await user.click(screen.getByRole('button', { name: 'Owes money' }));
    expect(screen.getByText('2 of 3 customers, 1 opted out of promotions')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Email this customer' }));

    expect(mockNavigate).toHaveBeenCalledWith('/admin/email', {
      state: {
        segment: { label: 'Owes money', userIds: [2] },
      },
    });
  });

  it('disables the email button when every filtered customer has opted out', async () => {
    const optedOut = customerWith({
      id: 6,
      email: 'opted-out@example.com',
      emailPromotions: false,
    });
    getCustomerMetrics.mockResolvedValue([buyer, optedOut]);
    const user = userEvent.setup();
    render(<UsersDashboard />);

    await screen.findByText('buyer@example.com');
    await user.click(screen.getByRole('button', { name: 'Opted out of promotions' }));

    expect(screen.getByText('1 of 2 customers, 1 opted out of promotions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Email these 0 customers' })).toBeDisabled();
  });

  it('shows the error when the customers cannot be loaded', async () => {
    getCustomerMetrics.mockRejectedValue(new Error('Could not load customers (500)'));
    render(<UsersDashboard />);

    expect(await screen.findByText('Could not load customers (500)')).toBeInTheDocument();
    expect(screen.queryByText('No users found')).not.toBeInTheDocument();
  });
});
