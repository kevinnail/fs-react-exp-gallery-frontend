import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGalleryPost } from '../../hooks/useGalleryPost.js';
import '../GalleryPostCard/GalleryPostCard.css';

export default function MainGalleryPostCard({
  id,
  title,
  image_url,
  price,
  description,
  discountedPrice,
  originalPrice,
  sold,
}) {
  const { additionalImagesGallery } = useGalleryPost(id);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef(null);

  // Determine whether to show discounted price or not
  const isDiscounted = discountedPrice && parseFloat(discountedPrice) < parseFloat(originalPrice);

  // Handle image load to update state
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // Set up intersection observer for lazy loading
  useEffect(() => {
    const observerCallback = (entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        if (observer) observer.disconnect(); // Disconnect observer once it's loaded
      }
    };

    let observer;
    if (imageRef.current) {
      observer = new IntersectionObserver(observerCallback, {
        threshold: 0.1, // Trigger when 10% of the image is visible
        rootMargin: '100px', // Load images that are 100px away from viewport
      });

      observer.observe(imageRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [imageRef]);

  // Helper function to get appropriate image URL
  const getImageUrl = (url) => {
    if (!url) return '';
    return url.endsWith('.mp4') ? `${url.slice(0, -4)}.jpg` : url;
  };

  return (
    <div className="gallery-display-container" key={id}>
      <Link className="gallery-display a-gallery" to={`/main-gallery/${id}`} title={`${title}`}>
        <div
          style={{
            position: 'absolute',
          }}
        >
          {sold ? <img src="/sold.png" /> : ''}
        </div>

        {/* Lazy loading image container */}
        <div ref={imageRef} style={{ position: 'relative', width: '100%', minHeight: '190px' }}>
          {/* Placeholder while loading */}
          {!isLoaded && (
            <div
              className="image-placeholder"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#333',
                borderRadius: '5px',
              }}
            ></div>
          )}

          {/* Actual image - only load when in viewport */}
          {isVisible && (
            <img
              className="gallery-img"
              src={
                getImageUrl(image_url) ||
                (additionalImagesGallery[0] && getImageUrl(additionalImagesGallery[0].image_url))
              }
              alt="gallery"
              style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
              onLoad={handleImageLoad}
            />
          )}
        </div>

        <div className="gallery-detail-container">
          <span className="gallery-title">
            {title.length > 20 ? title.slice(0, 20) + '...' : title}
          </span>
          <span className="gallery-desc">{description}</span>
          <div className="price-category-wrapper">
            <span className="gallery-price">
              {sold ? (
                <>
                  {isDiscounted ? (
                    <>
                      <span
                        style={{
                          textDecoration: 'line-through',
                          color: 'red',
                        }}
                      >
                        <span>${originalPrice}</span>
                      </span>
                    </>
                  ) : (
                    <span
                      style={{
                        textDecoration: 'line-through',
                      }}
                    >
                      ${price}
                    </span>
                  )}
                </>
              ) : (
                <>
                  {isDiscounted ? (
                    <>
                      <span className="gallery-on-sale">ON SALE! </span>
                      <span
                        style={{
                          textDecoration: 'line-through',
                          marginRight: '10px',
                          color: 'red',
                        }}
                      >
                        ${originalPrice}
                      </span>
                      <span>${Math.floor(discountedPrice)}</span>
                    </>
                  ) : (
                    <span>${price}</span>
                  )}
                </>
              )}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
