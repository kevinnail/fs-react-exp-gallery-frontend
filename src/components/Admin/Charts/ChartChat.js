import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { sendChartChat } from '../../../services/fetch-chart-chat.js';

const ChartChat = ({ granularity, range }) => {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const logRef = useRef(null);
  const inputRef = useRef(null);

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

    const nextMessages = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setDraft('');
    setSending(true);
    setError('');
    try {
      const { reply } = await sendChartChat({ granularity, range, messages: nextMessages });
      setMessages([...nextMessages, { role: 'assistant', content: reply }]);
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="chart-chat">
      <h2 className="chart-chat-title">Ask about this data</h2>
      <div className="chart-chat-log" ref={logRef} aria-live="polite">
        {messages.map((message, index) => (
          <p key={index} className={`chart-chat-message chart-chat-message--${message.role}`}>
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
