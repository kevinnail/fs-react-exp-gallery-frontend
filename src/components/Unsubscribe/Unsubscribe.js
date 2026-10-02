import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { unsubscribeFromEmails } from '../../services/fetch-unsubscribe.js';
import '../Auth/Auth.css';
import './Unsubscribe.css';

const CATEGORY_LABELS = {
  auctions: 'new auction',
  galleryPosts: 'new gallery post',
  promotions: 'sales and promotions',
};

const describeCategories = (categories) =>
  categories.map((category) => CATEGORY_LABELS[category]).join(', ');

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [submitting, setSubmitting] = useState(false);
  const [unsubscribedFrom, setUnsubscribedFrom] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const unsubscribe = async (all) => {
    setSubmitting(true);
    setErrorMessage('');
    try {
      const result = await unsubscribeFromEmails({ token, all });
      setUnsubscribedFrom(result.unsubscribedFrom);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="unsubscribe-page">
        <div className="unsubscribe-card">
          <h2 className="unsubscribe-title">This unsubscribe link is not complete</h2>
          <p className="unsubscribe-text">
            Use the full link from the bottom of the email, or change your email settings on your
            account page.
          </p>
          <Link className="unsubscribe-account-link" to="/account">
            Go to my account
          </Link>
        </div>
      </div>
    );
  }

  if (unsubscribedFrom) {
    return (
      <div className="unsubscribe-page">
        <div className="unsubscribe-card">
          <h2 className="unsubscribe-title">You&apos;re unsubscribed</h2>
          <p className="unsubscribe-text">
            You won&apos;t get {describeCategories(unsubscribedFrom)} emails anymore.
          </p>
          <Link className="unsubscribe-account-link" to="/account">
            Change my other email settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="unsubscribe-page">
      <div className="unsubscribe-card">
        <h2 className="unsubscribe-title">Unsubscribe</h2>
        {errorMessage && <p className="unsubscribe-text">{errorMessage}</p>}
        <button
          className="auth-button"
          type="button"
          disabled={submitting}
          onClick={() => unsubscribe(false)}
        >
          Unsubscribe from these emails
        </button>
        <button
          className="auth-button"
          type="button"
          disabled={submitting}
          onClick={() => unsubscribe(true)}
        >
          Unsubscribe from all marketing emails
        </button>
        <Link className="unsubscribe-account-link" to="/account">
          Change my email settings instead
        </Link>
      </div>
    </div>
  );
};

export default Unsubscribe;
