import { useEffect, useRef, useState } from 'react';
import websocketService from '../services/websocket.js';
import { useLocation } from 'react-router-dom';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    // Connect to WebSocket
    if (!websocketService.socket || !websocketService.isConnected) {
      websocketService.connect();
    }

    // Set up connection status listener
    const handleConnection = (data) => {
      setIsConnected(data.connected);
      setSocketId(websocketService.getConnectionStatus().socketId);
    };

    websocketService.on('connection', handleConnection);

    // Check initial connection status
    const initialStatus = websocketService.getConnectionStatus();
    setIsConnected(initialStatus.connected);
    setSocketId(initialStatus.socketId);

    // Capture the current listeners map for cleanup
    const currentListeners = listenersRef.current;

    // Cleanup on unmount
    return () => {
      websocketService.off('connection', handleConnection);
      // Remove all listeners for this hook instance
      currentListeners.forEach((callback, event) => {
        websocketService.off(event, callback);
      });
      currentListeners.clear();
    };
  }, []);

  // Generic event listener
  const addEventListener = (event, callback) => {
    websocketService.on(event, callback);
    listenersRef.current.set(event, callback);
  };

  // Remove event listener
  const removeEventListener = (event, callback) => {
    websocketService.off(event, callback);
    listenersRef.current.delete(event);
  };

  return {
    socket: websocketService.socket,
    isConnected,
    socketId,
    addEventListener,
    removeEventListener,
    joinConversation: websocketService.joinConversation.bind(websocketService),
    leaveConversation: websocketService.leaveConversation.bind(websocketService),
    sendMessage: websocketService.sendMessage.bind(websocketService),
    markMessageAsRead: websocketService.markMessageAsRead.bind(websocketService),
    sendTyping: websocketService.sendTyping.bind(websocketService),
  };
};

// -------------------- Messaging hook --------------------
// Hook specifically for messaging functionality
export const useMessaging = () => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const location = useLocation();

  const {
    socket,
    isConnected,
    addEventListener,
    removeEventListener,
    joinConversation,
    leaveConversation,
    sendMessage,
    markMessageAsRead,
    sendTyping,
  } = useWebSocket();

  useEffect(() => {
    // Listen for/ handle new messages
    const handleNewMessage = async (data) => {
      const message = data.message || data;

      try {
        // await markMessageAsRead(message.id);
      } catch (err) {
        console.error('Error marking live admin message as read:', err);
      }

      if (location.pathname === '/messages' && message.isFromAdmin) {
        try {
          await markMessageAsRead(message.id, message.conversationId);
        } catch (err) {
          console.error('Error marking live admin message as read:', err);
        }
      }

      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    };

    // Listen for message read events
    const handleMessageRead = (data) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === data.messageId ? { ...msg, isRead: true } : msg))
      );
    };

    // Listen for conversation updates
    const handleConversationUpdate = (conversation) => {
      // Only process valid conversations with required data
      if (!conversation || !conversation.conversation_id || !conversation.email) {
        return;
      }

      setConversations((prev) => {
        const index = prev.findIndex(
          (conv) => conv.conversation_id === conversation.conversation_id
        );
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...conversation };
          return updated;
        }
        return [...prev, conversation];
      });
    };

    // Listen for typing events
    const handleTypingStart = (data) => {
      setTypingUsers((prev) => (prev.includes(data.userId) ? prev : [...prev, data.userId]));
    };

    const handleTypingStop = (data) => {
      setTypingUsers((prev) => prev.filter((u) => u !== data.userId));
    };

    // Add event listeners
    addEventListener('new_message', handleNewMessage);
    addEventListener('message_read', handleMessageRead);
    addEventListener('conversation_updated', handleConversationUpdate);
    addEventListener('typing_start', handleTypingStart);
    addEventListener('typing_stop', handleTypingStop);

    // Cleanup
    return () => {
      removeEventListener('new_message', handleNewMessage);
      removeEventListener('message_read', handleMessageRead);
      removeEventListener('conversation_updated', handleConversationUpdate);
      removeEventListener('typing_start', handleTypingStart);
      removeEventListener('typing_stop', handleTypingStop);
    };
  }, [addEventListener, removeEventListener, location.pathname, markMessageAsRead]);

  // Typing indicator management
  const startTyping = (conversationId) => {
    setIsTyping(true);
    sendTyping(conversationId, true);
  };

  const stopTyping = (conversationId) => {
    setIsTyping(false);
    sendTyping(conversationId, false);
  };

  return {
    socket,
    isConnected,
    messages,
    setMessages,
    conversations,
    setConversations,
    isTyping,
    typingUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    markMessageAsRead,
    startTyping,
    stopTyping,
  };
};
