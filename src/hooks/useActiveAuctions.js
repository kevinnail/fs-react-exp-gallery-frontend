import { useEffect, useState } from 'react';
import { getAdminAuctions } from '../services/fetch-auctions.js';
import { hasRealTracking } from '../components/Admin/AdminSales/saleStatus.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//  Active auctions for the admin dashboard, plus how many closed ones are waiting to ship.

export function useActiveAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [auctionsToShipCount, setAuctionsToShipCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const allAuctions = await getAdminAuctions();
        setAuctions(allAuctions.filter((auction) => auction.isActive));
        setAuctionsToShipCount(
          allAuctions.filter(
            (auction) => auction.isPaid && !hasRealTracking(auction.trackingNumber)
          ).length
        );
      } catch (fetchError) {
        setAuctions([]);
        setError(fetchError.message);
        toast.error(`Error fetching auctions: ${fetchError.message}`, {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'useActiveAuctions-1',
          autoClose: false,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { auctions, auctionsToShipCount, loading, error };
}
