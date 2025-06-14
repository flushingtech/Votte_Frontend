import { useEffect, useState } from 'react';
import EventsList from '../components/EventsList';
import Navbar from '../components/Navbar';
import MyIdeas from '../components/MyIdeas';
import Profile from '../components/Profile';

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

  const getEasternDate = () => {
    const eastern = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    eastern.setHours(0, 0, 0, 0); // strip time
    return eastern;
  };
  
  const todayEastern = getEasternDate();
  

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
        className="flex flex-col md:flex-row flex-grow mx-auto p-4 gap-4"
        style={{ maxWidth: '100%', width: '100%' }}
      >
        {/* Events Section (Appears first on mobile, left on desktop) */}
        <div className="w-full md:w-[70%] flex flex-col gap-6">
          <div
            className="flex-1 border border-white shadow-sm overflow-y-auto"
            style={{
              padding: '0.5rem',
              width: '100%',
            }}
          >
            {/* Today's Date */}
            <div className="text-white text-xs mb-2 text-center">
              Today is {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'America/New_York',
              })}
            </div>

            <EventsList today={todayEastern} />
          </div>


          <div
            className="flex-1 border border-white shadow-sm overflow-y-auto"
            style={{
              padding: '0.5rem',
              width: '100%',
            }}
          >
            <Profile user={{ email: userEmail }} />
          </div>
        </div>

        {/* Right Section: My Projects (only contributed ideas) */}
        <div className="w-full md:w-[50%] flex flex-col gap-6">
          <div
            className="flex-1 border border-white shadow-sm overflow-y-auto"
            style={{
              padding: '0.5rem',
              width: '100%',
            }}
          >
            <MyIdeas email={userEmail} showContributedOnly={true} title="My Projects" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
