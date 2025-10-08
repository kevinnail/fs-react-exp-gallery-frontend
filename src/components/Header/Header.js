import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore.js';
import { signOut } from '../../services/auth.js';
import './Header.css';
import '../CoolSearchBox/CoolSearchBox.css';
import Menu from '../Menu/Menu.js';
import CoolSearchBox from '../CoolSearchBox/CoolSearchBox.js';
import { useNavigate } from 'react-router-dom';
export default function Header() {
  const { user, signout, isAdmin } = useUserStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = async () => {
    await signOut();
    signout();
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleHomeClick = () => {
    setIsMenuOpen(false);
  };

  const handleSearch = async (searchTerm) => {
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <>
      <header>
        <Link
          className="link"
          to={user && isAdmin ? '/admin' : '/main-gallery'}
          onClick={handleHomeClick}
        >
          <img className="logo" src="../logo-sq.png" />
        </Link>
        <h1 className="title">Stress Less Glass</h1>

        <div className="header-section">
          <img
            className={user ? 'menu-icon' : 'menu-no-user'}
            src="../menu.png"
            onClick={handleMenuClick}
          />
        </div>
        {/* {!user && <img className="logo" src="../black-sq.jpg" />} */}
      </header>

      <div
        className={`menu-icon-adapt menu-div ${isMenuOpen ? ' open ' : ''}${
          location.pathname === '/admin' ? ' menu-div-adapt ' : ''
        }`}
        onClick={handleMenuClick}
      >
        <Menu handleClick={handleClick} />
      </div>
      <CoolSearchBox onSearch={handleSearch} />
    </>
  );
}
