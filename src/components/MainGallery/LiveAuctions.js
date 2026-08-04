import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuctions } from '../../services/fetch-auctions.js';
import { useAuctionEventsStore } from '../../stores/auctionEventsStore.js';
import { useAuctionCountdown } from '../../hooks/useAuctionCountdown.js';
import './LiveAuctions.css';

// Panning speed in pixels per second. Fixed rate rather than a fixed
// duration, so ten lots pan at the same speed as four.
const PAN_PIXELS_PER_SECOND = 45;
const OVERFLOW_MARGIN_PX = 24;

function LotClock({ endTime }) {
  const { label, hasEnded } = useAuctionCountdown(endTime);

  return <span className="slg-lot-clock">{hasEnded ? 'Ended' : label}</span>;
}

function Lot({ auction }) {
  const { id, title, imageUrls, currentBid, startPrice, endTime } = auction;
  const coverImage = imageUrls?.[0];

  return (
    <Link className="slg-lot" to={`/auctions/${id}`}>
      <div className={`slg-lot-image${coverImage ? '' : ' slg-lot-image--empty'}`}>
        {coverImage ? <img src={coverImage} alt={title} loading="lazy" /> : 'No photo yet'}
      </div>
      <p className="slg-lot-name">{title}</p>
      <p className="slg-lot-meta">
        {currentBid ? (
          <>
            High bid <strong>${currentBid}</strong>
          </>
        ) : (
          <>
            No bids yet · opens at <strong>${startPrice}</strong>
          </>
        )}
      </p>
      <LotClock endTime={endTime} />
    </Link>
  );
}

/**
 * Live auctions, rendered at the very top of the front page.
 *
 * Auctions are money on a clock; the gallery below is money someday.
 * When nothing is running this renders null and the hero moves up.
 *
 * The lots pan horizontally only when there are enough of them to
 * overflow the screen — with three or four they simply sit there,
 * because motion with nothing hidden behind it is just noise. Whether
 * they overflow can only be known by measuring, which is why this
 * needs a resize observer rather than a media query.
 */
export default function LiveAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [panDuration, setPanDuration] = useState(0);
  const railRef = useRef(null);
  const lotSetRef = useRef(null);

  const lastAuctionCreated = useAuctionEventsStore((state) => state.lastAuctionCreated);
  const lastAuctionEnded = useAuctionEventsStore((state) => state.lastAuctionEnded);

  useEffect(() => {
    const fetchActiveAuctions = async () => {
      try {
        const data = await getAuctions();
        // `currentBid` already ships with each auction, so the front
        // page needs one request rather than one per lot.
        setAuctions(data.filter((auction) => auction.isActive));
      } catch (error) {
        console.error('Error fetching auctions:', error);
      }
    };

    fetchActiveAuctions();
  }, [lastAuctionCreated, lastAuctionEnded]);

  useEffect(() => {
    const rail = railRef.current;
    const lotSet = lotSetRef.current;
    if (!rail || !lotSet) return undefined;

    const measure = () => {
      // Measured off the first set only, so the duplicate added for the
      // seamless loop can't feed back into the decision.
      const setWidth = lotSet.scrollWidth;
      // Panning hides the scrollbar, which widens the rail slightly.
      // The margin keeps that from flipping a borderline case back and
      // forth between panning and not.
      const overflows = setWidth > rail.clientWidth + OVERFLOW_MARGIN_PX;
      setPanDuration(overflows ? setWidth / PAN_PIXELS_PER_SECOND : 0);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    observer.observe(lotSet);

    return () => observer.disconnect();
  }, [auctions]);

  if (!auctions.length) return null;

  const isPanning = panDuration > 0;

  return (
    <section className="slg-live" aria-labelledby="slg-live-heading">
      <div className="slg-section-head">
        <h2 className="slg-section-title" id="slg-live-heading">
          <span className="slg-live-dot" aria-hidden="true" />
          Live auctions
          <span className="slg-count">
            {auctions.length} {auctions.length === 1 ? 'lot' : 'lots'} ending soon
          </span>
        </h2>
        <Link className="slg-text-link" to="/auctions">
          All auctions &amp; archive
        </Link>
      </div>

      <div className={`slg-lot-rail${isPanning ? ' slg-lot-rail--panning' : ''}`} ref={railRef}>
        <div
          className={`slg-lot-track${isPanning ? ' slg-lot-track--panning' : ''}`}
          style={isPanning ? { animationDuration: `${panDuration}s` } : undefined}
        >
          <div className="slg-lot-set" ref={lotSetRef}>
            {auctions.map((auction) => (
              <Lot key={auction.id} auction={auction} />
            ))}
          </div>

          {isPanning ? (
            <div className="slg-lot-set" aria-hidden="true">
              {auctions.map((auction) => (
                <Lot key={`${auction.id}-loop`} auction={auction} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
