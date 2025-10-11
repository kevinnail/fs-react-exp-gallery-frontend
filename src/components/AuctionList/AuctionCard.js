import { useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuctionCard({ auction }) {
  const id = auction.id;

  const [selectedImage, setSelectedImage] = useState(auction.imageUrls[0]);
  const handleImageClick = (url) => setSelectedImage(url);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleEdit = async () => {
    navigate(`/admin/auctions/${id}`);
  };

  return (
    <div className="auction-card">
      <div className="auction-image-section">
        <img
          className="main-image"
          src={selectedImage}
          alt={auction.title}
          onClick={() => (!isMobile ? window.open(selectedImage, '_blank') : '')}
        />
        <div className="thumbnail-row">
          {auction.imageUrls.map((url) => (
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
        <div
          style={{
            width: '110%',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          {' '}
          <button className="edit-auction-icon-btn" onClick={handleEdit}>
            ✎
          </button>{' '}
        </div>
        <h2>{auction.title}</h2>
        <p className="auction-description">{auction.description}</p>
        <div className="auction-details">
          <p>
            <strong>Current Bid:</strong> ${auction.currentBid}
          </p>
          <p>
            <strong>Buy Now:</strong> ${auction.buyNowPrice || '—'}
          </p>
          <p>
            <strong>Ends:</strong>{' '}
            {new Date(auction.endTime).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
            })}
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
