import './AuctionResultsPanelSimple.css';
import { Link } from 'react-router-dom';
import Loading from '../Loading/Loading.js';

export default function AuctionResultsPanelSimple({ auctions, loading }) {
  if (loading) return <Loading />;

  if (auctions.length === 0) return <p className="slg-auction-empty">No active auctions.</p>;

  return (
    <ul className="slg-auction-list">
      {auctions.map((auction) => (
        <li key={auction.id}>
          <Link className="slg-auction-row" to={`/auctions/${auction.id}`}>
            <span className="slg-auction-thumb">
              {auction.imageUrls && auction.imageUrls[0] ? (
                <img src={auction.imageUrls[0]} alt="" />
              ) : null}
            </span>
            <span className="slg-auction-title">{auction.title}</span>
            <span className="slg-auction-bid">${(auction.currentBid || 0).toLocaleString()}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
