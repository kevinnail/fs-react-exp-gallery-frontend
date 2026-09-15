import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { useSwipeable } from 'react-swipeable';
import { useGalleryPost } from '../../hooks/useGalleryPost.js';
import Loading from '../Loading/Loading.js';
import NotFound from '../NotFound/NotFound.js';
import ShareButton from '../ShareButton/ShareButton.js';
import RequestButton from '../RequestButton/RequestButton.js';
import { useUserStore } from '../../stores/userStore.js';
import { getPiecePrice } from '../../services/userSpecial.js';
import './MainPostDetail.css';

Modal.setAppElement('#root');

const GLASSPASS_LOGO =
  'https://stress-less-glass.s3.us-west-2.amazonaws.com/stress-less-glass-assets/glasspass_logo.PNG';
const ETSY_LOGO =
  'https://stress-less-glass.s3.us-west-2.amazonaws.com/stress-less-glass-assets/etsy_logo.PNG';
const INSTAGRAM_LOGO = '/IG.png';

// Video posts store a matching .jpg poster frame alongside the .mp4.
const posterFor = (source) => (source?.endsWith('.mp4') ? source.replace('.mp4', '.jpg') : source);

function storeFor(sellingLink) {
  const platform = sellingLink?.toLowerCase() ?? '';

  if (platform.includes('etsy')) {
    return { name: 'Etsy', logo: ETSY_LOGO, isAuction: false };
  }
  if (platform.includes('instagram')) {
    return { name: 'Instagram', logo: INSTAGRAM_LOGO, isAuction: true };
  }
  return { name: 'GlassPass', logo: GLASSPASS_LOGO, isAuction: false };
}

