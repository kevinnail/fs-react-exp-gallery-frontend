import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore.js';
import { downloadInventoryCSV } from '../../services/fetch-utils.js';

export default function Menu({ handleClick }) {
  const { user, isAdmin } = useUserStore();

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
          </NavLink>{' '}
          <NavLink className="new-link" to="/auth/sign-in">
            Sign In
          </NavLink>
        </>
      )}

      {/* Display these links when the user is signed in */}
      {user && (
        <>
          <NavLink className="new-link" to="/main-gallery" title="Gallery">
            Gallery
          </NavLink>

          {!isAdmin && (
            <>
              <NavLink className="new-link" to="/profile">
                Profile
              </NavLink>
              <NavLink className="new-link" to="/messages">
                Messages
              </NavLink>
            </>
          )}

          <NavLink className="new-link" to="/about-me">
            About
          </NavLink>
          {isAdmin && (
            <>
              {' '}
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
            </>
          )}
          <button
            title="Sign Out"
            className="signout-button signout-button-adapt"
            onClick={handleClick}
          >
            Sign Out
          </button>
        </>
      )}
    </>
  );
}
