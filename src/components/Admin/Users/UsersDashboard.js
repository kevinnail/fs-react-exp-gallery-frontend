import { useEffect, useMemo, useState } from 'react';
import { getCustomerMetrics } from '../../../services/fetch-customers.js';
import {
  CUSTOMER_FILTERS,
  filterCustomers,
  sortCustomers,
  summarizeCustomers,
} from '../../../services/customerMetrics.js';
import CustomerRow, { CUSTOMER_COLUMN_COUNT } from './CustomerRow.js';
import CustomerSummary from './CustomerSummary.js';
import './UsersDashboard.css';

const PAGE_SIZE = 25;

const COLUMNS = [
  { sortKey: 'customer', label: 'Customer' },
  { sortKey: 'joined', label: 'Joined' },
  { sortKey: 'tenure', label: 'Tenure' },
  { sortKey: 'orders', label: 'Orders', isNumeric: true },
  { sortKey: 'items', label: 'Items', isNumeric: true },
  { sortKey: 'spend', label: 'Lifetime spend', isNumeric: true },
  { sortKey: 'averageOrder', label: 'Average order', isNumeric: true },
  { sortKey: 'outstanding', label: 'Outstanding', isNumeric: true },
  { sortKey: 'lastPurchase', label: 'Last purchase' },
  { sortKey: 'daysSinceLastPurchase', label: 'Days since', isNumeric: true },
];

const UsersDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);
  const [sortKey, setSortKey] = useState('joined');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activeFilter, setActiveFilter] = useState('all');
  const [joinedBefore, setJoinedBefore] = useState('');

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const allCustomers = await getCustomerMetrics();
        setCustomers(allCustomers.filter((customer) => !customer.isAdmin));
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, []);

  const summary = useMemo(() => summarizeCustomers(customers), [customers]);

  const visibleCustomers = useMemo(
    () =>
      sortCustomers(filterCustomers(customers, activeFilter, joinedBefore), sortKey, sortDirection),
    [customers, activeFilter, joinedBefore, sortKey, sortDirection]
  );

  const totalPages = Math.ceil(visibleCustomers.length / PAGE_SIZE);
  const pageCustomers = visibleCustomers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const changeSort = (columnSortKey) => {
    if (columnSortKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(columnSortKey);
      setSortDirection(columnSortKey === 'customer' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  const changeFilter = (filterKey) => {
    setActiveFilter(filterKey);
    setPage(1);
  };

  const changeJoinedBefore = (event) => {
    setJoinedBefore(event.target.value);
    setPage(1);
  };

  const toggleExpanded = (customerId) =>
    setExpandedCustomerId((current) => (current === customerId ? null : customerId));

  const ariaSortFor = (columnSortKey) => {
    if (columnSortKey !== sortKey) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  const renderBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={CUSTOMER_COLUMN_COUNT}>Loading customers</td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <td colSpan={CUSTOMER_COLUMN_COUNT} className="customers-error">
            {error}
          </td>
        </tr>
      );
    }
    if (pageCustomers.length === 0) {
      return (
        <tr>
          <td colSpan={CUSTOMER_COLUMN_COUNT}>No users found</td>
        </tr>
      );
    }
    return pageCustomers.map((customer) => (
      <CustomerRow
        key={customer.id}
        customer={customer}
        isExpanded={expandedCustomerId === customer.id}
        onToggle={() => toggleExpanded(customer.id)}
      />
    ));
  };

  return (
    <div className="users-page">
      <div className="users-panel">
        <h1 className="users-title">Registered Users</h1>

        <CustomerSummary summary={summary} />

        <div className="customer-filters">
          {CUSTOMER_FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className="customer-filter-button"
              aria-pressed={activeFilter === filter.key}
              onClick={() => changeFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
          <label className="customer-joined-before">
            Joined before
            <input type="date" value={joinedBefore} onChange={changeJoinedBefore} />
          </label>
        </div>

        <p className="customer-match-count">
          {visibleCustomers.length} of {customers.length} customers
        </p>

        <div className="customers-table-wrapper">
          <table className="customers-table">
            <thead>
              <tr>
                {COLUMNS.map((column) => (
                  <th
                    key={column.sortKey}
                    className={column.isNumeric ? 'numeric-cell' : undefined}
                    aria-sort={ariaSortFor(column.sortKey)}
                  >
                    <button
                      type="button"
                      className="customer-sort-button"
                      onClick={() => changeSort(column.sortKey)}
                    >
                      {column.label}
                      {column.sortKey === sortKey ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
                    </button>
                  </th>
                ))}
                <th aria-label="Details" />
              </tr>
            </thead>
            <tbody>{renderBody()}</tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="users-pagination">
            <button
              className="users-pagination-button"
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              disabled={page === 1}
            >
              Prev
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              className="users-pagination-button"
              onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersDashboard;
