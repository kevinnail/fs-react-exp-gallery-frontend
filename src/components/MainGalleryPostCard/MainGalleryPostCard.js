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
  const containerRef = useRef(null);

  // Determine whether to show discounted price or not
  const isDiscounted = discountedPrice && parseFloat(discountedPrice) < parseFloat(originalPrice);

  // Handle image load to update state
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // Get the correct image source
  const getImageSource = () => {
    if (image_url) {
      return image_url.endsWith('.mp4') ? `${image_url.slice(0, -4)}.jpg` : image_url;
    } else if (additionalImagesGallery && additionalImagesGallery.length > 0) {
      const additionalSrc = additionalImagesGallery[0].image_url;
      return additionalSrc.endsWith('.mp4') ? `${additionalSrc.slice(0, -4)}.jpg` : additionalSrc;
    }
    return '';
  };

  // Set up intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // If container is in view
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    // Store the current value of the ref in a variable
    const currentRef = containerRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      // Use the stored value in the cleanup function
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [containerRef]);

  return (
    <div className="gallery-display-container" key={id}>
      <Link className="gallery-display a-gallery" to={`/main-gallery/${id}`} title={`${title}`}>
        <div
          style={{
            position: 'absolute',
            alignSelf: 'flex-start',
            zIndex: 10, // Add z-index to ensure it's above other elements
          }}
        >
          {sold ? <img src="/sold.png" /> : ''}
        </div>

        <div
          ref={containerRef}
          className="lazy-image-container"
          style={{ position: 'relative', width: '100%' }}
        >
          {/* Always render placeholder, hide when image is loaded */}
          <div
            className="image-placeholder"
            style={{
              width: '100%',
              paddingBottom: '100%', // Maintain aspect ratio
              backgroundColor: '#333',
              borderRadius: '5px',
              display: isLoaded ? 'none' : 'block',
            }}
          ></div>

          {/* Always render the image element, but only set the src when visible */}
          <img
            className="gallery-img"
            src={isVisible ? getImageSource() : ''}
            alt={title}
            style={{
              display: 'block',
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              position: isLoaded ? 'relative' : 'absolute', // Position it absolutely when not loaded
              top: 0,
              left: 0,
            }}
            onLoad={handleImageLoad}
          />
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
