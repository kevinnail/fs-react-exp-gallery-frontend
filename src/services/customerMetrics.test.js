import {
  filterCustomers,
  getAverageOrderValue,
  sortCustomers,
  summarizeCustomers,
} from './customerMetrics.js';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const now = new Date('2026-09-30T12:00:00Z');
const daysAgo = (days) => new Date(now.getTime() - days * MILLISECONDS_PER_DAY).toISOString();

const customerWith = (overrides) => ({
  id: 1,
  email: 'customer@example.com',
  joinedAt: daysAgo(100),
  sendEmailNotifications: true,
  hasAddress: true,
  orderCount: 0,
  itemCount: 0,
  auctionsWon: 0,
  gross: 0,
  collected: 0,
  outstanding: 0,
  grossLast30Days: 0,
  grossPrior30Days: 0,
  lastPurchaseAt: null,
  bidCount: 0,
  ...overrides,
});

const idsOf = (customers) => customers.map((customer) => customer.id);

describe('sortCustomers', () => {
  it('puts the highest lifetime spend first and keeps ties in their original order', () => {
    const customers = [
      customerWith({ id: 1, gross: 100 }),
      customerWith({ id: 2, gross: 500 }),
      customerWith({ id: 3, gross: 100 }),
    ];

    expect(idsOf(sortCustomers(customers, 'spend', 'desc'))).toEqual([2, 1, 3]);
  });

  it('keeps customers with no purchase at the bottom in both directions', () => {
    const customers = [
      customerWith({ id: 1, lastPurchaseAt: null }),
      customerWith({ id: 2, lastPurchaseAt: daysAgo(5) }),
      customerWith({ id: 3, lastPurchaseAt: daysAgo(50) }),
    ];

    expect(idsOf(sortCustomers(customers, 'daysSinceLastPurchase', 'desc'))).toEqual([3, 2, 1]);
    expect(idsOf(sortCustomers(customers, 'daysSinceLastPurchase', 'asc'))).toEqual([2, 3, 1]);
  });

  it('does not reorder the array it was given', () => {
    const customers = [customerWith({ id: 1, gross: 1 }), customerWith({ id: 2, gross: 2 })];

    sortCustomers(customers, 'spend', 'desc');

    expect(idsOf(customers)).toEqual([1, 2]);
  });
});

describe('filterCustomers', () => {
  const buyer = customerWith({ id: 1, orderCount: 2, gross: 200, outstanding: 50, bidCount: 3 });
  const loser = customerWith({ id: 2, bidCount: 4, auctionsWon: 0, hasAddress: false });
  const quiet = customerWith({ id: 3, sendEmailNotifications: false, joinedAt: daysAgo(5) });
  const customers = [buyer, loser, quiet];

  it('excludes anyone with an order from "never purchased"', () => {
    expect(idsOf(filterCustomers(customers, 'neverPurchased'))).toEqual([2, 3]);
  });

  it('finds bidders who never won, owes money, no address and opted out', () => {
    expect(idsOf(filterCustomers(customers, 'bidNeverWon'))).toEqual([2]);
    expect(idsOf(filterCustomers(customers, 'owesMoney'))).toEqual([1]);
    expect(idsOf(filterCustomers(customers, 'noAddress'))).toEqual([2]);
    expect(idsOf(filterCustomers(customers, 'optedOut'))).toEqual([3]);
  });

  it('combines a filter with a joined-before date', () => {
    const joinedBefore = daysAgo(30).slice(0, 10);

    expect(idsOf(filterCustomers(customers, 'neverPurchased', joinedBefore))).toEqual([2]);
  });

  it('cuts off joined-before at local midnight of the chosen day', () => {
    const lateNightBefore = customerWith({
      id: 5,
      joinedAt: new Date(2026, 0, 31, 23, 0).toISOString(),
    });
    const earlyMorningOf = customerWith({
      id: 6,
      joinedAt: new Date(2026, 1, 1, 1, 0).toISOString(),
    });

    expect(idsOf(filterCustomers([lateNightBefore, earlyMorningOf], 'all', '2026-02-01'))).toEqual([
      5,
    ]);
  });

  it('leaves out a customer with no joined date when a joined-before date is set', () => {
    const undated = customerWith({ id: 4, joinedAt: null });

    expect(filterCustomers([undated], 'all', '2026-01-01')).toEqual([]);
  });

  it('throws on an unknown filter instead of showing everyone', () => {
    expect(() => filterCustomers(customers, 'bigSpenders')).toThrow(
      'Unknown customer filter: bigSpenders'
    );
  });
});

describe('summarizeCustomers', () => {
  it('computes conversion and repeat rate from buyers only', () => {
    const customers = [
      customerWith({ id: 1, orderCount: 3, gross: 300, collected: 200, outstanding: 100 }),
      customerWith({ id: 2, orderCount: 1, gross: 100, collected: 100 }),
      customerWith({ id: 3 }),
      customerWith({ id: 4, joinedAt: daysAgo(3), sendEmailNotifications: false }),
    ];

    expect(summarizeCustomers(customers, now)).toMatchObject({
      grossRevenue: 400,
      collected: 300,
      outstanding: 100,
      customerCount: 4,
      buyerCount: 2,
      conversionRate: 0.5,
      repeatBuyerRate: 0.5,
      averageOrderValue: 100,
      averageRevenuePerCustomer: 100,
      newSignupsLast30Days: 1,
      reachableByEmail: 3,
    });
  });

  it('returns zeroes rather than NaN for an empty list', () => {
    const summary = summarizeCustomers([], now);

    expect(Object.values(summary).every((value) => value === 0)).toBe(true);
  });
});

describe('getAverageOrderValue', () => {
  it('is 0 for a customer with no orders', () => {
    expect(getAverageOrderValue(customerWith({ orderCount: 0, gross: 0 }))).toBe(0);
  });
});
