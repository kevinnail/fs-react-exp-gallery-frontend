import { useEffect } from 'react';
import { useUserStore } from '../stores/userStore.js';
import { getConversations, getMyMessages } from '../services/fetch-messages.js';
import websocketService from '../services/websocket.js';

export const useUnreadMessages = () => {
  const { user, unreadMessageCount, setUnreadMessageCount, isAdmin } = useUserStore();

  const refreshUnreadCount = async () => {
    if (!user) return;

    try {
      if (isAdmin) {
        const conversations = await getConversations();
        const unread = conversations.reduce((acc, c) => {
          return acc + Number(c.unread_count || 0);
        }, 0);
        setUnreadMessageCount(unread);
      } else {
        const messages = await getMyMessages();
        const unread = messages.filter((m) => !m.isRead && m.isFromAdmin).length;
        setUnreadMessageCount(unread);
      }
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

  useEffect(() => {
    if (!user) return;

    // always fetch on login, admin or not
    refreshUnreadCount();
  }, [user]);

  return {
    unreadMessageCount,
    refreshUnreadCount,
    setUnreadMessageCount,
  };
};
