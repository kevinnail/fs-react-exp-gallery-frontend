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
        <div className="user-sales-grid">
          {sales.map((order) => {
            const items = getOrderItems(order);

            return (
              <div
                key={order.id}
                className="user-sales-card"
                style={{
                  border: order.is_paid
                    ? '1px solid var(--slg-state-good)'
                    : '1px solid var(--slg-state-bad)',
                }}
              >
                {/* PIECES */}
                <ul className="user-sales-pieces">
                  {items.map((item) => (
                    <li key={item.id} className="user-sales-piece">
                      {item.post_image_url ? (
                        <img
                          onClick={() => handlePieceNav(item.post_id)}
                          src={item.post_image_url}
                          alt={item.post_title}
                          className="user-sales-img"
                        />
                      ) : (
                        <div className="user-sales-img placeholder" />
                      )}

                      <div className="user-sales-piece-line">
                        <span className="user-sales-piece-title">{item.post_title}</span>
                        <span className="user-sales-piece-price">{formatMoney(item.price)}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* INFO */}
                <div className="user-sales-info">
                  <div className="slg-status-row">
                    {!order.is_paid && (
                      <span className="slg-status-chip slg-status-chip--unpaid">
                        Payment Needed
                      </span>
                    )}

                    {order.is_paid && !hasTracking(order.tracking_number) && (
                      <>
                        <span className="slg-status-chip slg-status-chip--paid">Paid</span>
                        <span className="slg-status-chip slg-status-chip--wait">Shipping Soon</span>
                      </>
                    )}

                    {hasTracking(order.tracking_number) && (
                      <span className="slg-status-chip slg-status-chip--shipped">Shipped</span>
                    )}
                  </div>

                  {/* TRACKING */}
                  {hasTracking(order.tracking_number) && (
                    <div
                      className="tracking-link"
                      onClick={() => handleTrackingClick(order.tracking_number)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleTrackingClick(order.tracking_number);
                      }}
                    >
                      <img
                        alt="USPS"
                        className="auction-result-thumb"
                        style={{
                          width: '50px',
                          height: '50px',
                          margin: '.5rem 0 0 .25rem',
                        }}
                        src="../../../usps.png"
                      />

                      <p style={{ textAlign: 'left', margin: 0 }}>
                        <span>Tracking number: </span>
                        <span>{order.tracking_number}</span>
                      </p>
                    </div>
                  )}

                  {/* MONEY */}
                  <dl className="user-sales-totals">
                    <div className="user-sales-total-line">
                      <dt>{items.length === 1 ? 'Piece' : `${items.length} pieces`}</dt>
                      <dd>{formatMoney(getOrderItemsSubtotal(order))}</dd>
                    </div>
                    <div className="user-sales-total-line">
                      <dt>Shipping</dt>
                      <dd>{formatMoney(getOrderShipping(order))}</dd>
                    </div>
                    <div className="user-sales-total-line user-sales-total-line--grand">
                      <dt>Total</dt>
                      <dd>{formatMoney(getOrderTotal(order))}</dd>
                    </div>
                  </dl>

                  {/* SOLD DATE */}
                  {order.created_at && (
                    <p className="sales-card-p">
                      <span>Purchased: </span>
                      {new Date(order.created_at).toLocaleString([], {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
