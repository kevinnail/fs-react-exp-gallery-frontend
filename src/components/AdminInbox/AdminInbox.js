import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../stores/userStore.js';
import { signOut } from '../../services/auth.js';
import {
  getConversationById,
  addAdminReply,
  getAllMessages,
} from '../../services/fetch-messages.js';
import Menu from '../Menu/Menu.js';
import './AdminInbox.css';

export default function AdminInbox() {
  const { signout, isAdmin } = useUserStore();
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
      const allMessages = await getAllMessages();

      // Group messages by conversation_id and get customer email
      const conversationMap = new Map();
      allMessages.forEach((message) => {
        const convId = message.conversationId;
        if (!conversationMap.has(convId)) {
          // Look for any message in this conversation that has a non-admin email
          const customerMessage = allMessages.find(
            (m) => m.conversationId === convId && m.userEmail && isAdmin
          );
          const customerEmail = customerMessage?.userEmail || 'Unknown Customer';

          conversationMap.set(convId, {
            conversation_id: convId,
            email: customerEmail,
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
                  {messages.map((message) => {
                    // In admin view: customer messages go left, admin messages go right
                    const isCustomerMessage = !message.isFromAdmin && isAdmin;
                    return (
                      <div
                        key={message.id}
                        className={`message-item ${isCustomerMessage ? 'customer-message' : 'admin-message'}`}
                      >
                        <div className="message-content">
                          <p>{message.messageContent}</p>
                          <span className="message-time">{formatDate(message.sentAt)}</span>
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
