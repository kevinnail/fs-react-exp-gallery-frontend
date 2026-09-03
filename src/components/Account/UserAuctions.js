import { useEffect, useState } from 'react';
import './UserAuctions.css';
import { getAuctionDetail } from '../../services/fetch-auctions.js';
import { useNavigate } from 'react-router-dom';

const hasTracking = (trackingNumber) => Boolean(trackingNumber) && trackingNumber !== '0';

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
        {hasTracking(auction.trackingNumber) && (
          <div
            className="tracking-link"
            onClick={() => handleTrackingClick(auction.trackingNumber)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTrackingClick(auction.trackingNumber);
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
              <span>{auction.trackingNumber}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading || hydrating) {
    return (
      <div className="user-auctions-widget">
        <p>Loading...</p>
      </div>
    );
  }

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

      <p className="empty-msg">
        Waiting for your item(s)? You can find your tracking number & link in the Won section below.
      </p>

      <h3>Active bids</h3>
      {hydratedBids.length > 0 ? (
        <div className="auction-mini-grid">
          {hydratedBids.map(({ bid, auction }) => (
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
          {wonAuctions.map((auction) => (
            <div
              key={auction.id}
              className="auction-mini-card won"
              style={{
                border: auction.isPaid
                  ? '1px solid var(--slg-state-good)'
                  : '1px solid var(--slg-state-bad)',
              }}
            >
              <WonCard auction={auction} />
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-msg">No completed wins yet.</p>
      )}
    </div>
  );
}
