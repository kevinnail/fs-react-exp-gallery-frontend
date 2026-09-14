import { Link } from 'react-router-dom';
import { useGalleryPosts } from '../../hooks/useGalleryPosts.js';
import './NotFound.css';

const CUBE_FACES = ['front', 'back', 'right', 'left', 'top', 'bottom'];

const imageUrlFor = (post) => post?.image_url ?? post?.imageUrl ?? post?.image;

const NotFound = () => {
  const { posts, galleryLoading } = useGalleryPosts();

  const cubePosts = galleryLoading
    ? []
    : [...posts]
        .filter((post) => imageUrlFor(post))
        .sort((first, second) => new Date(second.created_at) - new Date(first.created_at))
        .slice(0, CUBE_FACES.length);

  return (
    <main className="not-found-page">
      <div className="not-found-layout">
        <div className="not-found-message">
          <p className="not-found-status-code">404</p>
          <h1 className="not-found-title">This one got away.</h1>
          <p className="not-found-description">
            The page you asked for isn&apos;t here. It may have sold, been taken down, or the link
            may have a typo in it. The work below is still very much around.
          </p>
          <div className="not-found-links">
            <Link className="slg-button" to="/">
              Browse the gallery
            </Link>
            <Link className="slg-button slg-button--quiet" to="/auctions">
              Live auctions
            </Link>
            <Link className="slg-button slg-button--quiet" to="/about-me">
              About me
            </Link>
          </div>
        </div>

        <div className="not-found-cubes">
          <div className="not-found-gallery-cube-scene">
            <div className="not-found-gallery-cube">
              {CUBE_FACES.map((facePosition, faceIndex) => {
                const post = cubePosts[faceIndex];
                const imageUrl = imageUrlFor(post);

                return (
                  <Link
                    key={facePosition}
                    className={`not-found-gallery-cube-face not-found-gallery-cube-face--${facePosition}${
                      imageUrl ? '' : ' not-found-gallery-cube-face--placeholder'
                    }`}
                    to={post?.id ? `/${post.id}` : '/'}
                    style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
                  >
                    <span className="not-found-cube-face-label">
                      {post?.title ? `View ${post.title}` : 'Browse the gallery'}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="not-found-about-cube-scene">
            <div className="not-found-about-cube">
              {CUBE_FACES.map((facePosition) => (
                <Link
                  key={facePosition}
                  className={`not-found-about-cube-face not-found-about-cube-face--${facePosition}`}
                  to="/about-me"
                >
                  <span className="not-found-cube-face-label">About me</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
