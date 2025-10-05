import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../stores/userStore.js';
import { signOut } from '../../services/auth.js';
import { fetchUserProfile } from '../../services/fetch-utils.js';
import Menu from '../Menu/Menu.js';
import ProfileForm from './ProfileForm.js';
import './Profile.css';

export default function Profile() {
  const { user, profile, setUser, setProfile } = useUserStore();
  const [showEditForm, setShowEditForm] = useState(false);

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
  }, []);

  const handleClick = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      // Still set user to null even if sign out fails
      setUser(null);
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
        <div className="profile-header">
          <div className="profile-picture-section">
            {profile?.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" className="profile-picture" />
            ) : (
              <div className="profile-picture-placeholder">
                {profile?.firstName?.charAt(0) || user?.user?.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>
              {profile?.firstName && profile?.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : user?.user?.email}
            </h1>
            <p className="user-email">{user?.user?.email}</p>
            <button onClick={handleEditProfile} className="edit-profile-btn">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">First Name:</span>
            <span className="detail-value">{profile?.firstName || 'Not set'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Last Name:</span>
            <span className="detail-value">{profile?.lastName || 'Not set'}</span>
          </div>
        </div>
      </div>

      {showEditForm && <ProfileForm onClose={handleCloseForm} />}
    </div>
  );
}
