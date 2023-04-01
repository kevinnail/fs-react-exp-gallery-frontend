import React from 'react';
import { useParams } from 'react-router-dom';
import { usePost } from '../../hooks/usePost.js';
import './PostDetail.css';

export default function PostDetail() {
  const { id } = useParams();
  const { postDetail, imageUrls, loading, error } = usePost(id);
  if (error) return <h1>{error}</h1>;
  // show loading spinner while waiting for posts to load1
  if (loading) {
    return (
      <div className="loading-div">
        <img className="loading" src="../logo-sq.png" />
      </div>
    );
  }

  return (
    <div className="post-detail-div">
      <section>
        <h1 className="detail-title">{postDetail.title}</h1>
        <span>{postDetail.category}</span>
      </section>
      <section className="desc-price-container">
        <span className="desc-details">{postDetail.description}</span>
        <span className="price-details">${postDetail.price}</span>
      </section>
      {imageUrls.map((imageUrl, index) => (
        <img className="gallery-image" key={index} src={imageUrl} alt={`post-${index}`} />
      ))}
    </div>
  );
}
