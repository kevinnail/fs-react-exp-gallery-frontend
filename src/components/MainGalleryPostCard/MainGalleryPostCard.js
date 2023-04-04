import React from 'react';
import { Link } from 'react-router-dom';
import { useGalleryPost } from '../../hooks/useGalleryPost.js';
// import '../GalleryPostCard/GalleryPostCard.css ';
import '../GalleryPostCard/GalleryPostCard.css';

export default function MainGalleryPostCard({ id, title, image_url, price }) {
  const post = useGalleryPost(id);
  console.log('post', post);
  return (
    <>
      <div className="gallery-display-container" key={id}>
        <Link className="gallery-display" to={`/main-gallery/${id}`}>
          {image_url ? (
            <img className="gallery-img" src={image_url} alt="edit" />
          ) : (
            <>
              {post.additionalImages[0] && (
                <img className="gallery-img" src={post.additionalImages[0].image_url} alt="edit" />
              )}
            </>
          )}
          <div className="gallery-detail-container">
            <span className="gallery-title">
              {title.length > 20 ? title.slice(0, 20) + '...' : title}
            </span>
            <span className="gallery-price">${price}</span>
          </div>
        </Link>
      </div>
    </>
  );
}
