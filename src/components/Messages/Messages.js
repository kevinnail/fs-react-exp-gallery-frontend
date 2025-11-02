import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore.js';
import {
  getMyMessages,
  sendMessage,
  replyToConversation,
  markMessageAsReadFetchCall,
} from '../../services/fetch-messages.js';
import { getAdminProfile } from '../../services/fetch-utils.js';
import { useUnreadMessages } from '../../hooks/useUnreadMessages.js';
import { useMessaging } from '../../hooks/useWebSocket.js';
import './Messages.css';

export default function Messages() {
  const { isAdmin } = useUserStore();
  const location = useLocation();
  const { refreshUnreadCount } = useUnreadMessages();
  const {
    isConnected,
    messages,
    setMessages,
    typingUsers,
    joinConversation,
    leaveConversation,
    markMessageAsRead: markWebSocketMessageAsRead,
    startTyping,
    stopTyping,
  } = useMessaging();

  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [pieceMetadata, setPieceMetadata] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesListRef = useRef(null);
  const navigate = useNavigate();

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messageData = await getMyMessages();
      setMessages(messageData);

      // Get conversation ID from first message if available
      if (messageData.length > 0) {
        const convId = messageData[0].conversationId;
        setConversationId(convId);

        // Join the conversation room for real-time updates
        if (isConnected && convId) {
          joinConversation(convId);
        }
      }

      // Mark all unread admin messages as read when messages are loaded
      const unreadAdminMessages = messageData.filter(
        (message) => !message.isRead && message.isFromAdmin
      );

      for (const message of unreadAdminMessages) {
        try {
          await markMessageAsReadFetchCall(message.id);
          const res = await getMyMessages();
          console.log(
            'DB says unread:',
            res.filter((m) => !m.isRead).map((m) => m.id)
          );

          // Also mark via WebSocket for real-time updates
          if (isConnected) {
            markWebSocketMessageAsRead(message.id);
          }
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      }

      refreshUnreadCount();
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminProfile = async () => {
    try {
      const adminData = await getAdminProfile();
      setAdminProfile(adminData);
    } catch (error) {
      console.error('Error loading admin profile:', error);
    }
  };

  const scrollToBottom = () => {
    const list = messagesListRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    loadMessages();
    loadAdminProfile();

    // Check if we have piece metadata from navigation
    if (location.state?.pieceMetadata) {
      setPieceMetadata(location.state.pieceMetadata);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Join conversation when connected and conversationId is available
  useEffect(() => {
    if (isConnected && conversationId) {
      joinConversation(conversationId);
    }

    return () => {
      if (conversationId) {
        leaveConversation(conversationId);
      }
    };
  }, [isConnected, conversationId, joinConversation, leaveConversation]);

  // Add a timeout to show connection status after a delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isConnected) {
        // eslint-disalble-next-line no-console
        console.error('WebSocket connection taking longer than expected');
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isConnected]);

  // Scroll to bottom when component mounts and messages are loaded
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages, loading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);

      let response;
      let messageToSend = newMessage;

      // Always include piece metadata if available (for both new conversations and replies)
      if (pieceMetadata) {
        messageToSend = `${newMessage}\n\n---\nAbout this piece: ${pieceMetadata.title} (${pieceMetadata.category}) - $${pieceMetadata.price}\nView: ${pieceMetadata.url}\nImage: ${pieceMetadata.imageUrl}`;
      }

      if (conversationId) {
        // Reply to existing conversation
        response = await replyToConversation(conversationId, messageToSend);
      } else {
        // Start new conversation
        response = await sendMessage(messageToSend);
        setConversationId(response.conversationId);

        // Join the new conversation room
        if (isConnected) {
          joinConversation(response.conversationId);
        }
      }

      setNewMessage('');
      // Clear piece metadata after sending
      setPieceMetadata(null);

      // Stop typing indicator
      if (conversationId) {
        stopTyping(conversationId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    const newDateString = new Date(dateString).toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      year: '2-digit',
    });
    const finalDateString = newDateString.replace(',', ' at  ');
    return finalDateString;
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (conversationId && isConnected) {
      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // If textarea is empty, stop typing immediately
      if (!value.trim()) {
        stopTyping(conversationId);
        return;
      }

      // Start typing indicator
      startTyping(conversationId);

      // Set new timeout to stop typing indicator
      const timeout = setTimeout(() => {
        stopTyping(conversationId);
      }, 1000);

      setTypingTimeout(timeout);
    }
  };

  const renderMessageWithPieceMetadata = (messageContent) => {
    // Check if message contains piece metadata
    const pieceMetadataMatch = messageContent.match(
      /About this piece: (.+?) \(([^)]+)\) - \$([^\n]+)\nView: (.+)/
    );
    if (pieceMetadataMatch) {
      const [, title, category, price, url] = pieceMetadataMatch;

      // Extract imageUrl from message content
      const imageMatch = messageContent.match(/Image: (.+)/);
      const imageUrl = imageMatch ? imageMatch[1] : null;

      const mainMessage = messageContent.split('\n\n---\n')[0];

      return (
        <>
          <p>{mainMessage}</p>
          <div className="piece-metadata-highlight">
            <div className="piece-metadata-highlight-content">
              {' '}
              <p>
                <img width="50px" src={imageUrl} alt={title} />
              </p>
              <h3>{title}</h3>
            </div>

            <p>
              <span>Category:</span> {category}
            </p>
            <p>
              <span>Price:</span> ${price}
            </p>
            <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#ffd700' }}>
              View piece
            </a>
          </div>
        </>
      );
    }

    return <p>{messageContent}</p>;
  };

  return (
    <div className="messages-container">
      <div className="messages-content">
        <div style={{ display: 'flex', justifyContent: 'flex-start', position: 'absolute' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '0.9rem',
              cursor: 'pointer',
              padding: 0,
              justifySelf: 'start',
            }}
          >
            ← Back
          </button>
        </div>
        <div className="messages-header">
          <h1 style={{ marginTop: '1rem' }}>Contact Kevin</h1>
        </div>

        <div className="conversation-container">
          {loading ? (
            <div className="loading-messages">
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="no-messages">
              <p>No messages yet. Start a conversation below!</p>
            </div>
          ) : (
            <div className="messages-list" ref={messagesListRef}>
              {messages.map((message) => {
                // In user view: user messages go right, admin messages go left
                const isUserMessage = !message.isFromAdmin && !isAdmin;
                return (
                  <div
                    key={message.id}
                    className={`message-item ${isUserMessage ? 'messages-user-message' : 'messages-admin-message'}`}
                  >
                    <span className="message-time">{formatDate(message.sentAt)}</span>
                    {isUserMessage ? (
                      <div className="message-content">
                        {renderMessageWithPieceMetadata(message.messageContent)}
                      </div>
                    ) : (
                      <div className="message-content-wrapper">
                        {adminProfile?.imageUrl ? (
                          <img
                            src={adminProfile.imageUrl}
                            alt="Admin avatar"
                            className="admin-avatar"
                          />
                        ) : (
                          <div className="admin-avatar-fallback">
                            {adminProfile?.firstName
                              ? adminProfile.firstName.charAt(0).toUpperCase()
                              : 'K'}
                          </div>
                        )}
                        <div className="message-content">
                          {renderMessageWithPieceMetadata(message.messageContent)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {pieceMetadata && (
            <div className="piece-metadata-display">
              <h3>Message about: {pieceMetadata.title}</h3>

              <div className="piece-info">
                <p>
                  <img width="50px" src={pieceMetadata.imageUrl} />
                </p>
                <p>
                  <strong>Category:</strong> {pieceMetadata.category}
                </p>
                <p>
                  <strong>Price:</strong> ${pieceMetadata.price}
                </p>
                <a href={pieceMetadata.url} target="_blank" rel="noopener noreferrer">
                  View piece details →
                </a>
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              <p>Kevin is typing...</p>
            </div>
          )}

          {/* Connection status indicator */}
          {!isConnected && (
            <div className="connection-status">
              <p>Connecting to real-time messaging...</p>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="message-form">
            <div className="input-container">
              <textarea
                value={newMessage}
                onChange={handleTyping}
                placeholder={
                  pieceMetadata
                    ? `Ask about ${pieceMetadata.title}...`
                    : 'Type your message here...'
                }
                className="message-input"
                rows="3"
                disabled={sending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); // stop newline
                    handleSendMessage(e); // submit
                  }
                }}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="send-button"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
