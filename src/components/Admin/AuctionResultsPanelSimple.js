import './AuctionResultsPanelSimple.css';
import { Link } from 'react-router-dom';
import Loading from '../Loading/Loading.js';

export default function AuctionResultsPanelSimple({ auctions, loading }) {
  if (loading) return <Loading />;

  if (auctions.length === 0)
    return <p className="admin-active-auctions-empty-message">No active auctions.</p>;

  return (
    <ul className="admin-active-auctions-list">
      {auctions.map((auction) => (
        <li key={auction.id}>
          <Link className="admin-active-auctions-row" to={`/auctions/${auction.id}`}>
            <span className="admin-active-auctions-thumbnail">
              {auction.imageUrls && auction.imageUrls[0] ? (
                <img src={auction.imageUrls[0]} alt="" />
              ) : null}
            </span>
            <span className="admin-active-auctions-title">{auction.title}</span>
            <span className="admin-active-auctions-current-bid">
              ${(auction.currentBid || 0).toLocaleString()}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
