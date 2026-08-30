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
    <div className="slg-tray-overlay" onClick={onClose}>
      <aside
        className="slg-tray"
        role="dialog"
        aria-modal="true"
        aria-label="Your request"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="slg-tray-head">
          <h2 className="slg-tray-title">Your request</h2>
          <button
            type="button"
            className="slg-tray-close"
            onClick={onClose}
            aria-label="Close your request"
          >
            ×
          </button>
        </div>

        <p className="slg-tray-note">
          Sends Kevin a message. No card payment, nothing charged or held.
        </p>

        {items.length === 0 ? (
          <p className="slg-tray-empty">
            Nothing here yet. Tap Add to request on any piece you like.
          </p>
        ) : (
          <ul className="slg-tray-list">
            {items.map((item) => (
              <li className="slg-tray-item" key={item.postId}>
                {item.imageUrl ? (
                  <img className="slg-tray-thumb" src={item.imageUrl} alt="" />
                ) : (
                  <span className="slg-tray-thumb slg-tray-thumb--empty" aria-hidden="true" />
                )}

                <span className="slg-tray-item-title">{item.title}</span>

                <button
                  type="button"
                  className="slg-tray-remove"
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
          className="slg-tray-review"
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
