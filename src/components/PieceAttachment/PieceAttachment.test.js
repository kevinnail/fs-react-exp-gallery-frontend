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
  it('renders one card per piece and a single Create Sale button naming the count', () => {
    render(<PieceAttachment items={threePieces} onCreateSale={jest.fn()} />);

    expect(screen.getByText('Requesting 3 pieces')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Blue Wrap Rig' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Slyme Spoon' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fume Pendant' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Sale for 3 pieces →' })).toBeInTheDocument();
  });

  it('hands every piece to onCreateSale so one order covers the whole request', async () => {
    const onCreateSale = jest.fn();
    const user = userEvent.setup();
    render(<PieceAttachment items={threePieces} onCreateSale={onCreateSale} />);

    await user.click(screen.getByRole('button', { name: /create sale/i }));

    expect(onCreateSale).toHaveBeenCalledTimes(1);
    expect(onCreateSale.mock.calls[0][0].map((piece) => piece.postId)).toEqual([42, 17, 8]);
  });

  it('drops the count from the label for a single-piece request', () => {
    render(<PieceAttachment items={[threePieces[0]]} onCreateSale={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Create Sale →' })).toBeInTheDocument();
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

  it('blocks the whole request when any one piece has no usable id, naming that piece', () => {
    const mixedItems = [threePieces[0], { ...threePieces[1], postId: null }];

    render(<PieceAttachment items={mixedItems} onCreateSale={jest.fn()} />);

    const createSale = screen.getByRole('button', { name: /create sale/i });
    expect(createSale).toBeDisabled();
    expect(createSale).toHaveAttribute('title', 'No piece id for "Slyme Spoon"');
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
