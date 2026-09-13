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
        className="slg-item-card user-auctions-bid-card"
        onClick={() => {
          handleAuctionNav(auction.id);
        }}
      >
        <div className="slg-item-rows">
          <div className="slg-item-row">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="slg-item-thumb" />
            ) : (
              <div className="slg-item-thumb placeholder" />
            )}
            <span className="slg-item-text">
              <span className="slg-item-title">{title}</span>
              {auction?.endTime && (
                <span className="slg-item-subline">
                  Ends {formatShortDateTime(auction.endTime)}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="slg-item-footer">
          <div className="slg-item-meta">
            <span className="slg-item-date">Placed {formatShortDateTime(bid.createdAt)}</span>
            <dl className="slg-item-figures">
              <div className="slg-item-figure">
                <dt>Your bid</dt>
                <dd>{formatBid(bid.bidAmount)}</dd>
              </div>
              {typeof currentBid !== 'undefined' && (
                <div className="slg-item-figure slg-item-figure--strong">
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
        className="slg-item-card"
        style={{
          border: auction.isPaid
            ? '1px solid var(--slg-state-good)'
            : '1px solid var(--slg-state-bad)',
        }}
      >
        <div className="slg-item-rows">
          <div className="slg-item-row">
            {auction.imageUrls?.[0] ? (
              <img
                onClick={() => {
                  handleAuctionNav(auction.auctionId);
                }}
                src={auction.imageUrls[0]}
                alt={title}
                className="slg-item-thumb slg-item-thumb--link"
              />
            ) : (
              <div className="slg-item-thumb placeholder" />
            )}
            <span className="slg-item-text">
              <span className="slg-item-title">{title}</span>
              <span className="slg-item-subline">
                Reason: {auction.closedReason === 'buy_now' ? 'Bought instantly' : 'Expired'}
              </span>
            </span>
            <span className="slg-item-price">{formatBid(auction.finalBid)}</span>
          </div>
        </div>

        <div className="slg-item-footer">
          <div className="slg-item-meta">
            <div className="slg-status-row">
              {!auction.isPaid && (
                <span className="slg-status-chip slg-status-chip--unpaid">Payment Needed</span>
              )}

              {auction.isPaid && !hasTracking(auction.trackingNumber) && (
                <>
                  <span className="slg-status-chip slg-status-chip--paid">Paid</span>
                  <span className="slg-status-chip slg-status-chip--wait">Shipping Soon</span>
                </>
              )}

              {hasTracking(auction.trackingNumber) && (
                <span className="slg-status-chip slg-status-chip--shipped">Shipped</span>
              )}
            </div>

            <span className="slg-item-date">Closed {formatShortDateTime(auction.closedAt)}</span>
          </div>

          {hasTracking(auction.trackingNumber) && (
            <button
              type="button"
              className="slg-item-tracking"
              onClick={() => handleTrackingClick(auction.trackingNumber)}
            >
              <img alt="USPS" className="slg-item-tracking-logo" src="../../../usps.png" />
              <span>Tracking</span>
              <span className="slg-item-tracking-number">{auction.trackingNumber}</span>
            </button>
          )}

          {hasBuyNowPrice && (
            <dl className="slg-item-figures">
              <div className="slg-item-figure">
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
      <div className="user-auctions-widget">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="user-auctions-widget">
      <span className="new-work-msg">
        <strong>Your Auction Bids & Wins</strong>
      </span>

      <p className="empty-msg">
        Waiting for your item(s)? You can find your tracking number & link in the Won section below.
      </p>

      <h3>Active bids</h3>
      {hydratedBids.length > 0 ? (
        <div className="slg-item-grid">{hydratedBids.map(renderActiveBidCard)}</div>
      ) : (
        <p className="empty-msg">No active bids.</p>
      )}

      <h3>Won</h3>
      {wonAuctions.length > 0 ? (
        <div className="slg-item-grid">{wonAuctions.map(renderWonCard)}</div>
      ) : (
        <p className="empty-msg">No completed wins yet.</p>
      )}
    </div>
  );
}
