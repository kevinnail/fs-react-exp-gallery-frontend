import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAuctions } from '../../services/fetch-auctions.js';
import './AuctionCarousel.css';

export default function AuctionCarousel() {
  const [auctions, setAuctions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const data = await getAuctions();
        const active = data.filter((a) => a.is_active);
        setAuctions(active);
      } catch (e) {
        console.error('Error fetching auctions:', e);
      }
    };
    fetchAuctions();
  }, []);

  if (!auctions.length) return null;

  return (
    <Box className="auction-carousel">
      <div className="carousel-track">
        {auctions.map((auction) => (
          <div
            key={auction.id}
            className="carousel-item"
            onClick={() => navigate(`/auctions/${auction.id}`)}
          >
            <img
              src={auction.images?.[0]?.url || '/placeholder.png'}
              alt={auction.title}
              className="carousel-img"
            />
          </div>
        ))}
      </div>
    </Box>
  );
}
