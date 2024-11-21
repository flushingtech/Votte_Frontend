import { useEffect, useState } from 'react';
import EventsList from '../components/EventsList';
import Navbar from '../components/Navbar';
import MyIdeas from '../components/MyIdeas';
import LikedIdeas from '../components/LikedIdeas';

// Function to decode JWT manually
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

function Home() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = decodeToken(token);
      const email = decodedToken?.email || 'Guest';
      setUserName(email);
      setUserEmail(email);
      localStorage.setItem('userEmail', email); // Store email in local storage
    }
  }, []);

  return (
    <div
      className="home-page flex flex-col"
      style={{ backgroundColor: '#030C18', minHeight: '100vh' }}
    >
      <Navbar userName={userName} />

      {/* Flex container for the main content */}
      <div
        className="flex flex-wrap md:flex-nowrap flex-grow mx-auto p-4 gap-4"
        style={{ maxWidth: '100%', width: '100%' }}
      >
        {/* Left Section: MyIdeas and LikedIdeas */}
        <div className="w-full md:w-[98%] flex flex-col gap-6">
          {/* MyIdeas */}
          <div
            className="flex-1 border border-white shadow-sm overflow-y-auto"
            style={{
              padding: '1.5rem',
              width: '100%',
            }}
          >
            <MyIdeas email={userEmail} />
          </div>

          {/* LikedIdeas */}
          <div
            className="flex-1 border border-white shadow-sm overflow-y-auto"
            style={{
              padding: '1.5rem',
              width: '100%',
            }}
          >
            <LikedIdeas email={userEmail} />
          </div>
        </div>

        {/* Right Section: EventsList */}
        <div
          className="w-full md:w-[2%] border border-white shadow-sm"
          style={{
            padding: '0.25rem',
            width: '100%',
          }}
        >
          <EventsList />
        </div>
      </div>
    </div>
  );
}

export default Home;
