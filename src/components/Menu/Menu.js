import { NavLink } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore.js';
import { downloadInventoryCSV } from '../../services/fetch-utils.js';
import { useUnreadMessages } from '../../hooks/useUnreadMessages.js';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import websocketService from '../../services/websocket.js';
import { useNotificationStore } from '../../stores/notificationStore.js';

export default function Menu({ handleClick, closeMenu }) {
  const { user, isAdmin } = useUserStore();
  const { unreadMessageCount } = useUnreadMessages();
  const location = useLocation();
  // const [unreadCount, setUnreadCount] = useState(0);

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

  // defensive reset when the route is already /account
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
    <div>
      <>
        <NavLink className="mobile-new-link" to="/" title="Gallery" onClick={handleLinkClick}>
          Gallery
        </NavLink>{' '}
        <NavLink className="mobile-new-link" to="/auctions" onClick={handleAuctionsClick}>
          Auctions
          {unreadAuctionCount > 0 && location.pathname !== '/auctions' && (
            <span className="unread-badge">{unreadAuctionCount}</span>
          )}
        </NavLink>
      </>
      {!user && (
        <>
          <NavLink className="mobile-new-link" to="/about-me" onClick={handleLinkClick}>
            About
          </NavLink>
          <NavLink className="mobile-new-link" to="/auth/sign-in" onClick={handleLinkClick}>
            Sign In
          </NavLink>
        </>
      )}

      {user && (
        <>
          {isAdmin && (
            <>
              <NavLink
                className="mobile-new-link"
                to="/admin"
                title="Dashboard"
                onClick={handleLinkClick}
              >
                Dashboard
              </NavLink>
              <NavLink className="mobile-new-link" to="/account" onClick={handleProfileClick}>
                Account
              </NavLink>
            </>
          )}

          {!isAdmin && (
            <>
              <NavLink className="mobile-new-link" to="/account" onClick={handleProfileClick}>
                Account
                {wonAuctionCount > 0 && location.pathname !== '/account' && (
                  <span className="unread-badge">{wonAuctionCount}</span>
                )}
              </NavLink>

              <NavLink className="mobile-new-link" to="/messages" onClick={handleLinkClick}>
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
                className="mobile-new-link"
                to="/admin/inbox"
                title="Inbox"
                onClick={handleLinkClick}
              >
                Inbox
              </NavLink>
              <NavLink
                className="mobile-new-link"
                to="/admin/new"
                title="Make new post"
                onClick={handleLinkClick}
              >
                New
              </NavLink>
              <NavLink
                className="mobile-new-link"
                to="/admin/discounts"
                title="Post a new sale"
                onClick={handleLinkClick}
              >
                Sale!
              </NavLink>
              <button
                className="mobile-new-link download-button"
                title="Download Inventory CSV"
                onClick={() => {
                  handleDownloadCSV();
                  closeMenu();
                }}
              >
                Inventory
              </button>
              <NavLink
                className="mobile-new-link"
                to="/admin/users"
                title="Users Dashboard"
                onClick={handleLinkClick}
              >
                Users
              </NavLink>
            </>
          )}

          <NavLink
            className="mobile-new-link"
            to="/about-me"
            title="About Kevin"
            onClick={handleLinkClick}
          >
            About
          </NavLink>
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
