import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import votteLogo from "../assets/votte_favicon.png";
import { checkAdminStatus } from "../api/API";

function Navbar({ userName }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    <nav
      className="flex items-center justify-between p-3 shadow-md border relative"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      {/* Logo - Clicking navigates to /home */}
      <button onClick={goToHome} className="flex items-center">
        <img
          src={votteLogo}
          alt="Votte Logo"
          className="h-10 w-10 ml-2 cursor-pointer"
        />
      </button>

      {/* User Info & Dropdown */}
      <div className="relative flex items-center text-black text-lg font-medium mr-4">
        <span className="mr-2 text-gray-800">{userName || userEmail}</span>
        <button
          className="material-icons text-gray-600 text-md cursor-pointer hover:text-gray-900 transition"
          onClick={toggleDropdown}
        >
          expand_more
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-36 bg-white border shadow-lg text-center z-50"
            style={{ minWidth: "150px" }}
          >
            {isAdmin && (
              <button
                onClick={goToAdminPage}
                className="w-full text-sm px-4 py-2 text-gray-700 hover:bg-gray-200 transition"
              >
                Admin
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="w-full text-sm px-4 py-2 text-gray-700 hover:bg-gray-200 transition"
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
