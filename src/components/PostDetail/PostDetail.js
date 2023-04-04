import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { usePost } from '../../hooks/usePost.js';
import './PostDetail.css';

Modal.setAppElement('#root'); // If your app is using #root as the main container

export default function PostDetail() {
  const { id } = useParams();
  const { postDetail, imageUrls, loading, error } = usePost(id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  if (error) return <h1>{error} </h1>;
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
        <span className="category-label">Category:</span>
        <span>{postDetail.category}</span>
      </section>
      <section className="desc-price-container">
        <span className="desc-details">{postDetail.description}</span>
        <span className="price-details">${postDetail.price}</span>
      </section>
      <div className="gallery-container">
        <img
          className="gallery-image"
          src={imageUrls[currentIndex]}
          alt={`post-${currentIndex}`}
          onClick={openModal}
        />
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          className="modal"
          overlayClassName="overlay2"
        >
          <img
            className="modal-image"
            src={imageUrls[currentIndex]}
            alt={`modal-post-${currentIndex}`}
          />
          <button className="modal-close" onClick={closeModal}>
            x
          </button>
        </Modal>
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
