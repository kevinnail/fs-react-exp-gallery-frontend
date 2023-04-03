import React from 'react';

export default function MainGalleryPostCard({ id, title, image_url, price }) {
  return (
    <div>
      <div>{title}</div>
      <div>{price}</div>
      <img src={image_url} alt={title} />
    </div>
  );
}
