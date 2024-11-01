import React from 'react';

function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 flex items-center justify-between p-3" style={{ backgroundColor: '#FFE4CE' }}>
      <a href="https://flushingtech.org" className="flex items-center text-lg">
        <span className="mt-1.5 ml-4 material-icons text-black text-2xl font-bold">arrow_back</span>
        <span className="ml-3 lowercase text-black text-2xl">
          c.tech<span style={{ color: '#CA2828' }}>(flushing)</span>
        </span>
      </a>
    </nav>
  );
}

export default LandingNavbar;
