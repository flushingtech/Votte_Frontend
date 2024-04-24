import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-black text-white py-4">
      <div className="max-w-7xl mx-auto px-4 flex justify-center items-center">
        <div className="text-3xl font-thin" style={{ fontFamily: "'Bungee Shade', sans-serif", color: "#baf553ff" }}>
          Flushing Tech Meetup
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
