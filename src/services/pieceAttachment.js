const SEPARATOR = '\n\n---\n';
const ITEM_PREFIX = 'Item: ';
const FIELD_DELIMITER = ' | ';

const sanitizeField = (value) =>
  String(value ?? '')
    .replace(/[|\r\n]+/g, '/')
    .trim();

const priceField = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(2) : sanitizeField(value);
};

export const buildPurchaseRequestMessage = ({ items = [], note = '' } = {}) => {
  const trimmedNote = String(note ?? '').trim();
  const body = trimmedNote || 'I would like to request these pieces.';

  if (items.length === 0) return body;

  const heading = `Purchase request: ${items.length} ${items.length === 1 ? 'piece' : 'pieces'}`;

  const lines = items.map((item) =>
    [
      `${ITEM_PREFIX}${item.postId}`,
      sanitizeField(item.title),
      sanitizeField(item.category),
      priceField(item.price),
      priceField(item.discountedPrice),
      sanitizeField(item.url),
      sanitizeField(item.imageUrl),
    ].join(FIELD_DELIMITER)
  );

  return `${body}${SEPARATOR}${heading}\n${lines.join('\n')}`;
};

const postIdFromUrl = (url) => {
  try {
    const segments = new URL(url).pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    return lastSegment && /^\d+$/.test(lastSegment) ? Number(lastSegment) : null;
  } catch (error) {
    return null;
  }
};

const emptyToNull = (value) => {
  const trimmed = String(value ?? '').trim();
  return trimmed === '' ? null : trimmed;
};

const parseItemLines = (attachment) =>
  attachment
    .split('\n')
    .filter((line) => line.startsWith(ITEM_PREFIX))
    .map((line) => {
      const fields = line.slice(ITEM_PREFIX.length).split(FIELD_DELIMITER);
      if (fields.length < 7) return null;

      const [postId, title, category, price, discountedPrice, url, imageUrl] = fields;

      return {
        postId: /^\d+$/.test(postId.trim()) ? Number(postId.trim()) : null,
        title: title.trim(),
        category: emptyToNull(category),
        price: emptyToNull(price),
        discountedPrice: emptyToNull(discountedPrice),
        url: emptyToNull(url),
        imageUrl: emptyToNull(imageUrl),
      };
    })
    .filter(Boolean);

const LEGACY_WITH_DISCOUNT =
  /About this piece: (.+?) \(([^)]+)\) - \$(.+?) \| discounted: \$(.+?)\nView: (.+)/;
const LEGACY_WITHOUT_DISCOUNT = /About this piece: (.+?) \(([^)]+)\) - \$([^\n]+)\nView: (.+)/;

const parseLegacyPiece = (messageContent) => {
  const imageMatch = messageContent.match(/Image: (.+)/);
  const imageUrl = imageMatch ? imageMatch[1].trim() : null;

  const withDiscount = messageContent.match(LEGACY_WITH_DISCOUNT);
  if (withDiscount) {
    const [, title, category, price, discountedPrice, url] = withDiscount;
    const trimmedUrl = url.trim();
    return [
      {
        postId: postIdFromUrl(trimmedUrl),
        title: title.trim(),
        category: emptyToNull(category),
        price: emptyToNull(price),
        discountedPrice: emptyToNull(discountedPrice),
        url: trimmedUrl,
        imageUrl,
      },
    ];
  }

  const withoutDiscount = messageContent.match(LEGACY_WITHOUT_DISCOUNT);
  if (withoutDiscount) {
    const [, title, category, price, url] = withoutDiscount;
    const trimmedUrl = url.trim();
    return [
      {
        postId: postIdFromUrl(trimmedUrl),
        title: title.trim(),
        category: emptyToNull(category),
        price: emptyToNull(price),
        discountedPrice: null,
        url: trimmedUrl,
        imageUrl,
      },
    ];
  }

  return [];
};

export const parsePieceAttachment = (messageContent) => {
  if (!messageContent) return { body: '', items: [] };

  const body = messageContent.split(SEPARATOR)[0];

  const items = parseItemLines(messageContent);
  if (items.length > 0) return { body, items };

  const legacyItems = parseLegacyPiece(messageContent);
  if (legacyItems.length > 0) return { body, items: legacyItems };

  return { body: messageContent, items: [] };
};
