import { useEffect, useState } from 'react';
import './UserAuctions.css';
import { getUserAuctions, getAuctionDetail } from '../../services/fetch-auctions.js';
import { useNavigate } from 'react-router-dom';
import { useAuctionEventsStore } from '../../stores/auctionEventsStore.js';

export default function UserAuctions({ userId }) {
  // active bids hydrated with their auction details
  const [activeBids, setActiveBids] = useState([]); // [{ bid, auction }]
  const [wonAuctions, setWonAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // calculate totals
  const unpaidWins = wonAuctions.filter((a) => !a.isPaid);
  const totalWon = unpaidWins.reduce((sum, a) => sum + (a.finalBid || 0), 0);
  const shippingTotal = unpaidWins.length > 0 ? 9 + (unpaidWins.length - 1) * 1 : 0;
  const grandTotal = totalWon + shippingTotal;

  const lastAuctionPaid = useAuctionEventsStore((s) => s.lastAuctionPaid);

  useEffect(() => {
    if (!lastAuctionPaid) return;
    const { id, isPaid } = lastAuctionPaid;

    setWonAuctions((prev) =>
      prev.map((a) => (a.auctionId === id || a.id === id ? { ...a, isPaid } : a))
    );
    console.log('useEffect running- lastAuctionPaid:', lastAuctionPaid);
  }, [lastAuctionPaid]);

  useEffect(() => {
    const loadUserAuctions = async () => {
      try {
        const data = await getUserAuctions(userId);

        const rawActive = Array.isArray(data?.activeAuctionBids) ? data.activeAuctionBids : [];
        const rawWon = Array.isArray(data?.wonAuctions) ? data.wonAuctions : [];

        // hydrate active bids with auction detail so we can show title/images/end time
        const hydrated = await Promise.all(
          rawActive.map(async (bid) => {
            try {
              const auction = await getAuctionDetail(bid.auctionId);
              return { bid, auction };
            } catch (e) {
              console.error('getAuctionDetail failed for', bid.auctionId, e);
              return { bid, auction: null };
            }
          })
        );

        const activeHydration = hydrated.filter((a) => (a.auction.isActive ? a : ''));
        setActiveBids(activeHydration);
        setWonAuctions(rawWon);
      } catch (err) {
        console.error('Error loading user auctions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserAuctions();
  }, [userId]);

  const allPaid = wonAuctions.every((a) => a.isPaid === true);

  const handleAuctionNav = (id) => {
    navigate(`/auctions/${id}`);
  };

  const renderActiveBidCard = ({ bid, auction }) => {
    const img = auction?.imageUrls?.[0];
    const title = auction?.title || `Auction #${bid.auctionId}`;
    const currentBid = auction?.currentBid ?? auction?.startPrice;
    const endsAt = auction?.endTime ? new Date(auction.endTime).toLocaleString() : null;

    return (
      <>
        {img ? (
          <img src={img} alt={title} className="auction-mini-img  auction-mini-card-image" />
        ) : (
          <div className="auction-mini-img placeholder" />
        )}
        <div className="auction-mini-info">
          <h4>{title}</h4>
          <p>
            <span>Your bid: </span>${Number(bid.bidAmount).toLocaleString()}
          </p>
          {typeof currentBid !== 'undefined' && (
            <p>
              <span>Current bid: </span>${Number(currentBid).toLocaleString()}
            </p>
          )}
          <p>
            <span>Placed: </span>
            {new Date(bid.createdAt).toLocaleString()}
          </p>
          {endsAt && (
            <p>
              <span>Ends: </span>
              {endsAt}
            </p>
          )}
        </div>
      </>
    );
  };

  const WonCard = ({ auction }) => (
    <div>
      {auction.imageUrls?.[0] ? (
        <img
          onClick={() => {
            handleAuctionNav(auction.auctionId);
          }}
          src={auction.imageUrls[0]}
          alt={auction.title}
          className="auction-mini-img auction-mini-card-image"
        />
      ) : (
        <div className="auction-mini-img placeholder" />
      )}

      <div className="auction-mini-info">
        {!auction.isPaid && (
          <>
            <span
              style={{
                color: '#ffbb00',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: 'bold',
                marginRight: '3rem',
              }}
            >
              Payment Needed
            </span>

            <button onClick={handleMsgNav} className="pay-now-btn">
              Message to Pay
            </button>
          </>
        )}

        <h4>{auction.title || `Auction #${auction.auctionId}`}</h4>

        <p className="won-card-p">
          <span>Final bid: </span>${Number(auction.finalBid).toLocaleString()}
        </p>

        {typeof auction.buyNowPrice !== 'undefined' && (
          <p className="won-card-p">
            <span>Buy now price: </span>${Number(auction.buyNowPrice).toLocaleString()}
          </p>
        )}

        <p className="won-card-p">
          <span>Closed: </span>
          {new Date(auction.closedAt).toLocaleString([], {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>

        <p className="won-card-p">
          <span>Reason: </span>
          {auction.closedReason === 'buy_now' ? 'Bought instantly' : 'Expired'}
        </p>
        {auction.isPaid && (
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
            PAID
          </span>
        )}
        {auction.trackingNumber && (
          <div className="tracking-link">
            <a
              href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(
                auction.trackingNumber
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View tracking for ${auction.title}`}
            >
              <img
                alt="USPS"
                className="auction-result-thumb"
                style={{ width: '50px', height: '50px', margin: '.5rem 0 0 .25rem' }}
                src="../../../usps.png"
              />
            </a>
            <p
              style={{ textAlign: 'left' }}
              onClick={() => handleTrackingClick(auction.trackingNumber)}
            >
              <span>Tracking number: </span>
              <span>{auction.trackingNumber}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="user-auctions-widget">
        <p>Loading...</p>
      </div>
    );
  }

  const handleMsgNav = () => {
    navigate('/messages');
  };

  const handlePrintInvoice = () => {
    const win = window.open('', '_blank');
    const date = new Date().toLocaleDateString();

    const invoiceHTML =
      '<html>' +
      '<head>' +
      '<title>Invoice - Stress Less Glass</title>' +
      '<style>' +
      'body { font-family: Arial, sans-serif; margin: 40px; color: #333; }' +
      'h1, h2, h3 { text-align: left; }' +
      'table { width: 100%; border-collapse: collapse; margin-top: 20px; }' +
      'th, td { border: 1px solid #ddd; padding: 8px; text-align: left;font-size:.9rem }' +
      'th { background: #f4f4f4; }' +
      '.totals { text-align: right; margin-top: 30px;margin-right:3rem;width:20%;justify-self:flex-end }' +
      '.totals p { margin: 0; }' +
      '.footer { margin-top: 40px; text-align: center; font-size: 0.9em; }' +
      '</style>' +
      '</head>' +
      '<body>' +
      '<h1>Stress Less Glass</h1>' +
      '<h2>Invoice</h2>' +
      `<p><strong>Date:</strong> ${date}</p>` +
      '<table>' +
      '<thead><tr><th>Item</th><th>Final Bid</th><th>Closed Date</th><th>Shipping</th></tr></thead>' +
      '<tbody>' +
      unpaidWins
        .map((a, i) => {
          const shipping = i === 0 ? 9 : 1;
          return (
            `<tr>` +
            `<td>${a.title || `Auction #${a.auctionId}`}</td>` +
            `<td>$${Number(a.finalBid).toLocaleString()}</td>` +
            `<td>${new Date(a.closedAt).toLocaleString([], {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}</td>` +
            `<td>$${shipping.toFixed(2)}</td>` +
            `</tr>`
          );
        })
        .join('') +
      '</tbody></table>' +
      `<div class="totals" style="margin-top:30px;">
    <div style="display:flex; justify-content:space-between; margin:4px 0;">
        <p><strong>Subtotal:</strong></p>
        <p>$${totalWon.toLocaleString()}</p>
    </div>
    <div style="display:flex; justify-content:space-between; margin:4px 0;">
        <p><strong>Shipping:</strong></p>
        <p>$${shippingTotal.toLocaleString()}</p>
    </div>
    <div style="display:flex; justify-content:space-between; margin-top:8px; font-size:1.1rem;">
        <p><strong>Total:</strong></p>
        <p><strong>$${grandTotal.toLocaleString()}</strong></p>
    </div>
</div>` +
      '<div class="footer">' +
      '<p>Payment Due!</p>' +
      '<p>Zelle, PayPal, Venmo, Cash App, or CC/Debit via emailed invoice.</p>' +
      '<p>Thank you for supporting Stress Less Glass!</p>' +
      '</div>' +
      '<script>window.onload = () => window.print();</script>' +
      '</body>' +
      '</html>';

    win.document.write(invoiceHTML);
    win.document.close();
  };

  const handleTrackingClick = (trackingNumber) => {
    if (!trackingNumber) return;
    const url = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trackingNumber)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="user-auctions-widget">
      <span className="new-work-msg">
        <strong>Your Auction Bids & Wins</strong>
      </span>

      <div className="user-auctions-summary">
        {wonAuctions.length > 0 && !allPaid ? (
          <>
            <h4>Auctions needing payment:</h4>
            <div className="summary-details">
              <p className="summary-details-p">
                <span>Items won:</span> {unpaidWins.length}
              </p>
              <p className="summary-details-p">
                <span>Subtotal:</span> ${totalWon.toLocaleString()}
              </p>
              <p className="summary-details-p">
                <span>Shipping:</span> ${shippingTotal.toLocaleString()}
              </p>
              <p className="summary-total">
                <strong>Total:</strong> ${grandTotal.toLocaleString()}
              </p>
            </div>

            <div className="payment-info-banner">
              <div className="payment-due">
                <strong>Payment Due!</strong>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="pay-now-btn"
                    onClick={handlePrintInvoice}
                    style={{ cursor: 'pointer' }}
                  >
                    Print invoice
                  </button>

                  <button className="pay-now-btn" onClick={handleMsgNav}>
                    Message to Pay
                  </button>
                </div>
              </div>

              <p>
                I can take Zelle, PayPal, Venmo, Cash App, or CC/Debit via invoice through email.
                Contact me through{' '}
                <span
                  onClick={handleMsgNav}
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {' '}
                  Messages
                </span>{' '}
                if you need my payment info or have any questions! Thank you!
              </p>
            </div>
          </>
        ) : (
          <p className="empty-msg">
            Waiting for your item(s)? You can find your tracking number & link in the Won section
            below.
          </p>
        )}
      </div>

      <h3>Active bids</h3>
      {activeBids.length > 0 ? (
        <div className="auction-mini-grid">
          {activeBids.map(({ bid, auction }) => (
            <div
              key={bid.id}
              className="auction-mini-card"
              onClick={() => {
                handleAuctionNav(auction.id);
              }}
            >
              {renderActiveBidCard({ bid, auction })}
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-msg">No active bids.</p>
      )}

      <h3>Won</h3>
      {wonAuctions.length > 0 ? (
        <div className="auction-mini-grid">
          {wonAuctions.map((a) => (
            <div
              key={a.id}
              className="auction-mini-card won"
              style={{
                border: !a.isPaid ? '1px solid yellow' : '1px solid green',
              }}
            >
              <WonCard auction={a} />
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-msg">No completed wins yet.</p>
      )}
    </div>
  );
}
