import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../stores/userStore.js';
import { signOut } from '../../services/auth.js';
import {
  getConversations,
  getConversationById,
  addAdminReply,
} from '../../services/fetch-messages.js';
import Menu from '../Menu/Menu.js';
import './AdminInbox.css';

export default function AdminInbox() {
  const { signout } = useUserStore();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newReply, setNewReply] = useState('');

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
      const conversationData = await getConversations();

      // Group conversations by conversation_id - show only one entry per conversation
      // For admin inbox, show the customer's info, not admin's
      const groupedConversations = conversationData.reduce((acc, current) => {
        const existing = acc.find((item) => item.conversation_id === current.conversation_id);
        if (!existing) {
          // If this is the admin's entry, skip it and wait for the customer's entry
          if (current.email === 'admin') {
            return acc;
          }
          acc.push(current);
        }
        return acc;
      }, []);

      setConversations(groupedConversations);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  useEffect(() => {
    loadConversations();
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
                      <span className="user-email">{conversation.email}</span>
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
                <div className="messages-list">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message-item ${message.isFromAdmin ? 'admin-message' : 'customer-message'}`}
                    >
                      <div className="message-content">
                        <p>{message.messageContent}</p>
                        <span className="message-time">{formatDate(message.sentAt)}</span>
                      </div>
                    </div>
                  ))}
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
