import { useEffect } from 'react';
import { useUserStore } from '../stores/userStore.js';
import { getMyMessages } from '../services/fetch-messages.js';
import websocketService from '../services/websocket.js';

export const useUnreadMessages = () => {
  const { user, unreadMessageCount, setUnreadMessageCount, isAdmin } = useUserStore();

  const refreshUnreadCount = async () => {
    if (!user || isAdmin) return;

    try {
      const messages = await getMyMessages();
      const unreadCount = messages.filter((m) => !m.isRead && m.isFromAdmin).length;
      setUnreadMessageCount(unreadCount);
    } catch {
      setUnreadMessageCount(0);
    }
  };

  useEffect(() => {
    if (!user || isAdmin) return;

    const update = () => refreshUnreadCount();

    websocketService.on('new_message', update);
    websocketService.on('message_read', update);
    websocketService.on('conversation_updated', update);

    return () => {
      websocketService.off('new_message', update);
      websocketService.off('message_read', update);
      websocketService.off('conversation_updated', update);
    };
  }, [user, isAdmin]);

  return {
    unreadMessageCount,
    refreshUnreadCount,
    setUnreadMessageCount,
  };
};
