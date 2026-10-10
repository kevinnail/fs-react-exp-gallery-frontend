import { useEffect, useRef, useState } from 'react';
import { sendChartChat } from '../../../services/fetch-chart-chat.js';

const ChartChat = ({ granularity, range }) => {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const logRef = useRef(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, sending]);

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
        {sending ? (
          <p className="chart-chat-message chart-chat-message--assistant">Thinking</p>
        ) : null}
      </div>
      {error ? <p className="charts-error">{error}</p> : null}
      <form className="chart-chat-form" onSubmit={handleSubmit}>
        <textarea
          className="chart-chat-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) handleSubmit(event);
          }}
          rows={2}
          aria-label="Message"
        />
        <button type="submit" className="charts-control-button" disabled={sending || !draft.trim()}>
          Send
        </button>
      </form>
    </section>
  );
};

export default ChartChat;
