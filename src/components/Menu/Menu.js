import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';

export default function Menu({ handleClick }) {
  const { user } = useUser();
  const { id } = useParams();
  return (
    <>
      <NavLink className="new-link" to="/main-gallery" title="Gallery">
        <span className="new-post-span menu-btn">Gallery</span>{' '}
        {<img className="new-post-icon" src="../gallery.png" />}
      </NavLink>
      <NavLink className="new-link" to="/about-me">
        <span className="new-post-span menu-btn" title="About Kevin">
          About
        </span>{' '}
        {<img className="new-post-icon" src="../info.png" />}
      </NavLink>
      {user && (
        <>
          <NavLink className="new-link" to="/admin/new" title="Make new post">
            <span className="new-post-span">New Post</span>{' '}
            {<img className="new-post-icon" src="../upload-1.png" />}
          </NavLink>
          <button
            title="Sign Out"
            className={`signout-button 
            ${location.pathname === '/admin' ? ' signout-button-adapt' : ''}
            ${location.pathname === '/admin/new' ? ' signout-button-adapt' : ''}
            ${location.pathname === `/admin/${id}` ? ' signout-button-adapt' : ''}
            
            `}
            onClick={handleClick}
          >
            Sign Out {<img className="signout-nav-icon" src="../signout.png" />}
          </button>
        </>
      )}
    </>
  );
}
