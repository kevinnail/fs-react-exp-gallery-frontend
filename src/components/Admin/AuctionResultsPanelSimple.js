import React from 'react';
import './AuctionResultsPanelSimple.css';
import { getAdminAuctions } from '../../services/fetch-auctions.js';
import { useEffect, useState } from 'react';
import Loading from '../Loading/Loading.js';

export default function AuctionResultsPanelSimple() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const allAuctions = await getAdminAuctions();
        setAuctions(allAuctions.filter((a) => a.isActive));
      } catch (e) {
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <aside className="auction-results-panel-simple">
        <Loading />
      </aside>
    );
  }

  // Calculate total active bids
  const activeTotal = auctions.reduce((sum, auction) => sum + (auction.currentBid || 0), 0);
  return (
    <aside className="auction-results-panel-simple">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}
      >
        <h4 style={{ margin: 0 }}>Active Auction Bids: {`  `}</h4>
        <span style={{ color: '#9f9', fontWeight: 'bold', fontSize: '1.1rem' }}>
          ${activeTotal.toLocaleString()}
        </span>
      </div>
      <div className="auction-results-list-simple">
        {auctions.length === 0 ? (
          <div>No active auctions</div>
        ) : (
          auctions.map((auction) => {
            let bidAmount;
            if (auction.currentBid) {
              bidAmount = auction.currentBid;
            } else {
              bidAmount = 0;
            }
            return (
              <div key={auction.id} className="auction-result-item-simple">
                {auction.imageUrls && auction.imageUrls[0] ? (
                  <img
                    src={auction.imageUrls[0]}
                    alt={auction.title}
                    className="auction-result-thumb-simple"
                  />
                ) : null}
                <div className="auction-result-bid-simple">${bidAmount}</div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
