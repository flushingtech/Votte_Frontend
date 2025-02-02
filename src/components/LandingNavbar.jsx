import React, { useEffect, useState } from 'react';

function LandingNavbar() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Add a slight delay before showing the button
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 500); // 0.5s delay for the fade-in effect

    return () => clearTimeout(timer);
  }, []);

  const handleLogoClick = (event) => {
    event.preventDefault();
    window.location.reload(); // Refresh the page
  };

  return (
    <div>
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 flex items-center p-3 border-b shadow-md"
        style={{ backgroundColor: '#FFFFFF' }} // White navbar
      >
        {/* Logo/Favicon Button (Refreshes the Page) */}
        <a href="/" onClick={handleLogoClick} className="flex items-center">
          <img
            src="../src/assets/votte_favicon.png"
            alt="Votte Logo"
            className="h-10 w-10 ml-2 cursor-pointer"
          />
        </a>
      </nav>

      {/* FlushingTech Button (Subtly Below the Navbar with Fade-in Effect) */}
      <div
        className={`absolute top-20 left-4 transition-opacity duration-1000 ${
          showButton ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <a
          href="https://flushingtech.org"
          className="bg-white text-black px-4 py-2 text-sm font-semibold rounded-sm hover:bg-gray-300 transition-all border shadow-md"
        >
          Visit FlushingTech
        </a>
      </div>
    </div>
  );
}

export default LandingNavbar;
