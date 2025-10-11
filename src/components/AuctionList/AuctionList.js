import { useEffect, useState } from 'react';
import './AuctionList.css';
import AuctionCard from './AuctionCard.js';
import { getAuctions } from '../../services/fetch-auctions.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AuctionList() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const data = await getAuctions();

        setAuctions(data);
      } catch (err) {
        console.error('Error fetching auctions', err);
        toast.error(`Error saving auction: ${err.message}`, {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'auction-list-1',
          autoClose: false,
        });
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
        <button onClick={() => navigate('/admin/auctions')}>Add/ Edit Auctions</button>
        <div className="messages-header">
          <h1>Glass Art Auctions</h1>
          <p>Bid, watch, or buy instantly.</p>
        </div>
        <div className="auction-list">
          {auctions.length === 0 ? (
            <p>No active auctions right now.</p>
          ) : (
            auctions.map((auction) => <AuctionCard key={auction.id} auction={auction} />)
          )}
        </div>
      </div>
    </div>
  );
}
