import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useGalleryPosts } from '../../hooks/useGalleryPosts.js';
import { getSiteMessage } from '../../services/fetch-utils.js';
import MainGalleryPostCard from '../MainGalleryPostCard/MainGalleryPostCard.js';
import Loading from '../Loading/Loading.js';
import LiveAuctions from './LiveAuctions.js';
import NewestPieceHero from './NewestPieceHero.js';
import './MainGallery.css';

export default function MainGallery() {
  const { posts, galleryLoading } = useGalleryPosts();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const currentMessage = await getSiteMessage();
        setMessage(currentMessage.message);
      } catch (error) {
        console.error('An error occurred while fetching the customer message:', error);
        toast.error(`An error occurred while fetching the customer message: ${error.message}`, {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          toastId: 'main-gallery-site-message',
          autoClose: false,
        });
      }
    };

    fetchMessage();
  }, []);

  // `useGalleryPosts` shuffles the list, so the newest piece has to be
  // found by date rather than by taking the first entry. The hero is a
  // photograph, so a post without one can't hold that slot.
  const newestPiece = useMemo(() => {
    const candidates = posts.filter((post) => !post.sold && post.image_url);

    return candidates.reduce(
      (newest, post) =>
        !newest || new Date(post.created_at) > new Date(newest.created_at) ? post : newest,
      null
    );
  }, [posts]);

  const availableCount = useMemo(() => posts.filter((post) => !post.sold).length, [posts]);

  if (galleryLoading) return <Loading />;

  return (
    <main className="slg-page">
      {message ? (
        <div className="slg-notice">
          <p>{message}</p>
        </div>
      ) : null}

      <LiveAuctions />

      <NewestPieceHero post={newestPiece} availableCount={availableCount} />

      <section className="slg-gallery" id="slg-available" aria-labelledby="slg-available-heading">
        <div className="slg-section-head">
          <h2 className="slg-section-title" id="slg-available-heading">
            Available now
            <span className="slg-count">
              {availableCount} {availableCount === 1 ? 'piece' : 'pieces'}
            </span>
          </h2>
        </div>

        {posts.length ? (
          <div className="slg-grid">
            {posts.map((post) => (
              <MainGalleryPostCard key={post.id} {...post} />
            ))}
          </div>
        ) : (
          <p className="slg-empty">
            Nothing is listed right now. New pieces go up as they come off the torch.
          </p>
        )}
      </section>
    </main>
  );
}
