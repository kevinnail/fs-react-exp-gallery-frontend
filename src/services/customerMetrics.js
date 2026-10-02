const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const RECENT_SIGNUP_DAYS = 30;

const timeOf = (dateString) => (dateString ? new Date(dateString).getTime() : null);

const safeRatio = (numerator, denominator) => (denominator > 0 ? numerator / denominator : 0);

export const daysSince = (dateString, now = new Date()) =>
  dateString ? Math.floor((now.getTime() - timeOf(dateString)) / MILLISECONDS_PER_DAY) : null;

export const getAverageOrderValue = (customer) => safeRatio(customer.gross, customer.orderCount);

export const isBuyer = (customer) => customer.orderCount > 0;

const SORT_VALUES = {
  customer: (customer) => customer.email.toLowerCase(),
  joined: (customer) => timeOf(customer.joinedAt),
  tenure: (customer) => (customer.joinedAt ? -timeOf(customer.joinedAt) : null),
  orders: (customer) => customer.orderCount,
  items: (customer) => customer.itemCount,
  spend: (customer) => customer.gross,
  averageOrder: (customer) => getAverageOrderValue(customer),
  outstanding: (customer) => customer.outstanding,
  lastPurchase: (customer) => timeOf(customer.lastPurchaseAt),
  daysSinceLastPurchase: (customer) =>
    customer.lastPurchaseAt ? -timeOf(customer.lastPurchaseAt) : null,
};

export const sortCustomers = (customers, key, direction) => {
  const valueOf = SORT_VALUES[key];
  const directionSign = direction === 'asc' ? 1 : -1;

  return [...customers].sort((first, second) => {
    const firstValue = valueOf(first);
    const secondValue = valueOf(second);

    if (firstValue === secondValue) return 0;
    if (firstValue === null) return 1;
    if (secondValue === null) return -1;
    return (firstValue < secondValue ? -1 : 1) * directionSign;
  });
};

export const CUSTOMER_FILTERS = [
  { key: 'all', label: 'All', matches: () => true },
  { key: 'buyers', label: 'Buyers', matches: isBuyer },
  { key: 'neverPurchased', label: 'Never purchased', matches: (customer) => !isBuyer(customer) },
  { key: 'owesMoney', label: 'Owes money', matches: (customer) => customer.outstanding > 0 },
  // First-time-customer targeting: bid on an auction but have never bought
  // anything, by auction win or gallery order (orderCount counts both).
  {
    key: 'bidNeverBought',
    label: 'Bid but never bought',
    matches: (customer) => customer.bidCount > 0 && !isBuyer(customer),
  },
  { key: 'noAddress', label: 'No address on file', matches: (customer) => !customer.hasAddress },
  {
    key: 'optedOut',
    label: 'Opted out of promotions',
    matches: (customer) => !customer.emailPromotions,
  },
];

export const filterCustomers = (customers, filterKey, joinedBefore = '') => {
  const filter = CUSTOMER_FILTERS.find((candidate) => candidate.key === filterKey);
  if (!filter) throw new Error(`Unknown customer filter: ${filterKey}`);

  const joinedBeforeTime = joinedBefore ? new Date(`${joinedBefore}T00:00:00`).getTime() : null;

  return customers.filter(
    (customer) =>
      filter.matches(customer) &&
      (joinedBeforeTime === null ||
        (customer.joinedAt !== null && timeOf(customer.joinedAt) < joinedBeforeTime))
  );
};

export const summarizeCustomers = (customers, now = new Date()) => {
  const sumOf = (valueOf) => customers.reduce((total, customer) => total + valueOf(customer), 0);
  const countOf = (matches) => customers.filter(matches).length;

  const customerCount = customers.length;
  const buyerCount = countOf(isBuyer);
  const orderCount = sumOf((customer) => customer.orderCount);
  const grossRevenue = sumOf((customer) => customer.gross);

  return {
    grossRevenue,
    collected: sumOf((customer) => customer.collected),
    outstanding: sumOf((customer) => customer.outstanding),
    revenueLast30Days: sumOf((customer) => customer.grossLast30Days),
    revenuePrior30Days: sumOf((customer) => customer.grossPrior30Days),
    customerCount,
    buyerCount,
    conversionRate: safeRatio(buyerCount, customerCount),
    repeatBuyerRate: safeRatio(
      countOf((customer) => customer.orderCount > 1),
      buyerCount
    ),
    averageOrderValue: safeRatio(grossRevenue, orderCount),
    averageRevenuePerCustomer: safeRatio(grossRevenue, customerCount),
    newSignupsLast30Days: countOf((customer) => {
      const daysAgo = daysSince(customer.joinedAt, now);
      return daysAgo !== null && daysAgo < RECENT_SIGNUP_DAYS;
    }),
    reachableByEmail: countOf((customer) => customer.emailPromotions),
  };
};
