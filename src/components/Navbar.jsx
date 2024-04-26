import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Navbar = () => {
  return (
    <nav className="text-white py-4">
      <div className="max-w-7xl mx-auto px-4 flex justify-center items-center">
        <Link to="/" className="text-2xl md:text-3xl lg:text-4xl font-thin text-center" style={{ fontFamily: "'Bungee Shade', sans-serif", color: "#baf553ff" }}>
          Flushing Tech Meetup
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
