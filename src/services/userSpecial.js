// The account special: signed-in users get SPECIAL_DISCOUNT_PERCENT off any
// unsold piece for SPECIAL_LENGTH_DAYS after it is posted.
export const SPECIAL_DISCOUNT_PERCENT = 30;
export const SPECIAL_LENGTH_DAYS = 14;

const ENDING_SOON_DAYS = 3;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const specialExpiryTime = (post) =>
  new Date(post.created_at).getTime() + SPECIAL_LENGTH_DAYS * MILLISECONDS_PER_DAY;

export const isSpecialActive = (post, now = new Date()) =>
  post.sold === false && now.getTime() < specialExpiryTime(post);

// A manual discount (discounted_price) still applies alongside the special.
// The two never stack: the lower price wins.
export const getPiecePrice = (post, { isSignedIn, now = new Date() }) => {
  const basePrice = Number(post.originalPrice ?? post.price);
  const manualPrice = Number(post.discountedPrice);
  const hasManualDiscount = Boolean(post.discountedPrice) && manualPrice < basePrice;
  const listedPrice = hasManualDiscount ? basePrice : Number(post.price);

  const salePrices = [];
  if (hasManualDiscount) salePrices.push(manualPrice);
  if (isSignedIn && isSpecialActive(post, now)) {
    salePrices.push((listedPrice * (100 - SPECIAL_DISCOUNT_PERCENT)) / 100);
  }

  return {
    listedPrice,
    salePrice: salePrices.length > 0 ? Math.min(...salePrices) : null,
  };
};

const daysUntilSpecialEnds = (post, now) =>
  (specialExpiryTime(post) - now.getTime()) / MILLISECONDS_PER_DAY;

// Counts down to the same instant the piece leaves the special, so the
// label and the card disappearing always agree.
export const getSpecialCountdownLabel = (post, now = new Date()) => {
  if (!isSpecialActive(post, now)) return null;

  const daysRemaining = daysUntilSpecialEnds(post, now);
  if (daysRemaining < 1) return 'Last day!';
  if (daysRemaining < ENDING_SOON_DAYS) return `Only ${Math.ceil(daysRemaining)} days left!`;
  return `${Math.ceil(daysRemaining)} days left`;
};

export const isSpecialEndingSoon = (post, now = new Date()) =>
  isSpecialActive(post, now) && daysUntilSpecialEnds(post, now) < ENDING_SOON_DAYS;
