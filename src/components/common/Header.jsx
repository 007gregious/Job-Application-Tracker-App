import React from 'react';
import { FaBriefcase } from 'react-icons/fa';
import Button from './Button';

const Header = ({ currentUser, onSignOut }) => {
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
            <span>Signed in as <strong>{currentUser.name}</strong></span>
            <Button variant="secondary" onClick={onSignOut}>Sign Out</Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
