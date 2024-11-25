import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const adminEmails = ['flushingtech.nyc@gmail.com', 'tkhattab1999@gmail.com', 'admin2@example.com'];

function Navbar({ userName, backToHome }) {
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
      <div className="flex items-center">
        {backToHome ? (
          <button
            onClick={goToHome}
            className="flex items-center bg-black text-white py-2 px-4 rounded shadow hover:bg-gray-800 transition-all"
          >
            <span className="material-icons text-white text-xl font-bold">arrow_back</span>
            <span className="ml-2 text-sm font-semibold">Home</span>
          </button>
        ) : (
          <a href="https://flushingtech.org" className="flex items-center text-black text-sm">
            <span className="mt-1.5 ml-4 material-icons text-black text-2xl font-bold">arrow_back</span>
            <span className="ml-3 lowercase text-black text-2xl">
              c.tech<span style={{ color: '#CA2828' }}>(flushing)</span>
            </span>
          </a>
        )}
      </div>
      <div className="relative text-black text-xl mr-4 flex items-center">
        Hello, <span className="font-bold ml-1" style={{ color: '#CA2828' }}>{userName}</span>
        <span
          className="material-icons ml-2 cursor-pointer"
          onClick={toggleDropdown}
        >
          arrow_drop_down
        </span>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-24 bg-white rounded shadow-lg text-center z-10">
            {adminEmails.includes(userEmail) && (
              <button
                onClick={goToAdminPage}
                className="w-full text-sm px-4 py-2 text-black hover:bg-gray-200"
              >
                Admin
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="w-full text-sm px-4 py-2 text-black hover:bg-gray-200"
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
