import { useEffect, useState } from 'react';
import './UserSales.css';
import { getUserSales } from '../../../services/fetch-sales.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
      } catch (e) {
        console.error('Error loading user sales:', e);
        toast.error(`${e.message}` || 'Error loading your purchases', {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'user-sales-1',
          autoClose: 3000,
        });
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
              {sale.post_image_url ? (
                <img
                  onClick={() => handlePieceNav(sale.post_id)}
                  src={sale.post_image_url}
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
                {(sale.is_paid && sale.tracking_number === '0') ||
                  (sale.tracking_number === null && (
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
                  ))}
                {sale.tracking_number && sale.tracking_number !== '0' && (
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

                {/* TRACKING */}
                {sale.tracking_number && sale.tracking_number !== '0' && (
                  <div
                    className="tracking-link"
                    onClick={() => handleTrackingClick(sale.tracking_number)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTrackingClick(sale.tracking_number);
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
                      <span>{sale.tracking_number}</span>
                    </p>
                  </div>
                )}

                {/* Title */}
                <h4 style={{ margin: '.5rem 0 0 0' }}>{sale.post_title}</h4>

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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
