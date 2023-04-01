import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePost } from '../../hooks/usePost.js';
import './PostDetail.css';

export default function PostDetail() {
  const { id } = useParams();
  const { postDetail, imageUrls, loading, error } = usePost(id);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction) => {
    if (direction === 'left' && currentIndex < imageUrls.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    } else if (direction === 'right' && currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  if (error) return <h1>{error}</h1>;
  // show loading spinner while waiting for posts to load
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
      <div className="gallery-container">
        <button className="swipe-button" onClick={() => handleSwipe('right')}>
          &lt;
        </button>
        <img className="gallery-image" src={imageUrls[currentIndex]} alt={`post-${currentIndex}`} />
        <button className="swipe-button" onClick={() => handleSwipe('left')}>
          &gt;
        </button>
      </div>
      <div className="thumbnail-container">
        {imageUrls.map((imageUrl, index) => (
          <img
            key={index}
            className={`thumbnail-gallery ${index === currentIndex ? 'active' : ''}`}
            src={imageUrl}
            alt={`thumbnail-gallery-${index}`}
            onClick={() => handleThumbnailClick(index)}
          />
        ))}
      </div>
    </div>
  );
}
