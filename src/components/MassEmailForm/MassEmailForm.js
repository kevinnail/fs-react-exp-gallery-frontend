import { useState } from 'react';
import './MassEmailForm.css';
import { sendMassEmail } from '../../services/fetch-utils.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const MassEmailForm = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const navigate = useNavigate();

  const segment = useLocation().state?.segment ?? null;
  const recipientsText = segment
    ? `Goes to the ${segment.userIds.length} customers in "${segment.label}" who have email notifications on.`
    : 'Goes to every customer, including those who turned notifications off.';
  const sendLabel = segment ? 'Send promotion' : 'Send announcement';

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message are required', {
        theme: 'colored',
        toastId: 'mass-email-validation',
        autoClose: true,
      });
      return;
    }

    setConfirming(true);
  };

  const sendEmail = async () => {
    setConfirming(false);
    setSending(true);
    try {
      const { total, sent, failed } = await sendMassEmail({
        subject,
        message,
        userIds: segment?.userIds,
      });
      toast.success(`Sent to ${sent} of ${total} customers${failed ? `, ${failed} failed` : ''}`, {
        theme: 'colored',
        toastId: 'mass-email-success',
        autoClose: true,
      });
      navigate('/admin');
    } catch (error) {
      console.error('An error occurred:', error);
      toast.error('An error occurred. The email was not sent.', {
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
        <h2 className="mass-email-title">
          {segment ? 'Promotion to filtered customers' : 'Announcement to all customers'}
        </h2>
        <p className="mass-email-mode">
          {recipientsText}{' '}
          {segment
            ? 'For sales and specials.'
            : 'For site news and business updates, not sales or promotions.'}
        </p>

        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="mass-email-input"
          disabled={sending}
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message to customers"
          rows="10"
          className="mass-email-input mass-email-message-input"
          disabled={sending}
        />

        <button className="mass-email-submit-button" type="submit" disabled={sending}>
          {sending ? 'Sending…' : sendLabel}
        </button>
      </form>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        aria-labelledby="mass-email-dialog-title"
        aria-describedby="mass-email-dialog-description"
        PaperProps={{
          sx: {
            backgroundColor: 'var(--color-surface)',
            backgroundImage: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 0,
            fontFamily: 'var(--font-body)',
          },
        }}
      >
        <DialogTitle id="mass-email-dialog-title" sx={{ fontFamily: 'var(--font-display)' }}>
          {segment ? 'Send promotion?' : 'Send announcement?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="mass-email-dialog-description"
            sx={{ fontFamily: 'var(--font-body)' }}
          >
            {recipientsText} {segment ? '' : 'Not for sales or promotions. '}This cannot be undone.
          </DialogContentText>
          <DialogContentText sx={{ fontFamily: 'var(--font-body)', marginTop: '1rem' }}>
            Subject: {subject}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <button
            type="button"
            className="mass-email-dialog-button"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="mass-email-dialog-button mass-email-dialog-button--confirm"
            onClick={sendEmail}
          >
            {sendLabel}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MassEmailForm;
