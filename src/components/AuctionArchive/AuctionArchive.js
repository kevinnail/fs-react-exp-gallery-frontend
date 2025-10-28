import { useEffect, useState } from 'react';
import { getAuctions } from '../../services/fetch-auctions.js';
import { useNavigate } from 'react-router-dom';

export default function AuctionArchive() {
  const [auctions, setAuctions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const all = await getAuctions();
      const now = Date.now();
      const archive = all.filter(
        (a) => !a.isActive && now - new Date(a.endTime).getTime() >= 48 * 60 * 60 * 1000
      );
      setAuctions(archive);
    }
    load();
  }, []);

  return (
    <div className="messages-container">
      <div className="messages-content">
        <h1>Archive</h1>
        <p>Collected glass art - final prices private</p>
        <div className="auction-grid">
          {auctions.map((a) => (
            <div
              key={a.id}
              className="auction-preview-item"
              onClick={() => navigate(`/auctions/${a.id}`)}
            >
              <img src={a.imageUrls[0]} alt={a.title} className="auction-preview-img" />
              <h3>{a.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
