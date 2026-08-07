import './AuctionResultsPanelSimple.css';
import { Link } from 'react-router-dom';
import { getAdminAuctions } from '../../services/fetch-auctions.js';
import { useEffect, useState } from 'react';
import Loading from '../Loading/Loading.js';

export default function AuctionResultsPanelSimple() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const allAuctions = await getAdminAuctions();
        setAuctions(allAuctions.filter((auction) => auction.isActive));
      } catch (error) {
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="slg-live">
        <Loading />
      </div>
    );
  }

  // Calculate total active bids
  const activeTotal = auctions.reduce((sum, auction) => sum + (auction.currentBid || 0), 0);

  return (
    <div className="slg-live">
      <div className="slg-live-total">
        <span className="slg-live-total-label">Money on the table</span>
        <span className="slg-live-total-figure">${activeTotal.toLocaleString()}</span>
      </div>

      {auctions.length === 0 ? (
        <p className="slg-live-empty">No active auctions.</p>
      ) : (
        <ul className="slg-live-list">
          {auctions.map((auction) => (
            <li key={auction.id}>
              <Link className="slg-live-item" to={`/auctions/${auction.id}`}>
                <span className="slg-live-thumb">
                  {auction.imageUrls && auction.imageUrls[0] ? (
                    <img src={auction.imageUrls[0]} alt="" />
                  ) : null}
                </span>
                <span className="slg-live-title">{auction.title}</span>
                <span className="slg-live-bid">${(auction.currentBid || 0).toLocaleString()}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
