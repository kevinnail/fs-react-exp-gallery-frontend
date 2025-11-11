import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAuctions } from '../../services/fetch-auctions.js';
import { getBids } from '../../services/fetch-bids.js';
import './AuctionCarousel.css';
import { useAuctionEventsStore } from '../../stores/auctionEventsStore.js';

export default function AuctionCarousel() {
  const [auctions, setAuctions] = useState([]);
  const navigate = useNavigate();
  const lastAuctionCreated = useAuctionEventsStore((s) => s.lastAuctionCreated);

  useEffect(() => {
    const fetchAuctionsAndBids = async () => {
      try {
        const data = await getAuctions();
        const active = data.filter((a) => a.isActive);

        // Fetch bids for each auction
        const auctionsWithBids = await Promise.all(
          active.map(async (auction) => {
            try {
              const bids = await getBids(auction.id);

              const highestBid = bids.length ? Math.max(...bids.map((b) => b.bidAmount)) : null;
              return { ...auction, highestBid };
            } catch (err) {
              console.error(`Error fetching bids for auction ${auction.id}`, err);
              return { ...auction, highestBid: null };
            }
          })
        );

        setAuctions(auctionsWithBids);
      } catch (e) {
        console.error('Error fetching auctions:', e);
      }
    };

    fetchAuctionsAndBids();
  }, [lastAuctionCreated]);

  if (!auctions.length) return null;

  // Duplicate list for seamless scroll
  const doubled = [...auctions, ...auctions];

  return (
    <Box className="auction-carousel">
      <div className="carousel-track">
        {doubled.map((auction, i) => (
          <div
            key={`${auction.id}-${i}`}
            className="carousel-item"
            onClick={() => navigate(`/auctions`)}
          >
            <img
              src={auction.imageUrls?.[0] || '/placeholder.png'}
              alt={auction.title}
              className="carousel-img"
            />
            <div className="carousel-caption">
              {auction.highestBid ? `High bid: $${auction.highestBid} – ` : 'No bids yet – '}
              Ends{' '}
              {new Date(auction.endTime).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
}
