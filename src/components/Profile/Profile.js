import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../stores/userStore.js';
import { signOut } from '../../services/auth.js';
import { fetchUserProfile } from '../../services/fetch-utils.js';
import Menu from '../Menu/Menu.js';
import ProfileForm from './ProfileForm.js';
import './Profile.css';
import { useProfileStore } from '../../stores/profileStore.js';

export default function Profile() {
  const { user, signout } = useUserStore();
  const { profile, setProfile } = useProfileStore();
  const [showEditForm, setShowEditForm] = useState(false);

  // Check if user has added name or image
  const hasNameOrImage = profile?.firstName || profile?.lastName || profile?.imageUrl;

  const newUserMessage = (
    <>
      <p>
        Welcome to your profile page! (You can add your name and an avatar image using the edit
        button above.)
      </p>
      <p>
        I&apos;ll be adding features asap: auctions, messages, and we&apos;ll see what else! Stay
        tuned, thanks for being here.
      </p>
    </>
  );

  const existingUserMessage = (
    <p>
      Thanks for setting up an account- I&apos;ll be adding features asap: auctions, messages, and
      we&apos;ll see what else! Stay tuned, thanks for being here.
    </p>
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
                : user?.user?.email}
            </h1>
            <p className="user-email">{user?.user?.email}</p>
          </div>
        </div>

        <div className="profile-details">
          <h1 className="detail-value">
            {' '}
            {`Hey what's up${profile?.firstName ? ' ' + profile.firstName : ''}`}?!
          </h1>
          {customerMessage}
        </div>
      </div>

      {showEditForm && <ProfileForm handleCloseForm={handleCloseForm} />}
    </div>
  );
}
