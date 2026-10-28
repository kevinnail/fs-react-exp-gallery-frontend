import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SoldPieces from './SoldPieces.js';
import { getAllSales } from '../../../services/fetch-sales.js';

jest.mock('../../../services/fetch-sales.js', () => ({
  getAllSales: jest.fn(),
}));

const saleItem = (id, title, category, price, description = '') => ({
  id,
  order_id: 1,
  post_id: id + 100,
  price,
  post_title: title,
  post_image_url: `https://cdn.example.com/${id}.jpg`,
  post_category: category,
  post_description: description,
});

const orders = [
  {
    id: 1,
    buyer_id: 7,
    buyer_email: 'dana@example.com',
    buyer_first_name: 'Dana',
    buyer_last_name: 'Reed',
    created_at: '2026-09-01T18:00:00.000Z',
    items: [
      saleItem(1, 'Blue Wrap Rig', 'Rigs', '300.00', '10mm joint, 6 inch'),
      saleItem(2, 'Fume Pendant', 'Pendants', '80.00'),
    ],
  },
  {
    id: 2,
    buyer_id: 8,
    buyer_email: 'sam@example.com',
    buyer_first_name: null,
    buyer_last_name: null,
    created_at: '2026-10-01T18:00:00.000Z',
    items: [saleItem(3, 'Green Rig', 'Rigs', '200.00', '14mm joint, mini')],
  },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <SoldPieces />
    </MemoryRouter>
  );

const groupNamed = (name) =>
  screen.getByRole('heading', { level: 2, name }).closest('.sold-pieces-group');

describe('SoldPieces', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Otherwise the per-style totals the admin prices new work from are wrong.
  it('groups sold pieces by category with each group’s count, total and average', async () => {
    getAllSales.mockResolvedValue(orders);

    renderPage();

    expect(await screen.findByText('3 pieces, $580.00 total, $193.33 average')).toBeInTheDocument();
    const rigs = groupNamed('Rigs');
    expect(within(rigs).getByText('2 pieces, $500.00 total, $250.00 average')).toBeInTheDocument();
    expect(within(rigs).getByRole('link', { name: 'Blue Wrap Rig' })).toHaveAttribute(
      'href',
      '/101'
    );
    expect(
      within(groupNamed('Pendants')).getByText('1 piece, $80.00 total, $80.00 average')
    ).toBeInTheDocument();
  });

  // Otherwise looking up one customer's buying history still shows everyone's pieces.
  it('narrows the grid to one customer picked from the dropdown', async () => {
    getAllSales.mockResolvedValue(orders);

    renderPage();
    await screen.findByText('3 pieces, $580.00 total, $193.33 average');
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /^Customer/ }),
      'sam@example.com'
    );

    expect(
      screen.getByText('1 piece, $200.00 total, $200.00 average', {
        selector: '.sold-pieces-summary',
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Green Rig' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Blue Wrap Rig' })).not.toBeInTheDocument();
  });

  // Otherwise sizes written only in the description can't be searched.
  it('finds pieces by text in their description', async () => {
    getAllSales.mockResolvedValue(orders);

    renderPage();
    await screen.findByText('3 pieces, $580.00 total, $193.33 average');
    await userEvent.type(screen.getByRole('searchbox'), '14mm');

    expect(
      screen.getByText('1 piece, $200.00 total, $200.00 average', {
        selector: '.sold-pieces-summary',
      })
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Fume Pendant' })).not.toBeInTheDocument();
  });

  // Otherwise a failed load looks the same as never having sold anything.
  it('shows the load error instead of an empty page', async () => {
    getAllSales.mockRejectedValue(new Error('Network down'));

    renderPage();

    expect(await screen.findByText('Network down')).toBeInTheDocument();
    expect(screen.queryByText('No pieces have sold yet.')).not.toBeInTheDocument();
  });
});
