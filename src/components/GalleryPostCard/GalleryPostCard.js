import React from 'react';
import './GalleryPostCard.css';
import { usePost } from '../../hooks/usePost.js';
import { useUser } from '../../hooks/useUser.js';

export default function GalleryPostCard({
  id,
  posts,
  title,
  description, //commented just for now
  image_url, //commented just for now
  category, //commented just for now
  price,
}) {
  // const { user } = useUser();
  // const { setError } = usePost(id);
  return (
    <div className="gallery-display" key={id}>
      <img className="gallery-img" src={image_url} alt="edit" />
      <p className="grid-s2 grid-e4 ">{title.length > 9 ? title.slice(0, 9) + '...' : title}</p>
      <p className="grid-5">${price}</p>
      <div className="admin-prod-btn-cont grid-7"></div>
      {/* <h1>title: {title}</h1>
  <p>desc: {description}</p>
  <p>img: {image_url}</p>
  <p>cat: {category}</p>
  <p>$ {price}</p>
  <p>ID: {id}</p> */}
    </div>
  );
}
