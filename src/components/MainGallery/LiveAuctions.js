import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLiveAuctions } from '../../services/fetch-auctions.js';
import { useAuctionEventsStore } from '../../stores/auctionEventsStore.js';
import { useAuctionCountdown } from '../../hooks/useAuctionCountdown.js';
import './LiveAuctions.css';

// Panning speed in pixels per second. Fixed rate rather than a fixed
// duration, so ten lots pan at the same speed as four.
const PAN_PIXELS_PER_SECOND = 45;
const OVERFLOW_MARGIN_PX = 24;
const RESUME_DELAY_MS = 750;
const MAX_FRAME_SECONDS = 0.1;

function LotClock({ endTime, onEnded }) {
  const { label, hasEnded } = useAuctionCountdown(endTime);

  useEffect(() => {
    if (hasEnded) onEnded();
  }, [hasEnded, onEnded]);

  if (hasEnded) return null;

  return <span className="slg-lot-clock">{label}</span>;
}

function Lot({ auction, onEnded }) {
  const { id, title, imageUrls, currentBid, startPrice, endTime } = auction;
  const handleEnded = useCallback(() => onEnded(id), [onEnded, id]);
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
      <LotClock endTime={endTime} onEnded={handleEnded} />
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
 * overflow the screen. With three or four they simply sit there,
 * because motion with nothing hidden behind it is just noise. Whether
 * they overflow can only be known by measuring, which is why this
 * needs a resize observer rather than a media query.
 *
 * The pan drives the rail's real scroll position rather than a CSS
 * transform, so a finger can grab and swipe it natively (momentum
 * included) and the pan resumes from wherever it was left.
 */
export default function LiveAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [isPanning, setIsPanning] = useState(false);
  const railRef = useRef(null);
  const lotSetRef = useRef(null);

  const lastAuctionCreated = useAuctionEventsStore((state) => state.lastAuctionCreated);
  const lastAuctionEnded = useAuctionEventsStore((state) => state.lastAuctionEnded);

  const handleLotEnded = useCallback((auctionId) => {
    setAuctions((previousAuctions) =>
      previousAuctions.filter((auction) => auction.id !== auctionId)
    );
  }, []);

  useEffect(() => {
    const fetchLiveAuctions = async () => {
      try {
        setAuctions(await getLiveAuctions());
      } catch (error) {
        console.error('Error fetching live auctions:', error);
      }
    };

    fetchLiveAuctions();
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
      setIsPanning(setWidth > rail.clientWidth + OVERFLOW_MARGIN_PX);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    observer.observe(lotSet);

    return () => observer.disconnect();
  }, [auctions]);

  useEffect(() => {
    const rail = railRef.current;
    const lotSet = lotSetRef.current;
    if (!isPanning || !rail || !lotSet) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let animationFrameId;
    let previousTimestamp;
    let isTouching = false;
    let isHovered = false;
    let resumeAt = 0;
    let position = rail.scrollLeft;
    let lastWrittenScrollLeft = rail.scrollLeft;

    const holdOff = () => {
      resumeAt = performance.now() + RESUME_DELAY_MS;
    };

    const handleTouchStart = () => {
      isTouching = true;
    };

    const handleTouchEnd = () => {
      isTouching = false;
      holdOff();
    };

    const handlePointerEnter = (event) => {
      if (event.pointerType === 'mouse') isHovered = true;
    };

    const handlePointerLeave = (event) => {
      if (event.pointerType === 'mouse') isHovered = false;
    };

    const handleScroll = () => {
      if (Math.abs(rail.scrollLeft - lastWrittenScrollLeft) > 1) holdOff();
    };

    const step = (timestamp) => {
      const elapsedSeconds =
        previousTimestamp === undefined
          ? 0
          : Math.min((timestamp - previousTimestamp) / 1000, MAX_FRAME_SECONDS);
      previousTimestamp = timestamp;

      const isFocused = rail.contains(document.activeElement);
      const isPaused = isTouching || isHovered || isFocused || timestamp < resumeAt;

      if (isPaused) {
        position = rail.scrollLeft;
      } else {
        position += PAN_PIXELS_PER_SECOND * elapsedSeconds;
      }

      if (!isTouching) {
        const setWidth = lotSet.getBoundingClientRect().width;
        if (position >= setWidth) position -= setWidth;
        else if (position <= 0) position += setWidth;
      }

      const nextScrollLeft = Math.round(position);
      if (nextScrollLeft !== rail.scrollLeft) {
        rail.scrollLeft = nextScrollLeft;
      }
      lastWrittenScrollLeft = rail.scrollLeft;

      animationFrameId = requestAnimationFrame(step);
    };

    rail.addEventListener('touchstart', handleTouchStart, { passive: true });
    rail.addEventListener('touchend', handleTouchEnd, { passive: true });
    rail.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    rail.addEventListener('pointerenter', handlePointerEnter);
    rail.addEventListener('pointerleave', handlePointerLeave);
    rail.addEventListener('scroll', handleScroll, { passive: true });
    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
      rail.removeEventListener('touchstart', handleTouchStart);
      rail.removeEventListener('touchend', handleTouchEnd);
      rail.removeEventListener('touchcancel', handleTouchEnd);
      rail.removeEventListener('pointerenter', handlePointerEnter);
      rail.removeEventListener('pointerleave', handlePointerLeave);
      rail.removeEventListener('scroll', handleScroll);
    };
  }, [isPanning]);

  if (!auctions.length) return null;

  return (
    <section className="slg-live" aria-labelledby="slg-live-heading">
      <div className="slg-section-head">
        <Link className="slg-live-auctions-link" to="/auctions">
          <h2 className="slg-section-title" id="slg-live-heading">
            <span className="slg-live-dot" aria-hidden="true" />
            Live auctions{`  `}
            <span className="slg-count">
              {auctions.length} {auctions.length === 1 ? 'lot' : 'lots'} ending soon
            </span>
          </h2>
        </Link>
        <Link className="slg-text-link" to="/auctions">
          All auctions &amp; archive
        </Link>
      </div>

      <div className={`slg-lot-rail${isPanning ? ' slg-lot-rail--panning' : ''}`} ref={railRef}>
        <div className="slg-lot-track">
          <div className="slg-lot-set" ref={lotSetRef}>
            {auctions.map((auction) => (
              <Lot key={auction.id} auction={auction} onEnded={handleLotEnded} />
            ))}
          </div>

          {isPanning ? (
            <div className="slg-lot-set" aria-hidden="true">
              {auctions.map((auction) => (
                <Lot key={`${auction.id}-loop`} auction={auction} onEnded={handleLotEnded} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
