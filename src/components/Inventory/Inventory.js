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
  <div className="inventory">
    <p className="inventory-description">
      What is on the shelf right now. Sold, hidden and deleted pieces are left out. Tap a category
      to filter the list.
    </p>

    <div className="inventory-controls">
      <button
        type="button"
        className={`inventory-all-categories-button${selectedCategory === null ? ' inventory-all-categories-button--selected' : ''}`}
        aria-pressed={selectedCategory === null}
        onClick={() => onCategorySelect(null)}
      >
        All categories
      </button>
    </div>

    <table className="inventory-table">
      <thead>
        <tr>
          <th scope="col">Category</th>
          <th scope="col" className="inventory-numeric-cell">
            For sale
          </th>
          <th scope="col" className="inventory-numeric-cell">
            Value
          </th>
        </tr>
      </thead>
      <tbody>
        {CATEGORY_NAMES.map((categoryName) => {
          const count = totals.forSaleCountByCategory[categoryName];
          const level = stockLevel(count);
          const rowClasses = [
            `inventory-row--stock-${level}`,
            selectedCategory === categoryName ? 'inventory-row--selected' : '',
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
                  className="inventory-category-button"
                  aria-pressed={selectedCategory === categoryName}
                  onClick={(event) => {
                    event.stopPropagation();
                    onCategorySelect(categoryName);
                  }}
                >
                  {categoryName}
                  <span className="visually-hidden">, {STOCK_LEVEL_LABELS[level]}</span>
                </button>
              </th>
              <td className="inventory-numeric-cell inventory-for-sale-count">{count}</td>
              <td className="inventory-numeric-cell">
                {formatMoney(totals.forSaleValueByCategory[categoryName])}
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">For sale</th>
          <td className="inventory-numeric-cell">{totals.forSaleCount}</td>
          <td className="inventory-numeric-cell">
            <span className="inventory-total-value">{formatMoney(totals.forSaleValue)}</span>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
);

export default Inventory;
