import './UserSales.css';
import { useNavigate } from 'react-router-dom';
import {
  getOrderItems,
  getOrderItemsSubtotal,
  getOrderShipping,
  getOrderTotal,
} from '../../../services/salesOrder.js';

const formatMoney = (amount) => `$${Number(amount || 0).toFixed(2)}`;

const hasTracking = (trackingNumber) => Boolean(trackingNumber) && trackingNumber !== '0';

export default function UserSales({ sales, loading }) {
  const navigate = useNavigate();

  const handleTrackingClick = (trackingNumber) => {
    if (!trackingNumber) return;
    const url = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(
      trackingNumber
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePieceNav = (postId) => {
    navigate(`/${postId}`);
  };

  if (loading) {
    return (
      <div className="user-sales-widget">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="user-sales-widget">
      <span className="new-work-msg">
        <strong>Your Gallery Purchases</strong>
      </span>

      {sales.length === 0 ? (
        <p className="empty-msg">No purchases yet.</p>
      ) : (
        <div className="item-card-grid">
          {sales.map((order) => {
            const items = getOrderItems(order);

            return (
              <div
                key={order.id}
                className="item-card"
                style={{
                  border: order.is_paid
                    ? '1px solid var(--color-status-good)'
                    : '1px solid var(--color-status-bad)',
                }}
              >
                <ul className="item-card-pieces">
                  {items.map((item) => (
                    <li key={item.id} className="item-card-piece">
                      {item.post_image_url ? (
                        <img
                          onClick={() => handlePieceNav(item.post_id)}
                          src={item.post_image_url}
                          alt={item.post_title}
                          className="item-card-piece-image item-card-piece-image--clickable"
                        />
                      ) : (
                        <div className="item-card-piece-image item-card-piece-image--placeholder" />
                      )}
                      <span className="item-card-piece-title">{item.post_title}</span>
                      <span className="item-card-piece-price">{formatMoney(item.price)}</span>
                    </li>
                  ))}
                </ul>

                <div className="item-card-summary">
                  <div className="item-card-status-and-date">
                    <div className="status-chips">
                      {!order.is_paid && (
                        <span className="status-chip status-chip--unpaid">Payment Needed</span>
                      )}

                      {order.is_paid && !hasTracking(order.tracking_number) && (
                        <>
                          <span className="status-chip status-chip--paid">Paid</span>
                          <span className="status-chip status-chip--shipping-soon">
                            Shipping Soon
                          </span>
                        </>
                      )}

                      {hasTracking(order.tracking_number) && (
                        <span className="status-chip status-chip--shipped">Shipped</span>
                      )}
                    </div>

                    {order.created_at && (
                      <span className="item-card-date">
                        Purchased{' '}
                        {new Date(order.created_at).toLocaleString([], {
                          year: '2-digit',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  {hasTracking(order.tracking_number) && (
                    <button
                      type="button"
                      className="item-card-tracking-button"
                      onClick={() => handleTrackingClick(order.tracking_number)}
                    >
                      <img alt="USPS" className="item-card-tracking-logo" src="../../../usps.png" />
                      <span>Tracking</span>
                      <span className="item-card-tracking-number">{order.tracking_number}</span>
                    </button>
                  )}

                  <dl className="item-card-amounts">
                    <div className="item-card-amount">
                      <dt>{items.length === 1 ? 'Piece' : `${items.length} pieces`}</dt>
                      <dd>{formatMoney(getOrderItemsSubtotal(order))}</dd>
                    </div>
                    <div className="item-card-amount">
                      <dt>Shipping</dt>
                      <dd>{formatMoney(getOrderShipping(order))}</dd>
                    </div>
                    <div className="item-card-amount item-card-amount--emphasized">
                      <dt>Total</dt>
                      <dd>{formatMoney(getOrderTotal(order))}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
