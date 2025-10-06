import React, { useState, useEffect } from 'react';
import './ProfileForm.css';
import { useProfileStore } from '../../stores/profileStore.js';
import { toast } from 'react-toastify';

export default function ProfileForm({ handleCloseForm }) {
  const { updateUserProfile, profile, loading } = useProfileStore();
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    imageUrl: null,
  });
  const [previewImage, setPreviewImage] = useState(profile?.imageUrl || null);

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        imageUrl: null,
      });
      setPreviewImage(profile.imageUrl || null);
    }
  }, [profile]);

  // Validation functions
  const validateName = (name, fieldName) => {
    if (name.length > 50) {
      toast.warn(`${fieldName} must be 50 characters or less`, {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        autoClose: 3000,
      });
    }
  };

  const validateImageSize = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.warn('Image must be 5MB or less', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        autoClose: 3000,
      });
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'firstName') {
      validateName(value, 'First name');
    } else if (name === 'lastName') {
      validateName(value, 'Last name');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (validateImageSize(file)) {
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
              value={formData.firstName || profile?.firstName}
              onChange={handleInputChange}
              placeholder="Enter your first name"
              maxLength={51}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName || profile?.lastName || ''}
              onChange={handleInputChange}
              placeholder="Enter your last name"
              maxLength={51}
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
