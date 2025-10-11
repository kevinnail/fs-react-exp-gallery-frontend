import { useEffect, useState } from 'react';
import './UserAuctions.css';

export default function UserAuctions({ userId }) {
  const [biddingAuctions, setBiddingAuctions] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);

  useEffect(() => {
    const loadUserAuctions = async () => {
      try {
        // Replace with your API route once it's ready
        const res = await fetch(`/api/v1/users/${userId}/auctions`, {
          credentials: 'include',
        });
        const data = await res.json();

        const now = new Date();
        const active = data.filter((a) => a.isActive && new Date(a.endTime) > now);
        const won = data.filter((a) => !a.isActive || new Date(a.endTime) <= now);

        setBiddingAuctions(active);
        setWonAuctions(won);
      } catch (err) {
        console.error('Error loading user auctions:', err);
      }
    };

    loadUserAuctions();
  }, [userId]);

  const renderAuctionCard = (auction) => (
    <div key={auction.id} className="auction-mini-card">
      <img src={auction.imageUrls?.[0]} alt={auction.title} className="auction-mini-img" />
      <div className="auction-mini-info">
        <h4>{auction.title}</h4>
        <p className="auction-mini-desc">{auction.description}</p>
        <p>
          <span>Current Bid: </span>${auction.currentBid || auction.startPrice}
        </p>
        <p>
          Ends: <span>{new Date(auction.endTime).toLocaleString()}</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="user-auctions-widget">
      <h2>Current Auctions</h2>
      {biddingAuctions.length > 0 ? (
        <div className="auction-mini-grid">{biddingAuctions.map(renderAuctionCard)}</div>
      ) : (
        <p className="empty-msg">You’re not bidding on anything right now.</p>
      )}

      <h2>You Won</h2>
      {wonAuctions.length > 0 ? (
        <div className="auction-mini-grid">
          {wonAuctions.map((a) => (
            <div key={a.id} className="auction-mini-card won">
              {renderAuctionCard(a)}
              <div className="auction-win-message">
                <p>🎉 You won this auction!</p>
                <p>Please check your messages to arrange payment and shipping.</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-msg">No completed wins yet.</p>
      )}
    </div>
  );
}
