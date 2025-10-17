import { useState, useEffect } from 'react';
import { useUserStore } from '../../stores/userStore.js';
import { fetchUserProfile, fetchGalleryPosts } from '../../services/fetch-utils.js';
import ProfileForm from './ProfileForm.js';
import './Profile.css';
import { useProfileStore } from '../../stores/profileStore.js';
import { Link, useNavigate } from 'react-router-dom';
import UserAuctions from './UserAuctions.js';

export default function Profile() {
  const { user } = useUserStore();
  const { profile, setProfile } = useProfileStore();
  const [showEditForm, setShowEditForm] = useState(false);
  const [recentPosts, setRecentPosts] = useState([]);
  const navigate = useNavigate();

  // Check if user has added name or image
  const hasNameOrImage = profile?.firstName || profile?.lastName || profile?.imageUrl;

  const newUserMessage = (
    <>
      <p>
        You can add your name or whatever you want me to call you, and an avatar image, using the
        edit button above.
      </p>

      <p>
        If you have questions about work or a problem with your order, feel free to use the private/
        secure/ encrypted in house{' '}
        <Link className="message-link" to="/messages">
          messaging
        </Link>
        !
      </p>
      <p>
        I&apos;ll be adding features asap, just built Messages and Auctions- and we&apos;ll see what
        else down the line! Stay tuned, thanks for being here.
      </p>
    </>
  );

  const existingUserMessage = (
    <>
      <div>
        Thanks for setting up an account! You can now message me directly via Messages in 2 ways:
        <ul>
          <li>Message me directly via Messages up in menu</li>
          <li>
            Message me from the details page of a piece and Messages will automatically link it.
          </li>
        </ul>
      </div>
      <p>
        I&apos;ll be adding features asap, just built Messages and Auctions- and we&apos;ll see what
        else down the line! Stay tuned, thanks for being here.
      </p>
    </>
  );

  const customerMessage = hasNameOrImage ? existingUserMessage : newUserMessage;

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

  const handleEditProfile = () => {
    setShowEditForm(true);
  };

  const handleCloseForm = () => {
    setShowEditForm(false);
  };

  const handleClickNewWork = (postId) => {
    navigate(`/${postId}`);
  };

  return (
    <div className="profile-container">
      <div className="profile-content">
        <button
          onClick={handleEditProfile}
          className="edit-profile-icon-btn"
          aria-label="Edit Profile"
        >
          ✎
        </button>

        <div className="profile-header">
          <div className="profile-picture-section">
            {profile?.imageUrl ? (
              <img src={profile.imageUrl} alt="Profile" className="profile-picture" />
            ) : (
              <div className="profile-picture-placeholder">
                {profile?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>
              {profile?.firstName || profile?.lastName
                ? `${profile.firstName || ''} ${profile.lastName || ''}`
                : ''}
            </h1>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>

        <div className="profile-details">
          <h2 className="detail-value">
            {' '}
            {`${profile?.firstName ? 'Welcome,  ' + profile.firstName + '!' : 'Welcome!'}`}
          </h2>
          {customerMessage}
        </div>

        <div className="profile-dashboard-wide">
          <UserAuctions userId={user?.id} />
          <div className="new-work-section">
            <span className="new-work-msg">
              <strong>Current Special: </strong>30% off of the new work here!{' '}
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
                <p>Coming soon! Check back for special deals on the latest pieces.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditForm && <ProfileForm handleCloseForm={handleCloseForm} />}
    </div>
  );
}
