import { useEffect, useState } from 'react';
import { getBids } from '../../services/fetch-bids.js';
import {
  getAdminAuctions,
  markAuctionPaid,
  updateAuctionTracking,
} from '../../services/fetch-auctions.js';
import './AuctionResultsPanel.css';
import { toast } from 'react-toastify';

export default function AuctionResultsPanel() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingAuctionId, setTrackingAuctionId] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');

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

  return (
    <aside className="auction-results-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3>Auctions</h3>
        <span style={{ color: '#9f9' }}>${activeTotal.toLocaleString()}</span>
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

          return (
            <div
              key={a.id}
              className={`auction-result-item ${isClosed ? 'closed' : 'active-auction'}`}
            >
              {image ? (
                <img src={image} alt={a.title} className="auction-result-thumb" />
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
