import { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useGalleryPost } from '../../hooks/useGalleryPost.js';
import Modal from 'react-modal';
import { useSwipeable } from 'react-swipeable'; // Add this import
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
  const history = useHistory();

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };
  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < imageUrls.length - 1 ? prevIndex + 1 : prevIndex));
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrevious,
  });

  if (error) return <h1>{error}</h1>;
  // show loading spinner while waiting for posts to load
  if (loading) {
    return <Loading />;
  }
  const handleClick = async () => {
    await signOut();
    setUser(null);
  };

  const getThumbnailUrl = (url) => {
    if (url.endsWith('.mp4')) {
      return url.replace('.mp4', '.jpg');
    } else if (url.endsWith('.mov')) {
      return url.replace('.mov', '.jpg');
    } else {
      return url;
    }
  };

  const renderGalleryItem = (url, currentIndex) => {
    if (url.endsWith('.mp4') || url.endsWith('.mov')) {
      const videoType = url.endsWith('.mp4') ? 'video/mp4' : 'video/mov';

      return (
        <video className="gallery-video" controls>
          <source src={url} type={videoType} />
        </video>
      );
    } else {
      return (
        <img className="gallery-image" src={url} alt={`post-${currentIndex}`} onClick={openModal} />
      );
    }
  };

  return (
    <>
      <div className="post-detail-div-wrapper">
        <div className="menu-search-container">
          <Menu handleClick={handleClick} />
        </div>{' '}
        <div className="detail-top-container">
          <div>
            {' '}
            <div className="back-btn">
              <button
                className="retract-button2 btn-adjust"
                onClick={() => history.goBack()}
                title="Back to previous page"
              >
                <i className="fa fa-arrow-left" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          <div className="post-detail-div">
            {' '}
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
              {/* {imageUrls[currentIndex].endsWith('.mp4') ? (
                <video className="gallery-video" controls>
                  <source src={imageUrls[currentIndex]} type="video/mp4" />
                  <source src={imageUrls[currentIndex]} type="video/mov" />
                </video>
              ) : (
                <img
                  className="gallery-image"
                  src={imageUrls[currentIndex].replace('.mp4', '.jpg')}
                  alt={`post-${currentIndex}`}
                  onClick={openModal}
                />
              )} */}
              {renderGalleryItem(imageUrls[currentIndex], currentIndex)}
              <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="overlay2"
              >
                {imageUrls[currentIndex].endsWith('.mp4') ? (
                  <video className="modal-video" controls>
                    <source src={imageUrls[currentIndex]} type="video/mp4" />
                    <source src={imageUrls[currentIndex]} type="video/mov" />
                  </video>
                ) : (
                  <img
                    className="modal-image"
                    src={imageUrls[currentIndex].replace('.mp4', '.jpg')}
                    alt={`modal-post-${currentIndex}`}
                    {...swipeHandlers}
                  />
                )}
                <button className="modal-close" onClick={closeModal}>
                  x
                </button>
                {currentIndex > 0 && (
                  <button className="modal-navigation previous" onClick={handlePrevious}></button>
                )}
                {currentIndex < imageUrls.length - 1 && (
                  <button className="modal-navigation next" onClick={handleNext}></button>
                )}
              </Modal>
            </div>
            <div className="thumbnail-container">
              {imageUrls.map((imageUrl, index) => (
                <img
                  key={index}
                  className={`thumbnail-gallery ${index === currentIndex ? 'active' : ''}`}
                  src={getThumbnailUrl(imageUrl)}
                  alt={`thumbnail-gallery-${index}`}
                  onClick={() => handleThumbnailClick(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
