import React, { useState } from 'react';
import { useUserStore } from '../../stores/userStore.js';
import './ProfileForm.css';

export default function ProfileForm({ onClose }) {
  const { profile, updateUserProfile, loading } = useUserStore();
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    profilePicture: null,
  });
  const [previewImage, setPreviewImage] = useState(profile?.profilePicture || null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profilePicture: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
    };

    // Add profile picture if selected
    if (formData.profilePicture) {
      submitData.profilePicture = formData.profilePicture;
    }

    await updateUserProfile(submitData);
    onClose();
  };

  return (
    <div className="profile-form-overlay">
      <div className="profile-form-container">
        <div className="profile-form-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter your first name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter your last name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="profilePicture">Profile Picture</label>
            <div className="image-upload-container">
              {previewImage && (
                <div className="image-preview">
                  <img src={previewImage} alt="Profile preview" />
                </div>
              )}
              <input
                type="file"
                id="profilePicture"
                name="profilePicture"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              <label htmlFor="profilePicture" className="file-input-label">
                {formData.profilePicture ? 'Change Image' : 'Choose Image'}
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
