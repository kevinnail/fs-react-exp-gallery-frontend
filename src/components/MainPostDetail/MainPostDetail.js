import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGalleryPost } from '../../hooks/useGalleryPost.js';
import Modal from 'react-modal';
Modal.setAppElement('#root'); // If your app is using #root as the main container
import '../PostDetail/PostDetail.css';
import Menu from '../Menu/Menu.js';
import { signOut } from '../../services/auth.js';
import { useUser } from '../../hooks/useUser.js';
import Loading from '../Loading/Loading.js';

export default function MainPostDetail() {
  const { id } = useParams();
  const { postDetail, imageUrls, loading, error } = useGalleryPost(id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { setUser } = useUser();
  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  if (error) return <h1>{error}</h1>;
  // show loading spinner while waiting for posts to load
  if (loading) {
    return (
      <div className="loading-div-wrapper">
        {/* <div className="loading-div"> */}
        <Loading />
        {/* <img className="rotating-marble" src="../marble-css.png" /> */}
        {/* </div> */}
      </div>
    );
  }
  const handleClick = async () => {
    await signOut();
    setUser(null);
  };
  return (
    <div className="post-detail-div-wrapper">
      <div className="menu-search-container">
        <Menu handleClick={handleClick} />
      </div>
      <div className="post-detail-div">
        <section className="title-container">
          <h1 className="detail-title">{postDetail.title}</h1>
        </section>
        <section className="title-cat-container">
          <span className="category-label">Category:</span>
          <span className="category-span">{postDetail.category}</span>
          <span className="price-details">${postDetail.price}</span>
        </section>
        <section className="desc-price-container">
          <span className="desc-details">{postDetail.description}</span>
          <p className="contact">
            <a href="mailto:kevin@kevinnail.com">Email Kevin</a>{' '}
          </p>
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
    </div>
  );
}
