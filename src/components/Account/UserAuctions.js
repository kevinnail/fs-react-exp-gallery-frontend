import { useEffect, useState } from 'react';
import './UserAuctions.css';
import { getAuctionDetail } from '../../services/fetch-auctions.js';
import { useNavigate } from 'react-router-dom';

const hasTracking = (trackingNumber) => Boolean(trackingNumber) && trackingNumber !== '0';

const formatBid = (amount) => `$${Number(amount).toLocaleString()}`;

const formatShortDateTime = (value) =>
  new Date(value).toLocaleString([], {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function UserAuctions({ activeAuctionBids, wonAuctions, loading }) {
  // active bids hydrated with their auction details: [{ bid, auction }]
  const [hydratedBids, setHydratedBids] = useState([]);
  const [hydrating, setHydrating] = useState(true);

  const navigate = useNavigate();

  // Auction detail is only needed to render this tab, so it is fetched here
  // rather than with the account-wide activity feed.
  useEffect(() => {
    let isMounted = true;
    const hydrateActiveBids = async () => {
      if (loading) return;
      try {
        const hydrated = await Promise.all(
          activeAuctionBids.map(async (bid) => {
            try {
              const auction = await getAuctionDetail(bid.auctionId);
              return { bid, auction };
            } catch (error) {
              console.error('getAuctionDetail failed for', bid.auctionId, error);
              return { bid, auction: null };
            }
          })
        );
        if (!isMounted) return;
        setHydratedBids(hydrated.filter((entry) => entry.auction?.isActive));
      } catch (error) {
        console.error('Error hydrating active bids:', error);
      } finally {
        if (isMounted) setHydrating(false);
      }
    };

    hydrateActiveBids();
    return () => {
      isMounted = false;
    };
  }, [activeAuctionBids, loading]);

  const handleAuctionNav = (id) => {
    navigate(`/auctions/${id}`);
  };

  const handleTrackingClick = (trackingNumber) => {
    if (!trackingNumber) return;
    const url = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(
      trackingNumber
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderActiveBidCard = ({ bid, auction }) => {
    const imageUrl = auction?.imageUrls?.[0];
    const title = auction?.title || `Auction #${bid.auctionId}`;
    const currentBid = auction?.currentBid ?? auction?.startPrice;

    return (
      <div
        key={bid.id}
        className="item-card user-auctions-bid-card"
        onClick={() => {
          handleAuctionNav(auction.id);
        }}
      >
        <div className="item-card-pieces">
          <div className="item-card-piece">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="item-card-piece-image" />
            ) : (
              <div className="item-card-piece-image item-card-piece-image--placeholder" />
            )}
            <span className="item-card-piece-text">
              <span className="item-card-piece-title">{title}</span>
              {auction?.endTime && (
                <span className="item-card-piece-detail">
                  Ends {formatShortDateTime(auction.endTime)}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="item-card-summary">
          <div className="item-card-status-and-date">
            <span className="item-card-date">Placed {formatShortDateTime(bid.createdAt)}</span>
            <dl className="item-card-amounts">
              <div className="item-card-amount">
                <dt>Your bid</dt>
                <dd>{formatBid(bid.bidAmount)}</dd>
              </div>
              {typeof currentBid !== 'undefined' && (
                <div className="item-card-amount item-card-amount--emphasized">
                  <dt>Current bid</dt>
                  <dd>{formatBid(currentBid)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    );
  };

  const renderWonCard = (auction) => {
    const title = auction.title || `Auction #${auction.auctionId}`;
    const hasBuyNowPrice = auction.buyNowPrice !== null && auction.buyNowPrice !== undefined;

    return (
      <div
        key={auction.id}
        className="item-card"
        style={{
          border: auction.isPaid
            ? '1px solid var(--color-status-good)'
            : '1px solid var(--color-status-bad)',
        }}
      >
        <div className="item-card-pieces">
          <div className="item-card-piece">
            {auction.imageUrls?.[0] ? (
              <img
                onClick={() => {
                  handleAuctionNav(auction.auctionId);
                }}
                src={auction.imageUrls[0]}
                alt={title}
                className="item-card-piece-image item-card-piece-image--clickable"
              />
            ) : (
              <div className="item-card-piece-image item-card-piece-image--placeholder" />
            )}
            <span className="item-card-piece-text">
              <span className="item-card-piece-title">{title}</span>
              <span className="item-card-piece-detail">
                Reason: {auction.closedReason === 'buy_now' ? 'Bought instantly' : 'Expired'}
              </span>
            </span>
            <span className="item-card-piece-price">{formatBid(auction.finalBid)}</span>
          </div>
        </div>

        <div className="item-card-summary">
          <div className="item-card-status-and-date">
            <div className="status-chips">
              {!auction.isPaid && (
                <span className="status-chip status-chip--unpaid">Payment Needed</span>
              )}

              {auction.isPaid && !hasTracking(auction.trackingNumber) && (
                <>
                  <span className="status-chip status-chip--paid">Paid</span>
                  <span className="status-chip status-chip--shipping-soon">Shipping Soon</span>
                </>
              )}

              {hasTracking(auction.trackingNumber) && (
                <span className="status-chip status-chip--shipped">Shipped</span>
              )}
            </div>

            <span className="item-card-date">Closed {formatShortDateTime(auction.closedAt)}</span>
          </div>

          {hasTracking(auction.trackingNumber) && (
            <button
              type="button"
              className="item-card-tracking-button"
              onClick={() => handleTrackingClick(auction.trackingNumber)}
            >
              <img alt="USPS" className="item-card-tracking-logo" src="../../../usps.png" />
              <span>Tracking</span>
              <span className="item-card-tracking-number">{auction.trackingNumber}</span>
            </button>
          )}

          {hasBuyNowPrice && (
            <dl className="item-card-amounts">
              <div className="item-card-amount">
                <dt>Buy now price</dt>
                <dd>{formatBid(auction.buyNowPrice)}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    );
  };

  if (loading || hydrating) {
    return (
      <div className="user-auctions-panel">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="user-auctions-panel">
      <span className="account-section-heading">
        <strong>Your Auction Bids & Wins</strong>
      </span>

      <p className="user-auctions-empty-message">
        Waiting for your item(s)? You can find your tracking number & link in the Won section below.
      </p>

      <h3>Active bids</h3>
      {hydratedBids.length > 0 ? (
        <div className="item-card-grid">{hydratedBids.map(renderActiveBidCard)}</div>
      ) : (
        <p className="user-auctions-empty-message">No active bids.</p>
      )}

      <h3>Won</h3>
      {wonAuctions.length > 0 ? (
        <div className="item-card-grid">{wonAuctions.map(renderWonCard)}</div>
      ) : (
        <p className="user-auctions-empty-message">No completed wins yet.</p>
      )}
    </div>
  );
}
