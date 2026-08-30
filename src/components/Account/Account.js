import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '../../stores/userStore.js';
import { fetchGalleryPosts, markWelcomeMessageFalse } from '../../services/fetch-utils.js';
import ProfileForm from './AccountForm.js';
import './Account.css';
import { useProfileStore } from '../../stores/profileStore.js';
import { Link, useNavigate } from 'react-router-dom';
import UserAuctions from './UserAuctions.js';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import UserSales from './UserSales/UserSales.js';
import PaymentDueSummary from './PaymentDueSummary/PaymentDueSummary.js';
import { useAccountActivity } from '../../hooks/useAccountActivity.js';

const TAB_SUMMARY = 'summary';
const TAB_SPECIALS = 'specials';
const TAB_AUCTIONS = 'auctions';
const TAB_PURCHASES = 'purchases';

// Offset so the smooth scroll clears the fixed site header
const TAB_SCROLL_OFFSET = 100;

const tabLabel = (text, badge, badgeTitle) => (
  <span className="account-tab-label">
    {text}
    {badge ? (
      <span className="account-tab-badge" title={badgeTitle}>
        {badge}
      </span>
    ) : null}
  </span>
);

const totalDueLabel = (text, badge, badgeTitle) => (
  <span className="account-tab-label">
    {text}
    {badge ? <span title={badgeTitle}>{badge}</span> : null}
  </span>
);

