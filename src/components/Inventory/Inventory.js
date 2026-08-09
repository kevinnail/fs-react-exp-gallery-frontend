import { useState } from 'react';
import './Inventory.css';
import { CATEGORY_NAMES, calculateInventoryTotals, formatMoney } from './inventoryTotals.js';

const stockLevel = (count) => {
  if (count === 0) return 'out';
  if (count <= 2) return 'low';
  return 'ok';
};

const STOCK_LEVEL_LABELS = {
  out: 'out of stock',
  low: 'low stock',
  ok: 'in stock',
};

const Inventory = ({ posts, onCategorySelect, selectedCategory }) => {
  const [includeHidden, setIncludeHidden] = useState(false);
  const totals = calculateInventoryTotals(posts, { includeHidden });

  return (
    <div className="slg-inventory">
      <p className="slg-inventory-caption">
        What is on the shelf right now — sold and deleted pieces are left out. Tap a category to
        filter the list.
      </p>

      <div className="slg-inventory-controls">
        <button
          type="button"
          className={`slg-inventory-toggle${selectedCategory === null ? ' slg-inventory-toggle--on' : ''}`}
          aria-pressed={selectedCategory === null}
          onClick={() => onCategorySelect(null)}
        >
          All categories
        </button>
        <button
          type="button"
          className={`slg-inventory-toggle${includeHidden ? ' slg-inventory-toggle--on' : ''}`}
          aria-pressed={includeHidden}
          onClick={() => setIncludeHidden((isOn) => !isOn)}
        >
          Count hidden
        </button>
      </div>

      <table className="slg-inventory-table">
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col" className="slg-inventory-numeric">
              In stock
            </th>
            <th scope="col" className="slg-inventory-numeric">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {CATEGORY_NAMES.map((categoryName) => {
            const count = totals.inStockCountByCategory[categoryName];
            const level = stockLevel(count);
            const rowClasses = [
              `slg-inventory-row--${level}`,
              selectedCategory === categoryName ? 'slg-inventory-row--selected' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <tr key={categoryName} className={rowClasses}>
                <th scope="row">
                  <button
                    type="button"
                    className="slg-inventory-category"
                    aria-pressed={selectedCategory === categoryName}
                    onClick={() => onCategorySelect(categoryName)}
                  >
                    {categoryName}
                    <span className="slg-visually-hidden">— {STOCK_LEVEL_LABELS[level]}</span>
                  </button>
                </th>
                <td className="slg-inventory-numeric slg-inventory-count">{count}</td>
                <td className="slg-inventory-numeric">
                  {formatMoney(totals.inStockDiscountedTotalByCategory[categoryName])}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">In stock</th>
            <td className="slg-inventory-numeric">{totals.inStockCategorisedCount}</td>
            <td className="slg-inventory-numeric">
              <span className="slg-inventory-figure">
                {formatMoney(totals.inStockCategorisedTotal)}
              </span>
            </td>
          </tr>
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
            <th scope="row">Hidden</th>
            <td className="slg-inventory-numeric">{totals.hiddenCount}</td>
            <td className="slg-inventory-numeric">
              <span className="slg-inventory-figure-note">
                {includeHidden ? 'counted above' : 'not counted above'}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default Inventory;
