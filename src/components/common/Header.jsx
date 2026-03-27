import React from 'react';
import { FaBars, FaBriefcase } from 'react-icons/fa';
import Button from './Button';

const Header = ({ currentUser, onSignOut, onOpenMenu }) => {
  const initials = (currentUser?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <FaBriefcase className="logo-icon" />
          <h1>JobTrackr</h1>
        </div>
        <p className="tagline">Your Personal Job Application Tracker</p>

        {currentUser && (
          <div className="header-auth">
            <div className="header-user-meta">
              <div className="profile-avatar" aria-hidden="true">
                {currentUser.profile?.photo ? (
                  <img src={currentUser.profile.photo} alt={`${currentUser.name} avatar`} />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <span>Signed in as <strong>{currentUser.name}</strong></span>
            </div>
            <div className="header-actions">
              <Button variant="secondary" onClick={onSignOut}>Sign Out</Button>
              <button type="button" className="icon-only-btn" onClick={onOpenMenu} aria-label="Open side menu">
                <FaBars />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
