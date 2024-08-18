import React from 'react';
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

  // Determine whether to show discounted price or not
  const isDiscounted = discountedPrice && parseFloat(discountedPrice) < parseFloat(originalPrice);

  return (
    <div className="gallery-display-container" key={id}>
      <Link className="gallery-display a-gallery" to={`/main-gallery/${id}`} title={`${title}`}>
        <div
          style={{
            position: 'absolute',
            color: 'black',
            fontSize: '1.5rem',
            backgroundColor: 'yellow',
            fontWeight: 'bold',
            fontFamily: 'Raleway, sans-serif',
            padding: '0 5px 0 5px',
          }}
        >
          {sold ? 'SOLD OUT' : ''}
        </div>{' '}
        {image_url ? (
          <img
            className="gallery-img"
            src={image_url.endsWith('.mp4') ? `${image_url.slice(0, -4)}.jpg` : image_url}
            alt="gallery"
          />
        ) : (
          additionalImagesGallery[0] && (
            <img
              className="gallery-img"
              src={
                additionalImagesGallery[0].image_url.endsWith('.mp4')
                  ? `${additionalImagesGallery[0].image_url.slice(0, -4)}.jpg`
                  : additionalImagesGallery[0].image_url
              }
              alt="gallery"
            />
          )
        )}
        <div className="gallery-detail-container">
          <span className="gallery-title">
            {title.length > 20 ? title.slice(0, 20) + '...' : title}
          </span>
          <span className="gallery-desc">{description}</span>
          <div className="price-category-wrapper">
            <span className="gallery-price">
              {isDiscounted ? (
                <>
                  <span className="gallery-on-sale">ON SALE! </span>
                  <span
                    style={{ textDecoration: 'line-through', marginRight: '10px', color: 'red' }}
                  >
                    ${originalPrice}
                  </span>
                  <span>${discountedPrice}</span>
                </>
              ) : (
                <span>${price}</span>
              )}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
