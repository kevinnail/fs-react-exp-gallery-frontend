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
        <div className="slg-item-grid">
          {sales.map((order) => {
            const items = getOrderItems(order);

            return (
              <div
                key={order.id}
                className="slg-item-card"
                style={{
                  border: order.is_paid
                    ? '1px solid var(--slg-state-good)'
                    : '1px solid var(--slg-state-bad)',
                }}
              >
                <ul className="slg-item-rows">
                  {items.map((item) => (
                    <li key={item.id} className="slg-item-row">
                      {item.post_image_url ? (
                        <img
                          onClick={() => handlePieceNav(item.post_id)}
                          src={item.post_image_url}
                          alt={item.post_title}
                          className="slg-item-thumb slg-item-thumb--link"
                        />
                      ) : (
                        <div className="slg-item-thumb placeholder" />
                      )}
                      <span className="slg-item-title">{item.post_title}</span>
                      <span className="slg-item-price">{formatMoney(item.price)}</span>
                    </li>
                  ))}
                </ul>

                <div className="slg-item-footer">
                  <div className="slg-item-meta">
                    <div className="slg-status-row">
                      {!order.is_paid && (
                        <span className="slg-status-chip slg-status-chip--unpaid">
                          Payment Needed
                        </span>
                      )}

                      {order.is_paid && !hasTracking(order.tracking_number) && (
                        <>
                          <span className="slg-status-chip slg-status-chip--paid">Paid</span>
                          <span className="slg-status-chip slg-status-chip--wait">
                            Shipping Soon
                          </span>
                        </>
                      )}

                      {hasTracking(order.tracking_number) && (
                        <span className="slg-status-chip slg-status-chip--shipped">Shipped</span>
                      )}
                    </div>

                    {order.created_at && (
                      <span className="slg-item-date">
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
                      className="slg-item-tracking"
                      onClick={() => handleTrackingClick(order.tracking_number)}
                    >
                      <img alt="USPS" className="slg-item-tracking-logo" src="../../../usps.png" />
                      <span>Tracking</span>
                      <span className="slg-item-tracking-number">{order.tracking_number}</span>
                    </button>
                  )}

                  <dl className="slg-item-figures">
                    <div className="slg-item-figure">
                      <dt>{items.length === 1 ? 'Piece' : `${items.length} pieces`}</dt>
                      <dd>{formatMoney(getOrderItemsSubtotal(order))}</dd>
                    </div>
                    <div className="slg-item-figure">
                      <dt>Shipping</dt>
                      <dd>{formatMoney(getOrderShipping(order))}</dd>
                    </div>
                    <div className="slg-item-figure slg-item-figure--strong">
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
