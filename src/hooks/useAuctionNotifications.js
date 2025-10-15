import { useEffect, useState } from 'react';
import websocketService from '../services/websocket.js';

export function useAuctionNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    websocketService.on('user-outbid', () => {
      setUnreadCount((prev) => prev + 1);
    });
    return () => websocketService.off('user-outbid');
  }, []);

  return { unreadCount };
}
