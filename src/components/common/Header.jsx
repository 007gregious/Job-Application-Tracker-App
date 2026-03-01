import React from 'react';
import { FaBriefcase } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <FaBriefcase className="logo-icon" />
          <h1>JobTrackr</h1>
        </div>
        <p className="tagline">Your Personal Job Application Tracker</p>
      </div>
    </header>
  );
};

export default Header;