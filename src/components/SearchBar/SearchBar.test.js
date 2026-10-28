import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SearchBar from './SearchBar.js';
import { useUserStore } from '../../stores/userStore.js';
import { searchGalleryPosts } from '../../services/fetch-utils.js';

jest.mock('../../services/fetch-utils.js', () => ({
  searchGalleryPosts: jest.fn(),
}));

const LONG_AGO = '2024-01-01T00:00:00.000Z';

const discountedMarble = {
  id: 1,
  title: 'Zephyr Marble',
  category: 'marbles',
  price: '120',
  originalPrice: '120',
  discountedPrice: '85',
  sold: false,
  created_at: LONG_AGO,
  image_url: null,
};

const fullPriceSpoon = {
  id: 2,
  title: 'Zephyr Spoon',
  category: 'spoons',
  price: '90',
  originalPrice: null,
  discountedPrice: null,
  sold: false,
  created_at: LONG_AGO,
  image_url: null,
};

const soldRig = {
  id: 3,
  title: 'Zephyr Rig',
  category: 'rigs',
  price: '300',
  originalPrice: '300',
  discountedPrice: '250',
  sold: true,
  created_at: LONG_AGO,
  image_url: null,
};

const searchFor = async (term) => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <SearchBar />
    </MemoryRouter>
  );
  await user.click(screen.getByRole('button', { name: 'Search pieces' }));
  await user.type(screen.getByRole('searchbox', { name: 'Search pieces' }), term);
};

const priceLineFor = async (title) => {
  const result = await screen.findByRole('button', { name: new RegExp(title) });
  return result.querySelector('.search-result-price-and-category');
};

describe('SearchBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserStore.setState({ user: null });
    searchGalleryPosts.mockResolvedValue([discountedMarble, fullPriceSpoon, soldRig]);
  });

  // Otherwise a discounted piece shows its full price in search and the shopper never sees the sale.
  it('shows a discounted piece with its struck listed price and its sale price', async () => {
    await searchFor('zephyr');

    const priceLine = await priceLineFor('Zephyr Marble');
    expect(priceLine).toHaveTextContent('$120 $85 · marbles');
    expect(within(priceLine).getByText('$120')).toHaveClass('search-result-was-price');
  });

  // Otherwise every result would render a struck price whether or not it is on sale.
  it('shows a piece with no discount at one plain price', async () => {
    await searchFor('zephyr');

    const priceLine = await priceLineFor('Zephyr Spoon');
    expect(priceLine).toHaveTextContent('$90 · spoons');
    expect(priceLine.querySelector('.search-result-was-price')).toBeNull();
  });

  // Otherwise a sold piece would advertise a sale price nobody can buy at.
  it('shows a sold piece as sold with no price', async () => {
    await searchFor('zephyr');

    const priceLine = await priceLineFor('Zephyr Rig');
    expect(priceLine).toHaveTextContent('Sold · rigs');
    expect(priceLine).not.toHaveTextContent('$');
  });

  // Otherwise a failed search would leave the panel stuck on "Searching…" with no way forward.
  it('shows the no-match message when the search request fails', async () => {
    searchGalleryPosts.mockRejectedValue(new Error('Network down'));

    await searchFor('zephyr');

    expect(await screen.findByText(/No pieces match “zephyr”/)).toBeInTheDocument();
  });
});
