import { useEffect, useState } from 'react';
import './UserAuctions.css';
import { getUserAuctions, getAuctionDetail } from '../../services/fetch-auctions.js';
import { useNavigate } from 'react-router-dom';

export default function UserAuctions({ userId }) {
  // active bids hydrated with their auction details
  const [activeBids, setActiveBids] = useState([]); // [{ bid, auction }]
  const [wonAuctions, setWonAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // calculate totals
  const totalWon = wonAuctions.reduce((sum, a) => sum + (a.finalBid || 0), 0);
  const shippingTotal = wonAuctions.length > 0 ? 9 + (wonAuctions.length - 1) * 1 : 0;
  const grandTotal = totalWon + shippingTotal;

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

  const renderActiveBidCard = ({ bid, auction }) => {
    const img = auction?.imageUrls?.[0];
    const title = auction?.title || `Auction #${bid.auctionId}`;
    const currentBid = auction?.currentBid ?? auction?.startPrice;
    const endsAt = auction?.endTime ? new Date(auction.endTime).toLocaleString() : null;

    return (
      <>
        <div key={bid.id} className="auction-mini-card">
          {img ? (
            <img src={img} alt={title} className="auction-mini-img" />
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
        </div>{' '}
      </>
    );
  };

  const renderWonCard = (a) => (
    <div key={a.id} className="auction-mini-card won">
      <div className="auction-mini-core">
        {a.imageUrls?.[0] ? (
          <img src={a.imageUrls[0]} alt={a.title} className="auction-mini-img" />
        ) : (
          <div className="auction-mini-img placeholder" />
        )}
        <div className="auction-mini-info">
          <h4>{a.title || `Auction #${a.auctionId}`}</h4>
          <p className="won-card-p">
            <span>Final bid: </span>${Number(a.finalBid).toLocaleString()}
          </p>
          {typeof a.buyNowPrice !== 'undefined' && (
            <p className="won-card-p">
              <span>Buy now price: </span>${Number(a.buyNowPrice).toLocaleString()}
            </p>
          )}
          <p className="won-card-p">
            <span>Closed: </span>
            {new Date(a.closedAt).toLocaleString([], {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="won-card-p">
            <span>Reason: </span>
            {a.closedReason === 'buy_now' ? 'Bought instantly' : 'Expired'}
          </p>
        </div>
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
      wonAuctions
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

  return (
    <div className="user-auctions-widget">
      <span className="new-work-msg">
        <strong>Your Auction Bids & Wins</strong>
      </span>

      <div className="user-auctions-summary">
        <h4>Summary</h4>
        {wonAuctions.length > 0 ? (
          <>
            <div className="summary-details">
              <p className="summary-details-p">
                <span>Items won:</span> {wonAuctions.length}
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
                {' '}
                <strong>Payment Due!</strong>
                <button
                  className="mobile-new-link print-invoice"
                  onClick={() => handlePrintInvoice()}
                >
                  Print invoice
                </button>
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
          <p className="empty-msg">No wins yet to summarize.</p>
        )}
      </div>

      <h3>Active bids</h3>
      {activeBids.length > 0 ? (
        <div className="auction-mini-grid">{activeBids.map(renderActiveBidCard)}</div>
      ) : (
        <p className="empty-msg">No active bids.</p>
      )}

      <h3>Won</h3>
      {wonAuctions.length > 0 ? (
        <div className="auction-mini-grid">{wonAuctions.map(renderWonCard)}</div>
      ) : (
        <p className="empty-msg">No completed wins yet.</p>
      )}
    </div>
  );
}
