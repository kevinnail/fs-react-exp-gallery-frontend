import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore.js';
import './RequestTray.css';

const RequestTray = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleReview = () => {
    onClose();
    navigate('/request');
  };

  return createPortal(
    <div className="request-tray-overlay" onClick={onClose}>
      <aside
        className="request-tray"
        role="dialog"
        aria-modal="true"
        aria-label="Your request"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="request-tray-header">
          <h2 className="request-tray-title">Your request</h2>
          <button
            type="button"
            className="request-tray-close-button"
            onClick={onClose}
            aria-label="Close your request"
          >
            ×
          </button>
        </div>

        <p className="request-tray-payment-note">
          Sends Kevin a message. No card payment, nothing charged or held.
        </p>

        {items.length === 0 ? (
          <p className="request-tray-empty-message">
            Nothing here yet. Tap Add to request on any piece you like.
          </p>
        ) : (
          <ul className="request-tray-list">
            {items.map((item) => (
              <li className="request-tray-item" key={item.postId}>
                {item.imageUrl ? (
                  <img className="request-tray-thumbnail" src={item.imageUrl} alt="" />
                ) : (
                  <span
                    className="request-tray-thumbnail request-tray-thumbnail--empty"
                    aria-hidden="true"
                  />
                )}

                <span className="request-tray-item-title">{item.title}</span>

                <button
                  type="button"
                  className="request-tray-remove-button"
                  onClick={() => removeItem(item.postId)}
                  aria-label={`Remove ${item.title} from your request`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          className="request-tray-review-button"
          onClick={handleReview}
          disabled={items.length === 0}
        >
          Review request
        </button>
      </aside>
    </div>,
    document.body
  );
};

export default RequestTray;
