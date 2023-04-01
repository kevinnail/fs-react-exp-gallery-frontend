import React from 'react';
import { usePost } from '../../hooks/usePost.js';
import './GalleryPostCard.css';

export default function GalleryPostCard({
  id,
  title,
  image_url,
  price,
  // posts,
  // description, //commented just for now
  // category, //commented just for now
}) {
  const post = usePost(id);

  return (
    <>
      <div className="gallery-display-container" key={id}>
        <a className="gallery-display" href={`/gallery/${id}`}>
          <div className="gallery-detail-container">
            <span className="gallery-title">
              {title.length > 17 ? title.slice(0, 17) + '...' : title}
            </span>
            <span className="gallery-price">${price}</span>
          </div>
          {image_url ? (
            <img className="gallery-img" src={image_url} alt="edit" />
          ) : (
            <>
              {post.additionalImages[0] && (
                <img className="gallery-img" src={post.additionalImages[0].image_url} alt="edit" />
              )}
            </>
          )}
        </a>
      </div>
    </>
  );
}
