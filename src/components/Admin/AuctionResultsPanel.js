import { useEffect, useState } from 'react';
import { getBids } from '../../services/fetch-bids.js';
import { getAuctions } from '../../services/fetch-auctions.js';
import './AuctionResultsPanel.css';

export default function AuctionResultsPanel() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allAuctions = await getAuctions();

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
      } catch (err) {
        console.error('Error loading auctions:', err);
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
        <h3>Auction Results</h3>
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
    </aside>
  );
}
