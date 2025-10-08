import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../stores/userStore.js';
import { signOut } from '../../services/auth.js';
import { fetchUserProfile, fetchGalleryPosts } from '../../services/fetch-utils.js';
import Menu from '../Menu/Menu.js';
import ProfileForm from './ProfileForm.js';
import './Profile.css';
import { useProfileStore } from '../../stores/profileStore.js';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, signout } = useUserStore();
  const { profile, setProfile } = useProfileStore();
  const [showEditForm, setShowEditForm] = useState(false);
  const [recentPosts, setRecentPosts] = useState([]);

  // Check if user has added name or image
  const hasNameOrImage = profile?.firstName || profile?.lastName || profile?.image_url;

  const newUserMessage = (
    <>
      <p>
        Welcome to your profile page! (You can add your name and an avatar image using the edit
        button above.) If you have questions about work or a problem with your order, feel free to
        use the secure/ encrypted in house{' '}
        <Link className="message-link" to="/messages">
          messaging
        </Link>
        !
      </p>
      <p>
        I&apos;ll be adding features asap: early access to new work, comments on posts, auctions,
        and we&apos;ll see what else! Stay tuned, thanks for being here.
      </p>
    </>
  );

  const existingUserMessage = (
    <>
      <p>
        Thanks for setting up an account! You can now message me directly via Messages in 2 ways:
        <ul>
          <li>Message me directly via Messages up in menu</li>
          <li>
            Message me from the details page of a piece and Messages will automatically link it.
          </li>
        </ul>
      </p>
      <p>
        I&apos;ll be adding features asap: early access to new work, comments on posts, auctions,
        and we&apos;ll see what else! Stay tuned, thanks for being here.
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
        console.log('posts', posts);

        setRecentPosts(posts);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      }
    };

    loadRecentPosts();
  }, []);

  const handleClick = async () => {
    try {
      await signOut();
      signout();
    } catch (error) {
      console.error('Error signing out:', error);
      // Still clear state even if sign out fails
      signout();
    }
  };

  const handleEditProfile = () => {
    setShowEditForm(true);
  };

  const handleCloseForm = () => {
    setShowEditForm(false);
  };

  return (
    <div className="profile-container">
      <div className="menu-search-container">
        <Menu handleClick={handleClick} />
      </div>

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
            {profile?.image_url ? (
              <img src={profile.image_url} alt="Profile" className="profile-picture" />
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
                : user?.user?.email}
            </h1>
            <p className="user-email">{user?.user?.email}</p>
          </div>
        </div>

        <div className="profile-details">
          <h2 className="detail-value">
            {' '}
            {`${profile?.firstName ? 'Welcome,  ' + profile.firstName + '!' : 'Welcome!'}`}
          </h2>
          {customerMessage}
        </div>

        <div className="new-work-section">
          <h2 className="new-work-title">New Work /asd </h2>
          <div className="new-work-content">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <div key={post.id} className="recent-post-card">
                  <img
                    width="50"
                    src={post.image_url}
                    alt={post.title}
                    className="recent-post-image"
                  />
                  <div className="recent-post-details">
                    <h3>{post.title}</h3>
                    <p>{post.description}</p>
                    <p>Category: {post.category}</p>
                    <p>Price: {post.price ? `$${post.price}` : 'N/A'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>Coming soon! Check back for special deals on the latest pieces.</p>
            )}
          </div>
        </div>
      </div>

      {showEditForm && <ProfileForm handleCloseForm={handleCloseForm} />}
    </div>
  );
}
