import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PieceAttachment from './PieceAttachment.js';
import {
  parsePieceAttachment,
  buildPurchaseRequestMessage,
} from '../../services/pieceAttachment.js';

const threePieces = [
  {
    postId: 42,
    title: 'Blue Wrap Rig',
    category: 'rigs',
    price: '250',
    discountedPrice: '200',
    url: 'https://stresslessglass.example.com/42',
    imageUrl: 'https://cdn.example.com/a.jpg',
  },
  {
    postId: 17,
    title: 'Slyme Spoon',
    category: 'spoons',
    price: '90',
    discountedPrice: null,
    url: 'https://stresslessglass.example.com/17',
    imageUrl: 'https://cdn.example.com/b.jpg',
  },
  {
    postId: 8,
    title: 'Fume Pendant',
    category: 'pendants',
    price: '60',
    discountedPrice: null,
    url: 'https://stresslessglass.example.com/8',
    imageUrl: 'https://cdn.example.com/c.jpg',
  },
];

describe('PieceAttachment', () => {
  it('renders one card per piece with a Create Sale button for the admin', () => {
    render(<PieceAttachment items={threePieces} onCreateSale={jest.fn()} />);

    expect(screen.getByText('Requesting 3 pieces')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Blue Wrap Rig' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Slyme Spoon' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fume Pendant' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /create sale/i })).toHaveLength(3);
  });

  it('hands the clicked piece to onCreateSale so the right sale is prefilled', async () => {
    const onCreateSale = jest.fn();
    const user = userEvent.setup();
    render(<PieceAttachment items={threePieces} onCreateSale={onCreateSale} />);

    await user.click(screen.getAllByRole('button', { name: /create sale/i })[1]);

    expect(onCreateSale).toHaveBeenCalledTimes(1);
    expect(onCreateSale.mock.calls[0][0].postId).toBe(17);
  });

  it('offers no Create Sale button in the customer thread', () => {
    render(<PieceAttachment items={threePieces} />);

    expect(screen.queryByRole('button', { name: /create sale/i })).not.toBeInTheDocument();
  });

  it('shows the discounted price when a piece is on sale', () => {
    render(<PieceAttachment items={[threePieces[0]]} />);

    expect(screen.getByText('$250.00')).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument();
  });

  it('renders nothing for a message with no pieces attached', () => {
    const { container } = render(<PieceAttachment items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders a legacy single-piece message as one card', () => {
    const legacy =
      'Is this still available?\n\n---\nAbout this piece: Blue Wrap Rig (rigs) - $250 | ' +
      'discounted: $200\nView: https://stresslessglass.example.com/42\n' +
      'Image: https://cdn.example.com/a.jpg';

    render(<PieceAttachment items={parsePieceAttachment(legacy).items} onCreateSale={jest.fn()} />);

    expect(screen.queryByText(/requesting/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /create sale/i })).toHaveLength(1);
  });

  it('disables Create Sale when a message carries no usable piece id', () => {
    const legacyWithoutNumericId =
      'Hi\n\n---\nAbout this piece: Mystery (misc) - $10\nView: https://example.com/shop/mystery';

    render(
      <PieceAttachment
        items={parsePieceAttachment(legacyWithoutNumericId).items}
        onCreateSale={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /create sale/i })).toBeDisabled();
  });

  it('renders what the request builder produced, end to end', () => {
    const message = buildPurchaseRequestMessage({ items: threePieces, note: 'These three please' });

    render(<PieceAttachment items={parsePieceAttachment(message).items} />);

    expect(screen.getAllByRole('heading')).toHaveLength(3);
  });
});
