import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyItNow, getBids, placeBid } from '../../services/fetch-bids.js';
import { useUserStore } from '../../stores/userStore.js';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';

export default function AuctionCard({ auction }) {
  const id = auction.id;
  const { user } = useUserStore();

  const [selectedImage, setSelectedImage] = useState(auction.imageUrls[0]);
  const [bids, setBids] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [highestBid, setHighestBid] = useState(auction.currentBid || 0);
  const [isActive, setIsActive] = useState(auction.isActive);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleImageClick = (url) => setSelectedImage(url);
  const handleEdit = () => navigate(`/admin/auctions/${id}`);

  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');

  const [showConfirmBIN, setShowConfirmBIN] = useState(false);

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
        toast.error('Error fetching bids', {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'auction-list-1',
          autoClose: false,
        });
      }
    };
    fetchBids();
  }, [id]);

  const handleBuyItNow = async () => {
    try {
      await buyItNow({ auctionId: id, userId: user.id });
      return true;
    } catch (e) {
      console.error(e.message || 'Error fetching BIN');
      toast.error('Error bidding "BIN"', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'auction-list-1',
        autoClose: false,
      });
    }
  };

  return (
    <>
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
            {isActive && (
              <p
                style={{
                  fontSize: '1.2rem',
                  borderBottom: '1px solid grey',
                  padding: '.5rem',
                  color: '#ffd500',
                }}
              >
                <strong>Current Bid:</strong> ${highestBid}
              </p>
            )}
            <div className="bin-end-time-wrapper">
              <p>
                <strong>BIN:</strong> ${auction.buyNowPrice || '—'}
              </p>
              <p>
                <strong>Ends: </strong>
                {new Date(auction.endTime).toLocaleTimeString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="auction-actions">
            {isActive ? (
              <>
                <button onClick={() => setShowBidModal(true)} className="bid-btn">
                  Place Bid
                </button>
                {auction.buyNowPrice && (
                  <button onClick={() => setShowConfirmBIN(true)} className="buy-btn">
                    Buy Now
                  </button>
                )}
              </>
            ) : (
              <p className="bidding-closed">Bidding is CLOSED</p>
            )}
          </div>
          <p style={{ fontSize: '.9rem', marginTop: '.5rem', marginBottom: 0 }}>
            Total Bids {bids.length}
          </p>

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
      {showBidModal &&
        createPortal(
          <div className="bid-modal-overlay" role="dialog" aria-modal="true">
            <div className="bid-modal">
              <h3>Place a Bid</h3>
              <input
                type="number"
                min={
                  (highestBid >= (auction.startPrice || 0) ? highestBid : auction.startPrice) + 1
                }
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Enter amount greater than $${highestBid >= (auction.startPrice || 0) ? highestBid : auction.startPrice}`}
                className="bid-input"
              />
              <div className="modal-actions">
                <button
                  onClick={async () => {
                    try {
                      const startPrice = auction.startPrice || 0;
                      const startPriceMet = highestBid >= startPrice;
                      const minAllowedBid = startPriceMet ? highestBid : startPrice;

                      if (Number(bidAmount) <= minAllowedBid) {
                        toast(`Bid must be greater than $${minAllowedBid}`, { theme: 'dark' });
                        return;
                      }

                      await placeBid({ auctionId: id, userId: user.id, bidAmount });
                      const updated = await getBids(id);
                      setBids(updated);
                      setHighestBid(updated[0].bidAmount);
                      setBidAmount('');
                      setShowBidModal(false);
                    } catch (err) {
                      console.error('Error placing bid:', err);
                    }
                  }}
                  className="confirm-bid-btn"
                >
                  Submit Bid
                </button>
                <button onClick={() => setShowBidModal(false)} className="cancel-bid-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {showConfirmBIN &&
        createPortal(
          <div className="bid-modal-overlay" role="dialog" aria-modal="true">
            <div className="bid-modal">
              <h3>Confirm Purchase</h3>
              <p style={{ marginBottom: '1rem' }}>
                Are you sure you want to buy <strong>{auction.title}</strong> for $
                {auction.buyNowPrice}?
              </p>
              <div className="modal-actions">
                <button
                  onClick={async () => {
                    try {
                      await handleBuyItNow();
                      setIsActive(false);
                      toast.success('Purchase successful', {
                        theme: 'colored',
                        toastId: 'auction-card-1',
                      });
                    } catch (err) {
                      console.error(err);
                      toast.error('Error completing purchase', {
                        theme: 'colored',
                        toastId: 'auction-card-2',
                      });
                    } finally {
                      setShowConfirmBIN(false);
                    }
                  }}
                  className="confirm-bid-btn"
                >
                  Yes, Buy Now
                </button>
                <button onClick={() => setShowConfirmBIN(false)} className="cancel-bid-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
