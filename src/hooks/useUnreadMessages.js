import { useEffect, useCallback } from 'react';
import { useUserStore } from '../stores/userStore.js';
import { getMyMessages } from '../services/fetch-messages.js';
import websocketService from '../services/websocket.js';

export const useUnreadMessages = () => {
  const { unreadMessageCount, setUnreadMessageCount, user } = useUserStore();

  const checkUnreadMessages = useCallback(async () => {
    if (!user) {
      setUnreadMessageCount(0);
      return;
    }

    try {
      const messages = await getMyMessages();
      // Count unread admin messages (messages from admin that haven't been read)
      const unreadCount = messages.filter(
        (message) => !message.isRead && message.isFromAdmin
      ).length;

      setUnreadMessageCount(unreadCount);
    } catch (error) {
      console.error('Error checking unread messages:', error);
      setUnreadMessageCount(0);
    }
  }, [user, setUnreadMessageCount]);

  useEffect(() => {
    checkUnreadMessages();
  }, [user, checkUnreadMessages]);

  // WebSocket event handlers for real-time updates
  useEffect(() => {
    if (!user) return;

    const handleAnyMessage = () => {
      checkUnreadMessages();
    };

    websocketService.on('new_message', handleAnyMessage);
    websocketService.on('new_customer_message', handleAnyMessage);
    websocketService.on('message_read', handleAnyMessage);
    websocketService.on('conversation_updated', handleAnyMessage);

    return () => {
      websocketService.off('new_message', handleAnyMessage);
      websocketService.off('new_customer_message', handleAnyMessage);
      websocketService.off('message_read', handleAnyMessage);
      websocketService.off('conversation_updated', handleAnyMessage);
    };
  }, [user, checkUnreadMessages]);

  return {
    unreadMessageCount,
    refreshUnreadCount: checkUnreadMessages,
  };
};
