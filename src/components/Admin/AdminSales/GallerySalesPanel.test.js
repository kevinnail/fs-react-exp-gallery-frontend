import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import GallerySalesPanel from './GallerySalesPanel.js';
import { getAllSales, createSale } from '../../../services/fetch-sales.js';
import { getAllUsers } from '../../../services/fetch-utils.js';
import { usePosts } from '../../../hooks/usePosts.js';
import { toast } from 'react-toastify';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../../services/fetch-sales.js', () => ({
  getAllSales: jest.fn(),
  createSale: jest.fn(),
  updateSaleTracking: jest.fn(),
  updateSalePaidStatus: jest.fn(),
}));

jest.mock('../../../services/fetch-utils.js', () => ({
  getAllUsers: jest.fn(),
}));

jest.mock('../../../hooks/usePosts.js', () => ({
  usePosts: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const blueRig = {
  id: 42,
  title: 'Blue Wrap Rig',
  price: '250',
  discountedPrice: null,
  image_url: 'https://cdn.example.com/a.jpg',
};

const slymeSpoon = {
  id: 17,
  title: 'Slyme Spoon',
  price: '120',
  discountedPrice: '90',
  image_url: 'https://cdn.example.com/b.jpg',
};

const twoPieceOrder = {
  id: 5,
  buyer_id: 3,
  buyer_email: 'buyer@example.com',
  buyer_first_name: 'Dana',
  buyer_last_name: 'Reed',
  shipping_cost: '11.00',
  tracking_number: null,
  is_paid: false,
  paid_at: null,
  items: [
    {
      id: 9,
      order_id: 5,
      post_id: 42,
      price: '250.00',
      post_title: 'Blue Wrap Rig',
      post_image_url: 'https://cdn.example.com/a.jpg',
    },
    {
      id: 10,
      order_id: 5,
      post_id: 17,
      price: '90.00',
      post_title: 'Slyme Spoon',
      post_image_url: 'https://cdn.example.com/b.jpg',
    },
  ],
};

const renderPanel = () => render(<GallerySalesPanel />, { wrapper: MemoryRouter });

// What AdminInbox pushes through router state when the admin clicks Create Sale
// on a request message.
const renderPanelWithPrefill = (prefill) =>
  render(
    <MemoryRouter
      initialEntries={[{ pathname: '/admin/sales', state: { fromInbox: true, prefill } }]}
    >
      <GallerySalesPanel />
    </MemoryRouter>
  );

const addPiece = async (user, pieceTitle) => {
  await user.click(screen.getByRole('button', { name: 'Add piece' }));
  const picker = await screen.findByRole('dialog');
  await user.click(within(picker).getByRole('button', { name: new RegExp(pieceTitle) }));
};

const shippingInput = () => screen.getByLabelText('Shipping');

const totalsRow = (label) => screen.getByText(label).closest('.slg-order-total-line');

describe('GallerySalesPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAllSales.mockResolvedValue([]);
    getAllUsers.mockResolvedValue([]);
    usePosts.mockReturnValue({ posts: [blueRig, slymeSpoon] });
  });

  it('renders an existing order as one row with its piece count and full total', async () => {
    getAllSales.mockResolvedValue([twoPieceOrder]);

    renderPanel();

    const row = await screen.findByRole('button', { name: /2 pieces/ });
    // 250 + 90 items, plus 11 shipping
    expect(within(row).getByText('$351')).toBeInTheDocument();
    expect(within(row).getByText(/buyer@example.com/)).toBeInTheDocument();
  });

  it('lists every piece and a separate shipping line in the detail panel', async () => {
    const user = userEvent.setup();
    getAllSales.mockResolvedValue([twoPieceOrder]);

    renderPanel();

    await user.click(await screen.findByRole('button', { name: /2 pieces/ }));

    expect(screen.getByRole('heading', { name: 'Blue Wrap Rig' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Slyme Spoon' })).toBeInTheDocument();
    expect(within(totalsRow('Items')).getByText('$340')).toBeInTheDocument();
    expect(within(totalsRow('Shipping')).getByText('$11')).toBeInTheDocument();
    expect(within(totalsRow('Total')).getByText('$351')).toBeInTheDocument();
  });

  it('seeds shipping from the piece count and posts one order for both pieces', async () => {
    const user = userEvent.setup();
    createSale.mockResolvedValue({ id: 1 });

    renderPanel();

    await user.click(await screen.findByRole('button', { name: 'Add sale' }));
    await user.type(screen.getByLabelText('Buyer email'), 'buyer@example.com');

    await addPiece(user, 'Blue Wrap Rig');
    expect(shippingInput()).toHaveValue(10);

    await addPiece(user, 'Slyme Spoon');
    expect(shippingInput()).toHaveValue(11);

    // the discounted price is what seeds the second row
    expect(screen.getByLabelText('Price for Slyme Spoon')).toHaveValue(90);
    expect(within(totalsRow('Total')).getByText('$351')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save sale' }));

    await waitFor(() => expect(createSale).toHaveBeenCalledTimes(1));
    expect(createSale).toHaveBeenCalledWith(
      'buyer@example.com',
      [
        { postId: 42, price: '250' },
        { postId: 17, price: '90' },
      ],
      '11',
      ''
    );
  });

  it('re-seeds shipping when a piece is removed, but not after the admin types over it', async () => {
    const user = userEvent.setup();

    renderPanel();

    await user.click(await screen.findByRole('button', { name: 'Add sale' }));
    await addPiece(user, 'Blue Wrap Rig');
    await addPiece(user, 'Slyme Spoon');

    await user.click(screen.getByRole('button', { name: 'Remove Slyme Spoon' }));
    expect(screen.queryByLabelText('Price for Slyme Spoon')).not.toBeInTheDocument();
    expect(shippingInput()).toHaveValue(10);

    await user.clear(shippingInput());
    await user.type(shippingInput(), '25');
    await addPiece(user, 'Slyme Spoon');

    expect(shippingInput()).toHaveValue(25);
  });

  it('opens prefilled with every piece from a request and shipping for the count', async () => {
    const user = userEvent.setup();
    createSale.mockResolvedValue({ id: 1 });

    renderPanelWithPrefill({
      buyerEmail: 'buyer@example.com',
      user: null,
      pieces: [
        { id: 42, title: 'Blue Wrap Rig', price: 250, discountedPrice: null, imageUrl: 'a.jpg' },
        { id: 17, title: 'Slyme Spoon', price: 120, discountedPrice: 90, imageUrl: 'b.jpg' },
        { id: 8, title: 'Fume Pendant', price: 60, discountedPrice: null, imageUrl: 'c.jpg' },
      ],
    });

    expect(await screen.findByLabelText('Price for Blue Wrap Rig')).toHaveValue(250);
    expect(screen.getByLabelText('Price for Slyme Spoon')).toHaveValue(90);
    expect(screen.getByLabelText('Price for Fume Pendant')).toHaveValue(60);
    // 10 for the first piece, 1 for each of the other two
    expect(shippingInput()).toHaveValue(12);
    expect(screen.getByLabelText('Buyer email')).toHaveValue('buyer@example.com');

    await user.click(screen.getByRole('button', { name: 'Save sale' }));

    await waitFor(() => expect(createSale).toHaveBeenCalledTimes(1));
    expect(createSale).toHaveBeenCalledWith(
      'buyer@example.com',
      [
        { postId: 42, price: '250' },
        { postId: 17, price: '90' },
        { postId: 8, price: '60' },
      ],
      '12',
      ''
    );
  });

  it('refuses to save an order with no pieces', async () => {
    const user = userEvent.setup();

    renderPanel();

    await user.click(await screen.findByRole('button', { name: 'Add sale' }));
    await user.type(screen.getByLabelText('Buyer email'), 'buyer@example.com');
    await user.click(screen.getByRole('button', { name: 'Save sale' }));

    expect(createSale).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      'Add at least one piece to the sale.',
      expect.any(Object)
    );
  });

  it('will not add the same piece twice', async () => {
    const user = userEvent.setup();

    renderPanel();

    await user.click(await screen.findByRole('button', { name: 'Add sale' }));
    await addPiece(user, 'Blue Wrap Rig');
    await addPiece(user, 'Blue Wrap Rig');

    expect(screen.getAllByLabelText('Price for Blue Wrap Rig')).toHaveLength(1);
    expect(shippingInput()).toHaveValue(10);
    expect(toast.info).toHaveBeenCalledWith(
      'That piece is already on this sale.',
      expect.any(Object)
    );
  });
});
