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
        <h1 className="title">Stress Less Glass Admin</h1>
        {user && (
          <div className="header-section">
            {/* <p>
              Logged in as: <span className="user-email"> {user.email}</span> <br />
            </p> */}
            <img className="menu-icon" src="../menu.png" onClick={handleMenuClick} />
          </div>
        )}
      </header>
      <div className={`menu-div ${isMenuOpen ? 'open' : ''}`} onClick={handleMenuClick}>
        <Link className="new-link" to="/admin/new" onClick={handleMenuClick}>
          New Post
        </Link>
        <button className="signout-button" onClick={handleClick}>
          Sign Out
        </button>
      </div>
    </>
  );
}
