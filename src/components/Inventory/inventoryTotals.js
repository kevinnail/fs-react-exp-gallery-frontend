/* Inventory arithmetic, shared by the dashboard's stat tiles and the
 * category table below them. Both read the same numbers, so the maths
 * lives in one place rather than being reduced twice over the same
 * array with two chances to drift.
 */

export const CATEGORY_NAMES = [
  'Beads',
  'Blunt Tips',
  'Bubblers',
  'Collabs',
  'Cups',
  'Droppers',
  'Dry Pieces',
  'Goblets',
  'Jars',
  'Iso Stations',
  'Marbles',
  'Pendants',
  'Recyclers',
  'Rigs',
  'Slides',
  'Spinner Caps',
  'Terp Pearls',
  'Tubes',
  'Vases',
  'Misc',
];

export const calculateInventoryTotals = (posts) => {
  const countByCategory = {};
  const regularTotalByCategory = {};
  const discountedTotalByCategory = {};

  for (const categoryName of CATEGORY_NAMES) {
    countByCategory[categoryName] = 0;
    regularTotalByCategory[categoryName] = 0;
    discountedTotalByCategory[categoryName] = 0;
  }

  let regularTotal = 0;
  let discountedTotal = 0;
  let soldCount = 0;
  let soldRegularTotal = 0;
  let soldDiscountedTotal = 0;
  let hiddenCount = 0;

  for (const post of posts) {
    const regularPrice = parseFloat(post.price) || 0;
    const effectivePrice = post.discountedPrice ? parseFloat(post.discountedPrice) : regularPrice;

    regularTotal += regularPrice;
    discountedTotal += effectivePrice;

    // A post whose category predates the list above still counts toward
    // the site-wide totals, it just has no row to sit in.
    if (countByCategory[post.category] !== undefined) {
      countByCategory[post.category] += 1;
      regularTotalByCategory[post.category] += regularPrice;
      discountedTotalByCategory[post.category] += effectivePrice;
    }

    if (post.sold) {
      soldCount += 1;
      soldRegularTotal += regularPrice;
      soldDiscountedTotal += effectivePrice;
    }

    if (post.hide) {
      hiddenCount += 1;
    }
  }

  const categorisedCount = Object.values(countByCategory).reduce(
    (runningTotal, count) => runningTotal + count,
    0
  );

  return {
    countByCategory,
    regularTotalByCategory,
    discountedTotalByCategory,
    categorisedCount,
    regularTotal,
    discountedTotal,
    soldCount,
    soldRegularTotal,
    soldDiscountedTotal,
    hiddenCount,
    forSaleCount: categorisedCount - soldCount,
    forSaleRegularTotal: regularTotal - soldRegularTotal,
    forSaleDiscountedTotal: discountedTotal - soldDiscountedTotal,
  };
};

export const formatMoney = (amount) =>
  `$${Math.round(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
