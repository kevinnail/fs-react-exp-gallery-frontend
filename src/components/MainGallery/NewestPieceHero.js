import { Link } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore.js';
import { getPiecePrice } from '../../services/userSpecial.js';
import './NewestPieceHero.css';

const coverImageFor = (post) => {
  const source = post.image_url;
  if (!source) return '';
  // Video posts store a matching .jpg poster frame alongside the .mp4.
  return source.endsWith('.mp4') ? `${source.slice(0, -4)}.jpg` : source;
};

/**
 * The hero is the newest unsold piece, shown at scale with no frame.
 * The photo's black background is the page's black background, so the
 * glass reads as floating in the page itself.
 */
const NewestPieceHero = ({ post, availableCount }) => {
  const user = useUserStore((state) => state.user);

  if (!post) return null;

  const { id, title, description } = post;
  const { listedPrice, salePrice } = getPiecePrice(post, { isSignedIn: Boolean(user) });
  const coverImage = coverImageFor(post);

  return (
    <section className="newest-piece" aria-labelledby="newest-piece-heading">
      <div className="newest-piece-details">
        <p className="heading-label">Newest piece</p>
        <h1 className="newest-piece-title" id="newest-piece-heading">
          {title}
        </h1>
        {description ? <p className="newest-piece-description">{description}</p> : null}
        <p className="newest-piece-price">
          {salePrice !== null ? (
            <>
              <span className="original-price">${listedPrice}</span>${Math.floor(salePrice)}
            </>
          ) : (
            <>${listedPrice}</>
          )}
        </p>
        <div className="newest-piece-links">
          <Link className="button-link" to={`/${id}`}>
            View this piece
          </Link>
          <a className="button-link button-link--secondary" href="#available-pieces">
            See all {availableCount} available
          </a>
        </div>
      </div>

      {/* The photo navigates to the same place the button does. A Link
          rather than an onClick handler so it keeps keyboard focus,
          middle-click and open-in-new-tab. */}
      <figure className="newest-piece-image">
        {coverImage ? (
          <Link className="newest-piece-image-link" to={`/${id}`} aria-label={`View ${title}`}>
            <img src={coverImage} alt={title} />
          </Link>
        ) : null}
      </figure>
    </section>
  );
};

export default NewestPieceHero;
