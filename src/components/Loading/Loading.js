import { useState } from 'react';
import './Loading.css';

const randomBetween = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);

function randomDrift() {
  const horizontalSeconds = randomBetween(7, 11);
  const verticalSeconds = randomBetween(4.5, 6.5);
  const spinSeconds = randomBetween(7, 15);
  const approachSeconds = randomBetween(6, 9.5);

  return {
    '--marble-far-scale': randomBetween(0.06, 0.12).toFixed(3),
    '--marble-near-scale': randomBetween(2.2, 2.8).toFixed(2),
    '--marble-zoom-duration': `${approachSeconds.toFixed(2)}s`,
    '--marble-zoom-delay': `${(-randomBetween(0, approachSeconds * 2)).toFixed(2)}s`,
    '--marble-drift-horizontal-distance': `min(${randomBetween(16, 32).toFixed(1)}vw, 230px)`,
    '--marble-drift-vertical-distance': `min(${randomBetween(9, 18).toFixed(1)}vh, 130px)`,
    '--marble-drift-horizontal-duration': `${horizontalSeconds.toFixed(2)}s`,
    '--marble-drift-vertical-duration': `${verticalSeconds.toFixed(2)}s`,
    '--marble-drift-horizontal-delay': `${(-randomBetween(0, horizontalSeconds)).toFixed(2)}s`,
    '--marble-drift-vertical-delay': `${(-randomBetween(0, verticalSeconds)).toFixed(2)}s`,
    '--marble-spin-duration': `${spinSeconds.toFixed(2)}s`,
    '--marble-spin-direction': Math.random() < 0.5 ? 'normal' : 'reverse',
  };
}

export default function Loading() {
  // Initialiser form: rolled once when the component mounts, not on
  // every render, or the marble would jump on each parent update.
  const [drift] = useState(randomDrift);

  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-marble-area" style={drift}>
        <div className="loading-marble-drift-horizontal">
          <div className="loading-marble-drift-vertical">
            <div className="loading-marble-zoom">
              <img className="loading-marble" src="/marble-css.png" alt="" />
            </div>
          </div>
        </div>
      </div>

      <p className="loading-text">Loading</p>
    </div>
  );
}
