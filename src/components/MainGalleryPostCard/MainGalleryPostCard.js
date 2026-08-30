import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import RequestButton from '../RequestButton/RequestButton.js';
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
  fallbackImageUrl,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);

  const isDiscounted = discountedPrice && parseFloat(discountedPrice) < parseFloat(originalPrice);

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
    price: isDiscounted ? discountedPrice : price,
    discountedPrice: isDiscounted ? discountedPrice : null,
    imageUrl: imageSource,
    url: `${window.location.origin}/${id}`,
    sold,
  };

  return (
    <Link
      className={`slg-piece${sold ? ' slg-piece--sold' : ''}`}
      to={`/${id}`}
      title={title}
      ref={containerRef}
    >
      <div className="slg-piece-frame">
        {sold ? <span className="slg-badge">Sold</span> : null}
        {!sold && isDiscounted ? <span className="slg-badge slg-badge--sale">Sale</span> : null}

        {hasImage ? (
          <>
            {isLoaded ? null : <span className="slg-piece-skeleton" aria-hidden="true" />}
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
          <span className="slg-piece-placeholder">No photo yet</span>
        )}

        {sold ? null : (
          <div className="slg-piece-request">
            <RequestButton piece={requestPiece} variant="card" />
          </div>
        )}
      </div>

      <div className="slg-piece-meta">
        <span className="slg-piece-name">{title}</span>
        <span className="slg-piece-desc">{description}</span>
        <span className="slg-piece-price">
          {sold ? (
            <span className="slg-was">${isDiscounted ? originalPrice : price}</span>
          ) : isDiscounted ? (
            <>
              <span className="slg-was">${originalPrice}</span>${Math.floor(discountedPrice)}
            </>
          ) : (
            <>${price}</>
          )}
        </span>
      </div>
    </Link>
  );
}
