import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyItNow, getBids } from '../../services/fetch-bids.js';
import { useUserStore } from '../../stores/userStore.js';
import { toast } from 'react-toastify';
import { useProfileStore } from '../../stores/profileStore.js';
import { useAuctionEventsStore } from '../../stores/auctionEventsStore.js';
import { getAuctionResults } from '../../services/fetch-auctions.js';
import './AuctionCard.css';
import AuctionBidModal from './AuctionBidModal';
import ConfirmBINModal from './ConfirmBINModal';

export default function AuctionCard({ auction }) {
  const lastBidUpdate = useAuctionEventsStore((s) => s.lastBidUpdate);
  const lastBuyNowId = useAuctionEventsStore((s) => s.lastBuyNowId);

  const id = Number(auction.id);
  const { user, isAdmin } = useUserStore();
  const { profile } = useProfileStore();

  const [selectedImage, setSelectedImage] = useState(auction.imageUrls[0]);
  const [bids, setBids] = useState([]);
  const [highestBid, setHighestBid] = useState(auction.currentBid || 0);
  const [isActive, setIsActive] = useState(auction.isActive);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');
  const [showBidModal, setShowBidModal] = useState(false);
  const [showConfirmBIN, setShowConfirmBIN] = useState(false);
  const [auctionResults, setAuctionResults] = useState();

  useEffect(() => {
    if (!auction.endTime) return;

    const updateCountdown = () => {
      const diff = new Date(auction.endTime) - new Date();

      if (diff <= 0) {
        setTimeLeft('Auction ended');
        return;
      }

      const totalHours = Math.floor(diff / 3600000);
      const days = Math.floor(totalHours / 24);
      const hrs = totalHours % 24;
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      if (totalHours >= 24) {
        setTimeLeft(`${days}d ${hrs}h ${mins}m ${secs}s`);
      } else {
        setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime]);

  // initialize/ set isActive
  useEffect(() => {
    setIsActive(auction.isActive);
  }, [auction.isActive]);

  // buy now change (via websockets)
  useEffect(() => {
    if (lastBuyNowId === id) {
      setIsActive(false);
    }
  }, [lastBuyNowId, id]);

  // update bids (via websockets)
  useEffect(() => {
    if (lastBidUpdate?.id === id) {
      // Only refetch bids for THIS auction
      (async () => {
        try {
          const data = await getBids(id);
          if (Array.isArray(data)) {
            setBids(data);
            if (data.length > 0) setHighestBid(data[0].bidAmount);
          }
        } catch (err) {
          console.error('Error updating bids after socket event:', err);
        }
      })();
    }
  }, [lastBidUpdate, id]);

  // fetch bids and auction results
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const data = await getBids(id);
        if (Array.isArray(data)) {
          setBids(data);

          if (data.length > 0) setHighestBid(data[0].bidAmount);
        }

        const resultData = await getAuctionResults(id);
        console.log('resultData', resultData);

        setAuctionResults(resultData);
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
  }, [id, isActive]);

  const handleImageClick = (url) => {
    setSelectedImage(url);
  };

  const handleEdit = () => {
    navigate(`/admin/auctions/${id}`);
  };

  const handleNavAuth = () => {
    toast.info('Must be signed in to bid', {
      theme: 'colored',
      draggable: true,
      draggablePercent: 60,
      toastId: 'auction-list-2',
      autoClose: false,
    });
    navigate('/auth/sign-in');
  };

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
        toastId: 'auction-list-3',
        autoClose: false,
      });
    }
  };

  const checkProfileCompletion = () => {
    if (!profile) {
      return false;
    }

    const { firstName, lastName, imageUrl, userId } = profile;

    // Must match logged-in user and have non-empty values
    if (
      !user ||
      !user.id ||
      user.id !== userId ||
      !firstName?.trim() ||
      !lastName?.trim() ||
      !imageUrl?.trim()
    ) {
      toast.info(
        `Please complete your profile (name and avatar) before bidding or buying. Thank you!`,
        {
          theme: 'dark',
          draggable: true,
          draggablePercent: 60,
          autoClose: false,
        }
      );
      navigate('/account');
      return false;
    }

    return true;
  };

  const handleBidClick = () => {
    if (!user) {
      return handleNavAuth();
    }
    if (checkProfileCompletion()) {
      setShowBidModal(true);
    }
  };

  const handleBuyNowClick = () => {
    if (!user) {
      return handleNavAuth();
    }
    if (checkProfileCompletion()) {
      setShowConfirmBIN(true);
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
            {user && isAdmin && (
              <button className="edit-auction-icon-btn" onClick={handleEdit}>
                ✎
              </button>
            )}
          </div>

          <h2>{auction.title}</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{auction.description}</p>

          <div className="auction-details">
            <p
              style={{
                fontSize: '1.2rem',
                borderBottom: '1px solid grey',
                padding: '.5rem',
                color: isActive ? '#ffd500' : '#ddd',
              }}
            >
              {isActive && (
                <span>
                  <strong>Current Bid:</strong> ${highestBid}
                </span>
              )}

              {isActive && (
                <span
                  style={{
                    fontSize: '.9rem',
                    color: 'white',
                    display: 'block',
                    fontWeight: 'bold',
                  }}
                >
                  {bids[0]?.userId === user?.id ? "You're the high bidder!" : ''}
                </span>
              )}
            </p>

            <div className="bin-end-time-wrapper">
              <p>
                <strong>BIN:</strong> ${auction.buyNowPrice || '—'}
              </p>
              {isActive && (
                <p
                  style={{
                    backgroundColor: 'black',
                    padding: '.5rem',
                    display: 'block',
                    marginTop: '.5rem',
                    textAlign: 'center',
                    border: '1px solid yellow',
                    fontWeight: 'bold',
                  }}
                >
                  <strong>Ends: </strong>
                  {new Date(auction.endTime).toLocaleTimeString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                  <br />
                  <span
                    style={{
                      color: isActive ? '#ffd500' : '',
                    }}
                  >
                    {timeLeft}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="auction-actions">
            {isActive ? (
              <>
                <button type="button" onClick={handleBidClick} className="bid-btn">
                  Place Bid
                </button>
                {auction.buyNowPrice && (
                  <button type="button" onClick={handleBuyNowClick} className="buy-btn">
                    Buy Now
                  </button>
                )}
              </>
            ) : (
              <div>
                <p className="bidding-closed">Bidding is CLOSED</p>
                <div className="bid-entry">
                  <span
                    style={{
                      fontSize: '.9rem',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center',
                    }}
                  >
                    {' '}
                    <img
                      src={auctionResults?.profile?.imageUrl}
                      alt={auctionResults?.profile?.firstName}
                      className="bid-avatar"
                    />
                    {auctionResults?.profile?.firstName}
                  </span>

                  <span style={{ fontSize: '.9rem', fontWeight: 'normal' }}>
                    {auctionResults?.reason === 'buy_now' ? 'Buy It Now' : 'Time Expired'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <p style={{ fontSize: '.9rem', marginTop: '.5rem', marginBottom: 0 }}>
            Total Bids {bids.length}
          </p>

          {!isActive ? (
            <p style={{ fontStyle: 'italic', marginTop: '.5rem', opacity: 0.7 }}></p>
          ) : (
            bids.length > 0 && (
              <div className="bid-history">
                {bids.map((bid) => (
                  <div key={bid.id} className="bid-entry">
                    <img
                      src={bid.user?.imageUrl}
                      alt={bid.user?.firstName}
                      className="bid-avatar"
                    />
                    <div className="bid-info">
                      <span className="bid-name">{bid.user?.firstName}</span>
                      <span className="bid-amount">${bid.bidAmount}</span>
                      <span className="bid-time">
                        {new Date(bid.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
      <AuctionBidModal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        highestBid={highestBid}
        auction={auction}
        id={id}
        user={user}
        setBids={setBids}
        setHighestBid={setHighestBid}
      />

      <ConfirmBINModal
        isOpen={showConfirmBIN}
        onClose={() => setShowConfirmBIN(false)}
        auction={auction}
        onConfirm={async () => {
          try {
            await handleBuyItNow();
            setIsActive(false);
            toast.success('Purchase successful', { theme: 'colored', toastId: 'auction-card-1' });
          } catch (err) {
            console.error(err);
            toast.error('Error completing purchase', {
              theme: 'colored',
              toastId: 'auction-card-2',
            });
          }
        }}
      />
    </>
  );
}
