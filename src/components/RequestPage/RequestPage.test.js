import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RequestPage from './RequestPage.js';
import { useCartStore } from '../../stores/cartStore.js';
import { useUserStore } from '../../stores/userStore.js';
import { getGalleryPostDetail } from '../../services/fetch-utils.js';
import { sendCustomerMessage } from '../../services/sendCustomerMessage.js';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../services/fetch-utils.js', () => ({
  getGalleryPostDetail: jest.fn(),
}));

jest.mock('../../services/sendCustomerMessage.js', () => ({
  sendCustomerMessage: jest.fn(),
}));

jest.mock('../../hooks/useWebSocket.js', () => ({
  useWebSocket: () => ({ socket: { emit: jest.fn() }, isConnected: true }),
}));

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const blueRig = {
  postId: 42,
  title: 'Blue Wrap Rig',
  category: 'rigs',
  price: '250',
  discountedPrice: null,
  imageUrl: 'https://cdn.example.com/a.jpg',
  url: 'https://stresslessglass.example.com/42',
};

const slymeSpoon = {
  postId: 17,
  title: 'Slyme Spoon',
  category: 'spoons',
  price: '90',
  discountedPrice: null,
  imageUrl: 'https://cdn.example.com/b.jpg',
  url: 'https://stresslessglass.example.com/17',
};

const asServerPost = (item, overrides = {}) => ({
  id: item.postId,
  title: item.title,
  category: item.category,
  price: item.price,
  discountedPrice: item.discountedPrice,
  image_url: item.imageUrl,
  sold: false,
  ...overrides,
});

const renderPage = () => render(<RequestPage />, { wrapper: MemoryRouter });

describe('RequestPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    useCartStore.setState({ items: [blueRig, slymeSpoon] });
    useUserStore.setState({ user: { id: 3, email: 'buyer@example.com' } });
    getGalleryPostDetail.mockImplementation((id) =>
      Promise.resolve(asServerPost(Number(id) === 42 ? blueRig : slymeSpoon))
    );
    sendCustomerMessage.mockResolvedValue({ conversationId: 9, message: null });
  });

  it('says up front that this is not a checkout', async () => {
    renderPage();

    expect(await screen.findByText(/this isn't a checkout/i)).toBeInTheDocument();
  });

  it('totals the available pieces', async () => {
    renderPage();

    expect(await screen.findByText('$340.00')).toBeInTheDocument();
  });

  it('marks a piece that sold while it sat in the basket and leaves it out of the total', async () => {
    getGalleryPostDetail.mockImplementation((id) =>
      Promise.resolve(
        Number(id) === 42 ? asServerPost(blueRig, { sold: true }) : asServerPost(slymeSpoon)
      )
    );

    renderPage();

    expect(await screen.findByText('Just sold, sorry')).toBeInTheDocument();
    expect(screen.getByText('$90.00')).toBeInTheDocument();
    expect(screen.getByText(/one piece sold while it was in your request/i)).toBeInTheDocument();
  });

  it('sends a message carrying every available piece, then empties the basket', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(
      await screen.findByLabelText(/anything kevin should know/i),
      'Local pickup please'
    );
    await user.click(screen.getByRole('button', { name: /send request to kevin/i }));

    await waitFor(() => expect(sendCustomerMessage).toHaveBeenCalledTimes(1));

    const { messageContent } = sendCustomerMessage.mock.calls[0][0];
    expect(messageContent).toContain('Local pickup please');
    expect(messageContent).toContain('Purchase request: 2 pieces');
    expect(messageContent).toContain('Item: 42 | Blue Wrap Rig');
    expect(messageContent).toContain('Item: 17 | Slyme Spoon');

    expect(useCartStore.getState().items).toEqual([]);
    expect(mockNavigate).toHaveBeenCalledWith('/messages');
  });

  it('excludes a sold piece from the message it sends', async () => {
    getGalleryPostDetail.mockImplementation((id) =>
      Promise.resolve(
        Number(id) === 42 ? asServerPost(blueRig, { sold: true }) : asServerPost(slymeSpoon)
      )
    );
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: /send request to kevin/i }));

    await waitFor(() => expect(sendCustomerMessage).toHaveBeenCalledTimes(1));

    const { messageContent } = sendCustomerMessage.mock.calls[0][0];
    expect(messageContent).toContain('Purchase request: 1 piece');
    expect(messageContent).not.toContain('Blue Wrap Rig');
  });

  it('sends a guest to sign in and keeps their basket', async () => {
    useUserStore.setState({ user: null });
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: /send request to kevin/i }));

    expect(sendCustomerMessage).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/auth/sign-in', { state: { from: '/request' } });
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it('keeps the basket when sending fails, so nothing is silently lost', async () => {
    sendCustomerMessage.mockRejectedValue(new Error('Network down'));
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: /send request to kevin/i }));

    await waitFor(() => expect(useCartStore.getState().items).toHaveLength(2));
    expect(mockNavigate).not.toHaveBeenCalledWith('/messages');
  });

  it('removes a piece from the basket', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: /remove blue wrap rig/i }));

    expect(useCartStore.getState().items.map((item) => item.postId)).toEqual([17]);
  });

  it('shows an empty state rather than a submit button when nothing is picked out', async () => {
    useCartStore.setState({ items: [] });
    renderPage();

    expect(await screen.findByText(/nothing in your request yet/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /send request to kevin/i })
    ).not.toBeInTheDocument();
  });
});
