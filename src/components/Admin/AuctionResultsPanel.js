import { useEffect, useState } from 'react';
import { getBids } from '../../services/fetch-bids.js';
import {
  getAdminAuctions,
  markAuctionPaid,
  updateAuctionTracking,
} from '../../services/fetch-auctions.js';
import './AuctionResultsPanel.css';
import { toast } from 'react-toastify';
import websocketService from '../../services/websocket.js';
import { useNavigate } from 'react-router-dom';

export default function AuctionResultsPanel() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingAuctionId, setTrackingAuctionId] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');
  // simple tracking state: set when a user clicks the shipping thumbnail so other code
  // (or tests) that expect `tracking` to be set will work. This state does NOT toggle
  // the thumbnail; the thumbnail is shown only when the auction already has a trackingNumber.
  const [tracking, setTracking] = useState('');
  const navigate = useNavigate();

  const openTrackingModal = (auctionId, existingTracking = '') => {
    setTrackingAuctionId(auctionId);
    setTrackingInput(existingTracking);
    setShowTrackingModal(true);
  };

  const handleSaveTracking = async () => {
    try {
      await updateAuctionTracking(trackingAuctionId, trackingInput.trim());

      setAuctions((prev) =>
        prev.map((x) =>
          x.id === trackingAuctionId ? { ...x, trackingNumber: trackingInput.trim() } : x
        )
      );

      setShowTrackingModal(false);
      toast.success('Tracking saved', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        toastId: 'auction-track-fail',
        autoClose: false,
      });
    } catch (e) {
      toast.error(`${e.message}` || 'Error saving tracking', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'auction-track-fail',
        autoClose: false,
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const allAuctions = await getAdminAuctions();

        // hydrate each auction with top bid + bidder if available
        const withResults = await Promise.all(
          allAuctions.map(async (auction) => {
            try {
              const bids = await getBids(auction.id);
              if (!Array.isArray(bids) || bids.length === 0)
                return { ...auction, winner: null, topBid: null };

              const topBid = bids.reduce((max, b) => (b.bidAmount > max.bidAmount ? b : max));
              return { ...auction, winner: topBid.user, topBid };
            } catch (e) {
              console.error('Error fetching bids for auction', auction.id, e);
              return { ...auction, winner: null, topBid: null };
            }
          })
        );

        setAuctions(withResults);
      } catch (e) {
        console.error('Error loading auctions:', e);
        toast.error(`${e.message}` || 'Error loading auctions', {
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

    loadData();

    // subscribe to websocket events so the admin panel updates in real time
    const handleAuctionEnded = async (payload) => {
      // payload may be an object like { auctionId } or just auctionId
      const auctionId = payload && (payload.auctionId || payload.id || payload);
      if (!auctionId) return;

      // optimistically mark auction closed
      setAuctions((prev) => prev.map((a) => (a.id === auctionId ? { ...a, isActive: false } : a)));

      try {
        // fetch latest bids to hydrate winner/topBid if any
        const bids = await getBids(auctionId);
        if (Array.isArray(bids) && bids.length > 0) {
          const topBid = bids.reduce((max, b) => (b.bidAmount > max.bidAmount ? b : max));
          setAuctions((prev) =>
            prev.map((a) =>
              a.id === auctionId ? { ...a, topBid, winner: topBid.user, isActive: false } : a
            )
          );
        }

        toast.success('Auction has ended.', { theme: 'dark', autoClose: 3000 });
      } catch (e) {
        console.error('Error hydrating auction after end event', auctionId, e);
      }
    };

    // 'user-won' can contain more specific info; treat it similarly
    const handleUserWon = async (payload) => {
      const auctionId = payload && (payload.auctionId || payload.id || payload);
      if (!auctionId) return handleAuctionEnded(payload);
      // re-use same logic
      await handleAuctionEnded(payload);
    };

    websocketService.connect();
    websocketService.on('auction-ended', handleAuctionEnded);
    websocketService.on('user-won', handleUserWon);

    return () => {
      websocketService.off('auction-ended', handleAuctionEnded);
      websocketService.off('user-won', handleUserWon);
    };
  }, []);

  if (loading) {
    return (
      <aside className="auction-results-panel">
        <p>Loading results...</p>
      </aside>
    );
  }

  const activeTotal = auctions
    .filter((a) => a.isActive)
    .reduce((sum, a) => sum + (a.topBid?.bidAmount || 0), 0);

  const handleNavTracking = (auction) => {
    // If auction has a tracking number, open USPS tracking for that number.
    // Otherwise open the USPS main site. Open in a new tab.
    try {
      if (auction && auction.trackingNumber) {
        const url = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(
          auction.trackingNumber
        )}`;
        window.open(url, '_blank');
      } else {
        window.open('https://tools.usps.com', '_blank');
      }
    } catch (e) {
      // fallback to navigation in-app if window.open fails
      console.error('Error opening tracking link', e);
      navigate('https://tools.usps.com');
    }
  };

  // small helper to avoid inline multi-line handlers in JSX (keeps indentation shallow)
  const handleShippingClick = (trackingNumber, auction) => {
    setTracking(trackingNumber || '');
    handleNavTracking(auction);
  };

  return (
    <aside className="auction-results-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3>Auctions</h3>
        <div>
          <span>active bids total:</span>
          <span style={{ color: '#9f9' }}> ${activeTotal.toLocaleString()}</span>
        </div>
      </div>
      <div className="auction-results-list" data-current-tracking={tracking}>
        {auctions.map((a) => {
          const isClosed = !a.isActive;
          const winnerName = a.winner
            ? `${a.winner.firstName || ''} ${a.winner.lastName || ''}`.trim()
            : '—';
          const finalBid = a.topBid?.bidAmount ?? a.currentBid ?? a.startPrice;
          const image = a.imageUrls?.[0];
          const highBid = a.topBid ? a.topBid.bidAmount : 0;

          const handleTogglePaid = async (auctionId, currentPaid) => {
            try {
              await markAuctionPaid(auctionId, !currentPaid);

              setAuctions((prev) =>
                prev.map((x) => (x.id === auctionId ? { ...x, isPaid: !currentPaid } : x))
              );
            } catch (e) {
              console.error('Error marking auction paid');
              toast.error(`${e.message}` || 'Error marking auction paid', {
                theme: 'colored',
                draggable: true,
                draggablePercent: 60,
                toastId: 'auction-list-1',
                autoClose: false,
              });
            }
          };

          return (
            <div
              key={a.id}
              className={`auction-result-item ${isClosed ? 'closed' : 'active-auction'}`}
            >
              {image ? (
                <div style={{ display: 'grid' }}>
                  <img src={image} alt={a.title} className="auction-result-thumb" />

                  {isClosed && a.trackingNumber ? (
                    <img
                      src={image}
                      alt={`${a.title} shipping`}
                      className="auction-result-thumb"
                      onClick={() => handleShippingClick(a.trackingNumber, a)}
                      style={{ cursor: 'pointer' }}
                    />
                  ) : null}
                </div>
              ) : (
                <div className="auction-result-thumb placeholder" />
              )}

              <div className="auction-result-info">
                {isClosed && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button
                      onClick={() => handleTogglePaid(a.id, a.isPaid)}
                      style={{
                        padding: '4px 8px',
                        background: a.isPaid ? '#2a2' : '#a22',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: 'white',
                        fontSize: '0.8rem',
                        width: '40%',
                      }}
                    >
                      {a.isPaid ? 'Paid' : 'Mark Paid'}
                    </button>
                    {a.isPaid && (
                      <button
                        onClick={() => openTrackingModal(a.id, a.trackingNumber)}
                        style={{
                          padding: '4px 8px',
                          background: '#464646ff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: 'white',
                          fontSize: '0.8rem',
                          width: '40%',
                        }}
                      >
                        {a.trackingNumber ? `...${a.trackingNumber.slice(-4)}` : 'Tracking'}
                      </button>
                    )}
                  </div>
                )}

                <h4 title={a.title}>{a.title}</h4>

                <p>
                  <span>Status:</span> {isClosed ? 'Closed' : 'Active'}
                </p>

                <p>
                  <span>{isClosed ? 'Winner:' : 'High Bidder:'}</span> {winnerName || 'No bids'}
                </p>

                {isClosed && (
                  <p>
                    <span>Owes:</span> {a.topBid ? `$${finalBid.toLocaleString()}` : '—'}
                  </p>
                )}

                <p>
                  <span>High Bid:</span> {highBid ? `$${highBid.toLocaleString()}` : 'No bids'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {showTrackingModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#222',
              padding: '20px',
              borderRadius: '8px',
              width: '300px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <h4 style={{ margin: 0 }}>Enter Tracking</h4>

            <input
              type="text"
              placeholder="USPS Tracking Number"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #555',
                background: '#111',
                color: 'white',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setShowTrackingModal(false)}
                style={{
                  padding: '6px 12px',
                  background: '#444',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: 'white',
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleSaveTracking}
                style={{
                  padding: '6px 12px',
                  background: '#2a2',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: 'white',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
