import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore.js';
import { signOut } from '../../services/auth.js';
import { getMyMessages, sendMessage, replyToConversation } from '../../services/fetch-messages.js';
import { getAdminProfile } from '../../services/fetch-utils.js';
import Menu from '../Menu/Menu.js';
import './Messages.css';

export default function Messages() {
  const { signout, isAdmin } = useUserStore();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [pieceMetadata, setPieceMetadata] = useState(null);
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

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messageData = await getMyMessages();
      setMessages(messageData);

      // Get conversation ID from first message if available
      if (messageData.length > 0) {
        setConversationId(messageData[0].conversationId);
      }
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
  }, [location.state]);

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
        messageToSend = `${newMessage}\n\n---\nAbout this piece: ${pieceMetadata.title} (${pieceMetadata.category}) - $${pieceMetadata.price}\nView: ${pieceMetadata.url}`;
      }

      if (conversationId) {
        // Reply to existing conversation
        response = await replyToConversation(conversationId, messageToSend);
      } else {
        // Start new conversation
        response = await sendMessage(messageToSend);
        setConversationId(response.conversationId);
      }

      setMessages((prev) => [...prev, response]);
      setNewMessage('');
      // Clear piece metadata after sending
      setPieceMetadata(null);
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

  return (
    <div className="messages-container">
      <div className="menu-search-container">
        <Menu handleClick={handleClick} />
      </div>

      <div className="messages-content">
        <div className="messages-header">
          <h1>Contact Kevin</h1>
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
                        <p>{message.messageContent}</p>
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
                          <p>{message.messageContent}</p>
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

          <form onSubmit={handleSendMessage} className="message-form">
            <div className="input-container">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  pieceMetadata
                    ? `Ask about ${pieceMetadata.title}...`
                    : 'Type your message here...'
                }
                className="message-input"
                rows="3"
                disabled={sending}
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
