import React from 'react';

const Header = () => {
  return (
    <div className="text-center py-6">
      <h2
        className="text-4xl md:text-6xl lg:text-7xl text-purple-400 font-bold"
        style={{
          fontFamily: "'Bungee', cursive",
          textShadow: '0px 0px 1px rgba(255, 255, 255, 1)', // White drop shadow with blur radius
        }}
      >
        Hackathon Ideas
      </h2>
      <p className="text-lg text-white">
        If there's still space... add yours. Or feel free to vote.
      </p>
    </div>
  );
};

export default Header;
