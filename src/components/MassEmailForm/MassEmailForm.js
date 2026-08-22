import { useState } from 'react';
import './MassEmailForm.css';
import { sendMassEmail } from '../../services/fetch-utils.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function MassEmailForm() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message are required', {
        theme: 'colored',
        toastId: 'mass-email-validation',
        autoClose: true,
      });
      return;
    }

    const confirmed = window.confirm(
      'Send this email to all customers with email notifications enabled? This cannot be undone.'
    );
    if (!confirmed) return;

    setSending(true);
    try {
      const { total, sent, failed } = await sendMassEmail({ subject, message });
      toast.success(`Sent to ${sent} of ${total} customers${failed ? `, ${failed} failed` : ''}`, {
        theme: 'colored',
        toastId: 'mass-email-success',
        autoClose: true,
      });
      navigate('/admin');
    } catch (error) {
      console.error('An error occurred:', error);
      toast.error('An error occurred — the email was not sent', {
        theme: 'colored',
        toastId: 'mass-email-error',
        autoClose: true,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mass-email-wrapper">
      <form className="mass-email-form" onSubmit={handleSubmit}>
        <h2 className="form-title">Email Customers</h2>
        <p className="mass-email-note">Goes to every customer with email notifications enabled.</p>

        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="input-field"
          disabled={sending}
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message to customers"
          rows="10"
          className="input-field message-input"
          disabled={sending}
        />

        <button className="submit-btn" type="submit" disabled={sending}>
          {sending ? 'Sending…' : 'Send Email'}
        </button>
      </form>
    </div>
  );
}
