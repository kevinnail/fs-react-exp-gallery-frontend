import { NavLink } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore.js';
import { downloadInventoryCSV } from '../../services/fetch-utils.js';
import { useUnreadMessages } from '../../hooks/useUnreadMessages.js';
import { useLocation } from 'react-router-dom';

export default function Menu({ handleClick, closeMenu }) {
  const { user, isAdmin } = useUserStore();
  const { unreadMessageCount } = useUnreadMessages();
  const location = useLocation();

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
        <NavLink className="mobile-new-link" to="/auctions" onClick={handleLinkClick}>
          Auctions
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
            <NavLink
              className="mobile-new-link"
              to="/admin"
              title="Dashboard"
              onClick={handleLinkClick}
            >
              Dashboard
            </NavLink>
          )}

          {!isAdmin && (
            <>
              <NavLink className="mobile-new-link" to="/profile" onClick={handleLinkClick}>
                Profile
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
