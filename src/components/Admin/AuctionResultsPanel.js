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
import { useAuctionEventsStore } from '../../stores/auctionEventsStore.js';
import { useNavigate } from 'react-router-dom';

export default function AuctionResultsPanel() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingAuctionId, setTrackingAuctionId] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');
  const navigate = useNavigate();

  const lastBidUpdate = useAuctionEventsStore((s) => s.lastBidUpdate);
  useEffect(() => {
    if (!lastBidUpdate) return;
    const auctionId = Number(lastBidUpdate.id);

    (async () => {
      try {
        const bids = await getBids(auctionId);
        if (Array.isArray(bids) && bids.length > 0) {
          const topBid = bids.reduce((max, b) => (b.bidAmount > max.bidAmount ? b : max));
          setAuctions((prev) =>
            prev.map((a) =>
              Number(a.id) === auctionId ? { ...a, topBid, winner: topBid.user } : a
            )
          );
        }
      } catch (err) {
        console.error('Error updating admin high bid:', err);
      }
    })();
  }, [lastBidUpdate]);

  const openTrackingModal = (auctionId, existingTracking = '') => {
    setTrackingAuctionId(auctionId);
    setTrackingInput(existingTracking);
    setShowTrackingModal(true);
  };
  const handleSaveTracking = async () => {
    setLoading(true);
    try {
      const response = await updateAuctionTracking(trackingAuctionId, trackingInput.trim());

      setAuctions((prev) =>
        prev.map((x) =>
          x.id === trackingAuctionId ? { ...x, trackingNumber: trackingInput.trim() } : x
        )
      );

      if (response) {
        setShowTrackingModal(false);
        setLoading(false);
        toast.success('Tracking saved and email sent!', {
          theme: 'dark',
          draggable: true,
          draggablePercent: 60,
          toastId: 'auction-track-fail',
          autoClose: 3000,
        });
      }
    } catch (e) {
      toast.error(`${e.message}` || 'Error saving tracking', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'auction-track-fail',
        autoClose: 3000,
      });
      setLoading(false);
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
  //
  //

  // Shipping links are plain anchors to USPS — no JS navigation helper needed.

  return (
    <aside className="auction-results-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3>Auctions</h3>
        <div>
          <span>active bids total:</span>
          <span style={{ color: '#9f9' }}> ${activeTotal.toLocaleString()}</span>
        </div>
      </div>
      <div className="auction-results-list">
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
          const navAuction = (auctionId) => {
            navigate(`/auctions/${auctionId}`);
          };
          return (
            <div
              key={a.id}
              className={`auction-result-item ${isClosed ? 'closed' : 'active-auction'}`}
            >
              {image || !image ? (
                <div style={{ display: 'grid' }}>
                  <img
                    src={image}
                    alt={a.title}
                    onClick={() => {
                      navAuction(a.id);
                    }}
                    className="auction-result-thumb"
                  />
                  {isClosed && a.trackingNumber && (
                    <a
                      href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(
                        a.trackingNumber
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View tracking for ${a.title}`}
                    >
                      <img
                        alt="USPS"
                        className="auction-result-thumb"
                        style={{ width: '50px', height: '50px', margin: '.5rem 0 0 .25rem' }}
                        src="../../../usps.png"
                      />
                    </a>
                  )}
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
