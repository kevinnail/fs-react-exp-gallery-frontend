import { useEffect, useState } from 'react';

const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;

function pad(value) {
  return String(value).padStart(2, '0');
}

function describeRemaining(endTime) {
  const remainingMs = new Date(endTime).getTime() - Date.now();

  if (!Number.isFinite(remainingMs) || remainingMs <= 0) {
    return { label: 'Ended', hasEnded: true };
  }

  const totalSeconds = Math.floor(remainingMs / MILLISECONDS_PER_SECOND);
  const days = Math.floor(totalSeconds / SECONDS_PER_DAY);
  const hours = Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  // Past a day the seconds are noise; under a day they are the point.
  const label =
    days > 0
      ? `${days}d ${pad(hours)}h ${pad(minutes)}m`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return { label, hasEnded: false };
}

/**
 * Ticking countdown to an auction's end time.
 *
 * Returns `{ label, hasEnded }`. The interval clears itself once the
 * auction has ended so a finished lot stops waking the page up.
 */
export function useAuctionCountdown(endTime) {
  const [remaining, setRemaining] = useState(() => describeRemaining(endTime));

  useEffect(() => {
    if (!endTime) return undefined;

    setRemaining(describeRemaining(endTime));

    const intervalId = setInterval(() => {
      const next = describeRemaining(endTime);
      setRemaining(next);

      if (next.hasEnded) {
        clearInterval(intervalId);
      }
    }, MILLISECONDS_PER_SECOND);

    return () => clearInterval(intervalId);
  }, [endTime]);

  return remaining;
}
