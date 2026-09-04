/* Inventory arithmetic for the admin dashboard.
 *
 * The dashboard answers one question: what is on the shelf for sale right
 * now.
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
  const forSaleCountByCategory = {};
  const forSaleValueByCategory = {};

  for (const categoryName of CATEGORY_NAMES) {
    forSaleCountByCategory[categoryName] = 0;
    forSaleValueByCategory[categoryName] = 0;
  }

  let hiddenCount = 0;

  for (const post of posts) {
    if (post.isDeleted) continue;

    if (post.hide) {
      hiddenCount += 1;
      continue;
    }

    if (post.sold) continue;

    const regularPrice = parseFloat(post.price) || 0;
    const sellingPrice = post.discountedPrice ? parseFloat(post.discountedPrice) : regularPrice;

    forSaleCountByCategory[post.category] += 1;
    forSaleValueByCategory[post.category] += sellingPrice;
  }

  const forSaleCount = CATEGORY_NAMES.reduce(
    (runningTotal, categoryName) => runningTotal + forSaleCountByCategory[categoryName],
    0
  );

  const forSaleValue = CATEGORY_NAMES.reduce(
    (runningTotal, categoryName) => runningTotal + forSaleValueByCategory[categoryName],
    0
  );

  return {
    forSaleCountByCategory,
    forSaleValueByCategory,
    forSaleCount,
    forSaleValue,
    hiddenCount,
  };
};

export const formatMoney = (amount) =>
  `$${Math.round(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
