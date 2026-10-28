import { calculateInventoryTotals } from './inventoryTotals.js';

const postWith = (overrides) => ({
  category: 'Rigs',
  price: '400',
  discountedPrice: null,
  sold: false,
  hide: false,
  isDeleted: false,
  ...overrides,
});

describe('calculateInventoryTotals', () => {
  // Otherwise the full-price column hides what a promo is taking off the shelf value.
  it('adds a discounted piece at full price to full value and at sale price to the discounted value', () => {
    const totals = calculateInventoryTotals([
      postWith({ price: '400', discountedPrice: '300' }),
      postWith({ price: '100' }),
    ]);

    expect(totals.forSaleFullValueByCategory.Rigs).toBe(500);
    expect(totals.forSaleValueByCategory.Rigs).toBe(400);
    expect(totals.forSaleFullValue).toBe(500);
    expect(totals.forSaleValue).toBe(400);
  });

  // Otherwise pieces that are not on the shelf inflate the full-price value.
  it('leaves sold, hidden and deleted pieces out of both values', () => {
    const totals = calculateInventoryTotals([
      postWith({ sold: true }),
      postWith({ hide: true }),
      postWith({ isDeleted: true }),
    ]);

    expect(totals.forSaleFullValue).toBe(0);
    expect(totals.forSaleValue).toBe(0);
    expect(totals.hiddenCount).toBe(1);
  });
});
