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

const isInStock = (post, includeHidden) =>
  !post.sold && !post.isDeleted && (includeHidden || !post.hide);

export const calculateInventoryTotals = (posts, { includeHidden = false } = {}) => {
  const countByCategory = {};
  const regularTotalByCategory = {};
  const discountedTotalByCategory = {};
  const inStockCountByCategory = {};
  const inStockDiscountedTotalByCategory = {};

  for (const categoryName of CATEGORY_NAMES) {
    countByCategory[categoryName] = 0;
    regularTotalByCategory[categoryName] = 0;
    discountedTotalByCategory[categoryName] = 0;
    inStockCountByCategory[categoryName] = 0;
    inStockDiscountedTotalByCategory[categoryName] = 0;
  }

  let regularTotal = 0;
  let discountedTotal = 0;
  let soldCount = 0;
  let soldRegularTotal = 0;
  let soldDiscountedTotal = 0;
  let hiddenCount = 0;
  let inStockCount = 0;
  let inStockRegularTotal = 0;
  let inStockDiscountedTotal = 0;

  for (const post of posts) {
    const regularPrice = parseFloat(post.price) || 0;
    const effectivePrice = post.discountedPrice ? parseFloat(post.discountedPrice) : regularPrice;
    const inStock = isInStock(post, includeHidden);

    regularTotal += regularPrice;
    discountedTotal += effectivePrice;

    // A post whose category predates the list above still counts toward
    // the site-wide totals, it just has no row to sit in.
    if (countByCategory[post.category] !== undefined) {
      countByCategory[post.category] += 1;
      regularTotalByCategory[post.category] += regularPrice;
      discountedTotalByCategory[post.category] += effectivePrice;

      if (inStock) {
        inStockCountByCategory[post.category] += 1;
        inStockDiscountedTotalByCategory[post.category] += effectivePrice;
      }
    }

    if (inStock) {
      inStockCount += 1;
      inStockRegularTotal += regularPrice;
      inStockDiscountedTotal += effectivePrice;
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

  const inStockCategorisedCount = Object.values(inStockCountByCategory).reduce(
    (runningTotal, count) => runningTotal + count,
    0
  );

  const inStockCategorisedTotal = Object.values(inStockDiscountedTotalByCategory).reduce(
    (runningTotal, amount) => runningTotal + amount,
    0
  );

  return {
    countByCategory,
    regularTotalByCategory,
    discountedTotalByCategory,
    inStockCountByCategory,
    inStockDiscountedTotalByCategory,
    inStockCategorisedCount,
    inStockCategorisedTotal,
    categorisedCount,
    regularTotal,
    discountedTotal,
    soldCount,
    soldRegularTotal,
    soldDiscountedTotal,
    hiddenCount,
    forSaleCount: inStockCount,
    forSaleRegularTotal: inStockRegularTotal,
    forSaleDiscountedTotal: inStockDiscountedTotal,
  };
};

export const formatMoney = (amount) =>
  `$${Math.round(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
