import './Inventory.css';
import { CATEGORY_NAMES, formatMoney } from './inventoryTotals.js';

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

const Inventory = ({ totals, onCategorySelect, selectedCategory }) => (
  <div className="slg-inventory">
    <p className="slg-inventory-caption">
      What is on the shelf right now. Sold, hidden and deleted pieces are left out. Tap a category
      to filter the list.
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
    </div>

    <table className="slg-inventory-table">
      <thead>
        <tr>
          <th scope="col">Category</th>
          <th scope="col" className="slg-inventory-numeric">
            For sale
          </th>
          <th scope="col" className="slg-inventory-numeric">
            Value
          </th>
        </tr>
      </thead>
      <tbody>
        {CATEGORY_NAMES.map((categoryName) => {
          const count = totals.forSaleCountByCategory[categoryName];
          const level = stockLevel(count);
          const rowClasses = [
            `slg-inventory-row--${level}`,
            selectedCategory === categoryName ? 'slg-inventory-row--selected' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <tr
              key={categoryName}
              className={rowClasses}
              onClick={() => onCategorySelect(categoryName)}
            >
              <th scope="row">
                <button
                  type="button"
                  className="slg-inventory-category"
                  aria-pressed={selectedCategory === categoryName}
                  onClick={(event) => {
                    event.stopPropagation();
                    onCategorySelect(categoryName);
                  }}
                >
                  {categoryName}
                  <span className="slg-visually-hidden">, {STOCK_LEVEL_LABELS[level]}</span>
                </button>
              </th>
              <td className="slg-inventory-numeric slg-inventory-count">{count}</td>
              <td className="slg-inventory-numeric">
                {formatMoney(totals.forSaleValueByCategory[categoryName])}
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">For sale</th>
          <td className="slg-inventory-numeric">{totals.forSaleCount}</td>
          <td className="slg-inventory-numeric">
            <span className="slg-inventory-figure">{formatMoney(totals.forSaleValue)}</span>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
);

export default Inventory;
