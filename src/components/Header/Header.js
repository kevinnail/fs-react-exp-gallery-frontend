import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';
import { signOut } from '../../services/auth.js';
import './Header.css';
import '../CoolSearchBox/CoolSearchBox.css';
import Menu from '../Menu/Menu.js';

export default function Header() {
  const { user, setUser } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const location = useLocation();
  // console.log('location', location.pathname === '/auth/sign-in');

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
  const hoh = 9;
  return (
    <>
      <header>
        <Link className="link" to={user ? '/admin' : '/auth/sign-in'} onClick={handleHomeClick}>
          <img className="logo" src="../logo-sq.png" />
        </Link>
        <h1 className="title">Stress Less Glass</h1>
        {/* {location.pathname === '/auth/sign-in' ? ( */}
        {!user && (
          <>
            {/* <Link className="new-link adjustment-1" to="/main-gallery">
              <span className="new-post-span menu-btn">Gallery</span>
              <img className="new-post-icon" src="../gallery.png" />
            </Link>
            <Link className="new-link adjustment-1" to="/about-me">
              <span className="new-post-span menu-btn">About</span>
              <img className="new-post-icon" src="../info.png" />
            </Link> */}
          </>
        )}
        {/* // ) : null} */}
        {/* {user && ( */}
        <div className="header-section">
          <img
            className={user ? 'menu-icon' : 'menu-no-user'}
            src="../menu.png"
            onClick={handleMenuClick}
          />
        </div>
        {/* // )} */}
        {/* {!user && <img className="logo" src="../black-sq.jpg" />} */}
      </header>

      {/* {user && ( */}
      <div
        className={`menu-icon-adapt menu-div ${isMenuOpen ? ' open ' : ''}${
          location.pathname === '/admin' ? ' menu-div-adapt ' : ''
        }`}
        onClick={handleMenuClick}
      >
        <Menu handleClick={handleClick} />
      </div>
      {/* )} */}
    </>
  );
}
