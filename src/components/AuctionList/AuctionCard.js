import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBids } from '../../services/fetch-bids.js';

export default function AuctionCard({ auction }) {
  const id = auction.id;
  const [selectedImage, setSelectedImage] = useState(auction.imageUrls[0]);
  const [bids, setBids] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [highestBid, setHighestBid] = useState(auction.currentBid || 0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleImageClick = (url) => setSelectedImage(url);
  const handleEdit = () => navigate(`/admin/auctions/${id}`);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const data = await getBids(id);
        if (Array.isArray(data)) {
          setBids(data);
          if (data.length > 0) setHighestBid(data[0].bidAmount);
        }
      } catch (err) {
        console.error('Error fetching bids:', err);
      }
    };
    fetchBids();
  }, [id]);

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
          <button className="edit-auction-icon-btn" onClick={handleEdit}>
            ✎
          </button>
        </div>

        <h2>{auction.title}</h2>
        <p className="auction-description">{auction.description}</p>

        <div className="auction-details">
          <p>
            <strong>Current Bid:</strong> ${highestBid}
          </p>
          <p>
            <strong>Total Bids:</strong> {bids.length}
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
          {auction.buyNowPrice && <button className="buy-btn">Buy Now</button>}
        </div>

        {bids.length > 0 && (
          <div className="bid-history">
            <button className="view-bids-btn" onClick={() => setShowHistory((prev) => !prev)}>
              {showHistory ? 'Hide Bid History' : 'View Bid History'}
            </button>

            {showHistory && (
              <ul className="bids-list">
                {bids.slice(0, 10).map((bid, index) => (
                  <li key={bid.id || index} className="bid-entry">
                    <span>${bid.bidAmount}</span>{' '}
                    <small>
                      {new Date(bid.createdAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
