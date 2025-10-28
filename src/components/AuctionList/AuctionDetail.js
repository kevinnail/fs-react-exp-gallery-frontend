import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuctions } from '../../services/fetch-auctions.js';
import websocketService from '../../services/websocket.js';
import AuctionCard from './AuctionCard.js';

export default function AuctionDetail() {
  const { id } = useParams();
  const auctionId = Number(id);

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);

  // these replicate the exact "poke" signals your card already knows how to react to
  const [lastBidUpdate, setLastBidUpdate] = useState(null);
  const [lastBuyNowId, setLastBuyNowId] = useState(null);

  const navigate = useNavigate();

  // load this one auction
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const all = await getAuctions();
        const found = all.find((a) => Number(a.id) === auctionId) || null;
        if (isMounted) setAuction(found);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [auctionId]);

  // live sockets for exactly this auction - replicate the old trigger semantics 1:1
  useEffect(() => {
    if (!auctionId) return;

    const onBidPlaced = ({ auctionId: aId }) => {
      if (Number(aId) !== auctionId) return;
      // tell the card to refetch its own bids (preserves your existing behavior)
      setLastBidUpdate(auctionId);
    };

    const onBuyItNow = (aId) => {
      if (Number(aId) !== auctionId) return;
      // tell the card to close itself; also reflect locally for the header/badges
      setLastBuyNowId(auctionId);
      setAuction((prev) => (prev ? { ...prev, isActive: false } : prev));
    };

    const onAuctionEnded = ({ auctionId: aId }) => {
      if (Number(aId) !== auctionId) return;
      setAuction((prev) => (prev ? { ...prev, isActive: false } : prev));
    };

    websocketService.on('bid-placed', onBidPlaced);
    websocketService.on('auction-BIN', onBuyItNow);
    websocketService.on('auction-ended', onAuctionEnded);

    return () => {
      websocketService.off('bid-placed', onBidPlaced);
      websocketService.off('auction-BIN', onBuyItNow);
      websocketService.off('auction-ended', onAuctionEnded);
    };
  }, [auctionId]);

  if (loading) {
    return (
      <div className="messages-container">
        <div className="messages-content">
          <p>Loading auction...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="messages-container">
        <div className="messages-content">
          <p>Not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-content">
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

        <AuctionCard auction={auction} lastBidUpdate={lastBidUpdate} lastBuyNowId={lastBuyNowId} />
      </div>
    </div>
  );
}
