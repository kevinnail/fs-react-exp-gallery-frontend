import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { requestPasswordReset } from '../../services/fetch-utils.js';
import '../Auth/Auth.css';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedEmail)) {
      toast.warn('Enter a valid email address', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        autoClose: 5000,
      });
      return;
    }

    try {
      setSubmitting(true);
      await requestPasswordReset(normalizedEmail);
      setHasSubmitted(true);
    } catch (error) {
      if (error?.status === 429) {
        toast.warn('Too many requests. Please try again later.', {
          theme: 'colored',
          autoClose: 6000,
        });
      } else {
        toast.error(error.message || 'Failed to request a password reset.', {
          theme: 'colored',
          autoClose: 5000,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2 className="forgot-password-title">Reset your password</h2>

        {hasSubmitted ? (
          <>
            <p className="forgot-password-sent">
              If an account exists for that address, a password reset email is on its way. The link
              expires in 30 minutes.
            </p>
            <Link className="forgot-password-back" to="/auth/sign-in">
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <p className="forgot-password-copy">
              Enter the email address on your account and we&apos;ll send you a link to set a new
              password.
            </p>
            <form onSubmit={handleSubmit}>
              <input
                className="input-auth"
                type="email"
                id="forgot-password-email"
                name="email"
                placeholder="enter your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={101}
                required
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
              <button className="button-auth" type="submit" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
            <Link className="forgot-password-back" to="/auth/sign-in">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
