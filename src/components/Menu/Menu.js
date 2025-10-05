import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore.js';
import { downloadInventoryCSV } from '../../services/fetch-utils.js';

export default function Menu({ handleClick }) {
  const { user } = useUserStore();
  const { id } = useParams();

  const handleDownloadCSV = () => {
    downloadInventoryCSV();
  };

  return (
    <>
      {/* Display these links when the user is not signed in */}
      {!user && (
        <>
          {' '}
          <NavLink className="new-link" to="/main-gallery" title="Gallery">
            Gallery
          </NavLink>
          <NavLink className="new-link" to="/about-me">
            About
          </NavLink>
          {/* <a href="mailto:kevin@kevinnail.com">
            <img className="site-msg-link-ig" width="48px" src="/email.png" alt="Email" />
          </a>
          <a href="https://www.instagram.com/stresslessglass">
            <img width="48px" src="/IG.png" alt="Instagram" />
          </a> */}
        </>
      )}

      {/* Display these links when the user is signed in */}
      {user && (
        <>
          <NavLink className="new-link" to="/main-gallery" title="Gallery">
            Gallery
          </NavLink>
          <NavLink className="new-link" to="/about-me">
            About
          </NavLink>
          <NavLink className="new-link" to="/admin/new" title="Make new post">
            New
          </NavLink>
          <NavLink className="new-link" to="/admin/discounts" title="Make new post">
            Sale!
          </NavLink>
          <button
            className="new-link download-button"
            title="Download Inventory CSV"
            onClick={handleDownloadCSV}
          >
            Inventory
          </button>
          <button
            title="Sign Out"
            className={`signout-button 
            ${location.pathname === '/admin' ? ' signout-button-adapt' : ''}
            ${location.pathname === '/admin/new' ? ' signout-button-adapt' : ''}
            ${location.pathname === `/admin/${id}` ? ' signout-button-adapt' : ''}
            `}
            onClick={handleClick}
          >
            Sign Out
          </button>
        </>
      )}
    </>
  );
}
