import { io } from 'socket.io-client';

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
      });

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
        this.emit('connection', { connected: false, error });
      });

      // Message events
      this.socket.on('new_message', (message) => {
        console.info('Received new message:', message);
        this.emit('new_message', message);
      });

      this.socket.on('message_read', (data) => {
        console.info('Message marked as read:', data);
        this.emit('message_read', data);
      });

      this.socket.on('conversation_updated', (conversation) => {
        console.info('Conversation updated:', conversation);
        this.emit('conversation_updated', conversation);
      });

      this.socket.on('user_typing', (data) => {
        if (data.isTyping) {
          this.emit('typing_start', data);
        } else {
          this.emit('typing_stop', data);
        }
      });
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
      //eslint-disable-next-line no-console
      console.warn('Socket not connected, cannot send message');
    }
  }

  // Mark message as read
  markMessageAsRead(messageId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_message_read', messageId);
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

// Create and export a singleton instance
const websocketService = new WebSocketService();
export default websocketService;
