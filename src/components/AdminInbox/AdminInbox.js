import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore.js';
import {
  getConversationById,
  getConversations,
  markMessageAsReadFetchCall,
} from '../../services/fetch-messages.js';
import { useMessaging } from '../../hooks/useWebSocket.js';
import './AdminInbox.css';

export default function AdminInbox() {
  // User search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [startingConversation, setStartingConversation] = useState(false);
  const [startError, setStartError] = useState(null);

  // Search users API call
  const handleSearch = async (e) => {
    // TODO: Replace with actual user search logic using your preferred method
    e.preventDefault();
    setIsSearching(true);
    setError(null);
    // Simulate search result for UI only
    setTimeout(() => {
      setSearchResults([
        { id: 1, name: 'Test User', email: 'test@example.com' },
        { id: 2, name: 'Sample User', email: 'sample@example.com' },
      ]);
      setIsSearching(false);
    }, 500);
  };

  // Start conversation API call
  const handleStartConversation = async () => {
    setStartingConversation(true);
    setStartError(null);
    // Simulate starting a conversation for UI only
    setTimeout(() => {
      window.alert('Conversation started!');
      setSearchResults([]);
      setSearchTerm('');
      loadConversations(true);
      setStartingConversation(false);
    }, 500);
  };
  const navigate = useNavigate();
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
  const [showMobileModal, setShowMobileModal] = useState(false);
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
                firstName: message.first_name,
                lastName: message.last_name,
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

  // Mobile check helper
  const isMobile = () =>
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(max-width: 768px)').matches;

  const loadConversationMessages = async (conversationId) => {
    try {
      const messageData = await getConversationById(conversationId);

      setMessages(messageData);
      setSelectedConversation(conversationId);

      // On mobile, open messages in full-screen modal
      if (isMobile()) {
        setShowMobileModal(true);
      }

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
    const d = new Date(dateString);
    const now = new Date();
    const sameYear = d.getFullYear() === now.getFullYear();

    if (sameYear) {
      const datePart = d.toLocaleDateString([], {
        day: 'numeric',
        month: 'short',
      });
      const timePart = d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return `${datePart} at ${timePart}`;
    }

    const dateWithYear = d.toLocaleDateString([], {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return dateWithYear;
  };

  const renderMessageWithPieceMetadata = (messageContent) => {
    if (!messageContent) {
      return <p>[Message unavailable]</p>;
    }
    // Check if message contains piece metadata
    // Try new format first (with discounted price)
    let pieceMetadataMatch = messageContent.match(
      /About this piece: (.+?) \(([^)]+)\) - \$(.+?) \| discounted: \$(.+?)\nView: (.+)/
    );
    // Fallback for legacy messages without discounted price
    if (!pieceMetadataMatch) {
      pieceMetadataMatch = messageContent.match(
        /About this piece: (.+?) \(([^)]+)\) - \$([^\n]+)\nView: (.+)/
      );
    }
    if (pieceMetadataMatch) {
      const [, title, category, price, discountedPrice, url] = pieceMetadataMatch;

      // Extract imageUrl from message content
      const imageMatch = messageContent.match(/Image: (.+)/);
      const imageUrl = imageMatch ? imageMatch[1] : null;

      const mainMessage = messageContent.split('\n\n---\n')[0];
      const renderSalePrice = (price, discountedPrice) => {
        const numPrice = Number(price);
        const numDiscount = Number(discountedPrice);

        if (discountedPrice && numDiscount < numPrice) {
          return (
            <>
              <span className="detail-on-sale">ON SALE! </span>
              <span
                style={{
                  textDecoration: 'line-through',
                  marginRight: '10px',
                  color: 'red',
                }}
              >
                ${numPrice.toFixed(2)}
              </span>
              <span>${numDiscount.toFixed(2)}</span>
            </>
          );
        }

        return <span>${numPrice.toFixed(2)}</span>;
      };
      // Try to derive the post id from the URL (last path segment)
      let postId = null;
      try {
        const u = new URL(url);
        const parts = u.pathname.split('/').filter(Boolean);
        postId = parts[parts.length - 1] || null;
      } catch (e) {
        // ignore
      }

      const handleCreateSale = () => {
        // Find current conversation's customer details
        let customer = null;
        if (messages && messages.length > 0) {
          const convo = conversations.find(
            (c) => Number(c.user_id) === Number(messages[0]?.userId)
          );
          if (convo) {
            customer = {
              id: convo.user_id,
              email: convo.email,
              firstName: convo.first_name,
              lastName: convo.last_name,
              avatar: convo.image_url,
            };
          }
        }

        const piece = {
          id: postId ? Number(postId) : null,
          title,
          price: Number(price),
          discountedPrice: discountedPrice ? Number(discountedPrice) : null,
          imageUrl,
          url,
        };

        navigate('/admin/sales', {
          state: {
            fromInbox: true,
            prefill: {
              buyerEmail: customer?.email || null,
              user: customer,
              piece,
            },
          },
          replace: false,
        });
      };

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
              <span>Price:</span> {renderSalePrice(price, discountedPrice)}
            </p>
            <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#ffd700' }}>
              View piece
            </a>
            <button type="button" className="create-sale-button" onClick={handleCreateSale}>
              Create Sale →
            </button>
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

        {/* User Search and Start Conversation */}
        <div className="admin-inbox-user-search" style={{ marginBottom: '1rem' }}>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              disabled={isSearching}
              style={{ marginRight: '0.5rem' }}
            />
            <button type="submit" disabled={isSearching || !searchTerm}>
              Search
            </button>
          </form>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {searchResults.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {searchResults.map((user) => {
                return (
                  <li key={user.id} style={{ marginBottom: '0.5rem' }}>
                    <span>
                      {user.name} ({user.email})
                    </span>
                    <button
                      style={{ marginLeft: '1rem' }}
                      onClick={() => {
                        handleStartConversation(user.id);
                      }}
                      disabled={startingConversation}
                    >
                      Start Conversation
                    </button>
                  </li>
                );
              })}
              {searchResults.map((user) => (
                <li key={user.id} style={{ marginBottom: '0.5rem' }}>
                  <span>
                    {user.name} ({user.email})
                  </span>
                  <button
                    style={{ marginLeft: '1rem' }}
                    onClick={() => {
                      handleStartConversation(user.id);
                    }}
                    disabled={startingConversation}
                  >
                    Start Conversation
                  </button>
                </li>
              ))}
            </ul>
          )}
          {startError && <div style={{ color: 'red' }}>{startError}</div>}
        </div>

        <div className="inbox-layout">
          <div className="conversations-list">
            <h2>Conversations</h2>
            {/* Loading state */}
            {loading && (
              <div className="loading-conversations">
                <p>Loading conversations...</p>
              </div>
            )}
            {/* No conversations state */}
            {!loading && conversations.length === 0 && (
              <div className="no-conversations">
                <p>No conversations yet</p>
              </div>
            )}
            {/* Conversations list */}
            {!loading && conversations.length > 0 && (
              <div className="conversation-items">
                {conversations.map((conversation) => {
                  var isSelected = selectedConversation === conversation.conversation_id;
                  var itemClass = 'conversation-item' + (isSelected ? ' selected' : '');
                  return (
                    <div
                      key={conversation.conversation_id}
                      className={itemClass}
                      onClick={() => {
                        loadConversationMessages(conversation.conversation_id);
                      }}
                    >
                      <div className="conversation-header">
                        <div className="conversation-header-content">
                          <div className="conversation-header-content-wrapper">
                            {/* Avatar or fallback */}
                            {(() => {
                              if (conversation.image_url) {
                                return (
                                  <img
                                    src={conversation.image_url}
                                    alt="Customer avatar"
                                    className="conversation-avatar"
                                  />
                                );
                              } else {
                                return (
                                  <div className="conversation-avatar-fallback">
                                    {conversation.email
                                      ? conversation.email.charAt(0).toUpperCase()
                                      : '?'}
                                  </div>
                                );
                              }
                            })()}
                            <div className="sender-info-wrapper">
                              <span className="sender-name">
                                {conversation.first_name}{' '}
                                <span className="sender-name">
                                  {conversation.last_name ? conversation.last_name.slice(0, 1) : ''}
                                </span>
                              </span>
                              <span className="sender-email">{conversation.email}</span>
                            </div>
                          </div>
                          {/* Unread badge */}
                          {(() => {
                            if (conversation.unread_count > 0) {
                              return (
                                <span className="admin-unread-badge">
                                  {conversation.unread_count}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                      <div className="conversation-meta">
                        <span className="last-message-time">
                          {formatDate(conversation.last_message_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {conversations.map((conversation) => {
                  var isSelected = selectedConversation === conversation.conversation_id;
                  var itemClass = 'conversation-item' + (isSelected ? ' selected' : '');
                  return (
                    <div
                      key={conversation.conversation_id}
                      className={itemClass}
                      onClick={() => {
                        loadConversationMessages(conversation.conversation_id);
                      }}
                    >
                      <div className="conversation-header">
                        <div className="conversation-header-content">
                          <div className="conversation-header-content-wrapper">
                            {/* Avatar or fallback */}
                            {conversation.image_url ? (
                              <img
                                src={conversation.image_url}
                                alt="Customer avatar"
                                className="conversation-avatar"
                              />
                            ) : (
                              <div className="conversation-avatar-fallback">
                                {conversation.email
                                  ? conversation.email.charAt(0).toUpperCase()
                                  : '?'}
                              </div>
                            )}
                            <div className="sender-info-wrapper">
                              <span className="sender-name">
                                {conversation.first_name}{' '}
                                <span className="sender-name">
                                  {conversation.last_name ? conversation.last_name.slice(0, 1) : ''}
                                </span>
                              </span>
                              <span className="sender-email">{conversation.email}</span>
                            </div>
                          </div>
                          {/* Unread badge */}
                          {conversation.unread_count > 0 ? (
                            <span className="admin-unread-badge">{conversation.unread_count}</span>
                          ) : null}
                        </div>
                      </div>
                      <div className="conversation-meta">
                        <span className="last-message-time">
                          {formatDate(conversation.last_message_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="messages-panel messages-panel-desktop">
            {selectedConversation ? (
              <>
                {(() => {
                  const convo = conversations.find(
                    (c) => Number(c.user_id) === Number(messages[0]?.userId)
                  );
                  return convo ? (
                    <div
                      style={{
                        display: 'flex',
                        gap: '.5rem',
                        padding: '.5rem',
                        fontWeight: 'bold',
                      }}
                    >
                      <img
                        src={convo.image_url}
                        alt="Customer avatar"
                        className="conversation-avatar"
                      />
                      <span>{convo.first_name}</span>
                      <span>{convo.last_name?.slice(0, 1)}</span>
                    </div>
                  ) : null;
                })()}
                <div className="messages-list" ref={messagesListRef}>
                  {messages.map((message) => {
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
      {/* Mobile full-screen messages modal */}
      {showMobileModal && (
        <div className="mobile-messages-modal" role="dialog" aria-modal="true">
          <button
            type="button"
            className="close-mobile-modal"
            onClick={() => setShowMobileModal(false)}
            aria-label="Back"
          >
            ← Back
          </button>
          <div className="messages-panel messages-panel-mobile">
            {selectedConversation ? (
              <>
                {(() => {
                  const convo = conversations.find(
                    (c) => Number(c.user_id) === Number(messages[0]?.userId)
                  );
                  return convo ? (
                    <div
                      style={{
                        display: 'flex',
                        gap: '.5rem',
                        padding: '.5rem',
                        fontWeight: 'bold',
                      }}
                    >
                      <img
                        src={convo.image_url}
                        alt="Customer avatar"
                        className="conversation-avatar"
                      />
                      <span>{convo.first_name}</span>
                      <span>{convo.last_name?.slice(0, 1)}</span>
                    </div>
                  ) : null;
                })()}
                <div className="messages-list" ref={messagesListRef}>
                  {messages.map((message) => {
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
                {typingUsers.length > 0 && (
                  <div className="typing-indicator">
                    <p>Customer is typing...</p>
                  </div>
                )}
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
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
