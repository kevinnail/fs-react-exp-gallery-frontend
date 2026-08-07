import './Inventory.css';
import { CATEGORY_NAMES, calculateInventoryTotals, formatMoney } from './inventoryTotals.js';

/* Stock level, read at a glance from the count column.
 *
 * The old version coloured a category's whole row red at zero and purple
 * at five or more, which put the loudest colour on the least urgent row.
 * Now it's a single dot and only a genuinely empty category is allowed
 * to be alarming. */
const stockLevel = (count) => {
  if (count === 0) return 'out';
  if (count <= 2) return 'low';
  return 'ok';
};

const Inventory = ({ posts, onCategorySelect, selectedCategory }) => {
  const totals = calculateInventoryTotals(posts);

  return (
    <div className="slg-inventory">
      <table className="slg-inventory-table">
        <caption className="slg-inventory-caption">
          Tap a category to filter the list. Values use the sale price where one is set.
        </caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col" className="slg-inventory-numeric">
              Qty
            </th>
            <th scope="col" className="slg-inventory-numeric">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {CATEGORY_NAMES.map((categoryName) => {
            const count = totals.countByCategory[categoryName];

            return (
              <tr
                key={categoryName}
                className={selectedCategory === categoryName ? 'slg-inventory-row--selected' : ''}
              >
                <th scope="row">
                  <button
                    type="button"
                    className="slg-inventory-category"
                    aria-pressed={selectedCategory === categoryName}
                    onClick={() => onCategorySelect(categoryName)}
                  >
                    <span className={`slg-inventory-dot slg-inventory-dot--${stockLevel(count)}`} />
                    {categoryName}
                  </button>
                </th>
                <td className="slg-inventory-numeric">{count}</td>
                <td className="slg-inventory-numeric">
                  {formatMoney(totals.discountedTotalByCategory[categoryName])}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">All pieces</th>
            <td className="slg-inventory-numeric">{totals.categorisedCount}</td>
            <td className="slg-inventory-numeric">
              <span className="slg-inventory-figure">{formatMoney(totals.discountedTotal)}</span>
              <span className="slg-inventory-figure-note">
                {formatMoney(totals.regularTotal)} at full price
              </span>
            </td>
          </tr>
          <tr>
            <th scope="row">Sold</th>
            <td className="slg-inventory-numeric">{totals.soldCount}</td>
            <td className="slg-inventory-numeric">
              <span className="slg-inventory-figure">
                {formatMoney(totals.soldDiscountedTotal)}
              </span>
              <span className="slg-inventory-figure-note">
                {formatMoney(totals.soldRegularTotal)} at full price
              </span>
            </td>
          </tr>
          <tr>
            <th scope="row">For sale</th>
            <td className="slg-inventory-numeric">{totals.forSaleCount}</td>
            <td className="slg-inventory-numeric">
              <span className="slg-inventory-figure">
                {formatMoney(totals.forSaleDiscountedTotal)}
              </span>
              <span className="slg-inventory-figure-note">
                {formatMoney(totals.forSaleRegularTotal)} at full price
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default Inventory;
