import './PieceAttachment.css';

export const renderPieceSalePrice = (price, discountedPrice) => {
  const listed = Number(price);
  const discounted = Number(discountedPrice);

  if (discountedPrice && discounted < listed) {
    return (
      <>
        <span className="piece-attachment-was">${listed.toFixed(2)}</span>
        <span className="piece-attachment-now">${discounted.toFixed(2)}</span>
      </>
    );
  }

  return <span>${Number.isFinite(listed) ? listed.toFixed(2) : price}</span>;
};

const PieceAttachment = ({ items = [], onCreateSale }) => {
  if (items.length === 0) return null;

  return (
    <div className="piece-attachment">
      {items.length > 1 && (
        <p className="piece-attachment-count">Requesting {items.length} pieces</p>
      )}

      {items.map((item, index) => (
        <div className="piece-metadata-highlight" key={item.postId ?? `${item.title}-${index}`}>
          <div className="piece-metadata-highlight-content">
            <p>
              {item.imageUrl ? <img width="50px" src={item.imageUrl} alt={item.title} /> : null}
            </p>
            <h3>{item.title}</h3>
          </div>

          {item.category ? (
            <p>
              <span>Category:</span> {item.category}
            </p>
          ) : null}

          <p>
            <span>Price:</span> {renderPieceSalePrice(item.price, item.discountedPrice)}
          </p>

          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#ffd700' }}
            >
              View piece
            </a>
          ) : null}

          {onCreateSale ? (
            <button
              type="button"
              className="create-sale-button"
              onClick={() => onCreateSale(item)}
              disabled={!item.postId}
              title={item.postId ? undefined : 'No piece id on this message'}
            >
              Create Sale →
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default PieceAttachment;
