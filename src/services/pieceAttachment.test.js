import { buildPurchaseRequestMessage, parsePieceAttachment } from './pieceAttachment.js';

const blueRig = {
  postId: 42,
  title: 'Blue Wrap Rig',
  category: 'rigs',
  price: '250',
  discountedPrice: '200',
  url: 'https://stresslessglass.example.com/42',
  imageUrl: 'https://cdn.example.com/a.jpg',
};

const slymeSpoon = {
  postId: 17,
  title: 'Slyme Spoon',
  category: 'spoons',
  price: '90',
  discountedPrice: null,
  url: 'https://stresslessglass.example.com/17',
  imageUrl: 'https://cdn.example.com/b.jpg',
};

describe('buildPurchaseRequestMessage', () => {
  it('puts the customer note first and one line per piece after the separator', () => {
    const message = buildPurchaseRequestMessage({
      items: [blueRig, slymeSpoon],
      note: 'Local pickup if you can.',
    });

    expect(message).toBe(
      'Local pickup if you can.\n\n---\nPurchase request: 2 pieces\n' +
        'Item: 42 | Blue Wrap Rig | rigs | 250.00 | 200.00 | ' +
        'https://stresslessglass.example.com/42 | https://cdn.example.com/a.jpg\n' +
        'Item: 17 | Slyme Spoon | spoons | 90.00 |  | ' +
        'https://stresslessglass.example.com/17 | https://cdn.example.com/b.jpg'
    );
  });

  it('falls back to a default note so the message is never just a piece list', () => {
    const message = buildPurchaseRequestMessage({ items: [blueRig], note: '   ' });

    expect(message.split('\n\n---\n')[0]).toBe('I would like to request these pieces.');
  });

  it('says "piece" rather than "pieces" for a single item', () => {
    const message = buildPurchaseRequestMessage({ items: [blueRig] });

    expect(message).toContain('Purchase request: 1 piece\n');
  });

  it('strips the field delimiter out of a title so the line still parses', () => {
    const message = buildPurchaseRequestMessage({
      items: [{ ...blueRig, title: 'Blue | Wrap | Rig' }],
    });

    const { items } = parsePieceAttachment(message);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Blue / Wrap / Rig');
  });

  it('returns only the note when there are no pieces', () => {
    expect(buildPurchaseRequestMessage({ items: [], note: 'Just saying hi' })).toBe(
      'Just saying hi'
    );
  });
});

describe('parsePieceAttachment', () => {
  it('round-trips a multi-piece request', () => {
    const message = buildPurchaseRequestMessage({
      items: [blueRig, slymeSpoon],
      note: 'These two please.',
    });

    const { body, items } = parsePieceAttachment(message);

    expect(body).toBe('These two please.');
    expect(items).toEqual([
      { ...blueRig, price: '250.00', discountedPrice: '200.00' },
      { ...slymeSpoon, price: '90.00', discountedPrice: null },
    ]);
  });

  it('reads the post id from the line rather than guessing from the url', () => {
    const message = buildPurchaseRequestMessage({
      items: [{ ...blueRig, url: 'https://stresslessglass.example.com/gallery/some-slug' }],
    });

    expect(parsePieceAttachment(message).items[0].postId).toBe(42);
  });

  it('still renders a legacy single-piece message that carries a discount', () => {
    const legacy =
      'Is this still available?\n\n---\nAbout this piece: Blue Wrap Rig (rigs) - $250 | ' +
      'discounted: $200\nView: https://stresslessglass.example.com/42\n' +
      'Image: https://cdn.example.com/a.jpg';

    const { body, items } = parsePieceAttachment(legacy);

    expect(body).toBe('Is this still available?');
    expect(items).toEqual([
      {
        postId: 42,
        title: 'Blue Wrap Rig',
        category: 'rigs',
        price: '250',
        discountedPrice: '200',
        url: 'https://stresslessglass.example.com/42',
        imageUrl: 'https://cdn.example.com/a.jpg',
      },
    ]);
  });

  it('still renders the oldest single-piece format, which had no discount', () => {
    const legacy =
      'Interested!\n\n---\nAbout this piece: Slyme Spoon (spoons) - $90\n' +
      'View: https://stresslessglass.example.com/17\nImage: https://cdn.example.com/b.jpg';

    const { items } = parsePieceAttachment(legacy);

    expect(items).toHaveLength(1);
    expect(items[0].postId).toBe(17);
    expect(items[0].discountedPrice).toBeNull();
  });

  it('returns no pieces for an ordinary message', () => {
    const { body, items } = parsePieceAttachment('Hey Kevin, how long is shipping?');

    expect(body).toBe('Hey Kevin, how long is shipping?');
    expect(items).toEqual([]);
  });

  it('keeps the whole message when a typed separator attaches nothing', () => {
    const typed = 'Two things\n\n---\nfirst, hello\nsecond, how much is shipping?';

    const { body, items } = parsePieceAttachment(typed);

    expect(items).toEqual([]);
    expect(body).toBe(typed);
  });

  it('survives a message that could not be decrypted', () => {
    expect(parsePieceAttachment(null)).toEqual({ body: '', items: [] });
  });
});
