import React from 'react';

function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 flex items-center justify-between p-2" style={{ backgroundColor: 'transparent' }}>
      <a href="/home" className="flex items-center text-white text-sm">
        <span className="material-icons">arrow_back</span>
        <span className="ml-2 lowercase">back to main site</span>
      </a>
    </nav>
  );
}

export default LandingNavbar;
