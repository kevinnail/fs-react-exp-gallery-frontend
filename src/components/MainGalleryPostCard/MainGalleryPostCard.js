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
}) {
  const post = useGalleryPost(id);

  return (
    <>
      <div className="gallery-display-container" key={id}>
        <Link className="gallery-display a-gallery" to={`/main-gallery/${id}`} title={`${title}`}>
          {image_url ? (
            image_url.endsWith('.mp4') ? (
              <img
                className="gallery-img"
                src={`${image_url.replace('.mp4', '.jpg')}#t=0.5`}
                alt="thumbnail"
              />
            ) : (
              <img className="gallery-img" src={image_url} alt="edit" />
            )
          ) : (
            <>
              {post.additionalImagesGallery[0] && (
                <img
                  className="gallery-img"
                  src={post.additionalImagesGallery[0].image_url}
                  alt="edit"
                />
              )}
            </>
          )}
          <div className="gallery-detail-container">
            <span className="gallery-title">{title}</span>
            <span className="gallery-desc">{description}</span>
            <div className="price-category-wrapper">
              <span className="gallery-price">${price}</span>
              <span className="gallery-category"> {category}</span>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}
