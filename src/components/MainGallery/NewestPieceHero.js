import { Link } from 'react-router-dom';
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
  if (!post) return null;

  const { id, title, description, price, discountedPrice, originalPrice } = post;
  const isDiscounted =
    discountedPrice && parseFloat(discountedPrice) < parseFloat(originalPrice ?? price);
  const coverImage = coverImageFor(post);

  return (
    <section className="slg-hero" aria-labelledby="slg-hero-heading">
      <div className="slg-hero-copy">
        <p className="slg-eyebrow">Newest piece</p>
        <h1 className="slg-hero-title" id="slg-hero-heading">
          {title}
        </h1>
        {description ? <p className="slg-hero-spec">{description}</p> : null}
        <p className="slg-hero-price">
          {isDiscounted ? (
            <>
              <span className="slg-was">${originalPrice}</span>${Math.floor(discountedPrice)}
            </>
          ) : (
            <>${price}</>
          )}
        </p>
        <div className="slg-hero-actions">
          <Link className="slg-button" to={`/${id}`}>
            View this piece
          </Link>
          <a className="slg-button slg-button--quiet" href="#slg-available">
            See all {availableCount} available
          </a>
        </div>
      </div>

      {/* The photo navigates to the same place the button does. A Link
          rather than an onClick handler so it keeps keyboard focus,
          middle-click and open-in-new-tab. */}
      <figure className="slg-hero-figure">
        {coverImage ? (
          <Link className="slg-hero-figure-link" to={`/${id}`} aria-label={`View ${title}`}>
            <img src={coverImage} alt={title} />
          </Link>
        ) : null}
      </figure>
    </section>
  );
};

export default NewestPieceHero;
