// ...existing code...
import { useState, useEffect } from 'react';
import './Account.css';
import './AccountForm.css';
import { useProfileStore } from '../../stores/profileStore.js';
import { toast } from 'react-toastify';

export default function ProfileForm({ handleCloseForm }) {
  const { updateUserProfile, profile, loading } = useProfileStore();

  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    imageUrl: null,
    sendEmailNotifications:
      profile?.sendEmailNotifications !== undefined ? profile.sendEmailNotifications : true,
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    countryCode: 'US',
  });
  const [showAddress, setShowAddress] = useState(false);
  const [previewImage, setPreviewImage] = useState(profile?.imageUrl || null);

  // Helper: check if any required address field is filled
  const requiredAddressFields = ['addressLine1', 'city', 'state', 'postalCode'];

  const allAddressFieldsFilled = requiredAddressFields.every(
    (field) => formData[field].trim() !== ''
  );

  // Also highlight when no address is provided at all
  const needsAttention = !allAddressFieldsFilled; // true for partial OR empty

  // Button style values (avoid long ternaries inline)
  const addressBtnBackground = needsAttention ? '#e74c3c' : '#fffbe6';
  const addressBtnColor = needsAttention ? '#fff' : '#222';
  const addressBtnWeight = needsAttention ? 700 : 500;

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        imageUrl: null,
        sendEmailNotifications: profile.sendEmailNotifications,
        // Optionally, prefill address fields if you have them in profile/address state
        // addressLine1: profile.address?.addressLine1 || '',
        // addressLine2: profile.address?.addressLine2 || '',
        // city: profile.address?.city || '',
        // state: profile.address?.state || '',
        // postalCode: profile.address?.postalCode || '',
        // countryCode: profile.address?.countryCode || 'US',
      }));
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
      // Submit-time address validation: all-or-nothing
      const required = ['addressLine1', 'city', 'state', 'postalCode'];
      const anyFilled = required.some((f) => (formData[f] || '').trim() !== '');
      const allFilled = required.every((f) => (formData[f] || '').trim() !== '');
      console.log('address submit validation', { anyFilled, allFilled });

      if (anyFilled && !allFilled) {
        const toastOptions = {
          theme: 'dark',
          draggable: true,
          draggablePercent: 60,
          autoClose: 4000,
        };
        toast.error(
          'Please complete all required address fields (street, city, state, postal code) or leave them all blank and fill them in later',
          toastOptions
        );
        return;
      }

      let addressPayload = {};
      if (allFilled) {
        addressPayload = {
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || '',
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          countryCode: formData.countryCode || 'US',
        };
      }

      await updateUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        file: formData.imageUrl,
        existingImageUrl: profile?.imageUrl || null,
        sendEmailNotifications: formData.sendEmailNotifications,
        ...addressPayload,
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
              value={formData.firstName || ''}
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
              value={formData.lastName || ''}
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

          <div
            className="form-group"
            style={{ border: '1px solid yellow ', padding: '.5rem', borderRadius: '8px' }}
          >
            <label>
              <input
                type="checkbox"
                name="sendEmailNotifications"
                checked={formData.sendEmailNotifications}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sendEmailNotifications: e.target.checked,
                  }))
                }
              />
              Receive email notifications for new work/ auctions
            </label>
          </div>

          {/* Shipping Address Section */}
          <div className="form-group address-section">
            <button
              type="button"
              className="toggle-address-btn"
              onClick={() => setShowAddress((prev) => !prev)}
              style={{
                marginBottom: '0.5rem',
                background: addressBtnBackground,
                border: '1px solid #ccc',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                color: addressBtnColor,
                fontWeight: addressBtnWeight,
                transition: 'background 0.2s',
              }}
            >
              {showAddress ? 'Hide Shipping Address' : 'Add Shipping Address'}
            </button>
            {showAddress && (
              <div
                className="address-fields"
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #ffe066',
                }}
              >
                {/* Guidance handled via submit validation toast */}
                <div className="form-group">
                  <label htmlFor="addressLine1">Street Address</label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="addressLine2">Address Line 2 (optional)</label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Apt, suite, etc. (optional)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="postalCode">Postal Code</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="ZIP or postal code"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="countryCode">Country Code</label>
                  <input
                    type="text"
                    id="countryCode"
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    placeholder="US"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCloseForm} className="cancel-btn-account">
              Cancel
            </button>
            <button type="submit" className="submit-btn-account" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
