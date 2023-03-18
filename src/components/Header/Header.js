import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';
import { signOut } from '../../services/auth.js';
import './Header.css';

export default function Header() {
  const { user, setUser } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClick = async () => {
    await signOut();
    setUser(null);
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleHomeClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header>
        {/* <a href="/admin/new">
        <img className="icon" src="../bulletin-board-icon.png" />
      </a> */}
        <Link className="link" to="/admin" onClick={handleHomeClick}>
          <img className="logo" src="../logo-sq.png" />
        </Link>
        <h1 className="title">Stress Less Glass</h1>
        {user && (
          <div className="header-section">
            {/* <p>
              Logged in as: <span className="user-email"> {user.email}</span> <br />
            </p> */}
            <img className="menu-icon" src="../menu.png" onClick={handleMenuClick} />
          </div>
        )}
        {!user && <img className="logo" src="../black-sq.jpg" />}
      </header>

      <div className={`menu-div ${isMenuOpen ? 'open' : ''}`} onClick={handleMenuClick}>
        <Link className="new-link" to="/gallery" onClick={handleMenuClick}>
          <span className="new-post-span">Gallery</span>{' '}
          {<img className="new-post-icon" src="../gallery.png" />}
        </Link>
        <Link className="new-link" to="/admin/new" onClick={handleMenuClick}>
          <span className="new-post-span">New Post</span>{' '}
          {<img className="new-post-icon" src="../upload-1.png" />}
        </Link>
        <button className="signout-button" onClick={handleClick}>
          Sign Out {<img className="signout-nav-icon" src="../signout.png" />}
        </button>
      </div>
    </>
  );
}
