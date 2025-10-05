import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGalleryPost } from '../../hooks/useGalleryPost.js';
import Modal from 'react-modal';
import { useSwipeable } from 'react-swipeable'; // Add this import
Modal.setAppElement('#root'); // If your app is using #root as the main container
import '../PostDetail/PostDetail.css';
import Menu from '../Menu/Menu.js';
import { signOut } from '../../services/auth.js';
import { useUserStore } from '../../stores/userStore.js';
import Loading from '../Loading/Loading.js';

export default function MainPostDetail() {
  const { id } = useParams();
  const { postDetail, imageUrls, loading, error } = useGalleryPost(id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { signout } = useUserStore();
  const navigate = useNavigate();

  const glasspassLogoLink =
    'https://stress-less-glass.s3.us-west-2.amazonaws.com/stress-less-glass-assets/glasspass_logo.PNG';
  const etsyLogoLink =
    'https://stress-less-glass.s3.us-west-2.amazonaws.com/stress-less-glass-assets/etsy_logo.PNG';
  const instagramLogoLink = '/IG.png';

  let sellingLogoLink = glasspassLogoLink;
  let store = 'GlassPass';
  let isInstagram = false;

  const platform = postDetail?.selling_link?.toLowerCase();
  if (platform?.includes('etsy')) {
    sellingLogoLink = etsyLogoLink;
    store = 'Etsy';
  } else if (platform?.includes('instagram')) {
    sellingLogoLink = instagramLogoLink;
    store = 'Instagram';
    // eslint-disable-next-line
    isInstagram = true;
  }

  // console.log('postDetail?', postDetail?);
  // Determine whether to show discounted price or not
  const originalPrice = parseFloat(postDetail?.originalPrice);
  const discountedPrice = parseFloat(postDetail?.discountedPrice);
  const isDiscounted = discountedPrice && discountedPrice < originalPrice;

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
    signout();
  };

  const handleCategoryClick = () => {
    navigate(`/search?q=${postDetail?.category}`);
  };

  return (
    <>
      <div className="post-detail-div-wrapper">
        <div className="menu-search-container">
          <Menu handleClick={handleClick} />
        </div>{' '}
        <div className="detail-top-container">
          <div className="post-detail-div">
            <section className="title-container">
              <button
                className="retract-button2 btn-adjust"
                onClick={() => navigate(-1)}
                title="Back to previous page"
              >
                <span className="arrow-icon">←</span>
              </button>
              <h1 className="detail-title">{postDetail?.title}</h1>
            </section>
            <section className="title-cat-container">
              <div>
                <span className="category-label">Category:</span>
                <span className="new-link category-span" onClick={handleCategoryClick}>
                  {postDetail?.category}
                </span>
              </div>
              <div className="price-details">
                {postDetail?.sold ? (
                  <>
                    <span
                      style={{
                        textDecoration: 'line-through',
                        marginRight: '10px',
                        color: 'red',
                      }}
                    >
                      {isDiscounted ? (
                        <>
                          <span style={{ textDecoration: 'line-through' }}>
                            ${postDetail?.originalPrice}
                          </span>
                        </>
                      ) : (
                        <span style={{ textDecoration: 'line-through' }}>${postDetail?.price}</span>
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    {isDiscounted ? (
                      <>
                        <span className="detail-on-sale">ON SALE! </span>
                        <span
                          style={{
                            textDecoration: 'line-through',
                            marginRight: '10px',
                            color: 'red',
                          }}
                        >
                          ${postDetail?.originalPrice}
                        </span>
                        <span>${Number(postDetail?.discountedPrice).toFixed(2)}</span>
                      </>
                    ) : (
                      <span>${postDetail?.price}</span>
                    )}
                  </>
                )}
              </div>
            </section>
            <div className="gallery-container">
              <div
                style={{
                  position: 'absolute',
                  alignSelf: 'flex-start',
                }}
              >
                {postDetail?.sold ? <img src="/sold.png" /> : ''}
              </div>
              {imageUrls[currentIndex]?.endsWith('.mp4') ? (
                <video className="gallery-video" controls>
                  <source src={imageUrls[currentIndex]} type="video/mp4" />
                </video>
              ) : (
                <>
                  <img
                    className="gallery-image"
                    src={imageUrls[currentIndex]?.replace('.mp4', '.jpg')}
                    alt={`post-${currentIndex}`}
                    onClick={openModal}
                  />
                </>
              )}
              <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="overlay2"
              >
                {imageUrls[currentIndex]?.endsWith('.mp4') ? (
                  <video className="modal-video" controls>
                    <source src={imageUrls[currentIndex]} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    className="modal-image"
                    src={imageUrls[currentIndex]?.replace('.mp4', '.jpg')}
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
                  src={imageUrl.endsWith('.mp4') ? imageUrl.replace('.mp4', '.jpg') : imageUrl}
                  alt={`thumbnail-gallery-${index}`}
                  onClick={() => handleThumbnailClick(index)}
                />
              ))}
            </div>
            <section className="desc-price-container">
              <span className="desc-details">{postDetail?.description}</span>
            </section>
            <section className="selling-link-wrapper">
              <a href={`${postDetail?.selling_link}`} target="_blank" rel="noopener noreferrer">
                <div>
                  {postDetail.selling_link && (
                    <div className="inner-selling-link">
                      {' '}
                      <span className={'selling-link-span'}>
                        {platform?.includes('instagram') ? (
                          `Up for auction on ${store}!`
                        ) : (
                          <>
                            <span className="shimmer">Available</span> on {store}!
                          </>
                        )}
                      </span>
                      <img
                        className="selling-logo-link"
                        src={sellingLogoLink}
                        alt="Link to shopping cart"
                      />
                    </div>
                  )}
                </div>
              </a>
            </section>
            <section className="detail-contact-wrapper">
              <span className="detail-contact-text">Contact: </span>
              <div className="detail-contact-img-link-wrapper">
                {' '}
                <a href={'mailto:kevin@kevinnail.com'}>
                  <img className="site-msg-link-ig" width={'48px'} src="/email.png" />
                </a>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://www.instagram.com/stresslessglass"
                >
                  <img width={'48px'} src="/IG.png" />
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
