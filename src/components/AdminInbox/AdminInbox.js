import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '../../stores/userStore.js';
import {
  getConversationById,
  addAdminReply,
  getConversations,
  markMessageAsReadFetchCall,
} from '../../services/fetch-messages.js';
import { useMessaging } from '../../hooks/useWebSocket.js';
import './AdminInbox.css';

export default function AdminInbox() {
  const { isAdmin } = useUserStore();
  const {
    socket,
    isConnected,
    messages,
    setMessages,
    conversations,
    setConversations,
    typingUsers,
    joinConversation,
    leaveConversation,
    markMessageAsRead: markWebSocketMessageAsRead,
    startTyping,
    stopTyping,
  } = useMessaging();

  const { setUnreadMessageCount } = useUserStore();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesListRef = useRef(null);

  const loadConversations = async (forceReload = false) => {
    try {
      setLoading(true);
      const conversationsData = await getConversations();

      // If getConversations returns conversation summaries, use them directly
      if (conversationsData && conversationsData.length > 0) {
        // Check if the data structure is already conversation summaries
        const firstItem = conversationsData[0];
        if (firstItem.conversation_id && firstItem.email) {
          // Data is already in conversation format
          if (forceReload || conversations.length === 0) {
            setConversations(conversationsData);
          }
        } else {
          // Data is in message format, need to group by conversation
          const conversationMap = new Map();
          conversationsData.forEach((message) => {
            const convId = Number(message.conversation_id);
            if (!conversationMap.has(convId)) {
              // Look for any message in this conversation that has a non-admin email
              const customerMessage = conversationsData.find(
                (m) => Number(m.conversation_id) === convId && m.email && !m.isFromAdmin
              );
              const customerEmail = customerMessage?.email || 'Unknown Customer';
              conversationMap.set(convId, {
                conversation_id: convId,
                email: customerEmail,
                image_url: message.image_url,
                message_count: 0,
                last_message_at: message.sentAt,
                unread_count: 0,
              });
            }
            const conv = conversationMap.get(convId);
            conv.message_count++;
            if (new Date(message.sentAt) > new Date(conv.last_message_at)) {
              conv.last_message_at = message.sentAt;
            }
            if (!message.isRead && !message.isFromAdmin) {
              conv.unread_count++;
            }
          });

          const conversations = Array.from(conversationMap.values());
          if (forceReload || conversations.length === 0) {
            setConversations(conversations);
          }
        }
      } else {
        if (forceReload || conversations.length === 0) {
          setConversations([]);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationMessages = async (conversationId) => {
    try {
      const messageData = await getConversationById(conversationId);
      setMessages(messageData);
      setSelectedConversation(conversationId);

      // Join the conversation room for real-time updates
      if (isConnected) {
        joinConversation(conversationId);
      }

      // Mark all unread customer messages as read when conversation is opened
      const unreadCustomerMessages = messageData.filter(
        (message) => !message.isRead && !message.isFromAdmin
      );

      for (const message of unreadCustomerMessages) {
        try {
          await markMessageAsReadFetchCall(message.id);
          // Also mark via WebSocket for real-time updates
          if (isConnected) {
            markWebSocketMessageAsRead(message.id);
          }
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      }

      //  Reset unread message badge for admin
      setUnreadMessageCount(0);

      // Refresh conversations to update unread counts
      await loadConversations(true);

      // Scroll to bottom when conversation is opened
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim() || sending || !selectedConversation) return;

    try {
      setSending(true);

      socket.emit('send_message', {
        conversationId: selectedConversation,
        messageContent: newReply,
      });

      //clear state
      setNewReply('');

      // Stop typing indicator
      stopTyping(selectedConversation);

      // Refresh conversations to update unread counts and last message time
      await loadConversations(true);
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    const list = messagesListRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  };

  // Scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join conversation when connected and selectedConversation is available
  useEffect(() => {
    if (isConnected && selectedConversation) {
      joinConversation(selectedConversation);
    }

    return () => {
      if (selectedConversation) {
        leaveConversation(selectedConversation);
      }
    };
  }, [isConnected, selectedConversation, joinConversation, leaveConversation]);

  // load conversation on mount
  useEffect(() => {
    loadConversations();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh conversations when new messages arrive via WebSocket
  useEffect(() => {
    if (messages.length > 0) {
      // Check if the latest message is from a customer and not from admin
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && !latestMessage.isFromAdmin) {
        // Refresh conversations to pick up new conversations
        loadConversations(true);
      }
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleTyping = (e) => {
    const value = e.target.value;
    setNewReply(value);

    if (selectedConversation && isConnected) {
      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // If textarea is empty, stop typing immediately
      if (!value.trim()) {
        stopTyping(selectedConversation);
        return;
      }

      // Start typing indicator
      startTyping(selectedConversation);

      // Set new timeout to stop typing indicator
      const timeout = setTimeout(() => {
        stopTyping(selectedConversation);
      }, 1000);

      setTypingTimeout(timeout);
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

  const renderMessageWithPieceMetadata = (messageContent) => {
    if (!messageContent) {
      return <p>[Message unavailable]</p>;
    }
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
    <div className="admin-inbox-container">
      <div className="admin-inbox-content">
        <div className="inbox-header">
          <h1>Message Inbox</h1>
          <p>Customer conversations and messages</p>
        </div>

        <div className="inbox-layout">
          <div className="conversations-list">
            <h2>Conversations</h2>
            {loading ? (
              <div className="loading-conversations">
                <p>Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="no-conversations">
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="conversation-items">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.conversation_id}
                    className={`conversation-item ${
                      selectedConversation === conversation.conversation_id ? 'selected' : ''
                    }`}
                    onClick={() => loadConversationMessages(conversation.conversation_id)}
                  >
                    <div className="conversation-header">
                      <div className="conversation-header-content">
                        {conversation.image_url ? (
                          <img
                            src={conversation.image_url}
                            alt="Customer avatar"
                            className="conversation-avatar"
                          />
                        ) : (
                          <div className="conversation-avatar-fallback">
                            {conversation.email ? conversation.email.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                        <span className="sender-email">{conversation.email}</span>
                      </div>
                      <span className="message-count">{conversation.message_count} messages</span>
                    </div>
                    <div className="conversation-meta">
                      <span className="last-message-time">
                        {formatDate(conversation.last_message_at)}
                      </span>
                      {conversation.unread_count > 0 && (
                        <span className="unread-badge">{conversation.unread_count}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="messages-panel">
            {selectedConversation ? (
              <>
                <div className="messages-list" ref={messagesListRef}>
                  {messages.map((message) => {
                    // In admin view: customer messages go left, admin messages go right
                    const isCustomerMessage = !message.isFromAdmin && isAdmin;
                    return (
                      <div
                        key={message.id}
                        className={`admin-message-item ${isCustomerMessage ? 'admin-customer-message' : 'admin-admin-message'}`}
                      >
                        <span className="admin-message-time">{formatDate(message.sentAt)}</span>
                        {isCustomerMessage ? (
                          <div className="admin-message-content">
                            {renderMessageWithPieceMetadata(message.messageContent)}
                          </div>
                        ) : (
                          <div className="admin-message-content-wrapper">
                            <div className="admin-message-content">
                              {renderMessageWithPieceMetadata(message.messageContent)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                  <div className="typing-indicator">
                    <p>Customer is typing...</p>
                  </div>
                )}

                {/* Connection status indicator */}
                {!isConnected && (
                  <div className="connection-status">
                    <p>Connecting to real-time messaging...</p>
                  </div>
                )}

                <form onSubmit={handleSendReply} className="reply-form">
                  <div className="input-container">
                    <textarea
                      value={newReply}
                      onChange={handleTyping}
                      placeholder="Type your reply..."
                      className="reply-input"
                      rows="3"
                      disabled={sending}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply(e);
                        }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!newReply.trim() || sending}
                      className="reply-button"
                    >
                      {sending ? 'Sending...' : 'Reply'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="no-conversation-selected">
                <p>Select a conversation to view messages</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
