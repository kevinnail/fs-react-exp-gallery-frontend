import React from 'react';
import { useParams } from 'react-router-dom';
import { usePost } from '../../hooks/usePost.js';
import './PostDetail.css';

export default function PostDetail() {
  const { id } = useParams();
  // const post = usePost(id);
  const { postDetail, imageUrls, loading, error } = usePost(id);
  // const { postDetail } = post;

  if (loading) return <h1>Loading...</h1>;

  return (
    <div className="post-detail-div">
      <h1>{postDetail.title}</h1>
      <p>{postDetail.category}</p>
      <p>{postDetail.description}</p>
      <p>${postDetail.price}</p>
      {imageUrls.map((imageUrl, index) => (
        <img className="gallery-image" key={index} src={imageUrl} alt={`post-${index}`} />
      ))}
    </div>
  );
}
