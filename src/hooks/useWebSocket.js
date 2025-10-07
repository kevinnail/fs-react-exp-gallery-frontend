import { useEffect, useRef, useState } from 'react';
import websocketService from '../services/websocket.js';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Set up connection status listener
    const handleConnection = (data) => {
      setIsConnected(data.connected);
      setSocketId(websocketService.getConnectionStatus().socketId);
    };

    websocketService.on('connection', handleConnection);

    // Cleanup on unmount
    return () => {
      websocketService.off('connection', handleConnection);
      // Remove all listeners for this hook instance
      listenersRef.current.forEach((callback, event) => {
        websocketService.off(event, callback);
      });
      listenersRef.current.clear();
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

// Hook specifically for messaging functionality
export const useMessaging = () => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const {
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
    // Listen for new messages
    const handleNewMessage = (message) => {
      setMessages((prev) => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some((m) => m.id === message.id);
        if (!exists) {
          return [...prev, message];
        }
        return prev;
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
      setTypingUsers((prev) => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
    };

    const handleTypingStop = (data) => {
      setTypingUsers((prev) => prev.filter((userId) => userId !== data.userId));
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
  }, [addEventListener, removeEventListener]);

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
