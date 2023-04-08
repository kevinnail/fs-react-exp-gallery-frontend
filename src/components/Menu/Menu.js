import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';

export default function Menu({ handleClick }) {
  const { user } = useUser();
  return (
    <>
      <Link className="new-link" to="/main-gallery">
        <span className="new-post-span menu-btn">Gallery</span>{' '}
        {<img className="new-post-icon" src="../gallery.png" />}
      </Link>
      <Link className="new-link" to="/about-me">
        <span className="new-post-span menu-btn">About</span>{' '}
        {<img className="new-post-icon" src="../info.png" />}
      </Link>
      {user && (
        <>
          <Link className="new-link" to="/admin/new">
            <span className="new-post-span">New Post</span>{' '}
            {<img className="new-post-icon" src="../upload-1.png" />}
          </Link>
          <button className="signout-button" onClick={handleClick}>
            Sign Out {<img className="signout-nav-icon" src="../signout.png" />}
          </button>
        </>
      )}
    </>
  );
}
