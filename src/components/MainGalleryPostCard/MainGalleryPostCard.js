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
  category,
  discountedPrice,
  originalPrice,
}) {
  const { additionalImagesGallery, loading } = useGalleryPost(id);

  // Determine whether to show discounted price or not
  const isDiscounted = discountedPrice && parseFloat(discountedPrice) < parseFloat(originalPrice);

  // Handle loading state
  if (loading) {
    return (
      <div className="gallery-display-container loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="gallery-display-container" key={id}>
      <Link className="gallery-display a-gallery" to={`/main-gallery/${id}`} title={`${title}`}>
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
            <span className="gallery-category"> {category}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
