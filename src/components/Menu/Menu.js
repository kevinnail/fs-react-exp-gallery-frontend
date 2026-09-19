import { NavLink } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore.js';
import { downloadInventoryCSV } from '../../services/fetch-utils.js';
import { useUnreadMessages } from '../../hooks/useUnreadMessages.js';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import websocketService from '../../services/websocket.js';
import { useNotificationStore } from '../../stores/notificationStore.js';
import { useProfileStore } from '../../stores/profileStore.js';

import './Menu.css';

export default function Menu({ handleClick, closeMenu }) {
  const { user, isAdmin } = useUserStore();
  const { unreadMessageCount } = useUnreadMessages();
  const location = useLocation();
  const { profile } = useProfileStore();

  const {
    unreadAuctionCount,
    incrementAuction,
    resetAuction,
    wonAuctionCount,
    incrementWonAuction,
    resetWonAuction,
  } = useNotificationStore();

  useEffect(() => {
    const handleOutbid = () => incrementAuction();
    websocketService.on('user-outbid', handleOutbid);
    return () => websocketService.off('user-outbid', handleOutbid);
  }, [incrementAuction]);

  useEffect(() => {
    const handleUserWon = () => incrementWonAuction();
    websocketService.on('user-won', handleUserWon);
    return () => websocketService.off('user-won', handleUserWon);
  }, [incrementWonAuction]);

  const handleAuctionsClick = () => {
    resetAuction();
    closeMenu();
  };

  const handleProfileClick = () => {
    resetWonAuction();
    closeMenu();
  };

  useEffect(() => {
    if (location.pathname === '/account') resetWonAuction();
  }, [location.pathname, resetWonAuction]);

  const handleDownloadCSV = () => {
    downloadInventoryCSV();
  };

  const handleSignOut = async () => {
    await handleClick();
    closeMenu();
  };

  const handleLinkClick = () => {
    closeMenu();
  };

  return (
    <div className="site-menu">
      <>
        {user && (
          <div
            style={{
              fontSize: '.8rem',
              display: 'grid',
              textAlign: 'center',
              marginBottom: '.75rem',
            }}
          >
            <span>logged in as:</span>
            <span
              style={{
                fontSize: '1rem',
                margin: '.5rem 0 0rem 0',
                color: '#222 !important',
              }}
            >
              <strong>{`${profile?.firstName} ${profile?.lastName?.length > 10 ? profile?.lastName.substring(0, 1) + '.' : profile?.lastName}`}</strong>
            </span>
          </div>
        )}
        <NavLink className="site-menu-link" to="/" title="Shop" onClick={handleLinkClick}>
          Available Work
        </NavLink>{' '}
        {/* <NavLink className="site-menu-link" to="/gallery" title="Gallery" onClick={handleLinkClick}>
          Gallery
        </NavLink>{' '} */}
        <div style={{ position: 'relative', padding: '0' }}>
          <NavLink className="site-menu-link" to="/auctions" onClick={handleAuctionsClick}>
            Auctions
            {unreadAuctionCount > 0 && location.pathname !== '/auctions' && (
              <span className="site-menu-unread-count">{unreadAuctionCount}</span>
            )}
          </NavLink>
        </div>
      </>
      {!user && (
        <>
          <NavLink className="site-menu-link" to="/about-me" onClick={handleLinkClick}>
            About
          </NavLink>
          <NavLink className="site-menu-link" to="/auth/sign-in" onClick={handleLinkClick}>
            Sign In
          </NavLink>
        </>
      )}

      {user && (
        <>
          {isAdmin && (
            <>
              <NavLink
                className="site-menu-link"
                to="/admin"
                title="Dashboard"
                onClick={handleLinkClick}
                data-admin-group="start"
              >
                Dashboard
              </NavLink>
              <NavLink
                className="site-menu-link"
                to="/admin/sales"
                title="Dashboard"
                onClick={handleLinkClick}
                data-admin-group="start"
              >
                Sales
              </NavLink>
            </>
          )}

          {!isAdmin && (
            <>
              <div style={{ position: 'relative', padding: '0' }}>
                <NavLink className="site-menu-link" to="/account" onClick={handleProfileClick}>
                  Account
                  {wonAuctionCount > 0 && location.pathname !== '/account' && (
                    <span className="site-menu-unread-count">{wonAuctionCount}</span>
                  )}
                </NavLink>
              </div>
              <div style={{ position: 'relative', padding: '0' }}>
                <NavLink className="site-menu-link" to="/messages" onClick={handleLinkClick}>
                  Messages
                  {unreadMessageCount > 0 && location.pathname !== '/messages' && (
                    <span className="site-menu-unread-count">{unreadMessageCount}</span>
                  )}
                </NavLink>
              </div>
            </>
          )}
          {isAdmin && (
            <>
              {' '}
              <div style={{ position: 'relative', padding: '0' }}>
                <NavLink
                  className="site-menu-link"
                  to="/admin/inbox"
                  title="Inbox"
                  onClick={handleLinkClick}
                >
                  Inbox{' '}
                  {unreadMessageCount > 0 && location.pathname !== '/messages' && (
                    <span className="site-menu-unread-count">{unreadMessageCount}</span>
                  )}
                </NavLink>
              </div>
              <NavLink
                className="site-menu-link"
                to="/admin/discounts"
                title="Post a new sale"
                onClick={handleLinkClick}
              >
                Promotions!
              </NavLink>
              <NavLink
                className="site-menu-link"
                to="/admin/users"
                title="Users Dashboard"
                onClick={handleLinkClick}
              >
                Users
              </NavLink>
              <NavLink
                className="site-menu-link"
                to="/admin/email"
                title="Email Customers"
                onClick={handleLinkClick}
              >
                Email
              </NavLink>
              <button
                className="site-menu-link site-menu-download-button"
                title="Download Inventory CSV"
                onClick={() => {
                  handleDownloadCSV();
                  closeMenu();
                }}
              >
                Inventory
              </button>
            </>
          )}

          <NavLink
            className="site-menu-link"
            to="/about-me"
            title="About Kevin"
            onClick={handleLinkClick}
            data-admin-group="start"
          >
            About
          </NavLink>

          {isAdmin && (
            <NavLink className="site-menu-link" to="/account" onClick={handleProfileClick}>
              Account
            </NavLink>
          )}

          <button
            title="Sign Out"
            className="site-menu-signout-button site-menu-signout-button--separated"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </>
      )}
    </div>
  );
}
