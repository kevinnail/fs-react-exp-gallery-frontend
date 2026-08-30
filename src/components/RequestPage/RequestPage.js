import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useUserStore } from '../../stores/userStore.js';
import { useCartStore } from '../../stores/cartStore.js';
import { useRequestItems } from '../../hooks/useRequestItems.js';
import { useWebSocket } from '../../hooks/useWebSocket.js';
import { buildPurchaseRequestMessage } from '../../services/pieceAttachment.js';
import { sendCustomerMessage } from '../../services/sendCustomerMessage.js';
import Loading from '../Loading/Loading.js';
import './RequestPage.css';

const effectivePrice = (item) => {
  const discounted = Number(item.discountedPrice);
  const listed = Number(item.price);
  return discounted && discounted < listed ? discounted : listed;
};

const RequestPage = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const { items, availableItems, unavailableItems, total, loading } = useRequestItems();
  const { socket } = useWebSocket();

  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (sending || availableItems.length === 0) return;

    // The basket lives in localStorage, so it survives the trip through
    // sign-in and is still here when they come back.
    if (!user) {
      navigate('/auth/sign-in', { state: { from: '/request' } });
      return;
    }

    try {
      setSending(true);

      await sendCustomerMessage({
        socket,
        messageContent: buildPurchaseRequestMessage({ items: availableItems, note }),
      });

      clearCart();
      toast.success('Request sent. Kevin will get back to you soon.', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        toastId: 'request-sent',
      });
      navigate('/messages');
    } catch (error) {
      console.error('Error sending purchase request:', error);
      toast.error(`Could not send your request: ${error.message}`, {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        toastId: 'request-failed',
      });
    } finally {
      setSending(false);
    }
  };

  if (loading && items.length > 0) return <Loading />;

  return (
    <main className="slg-request">
      <div className="slg-request-head">
        <h1 className="slg-request-title">Your request</h1>
      </div>

      <p className="slg-request-explainer">
        <strong>This isn&apos;t a checkout.</strong> There&apos;s no card payment on the site yet,
        so this sends Kevin a message with everything you&apos;ve picked out. He&apos;ll confirm
        what&apos;s still available, work out shipping, and sort payment with you directly.
      </p>

      {items.length === 0 ? (
        <div className="slg-request-empty">
          <p>Nothing in your request yet.</p>
          <Link className="slg-request-submit" to="/">
            Browse the gallery
          </Link>
        </div>
      ) : (
        <form className="slg-request-form" onSubmit={handleSubmit}>
          <ul className="slg-request-list">
            {items.map((item) => (
              <li
                key={item.postId}
                className={`slg-request-item${item.sold ? ' slg-request-item--gone' : ''}`}
              >
                {item.imageUrl ? (
                  <img className="slg-request-thumb" src={item.imageUrl} alt="" />
                ) : (
                  <span className="slg-request-thumb slg-request-thumb--empty" aria-hidden="true" />
                )}

                <div className="slg-request-item-body">
                  <Link className="slg-request-item-title" to={`/${item.postId}`}>
                    {item.title}
                  </Link>

                  {item.sold ? (
                    <span className="slg-request-gone-note">
                      {item.unavailableReason === 'gone' ? 'No longer listed' : 'Just sold, sorry'}
                    </span>
                  ) : (
                    <span className="slg-request-item-price">
                      ${effectivePrice(item).toFixed(2)}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className="slg-request-remove"
                  onClick={() => removeItem(item.postId)}
                  aria-label={`Remove ${item.title} from your request`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          {unavailableItems.length > 0 && (
            <p className="slg-request-gone-summary">
              {unavailableItems.length === 1
                ? 'One piece sold while it was in your request, so it is not included below.'
                : `${unavailableItems.length} pieces sold while they were in your request, so they are not included below.`}
            </p>
          )}

          <div className="slg-request-total">
            <span>Estimated total</span>
            <span className="slg-request-total-value">${total.toFixed(2)}</span>
          </div>
          <p className="slg-request-total-note">Before shipping, which Kevin will confirm.</p>

          <label className="slg-request-note-label" htmlFor="request-note">
            Anything Kevin should know? (optional)
          </label>
          <textarea
            id="request-note"
            className="slg-request-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Shipping or local pickup, questions about a piece, timing"
            rows={4}
          />

          <button
            type="submit"
            className="slg-request-submit"
            disabled={sending || availableItems.length === 0}
          >
            {sending ? 'Sending...' : 'Send request to Kevin'}
          </button>

          {!user && (
            <p className="slg-request-signin-note">
              You&apos;ll be asked to sign in first, so Kevin can reply to you. Your request is
              saved.
            </p>
          )}
        </form>
      )}
    </main>
  );
};

export default RequestPage;
