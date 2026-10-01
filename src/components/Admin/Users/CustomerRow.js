import { Fragment } from 'react';

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
export const CUSTOMER_COLUMN_COUNT = 11;

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const formatMoney = (amount) => currencyFormatter.format(amount);

const formatDate = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Never';

const daysBetween = (startDateString, endDate) =>
  Math.floor((endDate - new Date(startDateString)) / MILLISECONDS_PER_DAY);

const formatTenure = (joinedAt, now) => {
  if (!joinedAt) return '';
  const days = daysBetween(joinedAt, now);
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
};

const formatYesNo = (value) => (value ? 'Yes' : 'No');

const CustomerRow = ({ customer, isExpanded, onToggle, now = new Date() }) => {
  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ');
  const averageOrderValue = customer.orderCount > 0 ? customer.gross / customer.orderCount : 0;
  const daysSinceLastPurchase = customer.lastPurchaseAt
    ? daysBetween(customer.lastPurchaseAt, now)
    : null;
  const daysToFirstPurchase =
    customer.joinedAt && customer.firstPurchaseAt
      ? Math.max(0, daysBetween(customer.joinedAt, new Date(customer.firstPurchaseAt)))
      : null;

  return (
    <Fragment>
      <tr className="customer-row">
        <td>
          <div className="customer-cell">
            {customer.imageUrl ? (
              <img className="customer-avatar" src={customer.imageUrl} alt="" />
            ) : (
              <div className="customer-avatar-placeholder" />
            )}
            <div>
              {fullName ? <div className="customer-name">{fullName}</div> : null}
              <div className="customer-email">{customer.email}</div>
            </div>
          </div>
        </td>
        <td>{formatDate(customer.joinedAt)}</td>
        <td>{formatTenure(customer.joinedAt, now)}</td>
        <td className="numeric-cell">{customer.orderCount}</td>
        <td className="numeric-cell">{customer.itemCount}</td>
        <td className="numeric-cell">{formatMoney(customer.gross)}</td>
        <td className="numeric-cell">{formatMoney(averageOrderValue)}</td>
        <td className={customer.outstanding > 0 ? 'numeric-cell owes-money' : 'numeric-cell'}>
          {formatMoney(customer.outstanding)}
        </td>
        <td>{formatDate(customer.lastPurchaseAt)}</td>
        <td className="numeric-cell">{daysSinceLastPurchase ?? ''}</td>
        <td>
          <button
            type="button"
            className="customer-details-button"
            aria-expanded={isExpanded}
            onClick={onToggle}
          >
            {isExpanded ? 'Hide' : 'Details'}
          </button>
        </td>
      </tr>

      {isExpanded ? (
        <tr className="customer-details-row">
          <td colSpan={CUSTOMER_COLUMN_COUNT}>
            <dl className="customer-details">
              <dt>Largest order</dt>
              <dd>{formatMoney(customer.largestOrder)}</dd>
              <dt>First purchase</dt>
              <dd>{formatDate(customer.firstPurchaseAt)}</dd>
              <dt>Days from signup to first purchase</dt>
              <dd>{daysToFirstPurchase ?? ''}</dd>
              <dt>Bids placed</dt>
              <dd>{customer.bidCount}</dd>
              <dt>Auctions bid on</dt>
              <dd>{customer.auctionsBidOn}</dd>
              <dt>Auctions won</dt>
              <dd>{customer.auctionsWon}</dd>
              <dt>Messages sent</dt>
              <dd>{customer.messageCount}</dd>
              <dt>Last contact</dt>
              <dd>{formatDate(customer.lastMessageAt)}</dd>
              <dt>Shipping address on file</dt>
              <dd>{formatYesNo(customer.hasAddress)}</dd>
              <dt>Email opt-in</dt>
              <dd>{formatYesNo(customer.sendEmailNotifications)}</dd>
            </dl>
          </td>
        </tr>
      ) : null}
    </Fragment>
  );
};

export default CustomerRow;
