import { useEffect, useState } from 'react';
import './AuctionList.css';
import AuctionCard from './AuctionCard.js';
import { getAuctions } from '../../services/fetch-auctions.js';

export default function AuctionList() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const data = await getAuctions();
        console.log('data', data);

        setAuctions(data);
      } catch (err) {
        console.error('Error fetching auctions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  if (loading) {
    return (
      <div className="messages-container">
        <div className="messages-content">
          <p>Loading auctions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-content">
        <div className="messages-header">
          <h1>Glass Art Auctions</h1>
          <p>Bid, watch, or buy instantly.</p>
        </div>

        <div className="auction-list">
          {auctions.length === 0 ? (
            <p>No active auctions right now.</p>
          ) : (
            auctions.map((a) => <AuctionCard key={a.id} auction={a} />)
          )}
        </div>
      </div>
    </div>
  );
}
