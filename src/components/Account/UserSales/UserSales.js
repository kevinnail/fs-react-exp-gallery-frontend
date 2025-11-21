import { useEffect, useState } from 'react';
import './UserSales.css';
import { getUserSales } from '../../../services/fetch-sales.js';
import { useNavigate } from 'react-router-dom';

export default function UserSales({ userId }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // loads sales for the logged-in user
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUserSales(userId);
        setSales(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading user sales:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

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
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="user-sales-card"
              style={{
                border:
                  sale.tracking_number && sale.is_paid
                    ? '1px solid green'
                    : sale.is_paid
                      ? '1px solid yellow'
                      : '1px solid red',
              }}
            >
              {/* IMAGE */}
              {sale.image_url ? (
                <img
                  onClick={() => handlePieceNav(sale.post_id)}
                  src={sale.image_url}
                  alt={sale.post_title}
                  className="user-sales-img"
                />
              ) : (
                <div className="user-sales-img placeholder" />
              )}

              {/* INFO */}
              <div className="user-sales-info">
                {/* Payment status */}
                {!sale.is_paid && (
                  <span
                    style={{
                      color: '#ff4444',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      marginRight: '3rem',
                    }}
                  >
                    Payment Needed
                  </span>
                )}

                {sale.is_paid && !sale.tracking_number && (
                  <span
                    style={{
                      color: 'yellow',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      marginRight: '3rem',
                    }}
                  >
                    Paid - Shipping Soon
                  </span>
                )}

                {sale.tracking_number && (
                  <span
                    style={{
                      color: 'green',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      marginRight: '3rem',
                    }}
                  >
                    Shipped
                  </span>
                )}

                {/* Title */}
                <h4>{sale.post_title}</h4>

                {/* Price */}
                <p className="sales-card-p">
                  <span>Price: </span>${Number(sale.price).toLocaleString()}
                </p>

                {/* SOLD DATE */}
                {sale.created_at && (
                  <p className="sales-card-p">
                    <span>Purchased: </span>
                    {new Date(sale.created_at).toLocaleString([], {
                      year: '2-digit',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}

                {/* TRACKING */}
                {sale.tracking_number && (
                  <div className="tracking-link">
                    <a
                      href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(
                        sale.tracking_number
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View tracking for ${sale.post_title}`}
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
                    </a>
                    <p
                      style={{ textAlign: 'left' }}
                      onClick={() => handleTrackingClick(sale.tracking_number)}
                    >
                      <span>Tracking number: </span>
                      <span>{sale.tracking_number}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
