import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import votteLogo from "../assets/votte_favicon.png";
import { checkAdminStatus } from "../api/API";

function Navbar({ userName }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email || "";

  useEffect(() => {
    const fetchAdminStatus = async () => {
      if (userEmail) {
        const adminStatus = await checkAdminStatus(userEmail);
        setIsAdmin(adminStatus);
      }
    };

    fetchAdminStatus();
  }, [userEmail]); // Runs when userEmail changes

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    setIsDropdownOpen(false);
    navigate("/");
  };

  const goToAdminPage = () => {
    setIsDropdownOpen(false);
    navigate("/admin");
  };

  const goToHome = () => {
    navigate("/home");
  };

  return (
    <nav className="relative z-50">
      {/* Main Navbar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-sm border-b border-slate-700/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Section */}
            <button 
              onClick={goToHome} 
              className="flex items-center space-x-3 group hover:scale-105 transition-all duration-200"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <img
                  src={votteLogo}
                  alt="Votte Logo"
                  className="relative h-10 w-10 rounded-xl shadow-lg border border-slate-600 bg-white p-1"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Votte
                </h1>
              </div>
            </button>


            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-300 hover:text-white p-2 rounded-lg transition-all duration-200 hover:bg-slate-700/50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* User Section */}
            <div className="relative flex items-center">
              {/* User Avatar & Info */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-white">
                    {userName?.split('@')[0] || userEmail?.split('@')[0] || 'Guest'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {isAdmin ? 'Administrator' : 'Member'}
                  </p>
                </div>
                
                {/* Avatar Button */}
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border border-slate-600 rounded-xl px-3 py-2 transition-all duration-200 hover:shadow-lg group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {(userName || userEmail)?.charAt(0)?.toUpperCase() || 'G'}
                  </div>
                  <svg 
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Enhanced Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl backdrop-blur-sm z-[9999] overflow-hidden">
                  {/* Dropdown Header */}
                  <div className="px-4 py-3 border-b border-slate-700/50 bg-gradient-to-r from-slate-700/50 to-slate-600/50">
                    <p className="text-sm font-medium text-white truncate">
                      {userName || userEmail}
                    </p>
                    <p className="text-xs text-slate-400">
                      {isAdmin ? '👑 Administrator' : '👤 Team Member'}
                    </p>
                  </div>

                  {/* Dropdown Items */}
                  <div className="py-2">
                    {isAdmin && (
                      <>
                        <button
                          onClick={goToAdminPage}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Admin Panel</span>
                        </button>
                        <div className="border-t border-slate-700/50 my-2"></div>
                      </>
                    )}
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-slate-800 to-slate-900 border-t border-slate-700/50 shadow-xl">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile User Info */}
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-700/50">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                {(userName || userEmail)?.charAt(0)?.toUpperCase() || 'G'}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {userName?.split('@')[0] || userEmail?.split('@')[0] || 'Guest'}
                </p>
                <p className="text-xs text-slate-400">
                  {isAdmin ? '👑 Administrator' : '👤 Team Member'}
                </p>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              {isAdmin && (
                <button
                  onClick={() => {
                    navigate('/admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Admin Panel</span>
                </button>
              )}
            </div>

            {/* Mobile Sign Out */}
            <div className="border-t border-slate-700/50 pt-4">
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtle bottom border glow */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
    </nav>
  );
}

export default Navbar;
