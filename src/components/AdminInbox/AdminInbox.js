import React, { useState, useEffect, useRef } from 'react';
import { useUserStore } from '../../stores/userStore.js';
import { signOut } from '../../services/auth.js';
import {
  getConversationById,
  addAdminReply,
  getConversations,
} from '../../services/fetch-messages.js';
import Menu from '../Menu/Menu.js';
import './AdminInbox.css';

export default function AdminInbox() {
  const { signout, isAdmin } = useUserStore();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedConversationData, setSelectedConversationData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newReply, setNewReply] = useState('');
  const messagesListRef = useRef(null);

  const handleClick = async () => {
    try {
      await signOut();
      signout();
    } catch (error) {
      console.error('Error signing out:', error);
      signout();
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const conversationsData = await getConversations();

      // If getConversations returns conversation summaries, use them directly
      if (conversationsData && conversationsData.length > 0) {
        // Check if the data structure is already conversation summaries
        const firstItem = conversationsData[0];
        if (firstItem.conversation_id && firstItem.email) {
          // Data is already in conversation format
          setConversations(conversationsData);
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
          setConversations(conversations);
        }
      } else {
        setConversations([]);
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

      // Find the conversation data to get customer avatar
      const conversationData = conversations.find(
        (conv) => conv.conversation_id === conversationId
      );
      setSelectedConversationData(conversationData);
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim() || sending || !selectedConversation) return;

    try {
      setSending(true);
      const response = await addAdminReply(selectedConversation, newReply);
      setMessages((prev) => [...prev, response]);
      setNewReply('');
      // Refresh conversations to update unread counts and last message time
      await loadConversations();
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const renderMessageWithPieceMetadata = (messageContent) => {
    // Check if message contains piece metadata
    const pieceMetadataMatch = messageContent.match(
      /About this piece: (.+?) \(([^)]+)\) - \$([^\n]+)\nView: (.+)/
    );

    if (pieceMetadataMatch) {
      const [, title, category, price, url] = pieceMetadataMatch;
      const mainMessage = messageContent.split('\n\n---\n')[0];

      return (
        <>
          <p>{mainMessage}</p>
          <div className="piece-metadata-highlight">
            <p>
              <strong>About this piece:</strong> {title}
            </p>
            <p>
              <strong>Category:</strong> {category} | <strong>Price:</strong> ${price}
            </p>
            <p>
              <strong>View piece:</strong>{' '}
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#ffd700' }}>
                Click here →
              </a>
            </p>
          </div>
        </>
      );
    }

    return <p>{messageContent}</p>;
  };

  useEffect(() => {
    loadConversations();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="admin-inbox-container">
      <div className="menu-search-container">
        <Menu handleClick={handleClick} />
      </div>

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
                        {isCustomerMessage &&
                          (selectedConversationData?.image_url ? (
                            <img
                              src={selectedConversationData.image_url}
                              alt="Customer avatar"
                              className="message-avatar"
                            />
                          ) : (
                            <div className="message-avatar-fallback">
                              {selectedConversationData?.email
                                ? selectedConversationData.email.charAt(0).toUpperCase()
                                : '?'}
                            </div>
                          ))}
                        <div className="admin-message-content">
                          {renderMessageWithPieceMetadata(message.messageContent)}
                          <span className="admin-message-time">{formatDate(message.sentAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendReply} className="reply-form">
                  <div className="input-container">
                    <textarea
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      placeholder="Type your reply..."
                      className="reply-input"
                      rows="3"
                      disabled={sending}
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
