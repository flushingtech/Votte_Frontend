import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const adminEmails = ['flushingtech.nyc@gmail.com', 'tkhattab1999@gmail.com', 'admin2@example.com', 'william@flushingtech.org'];

function Navbar({ userName }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    setIsDropdownOpen(false);
    navigate('/');
  };

  const goToAdminPage = () => {
    setIsDropdownOpen(false);
    navigate('/admin');
  };

  const goToHome = () => {
    navigate('/home');
  };

  return (
    <nav className="flex items-center justify-between p-3" style={{ backgroundColor: '#FFE4CE' }}>
      {/* Logo in the top left - Clicking it navigates to /home */}
      <button onClick={goToHome} className="flex items-center">
        <img src="../src/assets/votte_favicon.png" alt="Votte Logo" className="h-10 w-10 ml-2 cursor-pointer" />
      </button>

      {/* User Info & Dropdown */}
      <div className="relative flex items-center text-black text-lg font-medium mr-4">
        <span className="mr-2 text-gray-800">{userName || userEmail}</span>
        <span
          className="material-icons text-gray-600 text-md cursor-pointer hover:text-gray-900 transition"
          onClick={toggleDropdown}
        >
          expand_more
        </span>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-32 bg-white shadow-lg text-center z-10">
            {adminEmails.includes(userEmail) && (
              <button
                onClick={goToAdminPage}
                className="w-full text-sm px-4 py-2 text-gray-700 hover:bg-gray-200"
              >
                Admin
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="w-full text-sm px-4 py-2 text-gray-700 hover:bg-gray-200"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
