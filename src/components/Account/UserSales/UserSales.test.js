import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserSales from './UserSales.js';

const twoPieceOrder = {
  id: 5,
  buyer_id: 3,
  shipping_cost: '11.00',
  tracking_number: null,
  is_paid: false,
  created_at: '2026-09-01T12:00:00.000Z',
  items: [
    {
      id: 9,
      post_id: 42,
      price: '250.00',
      post_title: 'Blue Wrap Rig',
      post_image_url: 'https://cdn.example.com/a.jpg',
    },
    {
      id: 10,
      post_id: 17,
      price: '90.00',
      post_title: 'Slyme Spoon',
      post_image_url: 'https://cdn.example.com/b.jpg',
    },
  ],
};

const shippedSinglePieceOrder = {
  id: 6,
  buyer_id: 3,
  shipping_cost: '10.00',
  tracking_number: '9400111899223456789012',
  is_paid: true,
  created_at: '2026-08-20T12:00:00.000Z',
  items: [
    {
      id: 11,
      post_id: 8,
      price: '60.00',
      post_title: 'Fume Pendant',
      post_image_url: 'https://cdn.example.com/c.jpg',
    },
  ],
};

const renderSales = (sales) =>
  render(<UserSales sales={sales} loading={false} />, { wrapper: MemoryRouter });

const cardFor = (pieceTitle) => screen.getByText(pieceTitle).closest('.user-sales-card');

const totalLine = (card, label) => within(card).getByText(label).closest('.user-sales-total-line');

describe('UserSales', () => {
  it('renders one card per order listing every piece with its own price', () => {
    renderSales([twoPieceOrder]);

    expect(document.querySelectorAll('.user-sales-card')).toHaveLength(1);

    const card = cardFor('Blue Wrap Rig');
    expect(within(card).getByText('Slyme Spoon')).toBeInTheDocument();
    expect(within(card).getByText('$250.00')).toBeInTheDocument();
    expect(within(card).getByText('$90.00')).toBeInTheDocument();
    expect(within(card).getByAltText('Blue Wrap Rig')).toHaveAttribute(
      'src',
      'https://cdn.example.com/a.jpg'
    );
  });

  it('shows shipping as its own line rather than folding it into a price', () => {
    renderSales([twoPieceOrder]);

    const card = cardFor('Blue Wrap Rig');
    expect(within(totalLine(card, '2 pieces')).getByText('$340.00')).toBeInTheDocument();
    expect(within(totalLine(card, 'Shipping')).getByText('$11.00')).toBeInTheDocument();
    expect(within(totalLine(card, 'Total')).getByText('$351.00')).toBeInTheDocument();
  });

  it('reads payment and tracking state off the order, not the piece', () => {
    renderSales([twoPieceOrder, shippedSinglePieceOrder]);

    expect(within(cardFor('Blue Wrap Rig')).getByText('Payment Needed')).toBeInTheDocument();

    const shippedCard = cardFor('Fume Pendant');
    expect(within(shippedCard).getByText('Shipped')).toBeInTheDocument();
    expect(within(shippedCard).getByText('9400111899223456789012')).toBeInTheDocument();
    expect(within(shippedCard).queryByText('Payment Needed')).not.toBeInTheDocument();
  });

  it('falls back to a placeholder when a piece has no image', () => {
    const orderWithoutImage = {
      ...shippedSinglePieceOrder,
      items: [{ ...shippedSinglePieceOrder.items[0], post_image_url: null }],
    };

    renderSales([orderWithoutImage]);

    expect(screen.queryByAltText('Fume Pendant')).not.toBeInTheDocument();
    expect(document.querySelector('.user-sales-img.placeholder')).toBeInTheDocument();
  });

  it('says so when there are no purchases', () => {
    renderSales([]);

    expect(screen.getByText('No purchases yet.')).toBeInTheDocument();
  });
});
