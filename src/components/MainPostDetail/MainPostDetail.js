import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { useSwipeable } from 'react-swipeable';
import { useGalleryPost } from '../../hooks/useGalleryPost.js';
import Loading from '../Loading/Loading.js';
import NotFound from '../NotFound/NotFound.js';
import ShareButton from '../ShareButton/ShareButton.js';
import RequestButton from '../RequestButton/RequestButton.js';
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

  const store = storeFor(postDetail?.selling_link);

  const originalPrice = parseFloat(postDetail?.originalPrice);
  const discountedPrice = parseFloat(postDetail?.discountedPrice);
  const isDiscounted = Boolean(discountedPrice) && discountedPrice < originalPrice;

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
    discountedPrice: postDetail?.discountedPrice,
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
          discountedPrice: postDetail?.discountedPrice,
          imageUrl: imageUrls?.[0],
          url: window.location.href,
        },
      },
    });
  };

  if (loading) return <Loading />;
  if (notFound) return <NotFound />;

  return (
    <main className="slg-detail">
      <div className="slg-detail-bar">
        <button className="slg-detail-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <ShareButton
          imageUrl={currentSource}
          title={postDetail?.title}
          text={postDetail?.title}
          className="slg-detail-share--bar"
        />
      </div>

      <div className="slg-detail-layout">
        <div className="slg-detail-stage">
          <figure
            className={`slg-detail-figure${isVideo ? '' : ' slg-detail-figure--zoomable'}`}
            onClick={() => (currentSource ? setLightboxIsOpen(true) : null)}
          >
            {postDetail?.sold ? <span className="slg-detail-sold">Sold</span> : null}

            {isVideo ? (
              <video controls>
                <source src={currentSource} type="video/mp4" />
              </video>
            ) : currentSource ? (
              <>
                {isLoaded ? null : <span className="slg-detail-skeleton" aria-hidden="true" />}
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
            <div className="slg-detail-thumbs">
              {imageUrls.map((imageUrl, index) => (
                <button
                  key={imageUrl}
                  className={`slg-detail-thumb${
                    index === currentIndex ? ' slg-detail-thumb--active' : ''
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
            <span className="slg-detail-zoom-hint">Tap the photo to enlarge</span>
          ) : null}
        </div>

        <aside className="slg-detail-rail">
          {postDetail?.category ? (
            <span className="slg-detail-eyebrow">{postDetail.category}</span>
          ) : null}

          <h1 className="slg-detail-title">{postDetail?.title}</h1>

          <p className="slg-detail-price">
            {postDetail?.sold ? (
              <>
                <span className="slg-detail-sold-flag">Sold</span>
                <span className="slg-detail-was">
                  ${isDiscounted ? postDetail?.originalPrice : postDetail?.price}
                </span>
              </>
            ) : isDiscounted ? (
              <>
                <span className="slg-detail-sale-flag">On sale</span>
                <span className="slg-detail-was">${postDetail?.originalPrice}</span>$
                {discountedPrice.toFixed(2)}
              </>
            ) : (
              <>${postDetail?.price}</>
            )}
          </p>

          {postDetail?.description ? (
            <p className="slg-detail-desc">{postDetail.description}</p>
          ) : null}

          <div className="slg-detail-rule" />

          <div className="slg-detail-actions">
            <RequestButton piece={requestPiece} variant="detail" />

            <button
              className="slg-detail-button slg-detail-button--quiet"
              onClick={handleMessageClick}
            >
              Message Kevin
            </button>

            {postDetail?.selling_link ? (
              <a
                className="slg-detail-button slg-detail-button--quiet"
                href={postDetail.selling_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img className="slg-detail-store-logo" src={store.logo} alt="" />
                {store.isAuction ? `Bid on ${store.name}` : `Buy on ${store.name}`}
              </a>
            ) : null}
          </div>

          <ShareButton
            imageUrl={currentSource}
            title={postDetail?.title}
            text={postDetail?.title}
            variant="full"
            className="slg-detail-share--rail"
          />

          <div className="slg-detail-contact">
            <span className="slg-detail-contact-label">Contact</span>
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
        className="slg-lightbox"
        overlayClassName="slg-lightbox-overlay"
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
          className="slg-lightbox-close"
          onClick={() => setLightboxIsOpen(false)}
          aria-label="Close"
        >
          &#10006;
        </button>

        {currentIndex > 0 ? (
          <button
            className="slg-lightbox-nav slg-lightbox-nav--previous"
            onClick={showPrevious}
            aria-label="Previous image"
          >
            ‹
          </button>
        ) : null}

        {currentIndex < imageUrls.length - 1 ? (
          <button
            className="slg-lightbox-nav slg-lightbox-nav--next"
            onClick={showNext}
            aria-label="Next image"
          >
            ›
          </button>
        ) : null}

        {imageUrls.length > 1 ? (
          <span className="slg-lightbox-counter">
            {currentIndex + 1} / {imageUrls.length}
          </span>
        ) : null}
      </Modal>
    </main>
  );
}
