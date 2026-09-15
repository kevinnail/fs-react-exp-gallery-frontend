import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import RequestButton from '../RequestButton/RequestButton.js';
import { useUserStore } from '../../stores/userStore.js';
import { getPiecePrice } from '../../services/userSpecial.js';
import './MainGalleryPostCard.css';

export default function MainGalleryPostCard({
  id,
  title,
  image_url,
  price,
  description,
  discountedPrice,
  originalPrice,
  sold,
  created_at,
  fallbackImageUrl,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);
  const user = useUserStore((state) => state.user);

  const { listedPrice, salePrice } = getPiecePrice(
    { price, discountedPrice, originalPrice, sold, created_at },
    { isSignedIn: Boolean(user) }
  );

  // Video posts store a matching .jpg poster frame alongside the .mp4.
  const posterFor = (source) => (source.endsWith('.mp4') ? `${source.slice(0, -4)}.jpg` : source);

  const imageSource = image_url
    ? posterFor(image_url)
    : fallbackImageUrl
      ? posterFor(fallbackImageUrl)
      : '';

  // A post can exist with no photo attached yet. An empty `src` would
  // re-request the page itself and never fire onLoad, leaving the
  // skeleton shimmering forever — so render a still placeholder.
  const hasImage = Boolean(imageSource);

  // Only request the image once the card is near the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px', threshold: 0.01 }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => observer.disconnect();
  }, []);

  const requestPiece = {
    postId: id,
    title,
    price,
    discountedPrice: salePrice,
    imageUrl: imageSource,
    url: `${window.location.origin}/${id}`,
    sold,
  };

  return (
    <Link
      className={`piece-card${sold ? ' piece-card--sold' : ''}`}
      to={`/${id}`}
      title={title}
      ref={containerRef}
    >
      <div className="piece-card-image">
        {sold ? <span className="piece-card-sold-badge">Sold</span> : null}

        {hasImage ? (
          <>
            {isLoaded ? null : <span className="piece-card-image-skeleton" aria-hidden="true" />}
            {isVisible ? (
              <img
                src={imageSource}
                alt={title}
                style={{ opacity: isLoaded ? 1 : 0 }}
                onLoad={() => setIsLoaded(true)}
              />
            ) : null}
          </>
        ) : (
          <span className="piece-card-image-placeholder">No photo yet</span>
        )}
      </div>

      <div className="piece-card-details">
        <span className="piece-card-title">{title}</span>
        <span className="piece-card-description">{description}</span>

        <div className="piece-card-price-row">
          <span className="piece-card-price">
            {sold ? (
              <span className="original-price">${listedPrice}</span>
            ) : salePrice !== null ? (
              <>
                <span className="original-price">${listedPrice}</span>${Math.floor(salePrice)}
              </>
            ) : (
              <>${price}</>
            )}
          </span>

          {sold ? null : <RequestButton piece={requestPiece} variant="card" />}
        </div>
      </div>
    </Link>
  );
}
