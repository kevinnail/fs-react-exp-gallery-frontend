import { useEffect, useCallback } from 'react';
import { useUserStore } from '../stores/userStore.js';
import { getMyMessages } from '../services/fetch-messages.js';
import websocketService from '../services/websocket.js';
import { useLocation } from 'react-router-dom';

export const useUnreadMessages = () => {
  const { unreadMessageCount, setUnreadMessageCount, user } = useUserStore();
  const location = useLocation();

  const checkUnreadMessages = useCallback(async () => {
    if (location.pathname === '/messages') {
      setUnreadMessageCount(0);
      return;
    }

    if (!user) {
      setUnreadMessageCount(0);
      return;
    }

    try {
      const messages = await getMyMessages();
      const unreadCount = messages.filter((m) => !m.isRead && m.isFromAdmin).length;
      setUnreadMessageCount(unreadCount);
    } catch (error) {
      console.error(' error during unread check:', error);
      setUnreadMessageCount(0);
    }
  }, [user, setUnreadMessageCount, location.pathname]);

  useEffect(() => {
    // If user is on /messages, always reset
    if (location.pathname === '/messages') {
      setUnreadMessageCount(0);
      return;
    }

    // If there are no unread messages currently tracked, skip re-check
    // (prevents triggering when leaving /messages after clearing)
    if (unreadMessageCount === 0) {
      return;
    }

    checkUnreadMessages();
  }, [user, checkUnreadMessages, location.pathname, setUnreadMessageCount, unreadMessageCount]);

  // WebSocket listener setup
  useEffect(() => {
    if (!user) return;

    if (location.pathname === '/messages') {
      websocketService.off('new_message');
      websocketService.off('message_read');
      websocketService.off('conversation_updated');
      return;
    }

    const handleAnyMessage = (data) => {
      if (location.pathname === '/messages') {
        return;
      }
      checkUnreadMessages();
    };

    websocketService.on('new_message', handleAnyMessage);
    websocketService.on('message_read', handleAnyMessage);
    websocketService.on('conversation_updated', handleAnyMessage);

    return () => {
      websocketService.off('new_message', handleAnyMessage);
      websocketService.off('message_read', handleAnyMessage);
      websocketService.off('conversation_updated', handleAnyMessage);
    };
  }, [user, location.pathname, checkUnreadMessages]);

  return {
    unreadMessageCount,
    refreshUnreadCount: checkUnreadMessages,
  };
};
