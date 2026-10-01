export const SPECIAL_DISCOUNT_PERCENT = 30;
export const SPECIAL_LENGTH_DAYS = 14;

const ENDING_SOON_DAYS = 3;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const specialExpiryTime = (post) =>
  new Date(post.created_at).getTime() + SPECIAL_LENGTH_DAYS * MILLISECONDS_PER_DAY;

export const isSpecialActive = (post, now = new Date()) =>
  post.sold === false && now.getTime() < specialExpiryTime(post);

export const isSpecialAvailableTo = (post, signedUpAt, now = new Date()) =>
  Boolean(signedUpAt) &&
  isSpecialActive(post, now) &&
  new Date(post.created_at).getTime() >= new Date(signedUpAt).getTime();

export const getPiecePrice = (post, { signedUpAt, now = new Date() }) => {
  const basePrice = Number(post.originalPrice ?? post.price);
  const manualPrice = Number(post.discountedPrice);
  const hasManualDiscount = Boolean(post.discountedPrice) && manualPrice < basePrice;
  const listedPrice = hasManualDiscount ? basePrice : Number(post.price);

  const salePrices = [];
  if (hasManualDiscount) salePrices.push(manualPrice);
  if (isSpecialAvailableTo(post, signedUpAt, now)) {
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
