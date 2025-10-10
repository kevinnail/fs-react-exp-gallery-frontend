import { useEffect, useState } from 'react';
import './Auctions.css';

export default function AuctionList() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await fetch('/api/auctions');
        const data = await res.json();
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

function AuctionCard({ auction }) {
  const [selectedImage, setSelectedImage] = useState(auction.image_urls[0]);
  const handleImageClick = (url) => setSelectedImage(url);

  return (
    <div className="auction-card">
      <div className="auction-image-section">
        <img
          className="main-image"
          src={selectedImage}
          alt={auction.title}
          onClick={() => window.open(selectedImage, '_blank')}
        />
        <div className="thumbnail-row">
          {auction.image_urls.map((url) => (
            <img
              key={url}
              src={url}
              alt="thumbnail"
              className={`thumbnail ${url === selectedImage ? 'active' : ''}`}
              onClick={() => handleImageClick(url)}
            />
          ))}
        </div>
      </div>

      <div className="auction-info-section">
        <h2>{auction.title}</h2>
        <p className="auction-description">{auction.description}</p>

        <div className="auction-details">
          <p>
            <strong>Current Bid:</strong> ${auction.current_bid}
          </p>
          <p>
            <strong>Buy Now:</strong> ${auction.buy_now_price || '—'}
          </p>
          <p>
            <strong>Ends:</strong> {new Date(auction.end_time).toLocaleString()}
          </p>
        </div>

        <div className="auction-actions">
          <button className="bid-btn">Place Bid</button>
          {auction.buy_now_price && <button className="buy-btn">Buy Now</button>}
        </div>
      </div>
    </div>
  );
}
