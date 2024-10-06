import React from 'react';

function Navbar({ userName }) {
  return (
    <nav className="flex items-center justify-between p-2" style={{ backgroundColor: '#FBE8D8' }}>
      <div className="flex items-center">
        <a href="https://flushingtech.org" className="flex items-center text-black font-bold text-sm">
          <span className="material-icons">arrow_back</span>
          <span className="ml-2 lowercase">back to main site</span>
        </a>
      </div>
      <div className="text-black text-sm font-bold">
        Hello, {userName}
      </div>
    </nav>
  );
}

export default Navbar;
