import React from 'react';
import './GalleryPostCard.css';
// import { usePost } from '../../hooks/usePost.js';
// import { useUser } from '../../hooks/useUser.js';

export default function GalleryPostCard({
  id,
  title,
  image_url,
  price,
  // posts,
  // description, //commented just for now
  // category, //commented just for now
}) {
  return (
    <>
      <a href={`/gallery/${id}`}>
        <div className="gallery-display" key={id}>
          <p className="gallery-title">{title.length > 20 ? title.slice(0, 20) + '...' : title}</p>
          <img className="gallery-img" src={image_url} alt="gallery image" />
          <p className="gallery-price">${price}</p>
        </div>
      </a>
    </>
  );
}
