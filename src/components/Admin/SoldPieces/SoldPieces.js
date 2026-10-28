import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllSales } from '../../../services/fetch-sales.js';
import './SoldPieces.css';

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const formatMoney = (amount) => currencyFormatter.format(amount);

// Video posts store a matching .jpg poster frame alongside the .mp4.
const posterFor = (source) => (source.endsWith('.mp4') ? `${source.slice(0, -4)}.jpg` : source);

const customerNameOf = (order) =>
  [order.buyer_first_name, order.buyer_last_name].filter(Boolean).join(' ') || order.buyer_email;

const toSoldPieces = (orders) =>
  orders.flatMap((order) =>
    order.items.map((item) => ({
      id: item.id,
      postId: item.post_id,
      title: item.post_title,
      description: item.post_description,
      imageUrl: item.post_image_url,
      category: item.post_category,
      price: Number(item.price),
      soldAt: order.created_at,
      customerId: String(order.buyer_id),
      customerName: customerNameOf(order),
    }))
  );

const SORTS = [
  {
    key: 'newest',
    label: 'Newest first',
    compare: (first, second) => new Date(second.soldAt) - new Date(first.soldAt),
  },
  {
    key: 'oldest',
    label: 'Oldest first',
    compare: (first, second) => new Date(first.soldAt) - new Date(second.soldAt),
  },
  {
    key: 'priceHigh',
    label: 'Highest price',
    compare: (first, second) => second.price - first.price,
  },
  {
    key: 'priceLow',
    label: 'Lowest price',
    compare: (first, second) => first.price - second.price,
  },
];

const GROUPINGS = [
  {
    key: 'category',
    label: 'Category',
    keyOf: (piece) => piece.category,
    nameOf: (piece) => piece.category,
  },
  {
    key: 'customer',
    label: 'Customer',
    keyOf: (piece) => piece.customerId,
    nameOf: (piece) => piece.customerName,
  },
  { key: 'none', label: 'No grouping', keyOf: () => 'all', nameOf: () => null },
];

// Pieces arrive already sorted, so each group keeps that order. Groups are
// ordered by what they brought in.
const groupPieces = (pieces, grouping) => {
  const groups = new Map();

  for (const piece of pieces) {
    const groupKey = grouping.keyOf(piece);
    if (!groups.has(groupKey)) {
      groups.set(groupKey, { key: groupKey, name: grouping.nameOf(piece), pieces: [], total: 0 });
    }
    const group = groups.get(groupKey);
    group.pieces.push(piece);
    group.total += piece.price;
  }

  return [...groups.values()].sort((first, second) => second.total - first.total);
};

const describeTotals = (pieceCount, total) =>
  `${pieceCount} ${pieceCount === 1 ? 'piece' : 'pieces'}, ${formatMoney(total)} total, ${formatMoney(total / pieceCount)} average`;

const SoldPieces = () => {
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('newest');
  const [groupingKey, setGroupingKey] = useState('category');

  useEffect(() => {
    const loadPieces = async () => {
      try {
        setPieces(toSoldPieces(await getAllSales()));
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };
    loadPieces();
  }, []);

  const categoryOptions = useMemo(
    () => [...new Set(pieces.map((piece) => piece.category))].sort(),
    [pieces]
  );

  const customerOptions = useMemo(() => {
    const namesById = new Map(pieces.map((piece) => [piece.customerId, piece.customerName]));
    return [...namesById]
      .map(([id, name]) => ({ id, name }))
      .sort((first, second) => first.name.localeCompare(second.name));
  }, [pieces]);

  const visiblePieces = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const sort = SORTS.find((candidate) => candidate.key === sortKey);

    return pieces
      .filter(
        (piece) =>
          (categoryFilter === '' || piece.category === categoryFilter) &&
          (customerFilter === '' || piece.customerId === customerFilter) &&
          [piece.title, piece.description].join(' ').toLowerCase().includes(normalizedSearchTerm)
      )
      .sort(sort.compare);
  }, [pieces, categoryFilter, customerFilter, searchTerm, sortKey]);

  const grouping = GROUPINGS.find((candidate) => candidate.key === groupingKey);
  const groups = groupPieces(visiblePieces, grouping);
  const visibleTotal = visiblePieces.reduce((runningTotal, piece) => runningTotal + piece.price, 0);

  const renderContent = () => {
    if (loading) return <p className="sold-pieces-message">Loading sold pieces</p>;
    if (error) return <p className="sold-pieces-error">{error}</p>;
    if (pieces.length === 0) return <p className="sold-pieces-message">No pieces have sold yet.</p>;
    if (visiblePieces.length === 0) {
      return <p className="sold-pieces-message">No sold pieces match these filters.</p>;
    }

    return (
      <>
        <p className="sold-pieces-summary">{describeTotals(visiblePieces.length, visibleTotal)}</p>
        {groups.map((group) => (
          <section key={group.key} className="sold-pieces-group">
            {group.name !== null && (
              <div className="sold-pieces-group-heading-row">
                <h2 className="sold-pieces-group-name">{group.name}</h2>
                <p className="sold-pieces-group-totals">
                  {describeTotals(group.pieces.length, group.total)}
                </p>
              </div>
            )}
            <ul className="sold-pieces-grid">
              {group.pieces.map((piece) => (
                <li key={piece.id} className="sold-pieces-card">
                  <Link to={`/${piece.postId}`} className="sold-pieces-link">
                    <img
                      className="sold-pieces-image"
                      src={posterFor(piece.imageUrl)}
                      alt=""
                      loading="lazy"
                    />
                    <span className="sold-pieces-title">{piece.title}</span>
                  </Link>
                  <span className="sold-pieces-price">{formatMoney(piece.price)}</span>
                  <span className="sold-pieces-detail">{piece.category}</span>
                  <span className="sold-pieces-detail">{piece.customerName}</span>
                  <span className="sold-pieces-detail">
                    {dateFormatter.format(new Date(piece.soldAt))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </>
    );
  };

  return (
    <div className="sold-pieces-page">
      <div className="sold-pieces-panel">
        <h1 className="sold-pieces-title-heading">Sold Pieces</h1>

        <div className="sold-pieces-controls">
          <input
            type="search"
            className="sold-pieces-search"
            placeholder="Search title or description"
            aria-label="Search sold pieces by title or description"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <label className="sold-pieces-control">
            Category
            <select
              className="sold-pieces-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="sold-pieces-control">
            Customer
            <select
              className="sold-pieces-select"
              value={customerFilter}
              onChange={(event) => setCustomerFilter(event.target.value)}
            >
              <option value="">All customers</option>
              {customerOptions.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>
          <label className="sold-pieces-control">
            Sort
            <select
              className="sold-pieces-select"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value)}
            >
              {SORTS.map((sort) => (
                <option key={sort.key} value={sort.key}>
                  {sort.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sold-pieces-control">
            Group by
            <select
              className="sold-pieces-select"
              value={groupingKey}
              onChange={(event) => setGroupingKey(event.target.value)}
            >
              {GROUPINGS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default SoldPieces;
