import React from 'react';
import './Inventory.css';

const Inventory = ({ posts }) => {
  const categories = {
    Beads: 0,
    'Blunt Tips': 0,
    Bubblers: 0,
    Collabs: 0,
    Cups: 0,
    'Dry Pieces': 0,
    'Iso Station': 0,
    Marbles: 0,
    Pendants: 0,
    'Spinner Caps': 0,
    'Terp Pearls': 0,
    Tubes: 0,
    Recyclers: 0,
  };

  const categoryTotalPrices = { ...categories };

  posts.forEach((post) => {
    if (categories[post.category] !== undefined) {
      categories[post.category]++;
      categoryTotalPrices[post.category] += parseFloat(post.price);
    }
  });

  const totalInventoryCount = Object.values(categories).reduce((a, b) => a + b, 0);
  const totalInventoryPrice = Object.values(categoryTotalPrices).reduce((a, b) => a + b, 0);

  const getColor = (count) => {
    if (count >= 5) return 'rgb(156, 112, 214)';
    switch (count) {
      case 4:
        return 'rgb(129, 129, 255)';
      case 3:
        return 'rgb(0, 163, 63)';
      case 2:
        return 'rgb(216, 209, 0)';
      case 1:
        return 'orange';
      case 0:
        return 'red';
      default:
        return '';
    }
  };

  return (
    <div className="inventory-container">
      <div>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Total Items</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(categories).map((category) => (
              <tr key={category} style={{ color: getColor(categories[category]) }}>
                <td>{category}</td>
                <td>{categories[category]}</td>
                <td>${categoryTotalPrices[category].toFixed(2)}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: 'bold' }}>
              <td>Total</td>
              <td>{totalInventoryCount}</td>
              <td>${totalInventoryPrice.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
