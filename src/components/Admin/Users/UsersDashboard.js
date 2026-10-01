import { useEffect, useState } from 'react';
import { getCustomerMetrics } from '../../../services/fetch-customers.js';
import CustomerRow, { CUSTOMER_COLUMN_COUNT } from './CustomerRow.js';
import './UsersDashboard.css';

const PAGE_SIZE = 25;

const UsersDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);

  const totalPages = Math.ceil(customers.length / PAGE_SIZE);
  const pageCustomers = customers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const dev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setCustomers(await getCustomerMetrics());
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, []);

  const toggleExpanded = (customerId) =>
    setExpandedCustomerId((current) => (current === customerId ? null : customerId));

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
        <p>Total users: {dev ? customers.length : customers.length - 4}</p>

        <div className="customers-table-wrapper">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Joined</th>
                <th>Tenure</th>
                <th className="numeric-cell">Orders</th>
                <th className="numeric-cell">Items</th>
                <th className="numeric-cell">Lifetime spend</th>
                <th className="numeric-cell">Average order</th>
                <th className="numeric-cell">Outstanding</th>
                <th>Last purchase</th>
                <th className="numeric-cell">Days since</th>
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
