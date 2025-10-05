import React, { useState } from 'react';
import { useUserStore } from '../../stores/userStore.js';
import './ProfileForm.css';
import { useProfileStore } from '../../stores/profileStore.js';

export default function ProfileForm({ handleCloseForm }) {
  const { profile, loading } = useUserStore();
  const { updateUserProfile } = useProfileStore();
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    imageUrl: null,
  });
  const [previewImage, setPreviewImage] = useState(profile?.imageUrl || null);

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
        imageUrl: file,
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

    try {
      await updateUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        file: formData.imageUrl,
        existingImageUrl: profile?.imageUrl || null,
      });

      handleCloseForm();
    } catch (error) {
      console.error('Error updating profile:', error);
      // toast shown by store
    }
  };

  return (
    <div className="profile-form-overlay">
      <div className="profile-form-container">
        <div className="profile-form-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={handleCloseForm}>
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
            <label htmlFor="imageUrl">Profile Picture</label>
            <div className="image-upload-container">
              {previewImage && (
                <div className="image-preview">
                  <img src={previewImage} alt="Profile preview" />
                </div>
              )}
              <input
                type="file"
                id="imageUrl"
                name="imageUrl"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              <label htmlFor="imageUrl" className="file-input-label">
                {formData.imageUrl ? 'Change Image' : 'Choose Image'}
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCloseForm} className="cancel-btn">
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
