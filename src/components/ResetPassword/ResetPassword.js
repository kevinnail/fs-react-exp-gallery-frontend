import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { resetPassword } from '../../services/fetch-utils.js';
import '../Auth/Auth.css';
import './ResetPassword.css';

// Same rule the backend enforces in lib/utils/validatePassword.js
const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

const DEAD_TOKEN_CODES = ['RESET_TOKEN_EXPIRED', 'RESET_TOKEN_INVALID', 'RESET_TOKEN_INVALIDATED'];

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isTokenDead, setIsTokenDead] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!STRONG_PASSWORD_PATTERN.test(password)) {
      toast.warn(
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol',
        { theme: 'dark', draggable: true, draggablePercent: 60, autoClose: 10000 }
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.warn('Those passwords do not match', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        autoClose: 5000,
      });
      return;
    }

    try {
      setSubmitting(true);
      await resetPassword(token, password);
      toast.success('Password reset. You can sign in now.', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        autoClose: 5000,
      });
      navigate('/auth/sign-in');
    } catch (error) {
      if (DEAD_TOKEN_CODES.includes(error?.code)) {
        setIsTokenDead(true);
      }
      toast.error(error.message || 'Failed to reset password.', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        autoClose: 6000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!token || isTokenDead) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <h2 className="reset-password-title">This link is no longer valid</h2>
          <p className="reset-password-copy">
            Reset links expire after 30 minutes and can only be used once. Request a new one and
            we&apos;ll email it over.
          </p>
          <Link className="button-auth" to="/auth/forgot-password">
            Request a new link
          </Link>
          <Link className="reset-password-back" to="/auth/sign-in">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2 className="reset-password-title">Choose a new password</h2>
        <p className="reset-password-copy">
          At least 8 characters, with an uppercase letter, a lowercase letter, a number, and a
          symbol.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="reset-password-field">
            <input
              className="input-auth"
              type={showPassword ? 'text' : 'password'}
              id="new-password"
              name="new-password"
              placeholder="New password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              maxLength={50}
              required
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <span
              className="reset-password-toggle"
              onClick={() => setShowPassword((wasShown) => !wasShown)}
            >
              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </span>
          </div>

          <input
            className="input-auth"
            type={showPassword ? 'text' : 'password'}
            id="confirm-password"
            name="confirm-password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            maxLength={50}
            required
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />

          <button className="button-auth" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Set new password'}
          </button>
        </form>

        <Link className="reset-password-back" to="/auth/sign-in">
          Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
