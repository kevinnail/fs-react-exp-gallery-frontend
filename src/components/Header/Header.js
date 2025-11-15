import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore.js';
import { signOut } from '../../services/auth.js';
import './Header.css';
import '../CoolSearchBox/CoolSearchBox.css';
import Menu from '../Menu/Menu.js';
import CoolSearchBox from '../CoolSearchBox/CoolSearchBox.js';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../stores/notificationStore.js';

export default function Header() {
  const { user, signout, isAdmin } = useUserStore();
  const unreadMessageCount = useUserStore((s) => s.unreadMessageCount);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { unreadAuctionCount, fetchUnreadAuctions } = useNotificationStore();
  const totalUnread = unreadAuctionCount + unreadMessageCount;

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

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

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnreadAuctions();
    }
  }, [user, fetchUnreadAuctions]);

  return (
    <>
      <header>
        <Link className="link" to={user && isAdmin ? '/admin' : '/'} onClick={handleHomeClick}>
          <img className="logo" src="../logo-sq.png" />
        </Link>{' '}
        <div>
          <h1 className="biz-title">Stress Less Glass </h1>{' '}
        </div>
        <div className="header-section">
          <div className="menu-icon-wrapper" ref={buttonRef} onClick={handleMenuClick}>
            <button
              type="button"
              className="menu-icon-wrapper"
              onClick={handleMenuClick}
              aria-label="Open menu"
            >
              <img className={user ? 'menu-icon' : 'menu-no-user'} src="../menu.png" alt="" />
              {user && totalUnread > 0 && location.pathname !== '/messages' && (
                <span className="menu-badge">{totalUnread}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div
        ref={menuRef}
        className={`menu-icon-adapt menu-div ${isMenuOpen ? ' open ' : ''}${
          location.pathname === '/admin' ? ' menu-div-adapt ' : ''
        }`}
      >
        <Menu handleClick={handleClick} closeMenu={closeMenu} />
      </div>
      <CoolSearchBox onSearch={handleSearch} />
    </>
  );
}
