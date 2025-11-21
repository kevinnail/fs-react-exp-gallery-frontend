import { useState, useEffect } from 'react';
import { useUserStore } from '../../stores/userStore.js';
import {
  fetchUserProfile,
  fetchGalleryPosts,
  markWelcomeMessageFalse,
} from '../../services/fetch-utils.js';
import ProfileForm from './AccountForm.js';
import './Account.css';
import { useProfileStore } from '../../stores/profileStore.js';
import { Link, useNavigate } from 'react-router-dom';
import UserAuctions from './UserAuctions.js';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import UserSales from './UserSales/UserSales.js';

export default function Account() {
  const { user } = useUserStore();
  const { profile, setProfile, setShowWelcome } = useProfileStore();

  const [showEditForm, setShowEditForm] = useState(false);
  const [recentPosts, setRecentPosts] = useState([]);
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await fetchUserProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    loadProfile();
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
          <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>🌣</span>
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
            <div
              style={{
                border: `1px solid ${profile?.sendEmailNotifications ? 'green' : 'yellow'}`,
                padding: '.25rem .5rem',
                borderRadius: '12px',
              }}
            >
              Email notifications are{' '}
              {profile?.sendEmailNotifications ? (
                <>
                  <strong>enabled</strong> You will receive one email for new work, auctions, and
                  tracking info.
                </>
              ) : (
                <>
                  <strong>disabled</strong>, you will only receive emails for tracking info.
                </>
              )}
            </div>
          </div>
        </div>

        <div className="profile-details">
          <h2 className="detail-value">{displayGreeting}</h2>
          {profile?.showWelcome && customerMessage}
          {profile?.showWelcome && (
            <span className="got-it-button" onClick={removeWelcomeMessage}>
              Got it! Don&apos;t show this message again
            </span>
          )}
        </div>

        <Tabs
          value={tab}
          onChange={handleTabChange}
          className="account-tabs"
          TabIndicatorProps={{ className: 'account-tabs-indicator' }}
        >
          <Tab className="account-tab" label="Specials" />
          <Tab className="account-tab" label="Auctions" />
          <Tab className="account-tab" label="Purchases" />
        </Tabs>

        {/*  */}
        {/*  */}

        {/*  */}
        {/*  */}
        <div className="profile-dashboard-wide">
          {tab === 0 && (
            <div
              className="new-work-section"
              style={{ border: '1px solid white', paddingTop: '.5rem', margin: '1rem 0' }}
            >
              <span className="new-work-msg">
                <span style={{ display: 'block', textAlign: 'center' }}>
                  <strong>Current Special:</strong>{' '}
                </span>
                <span style={{ display: 'block', textAlign: 'left' }}>
                  <strong>50% OFF</strong> of the new work for all new sign ups{' '}
                  <strong style={{ color: 'yellow' }}>until the end of November! </strong>This
                  extends to GlassPass and Etsy just message me and I&apos;ll get it taken care of.
                </span>
                <br />
                <span style={{ display: 'block', textAlign: 'left' }}>
                  {' '}
                  After the sign up special ends, all new work will be discounted for 2 weeks after
                  it&apos;s posted.
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
                      {' '}
                      <div className="recent-post-image-title-wrapper">
                        {' '}
                        <img src={post.image_url} alt={post.title} className="recent-post-image" />
                      </div>
                      <div className="recent-post-details">
                        <p>
                          <span>Category: </span>
                          <span>{post.category}</span>
                        </p>
                        <p>
                          <span>Price:</span>{' '}
                          <span style={{ fontWeight: '600' }}>
                            {' '}
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
                              ${(post.price * 0.7).toFixed(0)}
                            </span>
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ margin: '1rem' }}>
                    No new work right now! Check back regularly, I&apos;m always working on stocking
                    up.{' '}
                  </p>
                )}
              </div>
            </div>
          )}
          {tab === 1 && <UserAuctions userId={user?.id} />}
          {tab === 2 && <UserSales userId={user?.id} />}
        </div>
      </div>

      {showEditForm && <ProfileForm handleCloseForm={handleCloseForm} />}
    </div>
  );
}
