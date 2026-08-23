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
    <main className="slg-404">
      <div className="slg-404-inner">
        <div className="slg-404-copy">
          <p className="slg-404-code">404</p>
          <h1 className="slg-404-title">This one got away.</h1>
          <p className="slg-404-text">
            The page you asked for isn&apos;t here. It may have sold, been taken down, or the link
            may have a typo in it. The work below is still very much around.
          </p>
          <div className="slg-404-actions">
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

        <div className="slg-404-stage">
          <div className="slg-404-scene">
            <div className="slg-404-cube">
              {CUBE_FACES.map((facePosition, faceIndex) => {
                const post = cubePosts[faceIndex];
                const imageUrl = imageUrlFor(post);

                return (
                  <Link
                    key={facePosition}
                    className={`slg-404-face slg-404-face--${facePosition}${
                      imageUrl ? '' : ' slg-404-face--placeholder'
                    }`}
                    to={post?.id ? `/${post.id}` : '/'}
                    style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
                  >
                    <span className="slg-404-face-label">
                      {post?.title ? `View ${post.title}` : 'Browse the gallery'}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="slg-404-scene2">
            <div className="slg-404-cube2">
              {CUBE_FACES.map((facePosition) => (
                <Link
                  key={facePosition}
                  className={`slg-404-face2 slg-404-face2--${facePosition}`}
                  to="/about-me"
                >
                  <span className="slg-404-face-label">About me</span>
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
