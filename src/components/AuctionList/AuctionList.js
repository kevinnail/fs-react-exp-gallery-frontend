import { useEffect, useState } from 'react';
import './AuctionList.css';
import { getAuctions } from '../../services/fetch-auctions.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import websocketService from '../../services/websocket.js';
import { useUserStore } from '../../stores/userStore.js';
import { useNotificationStore } from '../../stores/notificationStore.js';
import { getBids } from '../../services/fetch-bids.js';

function AuctionPreviewItem({ auction, onClick }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!auction?.endTime) return;

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
  }, [auction?.endTime]);

  const hasEnded = !auction.isActive;
  const highBid = auction.currentBid || auction.startPrice;

  return (
    <div className="auction-preview-item" onClick={onClick}>
      <img src={auction.imageUrls?.[0]} alt={auction.title} className="auction-preview-img" />
      <div style={{ marginTop: '.4rem' }}>
        {hasEnded ? (
          <>
            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Collected</div>
            <div style={{ fontSize: '.85rem', opacity: 0.7 }}>final price private</div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#ffd500' }}>${highBid}</div>
            <div style={{ fontSize: '.9rem', opacity: 0.9, color: '#ffd500' }}>{timeLeft}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuctionList() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isAdmin } = useUserStore();
  const [lastBidUpdate, setLastBidUpdate] = useState(null);
  const [lastBuyNowId, setLastBuyNowId] = useState(null);
  const { markAuctionsRead } = useNotificationStore();

  useEffect(() => {
    const handleBidPlaced = async ({ auctionId }) => {
      try {
        // fetch latest bids for that auction and update currentBid in the list
        const data = await getBids(auctionId);
        const newHigh = Array.isArray(data) && data.length ? data[0].bidAmount : null;

        setAuctions((prev) =>
          prev.map((a) => (a.id === auctionId ? { ...a, currentBid: newHigh ?? a.currentBid } : a))
        );

        setLastBidUpdate(auctionId); // keep your existing semantic if other parts rely on it
      } catch (err) {
        console.error('Error updating currentBid after bid-placed:', err);
      }
    };

    websocketService.on('bid-placed', handleBidPlaced);
    return () => websocketService.off('bid-placed', handleBidPlaced);
  }, []);

  // fetch auctions
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const data = await getAuctions();

        setAuctions(data);
      } catch (err) {
        console.error('Error fetching auctions', err);
        toast.error(`Error saving auction: ${err.message}`, {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'auction-list-1',
          autoClose: false,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  // set up listener for websocket auction end event
  useEffect(() => {
    const handleAuctionStart = ({ auction }) => {
      setAuctions((prev) => [...prev, auction]);
    };

    websocketService.on('auction-created', handleAuctionStart);

    return () => {
      websocketService.off('auction-created', handleAuctionStart);
    };
  }, []);

  // set up listener for websocket auction end event
  useEffect(() => {
    const handleAuctionEnd = ({ auctionId }) => {
      setAuctions((prev) => {
        const updated = prev.map((a) => {
          return a.id === auctionId ? { ...a, isActive: false } : a;
        });

        return updated;
      });
    };

    websocketService.on('auction-ended', handleAuctionEnd);

    return () => {
      websocketService.off('auction-ended', handleAuctionEnd);
    };
  }, []);

  // set up listener for websocket auction new bid event
  useEffect(() => {
    const handleBidPlaced = ({ auctionId }) => {
      setLastBidUpdate(auctionId);
    };

    websocketService.on('bid-placed', handleBidPlaced);

    return () => {
      websocketService.off('bid-placed', handleBidPlaced);
    };
  }, []);

  // set up listener for websocket auction BIN event
  useEffect(() => {
    const handleBuyItNow = (auctionId) => {
      setLastBuyNowId(auctionId);
      // optionally also update list state:
      setAuctions((prev) => prev.map((a) => (a.id === auctionId ? { ...a, isActive: false } : a)));
    };

    websocketService.on('auction-BIN', handleBuyItNow);

    return () => websocketService.off('auction-BIN', handleBuyItNow);
  }, []);

  useEffect(() => {
    markAuctionsRead();
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

  const now = Date.now();
  const active = auctions.filter((a) => a.isActive);
  const ended = auctions.filter((a) => !a.isActive);
  const recentEnded = ended.filter(
    (a) => now - new Date(a.endTime).getTime() < 48 * 60 * 60 * 1000
  );

  const displayAuctions = [...active, ...recentEnded];

  const handleNavArchive = () => {
    navigate('/auctions/archive');
  };

  return (
    <div className="messages-container">
      <div className="messages-content">
        {user && isAdmin && (
          <button className="add-edit-auctions" onClick={() => navigate('/admin/auctions')}>
            Add/ Edit Auctions
          </button>
        )}
        <div className="messages-header">
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginBottom: '1rem',
              padding: 0,
            }}
          >
            ← Back
          </button>
          <h1 style={{ margin: 0 }}>Glass Art Auctions</h1>

          <p style={{ margin: 0, padding: 0 }}>Bid, watch, or buy instantly.</p>
          <p style={{ margin: '.5rem .5rem' }}>
            <span
              onClick={() => {
                handleNavArchive();
              }}
              style={{ color: '#aaa', fontSize: '.9rem', cursor: 'pointer' }}
            >
              View archive
            </span>
          </p>
        </div>
        <div className="auction-list">
          {auctions.length === 0 ? (
            <p>No active auctions right now.</p>
          ) : (
            <div className="auction-grid">
              {auctions.length === 0 ? (
                <p>No active auctions right now.</p>
              ) : (
                displayAuctions.map((auction) => (
                  <AuctionPreviewItem
                    key={auction.id}
                    auction={auction}
                    onClick={() => navigate(`/auctions/${auction.id}`)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
