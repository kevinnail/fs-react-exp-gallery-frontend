import React from 'react';
import { Link } from 'react-router-dom';

export default function Menu(handleClick) {
  return (
    <>
      <Link className="new-link" to="/gallery">
        <span className="new-post-span">Gallery</span>{' '}
        {<img className="new-post-icon" src="../gallery.png" />}
      </Link>
      <Link className="new-link" to="/admin/new">
        <span className="new-post-span">New Post</span>{' '}
        {<img className="new-post-icon" src="../upload-1.png" />}
      </Link>
      <button className="signout-button" onClick={handleClick}>
        Sign Out {<img className="signout-nav-icon" src="../signout.png" />}
      </button>
    </>
  );
}
