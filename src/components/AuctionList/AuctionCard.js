import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyItNow, getBids } from '../../services/fetch-bids.js';
import { swapAuctionOrPost } from '../../services/fetch-utils.js';
import { useUserStore } from '../../stores/userStore.js';
import { toast } from 'react-toastify';
import { useProfileStore } from '../../stores/profileStore.js';
import { useAuctionEventsStore } from '../../stores/auctionEventsStore.js';
import { getAuctionResults } from '../../services/fetch-auctions.js';
import './AuctionCard.css';
import AuctionBidModal from './AuctionBidModal';
import ConfirmBINModal from './ConfirmBINModal';
import AuctionRulesModal from './AuctionRulesModal.js';
import { CATEGORIES } from '../PostForm/PostForm.js';

export default function AuctionCard({ auction }) {
  const isUserRestricted = () => {
    const restrictedUsers = (process.env.REACT_APP_RESTRICTED_USER_ID || '')
      .split(',')
      .map((id) => id.trim());
    return user && restrictedUsers.includes(String(user.id));
  };
  const lastBidUpdate = useAuctionEventsStore((s) => s.lastBidUpdate);
  const lastBuyNowId = useAuctionEventsStore((s) => s.lastBuyNowId);

  const id = Number(auction.id);
  const { user, isAdmin } = useUserStore();
  const { profile, address } = useProfileStore();

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

  const lastAuctionEnded = useAuctionEventsStore((s) => s.lastAuctionEnded);
  const lastAuctionExtended = useAuctionEventsStore((s) => s.lastAuctionExtended);

  const [showRules, setShowRules] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapCategory, setSwapCategory] = useState('');

  // set up listener for websocket auction end event
  useEffect(() => {
    if (!lastAuctionEnded) return;
    if (Number(lastAuctionEnded) !== Number(id)) return;

    setIsActive(false);
  }, [lastAuctionEnded, id]);

  useEffect(() => {
    if (!lastAuctionExtended) return;

    // Only for THIS auction card
    if (Number(lastAuctionExtended.id) !== Number(id)) return;

    const newEnd = lastAuctionExtended.newEndTime;
    if (!newEnd) return;
  }, [lastAuctionExtended, id]);

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
      toast.warn(
        <span style={{ fontSize: '.9rem' }}>
          Please complete your profile (name and avatar) before bidding or buying. Thank you!
        </span>,
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

    // Address scrutiny

    if (!address) {
      toast.warn(
        <span style={{ fontSize: '.9rem' }}>
          Please complete your address before bidding or buying by clicking the gear icon for
          settings in your Account page. Thank you!
        </span>,
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
    const { addressLine1, city, state, postalCode, countryCode } = address;
    if (
      !addressLine1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !postalCode?.trim() ||
      !countryCode?.trim()
    ) {
      toast.info(
        <span style={{ fontSize: '.9rem' }}>
          Please complete your address (all required fields) before bidding or buying by clicking
          the gear for settings in your Account page. Thank you!
        </span>,

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
    if (isUserRestricted()) {
      toast.error('Your account is restricted from bidding.', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'auction-list-restricted',
        autoClose: false,
      });
      return;
    }
    if (checkProfileCompletion()) {
      setShowBidModal(true);
    }
  };

  const handleBuyNowClick = () => {
    if (!user) {
      return handleNavAuth();
    }
    if (isUserRestricted()) {
      toast.error('Your account is restricted from buying.', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'auction-list-restricted-bin',
        autoClose: false,
      });
      return;
    }
    if (checkProfileCompletion()) {
      setShowConfirmBIN(true);
    }
  };

  const hasBids = highestBid > 0;
  const highestBidderUserId = bids[0]?.userId;
  const hasHighBidder = highestBidderUserId !== undefined && highestBidderUserId !== null;
  const isCurrentUserHighBidder =
    user?.id !== undefined &&
    user?.id !== null &&
    hasHighBidder &&
    String(highestBidderUserId) === String(user.id);

  const handleSwap = async () => {
    try {
      await swapAuctionOrPost('auction', id, swapCategory);
      setShowSwapModal(false);
      navigate('/auctions');
      toast.success('Auction successfully swapped to gallery post.', {
        theme: 'colored',
        toastId: 'auction-swap-success',
        draggable: true,
        draggablePercent: 60,
        autoClose: 4000,
      });
      // Optionally, trigger UI update or navigation here
    } catch (err) {
      setShowSwapModal(false);
      toast.error('Error swapping auction. Please try again.', {
        theme: 'colored',
        toastId: 'auction-swap-error',
        draggable: true,
        draggablePercent: 60,
        autoClose: 6000,
      });
    }
  };

  const handleOpenSwapModal = () => {
    setShowSwapModal(true);
  };

  const handleCloseSwapModal = () => {
    setShowSwapModal(false);
    setSwapCategory('');
  };

  return (
    <>
      <div className="auction-card">
        <div className="auction-card-images">
          <img
            className="auction-card-main-image"
            src={selectedImage}
            alt={auction.title}
            onClick={() => (!isMobile ? window.open(selectedImage, '_blank') : '')}
          />
          <div className="auction-card-thumbnail-row">
            {auction.imageUrls.map((url) => (
              <img
                key={url}
                src={url}
                alt="auction-card-thumbnail"
                className={`auction-card-thumbnail ${url === selectedImage ? 'auction-card-thumbnail--selected' : ''}`}
                onClick={() => handleImageClick(url)}
              />
            ))}
          </div>
        </div>

        <div className="auction-card-info">
          <div
            style={{
              width: '110%',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            {user && isAdmin && (
              <>
                {(isActive || bids.length === 0) && (
                  <button className="auction-card-swap-button" onClick={handleOpenSwapModal}>
                    ↳↰
                  </button>
                )}
                <button className="auction-card-edit-button" onClick={handleEdit}>
                  ✎
                </button>
              </>
            )}
          </div>

          <h2>{auction.title}</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{auction.description}</p>

          <div className="auction-card-details">
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
            </p>

            {!hasBids && (
              <p>
                <span>Opening Bid:</span>
                <span className="auction-card-price">
                  {' '}
                  <strong> ${auction.startPrice || ' - '}</strong>{' '}
                </span>
              </p>
            )}
            <div className="auction-card-buy-now-row">
              <p>
                <span>BIN:</span>
                <span className="auction-card-price">
                  <strong> ${auction.buyNowPrice || ' - '}</strong>
                </span>
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

          <div className="auction-card-actions">
            {isActive ? (
              <>
                <button
                  type="button"
                  onClick={handleBidClick}
                  className="auction-card-bid-button"
                  style={{ background: isCurrentUserHighBidder ? 'green' : '' }}
                >
                  {isCurrentUserHighBidder ? "You're the high bidder" : 'Place Bid'}
                </button>
                {auction.buyNowPrice && (
                  <button
                    type="button"
                    onClick={handleBuyNowClick}
                    className="auction-card-buy-button"
                  >
                    Buy Now
                  </button>
                )}
              </>
            ) : (
              <div>
                <p className="auction-card-bidding-closed">Bidding is CLOSED</p>
                {hasHighBidder && <span style={{ fontSize: '.9rem' }}>Winner:</span>}
                <div className="auction-card-bid-entry">
                  {hasHighBidder && (
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
                        className="auction-card-bid-avatar"
                      />
                      {auctionResults?.profile?.firstName}
                    </span>
                  )}

                  <span style={{ fontSize: '.9rem', fontWeight: 'normal' }}>
                    {auctionResults?.reason === 'buy_now' ? 'Buy It Now' : 'Time Expired'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '.9rem', marginTop: '.5rem', marginBottom: 0 }}>
              Total Bids {bids.length}
            </p>
            <p
              style={{
                fontSize: '.85rem',
                textDecoration: 'underline',
                cursor: 'pointer',
                opacity: 0.8,
                marginTop: '.5rem',
              }}
              onClick={() => setShowRules(true)}
            >
              Auction Rules
            </p>
          </div>
          {!isActive ? (
            <p style={{ fontStyle: 'italic', marginTop: '.5rem', opacity: 0.7 }}></p>
          ) : (
            bids.length > 0 && (
              <div className="auction-card-bid-history">
                {bids.map((bid) => (
                  <div key={bid.id} className="auction-card-bid-entry">
                    <img
                      src={bid.user?.imageUrl}
                      alt={bid.user?.firstName}
                      className="auction-card-bid-avatar"
                    />
                    <div className="auction-card-bid-details">
                      <span className="auction-card-bid-name">{bid.user?.firstName}</span>
                      <span className="auction-card-bid-amount">${bid.bidAmount}</span>
                      <span className="auction-card-bid-time">
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
            toast.success('Purchase successful', {
              theme: 'colored',
              toastId: 'auction-card-1',
              draggable: true,
              draggablePercent: 60,
              autoClose: false,
            });
          } catch (err) {
            console.error(err);
            toast.error('Error completing purchase', {
              theme: 'colored',
              toastId: 'auction-card-2',
              draggable: true,
              draggablePercent: 60,
              autoClose: false,
            });
          }
        }}
      />
      <AuctionRulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
      {showSwapModal && (
        <div className="bid-modal-overlay" role="dialog" aria-modal="true">
          <div className="bid-modal">
            <h3>Confirm Swap</h3>
            <p>
              Are you sure you want to swap this auction to a gallery post? This action cannot be
              undone.
            </p>
            <div className="form-select-wrapper">
              <select
                className="form-select"
                value={swapCategory}
                onChange={(event) => setSwapCategory(event.target.value)}
              >
                <option value="" disabled>
                  Choose category
                </option>
                {CATEGORIES.map((categoryName) => (
                  <option key={categoryName} value={categoryName}>
                    {categoryName}
                  </option>
                ))}
              </select>
            </div>
            <div className="bid-modal-actions">
              <button
                className="bid-modal-confirm-button"
                onClick={handleSwap}
                disabled={!swapCategory}
              >
                Confirm
              </button>
              <button className="bid-modal-cancel-button" onClick={handleCloseSwapModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
