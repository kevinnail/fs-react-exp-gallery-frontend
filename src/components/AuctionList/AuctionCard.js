import { useState } from 'react';

export default function AuctionCard({ auction }) {
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
