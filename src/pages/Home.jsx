import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventsList from '../components/EventsList';
import Navbar from '../components/Navbar';
import MyIdeas from '../components/MyIdeas';
import FeaturedProjects from '../components/FeaturedProjects';
import Leaderboard from '../components/Leaderboard';
import Sidebar from '../components/dashboard/Sidebar';
import { getUserProfile, getUserIdeas } from '../api/API';

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
  const [sidebarExpanded, setSidebarExpanded] = useState(() => window.innerWidth >= 1024);
  const [subtitleIdx, setSubtitleIdx] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(true);
  const [lastProject, setLastProject] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
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

  // Fetch last project + event for the welcome card
  useEffect(() => {
    if (!userEmail || userEmail === 'Guest') return;
    getUserIdeas(userEmail)
      .then(ideas => {
        if (ideas && ideas.length > 0) {
          setLastProject(ideas[0].idea || '');
          setLastEvent(ideas[0].event_title || '');
        } else {
          setLastProject('');
          setLastEvent('');
        }
      })
      .catch(() => { setLastProject(''); setLastEvent(''); });
  }, [userEmail]);

  // Cycle through 2 subtitle slots with a fade
  useEffect(() => {
    const interval = setInterval(() => {
      setSubtitleVisible(false);
      setTimeout(() => {
        setSubtitleIdx(i => (i + 1) % 2);
        setSubtitleVisible(true);
      }, 350);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 30%, #dbeafe 60%, #93c5fd 85%, #3b82f6 100%)' }}>

      {/* Navbar spans full width, above the sidebar */}
      <div className="relative z-50 flex-shrink-0">
        <Navbar userName={userName} profilePicture={profilePicture} />
      </div>

      {/* Below navbar: sidebar + content side by side */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">

      {/* Subtle white + light blue glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[420px] h-[420px] bg-blue-400/25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-[0%] left-[15%] w-[500px] h-[500px] bg-white/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-[5%] right-[5%] w-96 h-96 bg-white/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[20%] left-[10%] w-80 h-80 bg-white/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[5%] right-[20%] w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-[50%] right-[5%] w-72 h-72 bg-blue-200/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(e => !e)} />

      {/* Right: content — left padding matches sidebar width. This is the ONLY
          scrolling region for the dashboard; every section below sizes to its
          own content instead of scrolling independently. */}
  <div className="flex flex-col flex-1 min-w-0 overflow-y-auto relative"
    style={{ paddingLeft: sidebarExpanded ? '220px' : '52px', transition: 'padding-left 200ms ease' }}>

      <div className="px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-3 sm:gap-4 max-w-7xl mx-auto w-full">

        {/* Welcome */}
        <div className="relative overflow-hidden rounded-lg border border-slate-700 bg-slate-900 px-5 py-4">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 pointer-events-none" />
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-blue-500 to-purple-500" />
          <div className="relative pl-2">
            <p className="text-[11px] font-bold uppercase tracking-[.15em] text-blue-400/80">Welcome back</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mt-0.5">
              {userName || 'Guest'}! 👋
            </h1>
            <p
              className="text-sm mt-1 leading-snug"
              style={{
                opacity: subtitleVisible ? 1 : 0,
                transition: 'opacity 350ms ease-in-out',
                color: subtitleIdx === 0 ? '#93c5fd' : '#c4b5fd',
              }}
            >
              {subtitleIdx === 0
                ? lastProject
                  ? `Last project: ${lastProject}`
                  : 'No projects yet — submit your first idea 💡'
                : lastEvent
                  ? `Last event: ${lastEvent}`
                  : 'No events yet — join your first hackathon 🎯'
              }
            </p>
          </div>
        </div>

        {/* Events + Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden">
            <EventsList today={todayEastern} />
          </div>
          <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-blue-950 border border-blue-900/60 rounded-lg overflow-hidden">
            <Leaderboard />
          </div>
        </div>

        {/* Featured Projects — grows naturally, no internal scroll */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 border border-blue-900/60 rounded-lg overflow-hidden">
          <FeaturedProjects />
        </div>

      </div>

      </div>{/* end right column */}
      </div>{/* end sidebar+content row */}
    </div>
  );
}

export default Home;
