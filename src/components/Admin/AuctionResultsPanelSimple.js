import './AuctionResultsPanelSimple.css';
import { Link } from 'react-router-dom';
import Loading from '../Loading/Loading.js';

export default function AuctionResultsPanelSimple({ auctions, loading }) {
  if (loading) {
    return (
      <div className="slg-live">
        <Loading />
      </div>
    );
  }

  return (
    <div className="slg-live">
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
