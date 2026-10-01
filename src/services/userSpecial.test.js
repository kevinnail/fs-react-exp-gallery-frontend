import {
  getPiecePrice,
  getSpecialCountdownLabel,
  isSpecialActive,
  isSpecialAvailableTo,
  isSpecialEndingSoon,
} from './userSpecial.js';

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

const signedUpDaysAgo = (days) =>
  new Date(now.getTime() - days * MILLISECONDS_PER_DAY).toISOString();

// Signed up before any post in these tests, so the signup date never excludes them.
const longTimeMember = signedUpDaysAgo(365);

describe('getPiecePrice', () => {
  it('gives a signed-in user 30% off a piece still inside the special', () => {
    expect(getPiecePrice(postedDaysAgo(13), { signedUpAt: longTimeMember, now })).toEqual({
      listedPrice: 100,
      salePrice: 70,
    });
  });

  it('uses a manual discount when it is lower than the special', () => {
    const post = postedDaysAgo(2, { discountedPrice: '60', originalPrice: '100' });

    expect(getPiecePrice(post, { signedUpAt: longTimeMember, now })).toEqual({
      listedPrice: 100,
      salePrice: 60,
    });
  });

  it('keeps a manual discount for a signed-out viewer', () => {
    const post = postedDaysAgo(2, { discountedPrice: '80', originalPrice: '100' });

    expect(getPiecePrice(post, { signedUpAt: null, now }).salePrice).toBe(80);
  });

  it('gives a signed-out viewer full price on a brand-new piece', () => {
    expect(getPiecePrice(postedDaysAgo(0), { signedUpAt: null, now })).toEqual({
      listedPrice: 100,
      salePrice: null,
    });
  });

  it('gives full price once the 14 days have passed', () => {
    const justExpired = postedDaysAgo(14 + 1 / (24 * 60));

    expect(getPiecePrice(justExpired, { signedUpAt: longTimeMember, now }).salePrice).toBeNull();
  });

  it('gives 30% off a piece posted after the account signed up', () => {
    expect(getPiecePrice(postedDaysAgo(2), { signedUpAt: signedUpDaysAgo(5), now })).toEqual({
      listedPrice: 100,
      salePrice: 70,
    });
  });

  it('gives full price on a piece posted before the account signed up', () => {
    expect(getPiecePrice(postedDaysAgo(5), { signedUpAt: signedUpDaysAgo(2), now })).toEqual({
      listedPrice: 100,
      salePrice: null,
    });
  });

  it('keeps a manual discount on a piece posted before the account signed up', () => {
    const post = postedDaysAgo(5, { discountedPrice: '80', originalPrice: '100' });

    expect(getPiecePrice(post, { signedUpAt: signedUpDaysAgo(2), now }).salePrice).toBe(80);
  });
});

describe('isSpecialAvailableTo', () => {
  it('is available on a piece posted the same instant the account signed up', () => {
    const post = postedDaysAgo(3);

    expect(isSpecialAvailableTo(post, post.created_at, now)).toBe(true);
  });

  it('is not available without a signup date', () => {
    expect(isSpecialAvailableTo(postedDaysAgo(1), null, now)).toBe(false);
  });

  it('is not available on a sold piece posted after signup', () => {
    expect(isSpecialAvailableTo(postedDaysAgo(1, { sold: true }), signedUpDaysAgo(5), now)).toBe(
      false
    );
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
  it('shows the days left for the whole two weeks', () => {
    expect(getSpecialCountdownLabel(postedDaysAgo(0.5), now)).toBe('14 days left');
    expect(getSpecialCountdownLabel(postedDaysAgo(7.5), now)).toBe('7 days left');
    expect(getSpecialCountdownLabel(postedDaysAgo(10.5), now)).toBe('4 days left');
  });

  it('adds urgency through the last three days', () => {
    expect(getSpecialCountdownLabel(postedDaysAgo(11.5), now)).toBe('Only 3 days left!');
    expect(getSpecialCountdownLabel(postedDaysAgo(12.5), now)).toBe('Only 2 days left!');
    expect(getSpecialCountdownLabel(postedDaysAgo(13.5), now)).toBe('Last day!');
  });

  it('shows nothing once the special has ended', () => {
    expect(getSpecialCountdownLabel(postedDaysAgo(15), now)).toBeNull();
  });
});

describe('isSpecialEndingSoon', () => {
  it('is true inside the last three days', () => {
    expect(isSpecialEndingSoon(postedDaysAgo(11.5), now)).toBe(true);
    expect(isSpecialEndingSoon(postedDaysAgo(13.5), now)).toBe(true);
  });

  it('is false earlier in the special', () => {
    expect(isSpecialEndingSoon(postedDaysAgo(10.5), now)).toBe(false);
  });

  it('is false once the special has ended', () => {
    expect(isSpecialEndingSoon(postedDaysAgo(15), now)).toBe(false);
  });
});
