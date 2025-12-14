import { useEffect, useState } from 'react';
import EventsList from '../components/EventsList';
import Navbar from '../components/Navbar';
import MyIdeas from '../components/MyIdeas';
import Profile from '../components/Profile';
import FeaturedProjects from '../components/FeaturedProjects';
import Leaderboard from '../components/Leaderboard';
import { getUserProfile } from '../api/API';

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
  const [profilePicture, setProfilePicture] = useState('');
  const [activeTab, setActiveTab] = useState('community');

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
      setUserEmail(email);
      localStorage.setItem('userEmail', email); // Store email in local storage

      // Fetch user profile to get display name and profile picture
      const fetchUserName = async () => {
        try {
          const profile = await getUserProfile(email);
          setUserName(profile.name || email.split('@')[0]);
          setProfilePicture(profile.profile_picture || '');
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserName(email.split('@')[0]);
        }
      };

      fetchUserName();
    }
  }, []);

  return (
    <div
      className="home-page flex flex-col min-h-screen relative overflow-hidden"
      style={{
        background: '#000000',
      }}
    >
      {/* Light blue flashes/glowing effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-[60%] right-[15%] w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[20%] left-[20%] w-56 h-56 bg-cyan-400/12 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] right-[40%] w-72 h-72 bg-blue-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-[10%] right-[25%] w-48 h-48 bg-cyan-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <Navbar userName={userName} profilePicture={profilePicture} />

      {/* Welcome Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 lg:py-2 lg:flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-bold text-white mb-2 lg:mb-1">
            Welcome back, {userName || 'Guest'}! 👋
          </h1>
          <p className="text-gray-400 text-sm sm:text-base lg:text-xs xl:text-sm">
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

      {/* Tabs */}
      <div className="px-4 sm:px-6 pb-4">
        <div className="max-w-7xl mx-auto flex gap-2 border-b border-slate-700/50">
          <button
            onClick={() => setActiveTab('community')}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'community'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-slate-800/50'
            } rounded-t-lg`}
          >
            🌐 Community
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'profile'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-slate-800/50'
            } rounded-t-lg`}
          >
            👤 Profile
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6 relative">
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

        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-0 lg:h-full lg:flex lg:flex-col lg:gap-3 xl:gap-4">

          {activeTab === 'community' ? (
            <>
              {/* Community Tab - Top Row: Events and Leaderboard */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-3 xl:gap-4 lg:flex-[3]">
                {/* Events Section - Takes up 2 columns on desktop */}
                <div className="xl:col-span-2 lg:h-full">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 shadow-2xl overflow-hidden lg:h-full">
                    <div className="h-auto lg:h-full">
                      <EventsList today={todayEastern} />
                    </div>
                  </div>
                </div>

                {/* Leaderboard Section */}
                <div className="xl:col-span-1">
                  <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-700/50 shadow-2xl overflow-hidden lg:h-full">
                    <div className="h-[400px] lg:h-full overflow-y-auto">
                      <Leaderboard />
                    </div>
                  </div>
                </div>
              </div>

              {/* Community Tab - Bottom Row: Featured Projects */}
              <div className="w-full lg:flex-[2]">
                <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 backdrop-blur-sm border border-blue-700/50 shadow-2xl overflow-hidden lg:h-full">
                  <div className="h-[350px] sm:h-[400px] lg:h-full overflow-y-auto">
                    <FeaturedProjects />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Profile Tab */}
              <div className="w-full lg:h-full">
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-700/50 shadow-2xl overflow-hidden lg:h-full">
                  <div className="h-[600px] sm:h-[650px] lg:h-full overflow-y-auto">
                    <Profile user={{ email: userEmail }} />
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Home;
