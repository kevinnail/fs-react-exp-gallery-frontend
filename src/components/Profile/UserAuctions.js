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

  useEffect(() => {
    const loadUserAuctions = async () => {
      try {
        const data = await getUserAuctions(userId);
        console.log('data', data);

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

        setActiveBids(hydrated);
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
      </div>
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
          <p>
            <span>Final bid: </span>${Number(a.finalBid).toLocaleString()}
          </p>
          {typeof a.buyNowPrice !== 'undefined' && (
            <p>
              <span>Buy now price: </span>${Number(a.buyNowPrice).toLocaleString()}
            </p>
          )}
          <p>
            <span>Closed: </span>
            {new Date(a.closedAt).toLocaleString()}
          </p>
          <p>
            <span>Reason: </span>
            {a.closedReason === 'buy_now' ? 'Bought instantly' : 'Expired'}
          </p>
        </div>
      </div>
      <div className="auction-win-message">
        <p>You won this auction.</p>
        <p>Check messages to arrange payment and shipping.</p>
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
  const handleNavAuction = () => {
    navigate('/auctions');
  };

  return (
    <div onClick={handleNavAuction} className="user-auctions-widget">
      <span className="new-work-msg">
        <strong>Your Auction Bids & Wins</strong>
      </span>
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
