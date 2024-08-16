import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';
import { downloadInventoryCSV } from '../../services/fetch-utils.js';

export default function Menu({ handleClick }) {
  const { user } = useUser();
  const { id } = useParams();

  const handleDownloadCSV = () => {
    downloadInventoryCSV();
  };

  return (
    <>
      <NavLink className="new-link" to="/main-gallery" title="Gallery">
        Gallery
        {/* <span className="new-post-span menu-btn"></span>{' '} */}
        {/* {<img className="new-post-icon" src="../gallery.png" />} */}
      </NavLink>
      <NavLink className="new-link" to="/about-me">
        About
        {/* <span className="new-post-span menu-btn" title="About Kevin"> */}
        {/* About Me */}
        {/* </span>{' '} */}
        {/* {<img className="new-post-icon" src="../info.png" />} */}
      </NavLink>
      {user && (
        <>
          <NavLink className="new-link" to="/admin/new" title="Make new post">
            {/* <span className="new-post-span">New</span>{' '} */}New
            {/* {<img className="new-post-icon" src="../upload-1.png" />} */}
          </NavLink>
          <button
            className="new-link download-button"
            title="Download Inventory CSV"
            onClick={handleDownloadCSV}
          >
            {/* <span className="new-post-span">Inventory</span>{' '} */}Inventory
            {/* {<img className="new-post-icon" src="../upload-1.png" />} */}
          </button>
          <NavLink className="new-link" to="/admin/discounts" title="Make new post">
            Sale!
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
            Sign <br />
            Out
          </button>
        </>
      )}
    </>
  );
}
