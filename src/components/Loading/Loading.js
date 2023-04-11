import React from 'react';
import './Loading.css';
import { Link } from 'react-router-dom';

export default function Loading() {
  return (
    // <div className="loading-div-wrapper">
    //   <div className="loading-div">
    //     <img className="rotating-marble" src="../marble-css.png" />
    //   </div>
    // </div>
    <>
      <h3 className="loading-text">Loading...</h3>
      <div className="scene">
        <div className="cube">
          <div className="face front">
            <Link className="hidden-text-link" to="/main-gallery">
              {' '}
              {'This is a link to the gallery page if you are clever enough you might find it! '}
            </Link>
          </div>
          <div className="face back">
            {' '}
            <Link className="hidden-text-link" to="/main-gallery">
              {'This is a link to the gallery page if you are clever enough you might find it! '}
            </Link>
          </div>
          <div className="face right">
            {' '}
            <Link className="hidden-text-link" to="/main-gallery">
              {'This is a link to the gallery page if you are clever enough you might find it! '}
            </Link>
          </div>
          <div className="face left">
            {' '}
            <Link className="hidden-text-link" to="/main-gallery">
              {'This is a link to the gallery page if you are clever enough you might find it! '}
            </Link>
          </div>
          <div className="face top">
            {' '}
            <Link className="hidden-text-link" to="/main-gallery">
              {'This is a link to the gallery page if you are clever enough you might find it! '}
            </Link>
          </div>
          <div className="face bottom">
            {' '}
            <Link className="hidden-text-link" to="/main-gallery">
              {'This is a link to the gallery page if you are clever enough you might find it! '}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
