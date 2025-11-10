import { NavLink } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore.js';
import { downloadInventoryCSV } from '../../services/fetch-utils.js';
import { useUnreadMessages } from '../../hooks/useUnreadMessages.js';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import websocketService from '../../services/websocket.js';
import { useNotificationStore } from '../../stores/notificationStore.js';
import { useProfileStore } from '../../stores/profileStore.js';
import './Menu.css'; // added

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
    <div className="menu">
      <>
        {user && (
          <div
            style={{
              fontSize: '.8rem',
              display: 'grid',
              textAlign: 'center',
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
        <NavLink className="menu-new-link" to="/" title="Gallery" onClick={handleLinkClick}>
          Gallery
        </NavLink>{' '}
        <NavLink className="menu-new-link" to="/auctions" onClick={handleAuctionsClick}>
          Auctions
          {unreadAuctionCount > 0 && location.pathname !== '/auctions' && (
            <span className="unread-badge">{unreadAuctionCount}</span>
          )}
        </NavLink>
      </>
      {!user && (
        <>
          <NavLink className="menu-new-link" to="/about-me" onClick={handleLinkClick}>
            About
          </NavLink>
          <NavLink className="menu-new-link" to="/auth/sign-in" onClick={handleLinkClick}>
            Sign In
          </NavLink>
        </>
      )}

      {user && (
        <>
          {isAdmin && (
            <>
              <NavLink
                className="menu-new-link"
                to="/admin"
                title="Dashboard"
                onClick={handleLinkClick}
                data-admin-group="start"
              >
                Dashboard
              </NavLink>
            </>
          )}

          {!isAdmin && (
            <>
              <NavLink className="menu-new-link" to="/account" onClick={handleProfileClick}>
                Account
                {wonAuctionCount > 0 && location.pathname !== '/account' && (
                  <span className="unread-badge">{wonAuctionCount}</span>
                )}
              </NavLink>

              <NavLink className="menu-new-link" to="/messages" onClick={handleLinkClick}>
                Messages
                {unreadMessageCount > 0 && location.pathname !== '/messages' && (
                  <span className="unread-badge">{unreadMessageCount}</span>
                )}
              </NavLink>
            </>
          )}
          {isAdmin && (
            <>
              {' '}
              <NavLink
                className="menu-new-link"
                to="/admin/inbox"
                title="Inbox"
                onClick={handleLinkClick}
              >
                Inbox{' '}
                {unreadMessageCount > 0 && location.pathname !== '/messages' && (
                  <span className="unread-badge">{unreadMessageCount}</span>
                )}
              </NavLink>
              <NavLink
                className="menu-new-link"
                to="/admin/new"
                title="Make new post"
                onClick={handleLinkClick}
              >
                New
              </NavLink>
              <NavLink
                className="menu-new-link"
                to="/admin/discounts"
                title="Post a new sale"
                onClick={handleLinkClick}
              >
                Sale!
              </NavLink>
              <NavLink
                className="menu-new-link"
                to="/admin/users"
                title="Users Dashboard"
                onClick={handleLinkClick}
              >
                Users
              </NavLink>
              <button
                className="menu-new-link download-button"
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
            className="menu-new-link"
            to="/about-me"
            title="About Kevin"
            onClick={handleLinkClick}
            data-admin-group="start"
          >
            About
          </NavLink>

          {isAdmin && (
            <NavLink className="menu-new-link" to="/account" onClick={handleProfileClick}>
              Account
            </NavLink>
          )}

          <button
            title="Sign Out"
            className="signout-button signout-button-adapt"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </>
      )}
    </div>
  );
}