export default function Account() {
  const { user } = useUserStore();
  const { profile, address, setShowWelcome, fetchUserProfile } = useProfileStore();
  const [showEditForm, setShowEditForm] = useState(false);
  const [recentPosts, setRecentPosts] = useState([]);
  const navigate = useNavigate();
  const [tab, setTab] = useState(TAB_SPECIALS);
  const tabsRef = useRef(null);
  const hasAutoSelectedTab = useRef(false);

  const {
    loading: activityLoading,
    activeAuctionBids,
    wonAuctions,
    sales,
    unpaidData,
  } = useAccountActivity(user?.id);
  const unpaidAuctionCount = unpaidData.unpaidWins.length;
  const unpaidPurchaseCount = unpaidData.unpaidPurchases.length;
  const hasUnpaid = unpaidData.itemCount > 0;

  const currentSpecialDiscount = 0.7; //^  Adjust as needed =========================================================

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const goToTab = (value) => {
    setTab(value);
    window.requestAnimationFrame(() => {
      if (!tabsRef.current) return;
      const top = tabsRef.current.getBoundingClientRect().top + window.scrollY - TAB_SCROLL_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  };

  useEffect(() => {
    if (activityLoading || hasAutoSelectedTab.current) return;
    hasAutoSelectedTab.current = true;
    if (hasUnpaid) setTab(TAB_SUMMARY);
  }, [activityLoading, hasUnpaid]);

  // The summary tab only exists while something is unpaid
  useEffect(() => {
    if (!hasUnpaid && tab === TAB_SUMMARY) setTab(TAB_SPECIALS);
  }, [hasUnpaid, tab]);

  useEffect(() => {
    // Use store method so both profile & address get populated
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadRecentPosts = async () => {
      try {
        const posts = await fetchGalleryPosts();

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const recentWork = posts
          .filter((post) => new Date(post.created_at) >= twoWeeksAgo && post.sold === false)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setRecentPosts(recentWork);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      }
    };

    loadRecentPosts();
  }, []);

  // Check if user has added name or image
  const hasNameOrImage = profile?.firstName || profile?.lastName || profile?.imageUrl;

  // Determine if profile is complete: firstName, lastName, avatar image, and address fields
  const hasFirstName = Boolean(profile?.firstName && String(profile.firstName).trim());
  const hasLastName = Boolean(profile?.lastName && String(profile.lastName).trim());
  const hasAvatar = Boolean(profile?.imageUrl && String(profile.imageUrl).trim());
  const hasAddress = Boolean(
    address &&
      address.addressLine1 &&
      address.city &&
      address.state &&
      address.postalCode &&
      address.countryCode
  );

  const isProfileComplete = hasFirstName && hasLastName && hasAvatar && hasAddress;

  const removeWelcomeMessage = async () => {
    try {
      // persist the preference to the backend
      await markWelcomeMessageFalse(user?.id);
    } catch (e) {
      // still update local state even if the network call fails
      console.error('Failed to persist welcome dismissal:', e);
    } finally {
      setShowWelcome(false);
    }
  };

  function ProfileMessage() {
    return (
      <div>
        <p className="profile-content-p">
          I&apos;ll be adding more features asap, I just built Messages and Auctions- and we&apos;ll
          see what else I get going down the line! One thing is I&apos;m looking into getting my
          blog going again for those interested in some long form content, free from doom scrolling.
          It&apos;ll be hikes/ nature, astronomy/ astrophotography, music, fun coding stuff I&apos;m
          working on, etc.- coming soon.
        </p>
        <p className="profile-content-p" style={{ marginTop: '1rem' }}>
          Let me know if you run into any bugs/ technical issues and I&apos;ll get &apos;em fixed.
        </p>
        <p className="profile-content-p" style={{ textAlign: 'center', margin: '2rem' }}>
          Stay tuned, and thanks for being here.
        </p>
      </div>
    );
  }

  const newUserMessage = (
    <>
      <p className="profile-content-p">
        Please add your name or whatever you want me to call you, and an avatar image, using the
        edit button above.
      </p>

      <p className="profile-content-p">
        If you have questions about work or a problem with an order, feel free to use the private/
        secure/ encrypted in house{' '}
        <Link className="message-link" to="/messages">
          messaging
        </Link>
        ! <span>(link in menu)</span>
      </p>
      <ProfileMessage />
    </>
  );

  const existingUserMessage = (
    <>
      <div>
        Thanks for setting up an account! You can now message me directly via Messages in 2 ways:
        <ol>
          <li>Message me directly via Messages up in menu</li>
          <li>
            Message me from the details page of a piece and Messages will automatically link it
          </li>
        </ol>
      </div>
      <ProfileMessage />
    </>
  );

  const customerMessage = hasNameOrImage ? existingUserMessage : newUserMessage;

  const handleEditProfile = () => {
    setShowEditForm(true);
  };

  const handleCloseForm = () => {
    setShowEditForm(false);
  };

  const handleClickNewWork = (postId) => {
    navigate(`/${postId}`);
  };

  // Time-based greeting (includes late-night/night-owl message)
  const displayGreeting = (() => {
    const hour = new Date().getHours();
    const name = profile?.firstName || '';

    // Late night / night-owl hours: 00:00 - 04:59
    if (hour >= 0 && hour < 5) {
      return name ? `Hey ${name}, enjoy the late night energy!` : 'Enjoy the late night energy!';
    }

    // Morning: 05:00 - 11:59
    if (hour >= 5 && hour < 12) return name ? `Good morning, ${name}!` : 'Good morning!';

    // Afternoon: 12:00 - 17:59
    if (hour >= 12 && hour < 18) return name ? `Good afternoon, ${name}!` : 'Good afternoon!';

    // Evening: 18:00 - 23:59
    return name ? `Good evening, ${name}!` : 'Good evening!';
  })();

  return (
    <div className="profile-container">
      <div className="profile-content">
        <button
          onClick={handleEditProfile}
          className="edit-profile-icon-btn"
          aria-label="Edit Settings"
          title="Edit Settings"
        >
          <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>⚙️</span>
        </button>
        <div className="profile-header">
          <div className="profile-picture-section">
            {profile?.imageUrl ? (
              <img src={profile?.imageUrl} alt="Profile" className="profile-picture" />
            ) : (
              <div className="profile-picture-placeholder">
                {profile?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>
              {profile?.firstName || profile?.lastName
                ? `${profile?.firstName || ''} ${profile?.lastName || ''}`
                : ''}
            </h1>
            <p className="user-email">{user?.email}</p>
            <p className="account-greeting">{displayGreeting}</p>
            <div className="account-status-row">
              <button
                type="button"
                className={`account-chip ${
                  profile?.sendEmailNotifications ? 'account-chip-on' : 'account-chip-off'
                }`}
                onClick={handleEditProfile}
                title={
                  profile?.sendEmailNotifications
                    ? 'Emails for new messages, new work, auctions, and tracking info. Click to change in settings.'
                    : 'Only tracking info emails. Click to change in settings.'
                }
              >
                <span className="account-chip-dot" aria-hidden="true" />
                Email notifications {profile?.sendEmailNotifications ? 'on' : 'off'}
                <span className="account-chip-gear" aria-hidden="true">
                  ⚙️
                </span>
              </button>
              {!isProfileComplete && (
                <button
                  type="button"
                  className="account-chip account-chip-warn"
                  onClick={handleEditProfile}
                >
                  Account info incomplete
                  <span className="account-chip-gear" aria-hidden="true">
                    ⚙️
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {profile?.showWelcome && (
          <div className="profile-details">
            {customerMessage}
            <span className="got-it-button" onClick={removeWelcomeMessage}>
              Got it! Don&apos;t show this message again
            </span>
          </div>
        )}

        <div ref={tabsRef}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            className="account-tabs"
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{ className: 'account-tabs-indicator' }}
          >
            {hasUnpaid && (
              <Tab
                className="account-tab account-tab-due"
                value={TAB_SUMMARY}
                label={totalDueLabel(
                  'Summary',
                  `$${unpaidData.total.toLocaleString()}`,
                  'Amount currently due'
                )}
              />
            )}
            <Tab className="account-tab" value={TAB_SPECIALS} label="Specials" />
            <Tab
              className="account-tab"
              value={TAB_AUCTIONS}
              label={tabLabel(
                'Auctions',
                unpaidAuctionCount || null,
                `${unpaidAuctionCount} awaiting payment`
              )}
            />
            <Tab
              className="account-tab"
              value={TAB_PURCHASES}
              label={tabLabel(
                'Purchases',
                unpaidPurchaseCount || null,
                `${unpaidPurchaseCount} awaiting payment`
              )}
            />
          </Tabs>
        </div>
        <div className="tab-content-wrapper">
          {tab === TAB_SUMMARY && hasUnpaid && (
            <PaymentDueSummary
              unpaidData={unpaidData}
              onViewUnpaidAuctions={() => goToTab(TAB_AUCTIONS)}
              onViewUnpaidPurchases={() => goToTab(TAB_PURCHASES)}
            />
          )}
          {tab === TAB_SPECIALS && (
            <div className="new-work-section">
              <span className="new-work-msg">
                <span style={{ display: 'block', textAlign: 'center' }}>
                  <strong>Current Special:</strong>
                </span>

                <span style={{ display: 'block', textAlign: 'center' }}>
                  All new work is <strong>discounted 30% </strong>
                  for 2 weeks after it&apos;s posted.
                </span>
              </span>

              <div className="new-work-content">
                {recentPosts.length > 0 ? (
                  recentPosts.map((post) => (
                    <div
                      key={post.id}
                      className="recent-post-card"
                      onClick={() => handleClickNewWork(post.id)}
                    >
                      <div className="recent-post-image-title-wrapper">
                        <img src={post.image_url} alt={post.title} className="recent-post-image" />
                      </div>

                      <div className="recent-post-details">
                        <p>
                          <span>Category:</span>
                          <span>{post.category}</span>
                        </p>

                        <p>
                          <span>Price:</span>
                          <span style={{ fontWeight: '600' }}>
                            <span
                              style={{
                                color: 'red',
                                textDecoration: 'line-through',
                                marginRight: '1rem',
                              }}
                            >
                              {post.price ? `$${post.price}` : 'N/A'}
                            </span>
                            <i className="fa fa-arrow-right" aria-hidden="true"></i>
                            <span style={{ marginLeft: '.25rem' }}>
                              ${(post.price * currentSpecialDiscount).toFixed(0)}
                            </span>
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ margin: '1rem' }}>No new work right now! Check back regularly.</p>
                )}
              </div>
            </div>
          )}
          {tab === TAB_AUCTIONS && (
            <UserAuctions
              activeAuctionBids={activeAuctionBids}
              wonAuctions={wonAuctions}
              loading={activityLoading}
            />
          )}
          {tab === TAB_PURCHASES && <UserSales sales={sales} loading={activityLoading} />}
        </div>
      </div>

      {showEditForm && <ProfileForm handleCloseForm={handleCloseForm} />}
    </div>
  );
}
