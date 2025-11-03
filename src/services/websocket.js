import { io } from 'socket.io-client';
import { useUserStore } from '../stores/userStore.js';

const BASE_URL = process.env.REACT_APP_HOME_URL;

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Initialize socket connection
  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    try {
      this.socket = io(BASE_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      window.ws = this.socket;

      this.socket.on('connect', () => {
        console.info('WebSocket connected:', this.socket.id);
        this.isConnected = true;
        this.emit('connection', { connected: true });
      });

      this.socket.on('disconnect', (reason) => {
        console.info('WebSocket disconnected:', reason);
        this.isConnected = false;
        this.emit('connection', { connected: false });
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.isConnected = false;
        this.emit('connection', { connected: false, error });
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.info('WebSocket reconnected after', attemptNumber, 'attempts');
        this.isConnected = true;
        this.emit('connection', { connected: true });
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('WebSocket reconnection error:', error);
        this.isConnected = false;
        this.emit('connection', { connected: false, error });
      });

      // Message events
      this.socket.on('new_message', (message) => {
        this.emit('new_message', message);
      });

      this.socket.on('new_customer_message', (data) => {
        this.emit('new_customer_message', data);
      });

      this.socket.on('message_read', (data) => {
        this.emit('message_read', data);
      });

      this.socket.on('conversation_updated', (conversation) => {
        this.emit('conversation_updated', conversation);
      });

      this.socket.on('user_typing', (data) => {
        if (data.isTyping) {
          this.emit('typing_start', data);
        } else {
          this.emit('typing_stop', data);
        }
      });

      this.socket.on('auction-created', (data) => {
        this.emit('auction-created', data);
      });

      this.socket.on('auction-ended', (data) => {
        this.emit('auction-ended', data);
      });

      this.socket.on('auction-extended', (data) => {
        this.emit('auction-extended', data);
      });

      this.socket.on('bid-placed', (data) => {
        this.emit('bid-placed', data);
      });

      this.socket.on('auction-BIN', (data) => {
        this.emit('auction-BIN', data);
      });

      this.socket.on('user-outbid', (data) => {
        this.emit('user-outbid', data);
      });

      this.socket.on('user-won', (data) => {
        this.emit('user-won', data);
      });
      //
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      this.emit('connection', { connected: false, error });
    }

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a conversation room
  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  // Leave a conversation room
  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  // Send a message
  sendMessage(messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', messageData);
    } else {
      console.warn('Socket not connected, cannot send message');
    }
  }

  // Mark message as read
  markMessageAsRead(messageId, conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_message_read', { messageId, conversationId });
    }
  }

  // Send typing indicator
  sendTyping(conversationId, isTyping) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { conversationId, isTyping });
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null,
    };
  }
}

let adminListenerAttached = false;

export function attachAdminListener() {
  if (adminListenerAttached) return;
  adminListenerAttached = true;

  const { setUnreadMessageCount } = useUserStore.getState();

  websocketService.on('new_customer_message', (data) => {
    const msg = data?.message || data;
    if (msg && !msg.isFromAdmin) {
      setUnreadMessageCount((prev) => prev + 1);
    }
  });
}

// Create and export a singleton instance
const websocketService = new WebSocketService();
export default websocketService;
