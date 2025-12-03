import { useEffect, useState } from 'react';
import './UserSales.css';
import { getUserSales } from '../../../services/fetch-sales.js';
import websocketService from '../../../services/websocket.js';
import { SALE_PAID, SALE_TRACKING_INFO, SALE_CREATED } from '../../../services/salesEvents.js';
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

  // Real-time updates for purchases (paid + tracking)
  useEffect(() => {
    const handleSalePaid = (data) => {
      if (!data || typeof data.saleId === 'undefined') return; // ignore incomplete
      setSales((prev) =>
        prev.map((s) => (s.id === data.saleId ? { ...s, is_paid: data.isPaid } : s))
      );
    };
    const handleSaleTracking = (data) => {
      if (!data || typeof data.saleId === 'undefined') return;
      setSales((prev) =>
        prev.map((s) => (s.id === data.saleId ? { ...s, tracking_number: data.trackingNumber } : s))
      );
    };
    websocketService.on(SALE_PAID, handleSalePaid);
    websocketService.on(SALE_TRACKING_INFO, handleSaleTracking);
    return () => {
      websocketService.off(SALE_PAID, handleSalePaid);
      websocketService.off(SALE_TRACKING_INFO, handleSaleTracking);
    };
  }, [userId]);

  // Real-time sale creation
  useEffect(() => {
    const handleSaleCreated = (data) => {
      const payload = data?.sale || data;
      if (!payload) return;
      // Map backend fields to frontend sale shape
      const mapped = {
        id: payload.id ?? payload.saleId,
        post_id: payload.post_id ?? payload.postId,
        user_id: payload.user_id ?? payload.userId,
        price: payload.price,
        tracking_number: payload.tracking_number ?? payload.trackingNumber ?? '0',
        is_paid: payload.is_paid ?? payload.isPaid ?? false,
        created_at: payload.created_at,
        post_title: payload.post_title,
        post_image_url: payload.post_image_url,
        buyer_email: payload.buyer_email,
      };
      if (!mapped.id) {
        console.error('[UserSales] sale-created payload missing id', data);
        return;
      }

      // ensure sale belongs to this user
      if (mapped.user_id && userId && Number(mapped.user_id) !== Number(userId)) return;
      setSales((prev) => (prev.some((s) => s.id === mapped.id) ? prev : [mapped, ...prev]));
    };
    websocketService.on(SALE_CREATED, handleSaleCreated);
    return () => {
      websocketService.off(SALE_CREATED, handleSaleCreated);
    };
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
                border: sale.is_paid ? '1px solid green' : '1px solid red',
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
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      marginRight: '3rem',
                    }}
                  >
                    Payment Needed
                  </span>
                )}

                {sale.is_paid && (!sale.tracking_number || sale.tracking_number === '0') && (
                  <span
                    style={{
                      color: 'yellow',
                      padding: '4px 6px',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      marginRight: '3rem',
                    }}
                  >
                    <span
                      style={{
                        marginRight: '1.5rem',
                        color: 'green',
                      }}
                    >
                      Paid{' '}
                    </span>{' '}
                    Shipping Soon
                  </span>
                )}
                {sale.tracking_number && sale.tracking_number !== '0' && (
                  <span
                    style={{
                      color: 'green',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      marginRight: '3rem',
                      display: 'block',
                      marginBottom: '.5rem',
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
