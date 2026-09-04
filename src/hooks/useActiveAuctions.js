import { useEffect, useState } from 'react';
import { getAdminAuctions } from '../services/fetch-auctions.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//  Active auctions for the admin dashboard.

export function useActiveAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const allAuctions = await getAdminAuctions();
        setAuctions(allAuctions.filter((auction) => auction.isActive));
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

  return { auctions, loading, error };
}
