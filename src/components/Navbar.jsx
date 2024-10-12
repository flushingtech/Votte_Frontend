import React from 'react';

function Navbar({ userName }) {
  return (
    <nav className="flex items-center justify-between p-2" style={{ backgroundColor: '#1E2A3A' }}>
      <div className="flex items-center">
        <a href="https://flushingtech.org" className="flex items-center text-white text-sm">
          <span className="material-icons">arrow_back</span>
          <span className="ml-2 lowercase">back to main site</span>
        </a>
      </div>
      <div className="text-white text-sm">
        Hello, {userName}
      </div>
    </nav>
  );
}

export default Navbar;
