import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventsList from '../components/EventsList';
import Navbar from '../components/Navbar';
import MyIdeas from '../components/MyIdeas';
import FeaturedProjects from '../components/FeaturedProjects';
import Leaderboard from '../components/Leaderboard';
import Sidebar from '../components/dashboard/Sidebar';
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
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  // No tabs: always show community view

  const getEasternDate = () => {
    const eastern = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    eastern.setHours(0, 0, 0, 0); // strip time
    return eastern;
  };

  const todayEastern = getEasternDate();

  // Redirect to landing page if not logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/', { replace: true });
      return;
    }
  }, [navigate]);

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
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#000000' }}>

      {/* Navbar spans full width, above the sidebar */}
      <div className="relative z-50 flex-shrink-0">
        <Navbar userName={userName} profilePicture={profilePicture} />
      </div>

      {/* Below navbar: sidebar + content side by side */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">

      {/* Light blue flashes/glowing effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-[60%] right-[15%] w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[20%] left-[20%] w-56 h-56 bg-cyan-400/12 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] right-[40%] w-72 h-72 bg-blue-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-[10%] right-[25%] w-48 h-48 bg-cyan-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <Sidebar />

      {/* Right: content */}
  <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative pl-6">

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

      {/* No tabs - community content only */}

      {/* Main Content Grid */}
      <div className="flex-1 min-h-0 flex flex-col px-4 sm:px-6 pb-6">
        <div className="flex-1 min-h-0 flex flex-col gap-4 max-w-7xl mx-auto w-full">

            <>
              {/* Events + Leaderboard — fixed height */}
              <div className="flex-shrink-0 grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 shadow-2xl overflow-hidden" style={{ minHeight: '340px' }}>
                    <EventsList today={todayEastern} />
                  </div>
                </div>
                <div className="xl:col-span-1">
                  <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-700/50 shadow-2xl overflow-hidden">
                    <div className="h-[340px] overflow-y-auto">
                      <Leaderboard />
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Projects — fills remaining height */}
              <div className="flex-1 min-h-0 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 backdrop-blur-sm border border-blue-700/50 shadow-2xl overflow-y-auto lg:overflow-hidden">
                <FeaturedProjects />
              </div>
            </>

        </div>
      </div>

      </div>{/* end right column */}
      </div>{/* end sidebar+content row */}
    </div>
  );
}

export default Home;