export default function MainPostDetail() {
  const { id } = useParams();
  const { postDetail, imageUrls, loading, notFound } = useGalleryPost(id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxIsOpen, setLightboxIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  const store = storeFor(postDetail?.selling_link);

  const { listedPrice, salePrice } = getPiecePrice(postDetail ?? {}, { isSignedIn: Boolean(user) });

  const currentSource = imageUrls[currentIndex];
  const isVideo = Boolean(currentSource?.endsWith('.mp4'));

  const showPrevious = useCallback(() => {
    setCurrentIndex((previous) => (previous > 0 ? previous - 1 : previous));
  }, []);

  const showNext = useCallback(() => {
    setCurrentIndex((previous) => (previous < imageUrls.length - 1 ? previous + 1 : previous));
  }, [imageUrls.length]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: showNext,
    onSwipedRight: showPrevious,
  });

  // The main image fades in per slide, so the placeholder has to come
  // back whenever the selection changes.
  useEffect(() => {
    setIsLoaded(false);
  }, [currentIndex]);

  useEffect(() => {
    if (!lightboxIsOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') showPrevious();
      if (event.key === 'ArrowRight') showNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIsOpen, showPrevious, showNext]);

  const requestPiece = {
    postId: postDetail?.id,
    title: postDetail?.title,
    category: postDetail?.category,
    price: postDetail?.price,
    discountedPrice: salePrice,
    imageUrl: imageUrls?.[0],
    url: window.location.href,
    sold: postDetail?.sold,
  };

  const handleMessageClick = () => {
    navigate('/messages', {
      state: {
        pieceMetadata: {
          id: postDetail?.id,
          title: postDetail?.title,
          category: postDetail?.category,
          price: postDetail?.price,
          discountedPrice: salePrice,
          imageUrl: imageUrls?.[0],
          url: window.location.href,
        },
      },
    });
  };

  if (loading) return <Loading />;
  if (notFound) return <NotFound />;

  return (
    <main className="piece-detail-page">
      <div className="piece-detail-top-bar">
        <button className="piece-detail-back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <ShareButton
          imageUrl={currentSource}
          title={postDetail?.title}
          text={postDetail?.title}
          className="piece-detail-top-bar-share-button"
        />
      </div>

      <div className="piece-detail-layout">
        <div className="piece-detail-media-column">
          <figure
            className={`piece-detail-main-media${isVideo ? '' : ' piece-detail-main-media--zoomable'}`}
            onClick={() => (currentSource ? setLightboxIsOpen(true) : null)}
          >
            {postDetail?.sold ? <span className="piece-detail-sold-badge">Sold</span> : null}

            {isVideo ? (
              <video controls>
                <source src={currentSource} type="video/mp4" />
              </video>
            ) : currentSource ? (
              <>
                {isLoaded ? null : (
                  <span className="piece-detail-image-skeleton" aria-hidden="true" />
                )}
                <img
                  src={posterFor(currentSource)}
                  alt={postDetail?.title}
                  style={{ opacity: isLoaded ? 1 : 0 }}
                  onLoad={() => setIsLoaded(true)}
                />
              </>
            ) : null}
          </figure>

          {imageUrls.length > 1 ? (
            <div className="piece-detail-thumbnails">
              {imageUrls.map((imageUrl, index) => (
                <button
                  key={imageUrl}
                  className={`piece-detail-thumbnail${
                    index === currentIndex ? ' piece-detail-thumbnail--selected' : ''
                  }`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Show image ${index + 1} of ${imageUrls.length}`}
                >
                  <img src={posterFor(imageUrl)} alt="" />
                </button>
              ))}
            </div>
          ) : null}

          {!isVideo && currentSource ? (
            <span className="piece-detail-zoom-hint">Tap the photo to enlarge</span>
          ) : null}
        </div>

        <aside className="piece-detail-info-column">
          {postDetail?.category ? (
            <span className="piece-detail-category">{postDetail.category}</span>
          ) : null}

          <h1 className="piece-detail-title">{postDetail?.title}</h1>

          <p className="piece-detail-price">
            {postDetail?.sold ? (
              <>
                <span className="piece-detail-sold-label">Sold</span>
                <span className="piece-detail-original-price">${listedPrice}</span>
              </>
            ) : salePrice !== null ? (
              <>
                <span className="piece-detail-original-price">${listedPrice}</span>$
                {salePrice.toFixed(2)}
              </>
            ) : (
              <>${postDetail?.price}</>
            )}
          </p>

          {postDetail?.description ? (
            <p className="piece-detail-description">{postDetail.description}</p>
          ) : null}

          <div className="piece-detail-divider" />

          <div className="piece-detail-actions">
            <RequestButton piece={requestPiece} variant="detail" />

            <button
              className="piece-detail-button piece-detail-button--secondary"
              onClick={handleMessageClick}
            >
              Message Kevin
            </button>

            {postDetail?.selling_link ? (
              <a
                className="piece-detail-button piece-detail-button--secondary"
                href={postDetail.selling_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img className="piece-detail-store-logo" src={store.logo} alt="" />
                {store.isAuction ? `Bid on ${store.name}` : `Buy on ${store.name}`}
              </a>
            ) : null}
          </div>

          <ShareButton
            imageUrl={currentSource}
            title={postDetail?.title}
            text={postDetail?.title}
            variant="full"
            className="piece-detail-info-column-share-button"
          />

          <div className="piece-detail-contact-links">
            <span className="piece-detail-contact-label">Contact</span>
            <a href="mailto:kevin@kevinnail.com" aria-label="Email Kevin">
              <img src="/email.png" alt="" />
            </a>
            <a
              href="https://www.instagram.com/stresslessglass"
              target="_blank"
              rel="noreferrer"
              aria-label="Stress Less Glass on Instagram"
            >
              <img src="/IG.png" alt="" />
            </a>
          </div>
        </aside>
      </div>

      <Modal
        isOpen={lightboxIsOpen}
        onRequestClose={() => setLightboxIsOpen(false)}
        className="piece-detail-lightbox"
        overlayClassName="piece-detail-lightbox-overlay"
        contentLabel={postDetail?.title}
      >
        {isVideo ? (
          <video controls>
            <source src={currentSource} type="video/mp4" />
          </video>
        ) : (
          <img src={posterFor(currentSource)} alt={postDetail?.title} {...swipeHandlers} />
        )}

        <button
          className="piece-detail-lightbox-close-button"
          onClick={() => setLightboxIsOpen(false)}
          aria-label="Close"
        >
          &#10006;
        </button>

        {currentIndex > 0 ? (
          <button
            className="piece-detail-lightbox-arrow piece-detail-lightbox-arrow--previous"
            onClick={showPrevious}
            aria-label="Previous image"
          >
            ‹
          </button>
        ) : null}

        {currentIndex < imageUrls.length - 1 ? (
          <button
            className="piece-detail-lightbox-arrow piece-detail-lightbox-arrow--next"
            onClick={showNext}
            aria-label="Next image"
          >
            ›
          </button>
        ) : null}

        {imageUrls.length > 1 ? (
          <span className="piece-detail-lightbox-image-counter">
            {currentIndex + 1} / {imageUrls.length}
          </span>
        ) : null}
      </Modal>
    </main>
  );
}
