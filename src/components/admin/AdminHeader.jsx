import React from 'react';

const AdminHeader = () => {
  return (
    <div className="text-center py-6">
      <h2
        className="text-4xl md:text-6xl lg:text-7xl text-purple-400 font-bold"
        style={{
          fontFamily: "'Bungee', cursive",
          textShadow: '0px 0px 1px rgba(255, 255, 255, 1)', // White drop shadow with blur radius
        }}
      >
        Admin Mode
      </h2>
      <p className="text-lg text-white">
        Refresh what you need.
      </p>
    </div>
  );
};

export default AdminHeader;
