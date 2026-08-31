import { useCartStore, selectIsInCart } from '../../stores/cartStore.js';
import './RequestButton.css';

const RequestButton = ({ piece, variant = 'detail' }) => {
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const isInCart = useCartStore(selectIsInCart(piece?.postId));

  if (!piece || piece.postId === undefined || piece.postId === null) return null;
  if (piece.sold) return null;

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isInCart) {
      removeItem(piece.postId);
    } else {
      addItem(piece);
    }
  };

  const label = isInCart ? 'In request' : 'Add to request';
  const shortLabel = isInCart ? 'Added' : 'Add';

  return (
    <button
      type="button"
      className={`slg-request-button slg-request-button--${variant}${
        isInCart ? ' slg-request-button--active' : ''
      }`}
      onClick={handleClick}
      aria-pressed={isInCart}
      aria-label={label}
      title={
        isInCart ? `Remove ${piece.title} from your request` : `Add ${piece.title} to your request`
      }
    >
      <span className="slg-request-button-mark" aria-hidden="true">
        {isInCart ? '✓' : '+'}
      </span>
      <span className="slg-request-button-label slg-request-button-label--full" aria-hidden="true">
        {label}
      </span>
      <span className="slg-request-button-label slg-request-button-label--short" aria-hidden="true">
        {shortLabel}
      </span>
    </button>
  );
};

export default RequestButton;
