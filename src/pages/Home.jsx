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
      className="home-page flex flex-col h-screen overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)',
      }}
    >
      <Navbar userName={userName} />

      {/* Welcome Header */}
      <div className="px-4 sm:px-6 py-2 sm:py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
            Welcome back, {userName.split('@')[0] || 'Guest'}! 👋
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Your innovation dashboard • {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              timeZone: 'America/New_York',
            })}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 px-4 sm:px-6 pb-4 relative overflow-hidden">
        {/* Left Decorative Lines */}
        <div className="fixed left-0 top-1/2 transform -translate-y-1/2 hidden lg:block z-10">
          <div className="space-y-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-blue-500/50"></div>
            <div className="w-24 h-px bg-gradient-to-r from-transparent to-purple-500/40"></div>
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-cyan-500/30"></div>
            <div className="w-20 h-px bg-gradient-to-r from-transparent to-blue-400/60"></div>
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-indigo-500/35"></div>
          </div>
        </div>

        {/* Right Decorative Lines */}
        <div className="fixed right-0 top-1/2 transform -translate-y-1/2 hidden lg:block z-10">
          <div className="space-y-4">
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-blue-500/50"></div>
            <div className="w-24 h-px bg-gradient-to-l from-transparent to-purple-500/40"></div>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-cyan-500/30"></div>
            <div className="w-20 h-px bg-gradient-to-l from-transparent to-blue-400/60"></div>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-indigo-500/35"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto h-full flex flex-col gap-3 sm:gap-4">

          {/* Top Row - Events and Projects */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 flex-[3]">
            {/* Events Section - Takes up 2 columns on desktop */}
            <div className="xl:col-span-2 h-full">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl h-full overflow-hidden">
                <EventsList today={todayEastern} />
              </div>
            </div>

            {/* Projects Section */}
            <div className="xl:col-span-1 h-full">
              <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 backdrop-blur-sm rounded-xl border border-blue-700/50 shadow-2xl h-full overflow-hidden">
                <MyIdeas email={userEmail} showContributedOnly={true} title="My Projects" />
              </div>
            </div>
          </div>

          {/* Bottom Row - Profile Section (Full Width) */}
          <div className="w-full flex-[2]">
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-xl border border-purple-700/50 shadow-2xl h-full overflow-hidden">
              <Profile user={{ email: userEmail }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Home;
