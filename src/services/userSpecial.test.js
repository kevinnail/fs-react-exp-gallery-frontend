import { getPiecePrice, getSpecialCountdownLabel, isSpecialActive } from './userSpecial.js';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const now = new Date('2026-09-13T12:00:00Z');

const postedDaysAgo = (days, overrides = {}) => ({
  price: '100',
  discountedPrice: null,
  originalPrice: null,
  sold: false,
  created_at: new Date(now.getTime() - days * MILLISECONDS_PER_DAY).toISOString(),
  ...overrides,
});

describe('getPiecePrice', () => {
  it('gives a signed-in user 30% off a piece still inside the special', () => {
    expect(getPiecePrice(postedDaysAgo(13), { isSignedIn: true, now })).toEqual({
      listedPrice: 100,
      salePrice: 70,
    });
  });

  it('uses a manual discount when it is lower than the special', () => {
    const post = postedDaysAgo(2, { discountedPrice: '60', originalPrice: '100' });

    expect(getPiecePrice(post, { isSignedIn: true, now })).toEqual({
      listedPrice: 100,
      salePrice: 60,
    });
  });

  it('keeps a manual discount for a signed-out viewer', () => {
    const post = postedDaysAgo(2, { discountedPrice: '80', originalPrice: '100' });

    expect(getPiecePrice(post, { isSignedIn: false, now }).salePrice).toBe(80);
  });

  it('gives a signed-out viewer full price on a brand-new piece', () => {
    expect(getPiecePrice(postedDaysAgo(0), { isSignedIn: false, now })).toEqual({
      listedPrice: 100,
      salePrice: null,
    });
  });

  it('gives full price once the 14 days have passed', () => {
    const justExpired = postedDaysAgo(14 + 1 / (24 * 60));

    expect(getPiecePrice(justExpired, { isSignedIn: true, now }).salePrice).toBeNull();
  });
});

describe('isSpecialActive', () => {
  it('is never active for a sold piece', () => {
    expect(isSpecialActive(postedDaysAgo(1, { sold: true }), now)).toBe(false);
  });

  it('is not active for a post with no created_at', () => {
    expect(isSpecialActive({ price: '100', sold: false }, now)).toBe(false);
  });
});

describe('getSpecialCountdownLabel', () => {
  it('counts down through the last three days', () => {
    expect(getSpecialCountdownLabel(postedDaysAgo(11.5), now)).toBe('3 days left');
    expect(getSpecialCountdownLabel(postedDaysAgo(12.5), now)).toBe('2 days left');
    expect(getSpecialCountdownLabel(postedDaysAgo(13.5), now)).toBe('Last day!');
  });

  it('shows nothing before the last three days', () => {
    expect(getSpecialCountdownLabel(postedDaysAgo(10.5), now)).toBeNull();
  });

  it('shows nothing once the special has ended', () => {
    expect(getSpecialCountdownLabel(postedDaysAgo(15), now)).toBeNull();
  });
});
