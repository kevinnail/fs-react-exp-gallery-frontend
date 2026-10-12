import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  createChartChat,
  getChartChat,
  sendChartChatMessage,
} from '../../../services/fetch-chart-chats.js';

// Stands in for the question's id until the server saves it.
const PENDING_MESSAGE_ID = 'pending';

const ChartChat = ({ granularity, range, setGranularity, setRange }) => {
  // The open chat lives in the URL so a refresh comes back to it.
  const [searchParams, setSearchParams] = useSearchParams();
  const chatId = searchParams.get('chat');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const logRef = useRef(null);
  const inputRef = useRef(null);
  // The chat the log already holds, so putting a just-created chat in the URL
  // does not fetch it again.
  const shownChatIdRef = useRef(null);

  useEffect(() => {
    if (!chatId) {
      shownChatIdRef.current = null;
      setMessages([]);
      return;
    }
    if (chatId === shownChatIdRef.current) return;

    let isCurrentRequest = true;
    const loadChat = async () => {
      setMessages([]);
      setError('');
      try {
        const chat = await getChartChat(chatId);
        if (!isCurrentRequest) return;
        shownChatIdRef.current = chatId;
        setMessages(chat.messages);
        // Show the data the conversation was about.
        setGranularity(chat.granularity);
        setRange(chat.range);
      } catch (loadError) {
        if (isCurrentRequest) setError(loadError.message);
      }
    };
    loadChat();

    return () => {
      isCurrentRequest = false;
    };
  }, [chatId, setGranularity, setRange]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const previousHeight = input.offsetHeight;
    input.style.height = 'auto';
    const borderHeight = input.offsetHeight - input.clientHeight;
    input.style.height = `${input.scrollHeight + borderHeight}px`;

    const growth = input.offsetHeight - previousHeight;
    if (growth > 0) window.scrollBy(0, growth);
  }, [draft]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;

    const previousMessages = messages;
    setMessages([...previousMessages, { id: PENDING_MESSAGE_ID, role: 'user', content }]);
    setDraft('');
    setSending(true);
    setError('');
    try {
      if (chatId) {
        const savedTurns = await sendChartChatMessage(chatId, { granularity, range, content });
        setMessages([...previousMessages, ...savedTurns]);
      } else {
        const chat = await createChartChat({ granularity, range, content });
        shownChatIdRef.current = String(chat.id);
        setMessages(chat.messages);
        setSearchParams(
          (params) => {
            const nextParams = new URLSearchParams(params);
            nextParams.set('chat', chat.id);
            return nextParams;
          },
          { replace: true }
        );
      }
    } catch (sendError) {
      // Nothing was saved, so the question goes back in the box to retry.
      setMessages(previousMessages);
      setDraft(content);
      setError(sendError.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="chart-chat">
      <h2 className="chart-chat-title">Ask about this data</h2>
      <div className="chart-chat-log" ref={logRef} aria-live="polite">
        {messages.map((message) => (
          <p key={message.id} className={`chart-chat-message chart-chat-message--${message.role}`}>
            {message.content}
          </p>
        ))}
        {sending ? <p className="chart-chat-thinking">Thinking</p> : null}
      </div>
      {error ? <p className="charts-error">{error}</p> : null}
      <form className="chart-chat-form" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          className="chart-chat-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) handleSubmit(event);
          }}
          rows={1}
          placeholder="Ask about the numbers above"
          aria-label="Message"
        />
        <div className="chart-chat-actions">
          <button type="submit" className="chart-chat-send" disabled={sending || !draft.trim()}>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 20L21 12L3 4V10L17 12L3 14V20Z" fill="currentColor" />
            </svg>
            Send
          </button>
        </div>
      </form>
    </section>
  );
};

export default ChartChat;
