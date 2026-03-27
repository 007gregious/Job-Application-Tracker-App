import React, { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { authService } from '../../services/authService';

const MAX_PHOTO_DIMENSION = 256;
const PHOTO_QUALITY = 0.82;

const buildProfileState = (currentUser) => ({
  name: currentUser?.name || '',
  email: currentUser?.email || '',
  headline: currentUser?.profile?.headline || '',
  targetRole: currentUser?.profile?.targetRole || '',
  location: currentUser?.profile?.location || '',
  linkedinUrl: currentUser?.profile?.linkedinUrl || '',
  portfolioUrl: currentUser?.profile?.portfolioUrl || '',
  photo: currentUser?.profile?.photo || ''
});

const resizeImageToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.onload = () => {
    const image = new Image();

    image.onload = () => {
      const scale = Math.min(MAX_PHOTO_DIMENSION / image.width, MAX_PHOTO_DIMENSION / image.height, 1);
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL('image/webp', PHOTO_QUALITY));
    };

    image.onerror = () => reject(new Error('Unable to read selected image'));
    image.src = reader.result;
  };

  reader.onerror = () => reject(new Error('Unable to process selected file'));
  reader.readAsDataURL(file);
});

const ProfilePage = ({ currentUser, onProfileUpdated }) => {
  const initialState = useMemo(() => buildProfileState(currentUser), [currentUser]);
  const [profileData, setProfileData] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    setProfileData(buildProfileState(currentUser));
  }, [currentUser]);

  const initials = (profileData.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      const compressedDataUrl = await resizeImageToDataUrl(file);
      setProfileData((prev) => ({ ...prev, photo: compressedDataUrl }));
      toast.success('Profile photo ready to save');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRemovePhoto = () => {
    setProfileData((prev) => ({ ...prev, photo: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!currentUser?.id) {
      toast.error('You must be signed in to update your profile');
      return;
    }

    if (!profileData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);

    try {
      const sessionUser = authService.updateProfile(currentUser.id, {
        name: profileData.name,
        profile: {
          headline: profileData.headline,
          targetRole: profileData.targetRole,
          location: profileData.location,
          linkedinUrl: profileData.linkedinUrl,
          portfolioUrl: profileData.portfolioUrl,
          photo: profileData.photo
        }
      });

      onProfileUpdated(sessionUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page application-form">
      <h2>My Profile</h2>
      <p className="profile-subtitle">Update your personal details and keep your profile photo across sessions.</p>

      <form onSubmit={handleSubmit}>
        <div className="profile-photo-section">
          <div className="profile-avatar-large" aria-label="Profile avatar">
            {profileData.photo ? (
              <img src={profileData.photo} alt="Profile" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="profile-photo-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadPhoto}
            />
            {profileData.photo && (
              <Button type="button" variant="secondary" onClick={handleRemovePhoto}>
                Remove Photo
              </Button>
            )}
          </div>
        </div>

        <div className="form-row">
          <Input
            label="Full Name"
            name="name"
            value={profileData.name}
            onChange={handleInputChange}
            required
            placeholder="John Doe"
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleInputChange}
            placeholder="you@example.com"
            required
            readOnly
            disabled
          />
        </div>

        <Input
          label="Headline"
          name="headline"
          value={profileData.headline}
          onChange={handleInputChange}
          placeholder="Job seeker focused on frontend roles"
        />

        <div className="form-row">
          <Input
            label="Target Role"
            name="targetRole"
            value={profileData.targetRole}
            onChange={handleInputChange}
            placeholder="Frontend Engineer"
          />
          <Input
            label="Location"
            name="location"
            value={profileData.location}
            onChange={handleInputChange}
            placeholder="Austin, TX"
          />
        </div>

        <div className="form-row">
          <Input
            label="LinkedIn URL"
            type="url"
            name="linkedinUrl"
            value={profileData.linkedinUrl}
            onChange={handleInputChange}
            placeholder="https://linkedin.com/in/your-profile"
          />
          <Input
            label="Portfolio URL"
            type="url"
            name="portfolioUrl"
            value={profileData.portfolioUrl}
            onChange={handleInputChange}
            placeholder="https://yourportfolio.com"
          />
        </div>

        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
