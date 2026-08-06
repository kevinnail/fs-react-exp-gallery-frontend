import { useState } from 'react';
import './Loading.css';

const randomBetween = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);

/**
 * The horizontal drift, the vertical drift, the approach and the spin
 * each get their own duration, and the two drift periods are drawn from ranges that
 * cannot line up. Two crossed oscillations at unrelated periods trace a
 * Lissajous path, which wanders for minutes before it ever repeats — so
 * it reads as free float rather than as a loop.
 *
 * The negative delays are what make each mount different: the animation
 * starts already part-way through, so the marble enters from a new
 * point on a new path every time this component appears.
 */
function randomDrift() {
  const horizontalSeconds = randomBetween(7, 11);
  const verticalSeconds = randomBetween(4.5, 6.5);
  const spinSeconds = randomBetween(7, 15);
  const approachSeconds = randomBetween(6, 9.5);

  return {
    '--slg-far': randomBetween(0.06, 0.12).toFixed(3),
    '--slg-near': randomBetween(2.2, 2.8).toFixed(2),
    '--slg-approach-duration': `${approachSeconds.toFixed(2)}s`,
    '--slg-approach-delay': `${(-randomBetween(0, approachSeconds * 2)).toFixed(2)}s`,
    '--slg-drift-x': `min(${randomBetween(16, 32).toFixed(1)}vw, 230px)`,
    '--slg-drift-y': `min(${randomBetween(9, 18).toFixed(1)}vh, 130px)`,
    '--slg-drift-x-duration': `${horizontalSeconds.toFixed(2)}s`,
    '--slg-drift-y-duration': `${verticalSeconds.toFixed(2)}s`,
    '--slg-drift-x-delay': `${(-randomBetween(0, horizontalSeconds)).toFixed(2)}s`,
    '--slg-drift-y-delay': `${(-randomBetween(0, verticalSeconds)).toFixed(2)}s`,
    '--slg-spin-duration': `${spinSeconds.toFixed(2)}s`,
    '--slg-spin-direction': Math.random() < 0.5 ? 'normal' : 'reverse',
  };
}

export default function Loading() {
  // Initialiser form: rolled once when the component mounts, not on
  // every render, or the marble would jump on each parent update.
  const [drift] = useState(randomDrift);

  return (
    <div className="slg-loading" role="status" aria-live="polite">
      <div className="slg-loading-field" style={drift}>
        <div className="slg-loading-drift-x">
          <div className="slg-loading-drift-y">
            <div className="slg-loading-approach">
              <img className="slg-loading-marble" src="/marble-css.png" alt="" />
            </div>
          </div>
        </div>
      </div>

      <p className="slg-loading-label">Loading</p>
    </div>
  );
}
