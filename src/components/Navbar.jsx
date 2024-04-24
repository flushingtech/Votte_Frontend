import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-black text-white py-4">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        {/* Title with specified styling */}
        <div className="top-left-nav text-3xl font-thin" style={{ fontFamily: "'Bungee Shade', sans-serif", color: "#baf553ff" }}>
          Flushing Tech
        </div>
        {/* Navigation Links */}
        <ul className="flex text-lg space-x-12">
          <li>
            <a href="https://discord.gg/xGgFcZknDR" target="_blank" className="hover:text-gray-300">Discord</a>
          </li>
          <li>
            <a href="https://github.com/flushingtech/" target="_blank" className="hover:text-gray-300">GitHub</a>
          </li>
          <li>
            <a href="https://www.meetup.com/flushing-tech-meetup-group/" target="_blank">Meetup</a>
          </li>
        </ul>
      </div>
    </nav>
    
  );
};

export default Navbar;
