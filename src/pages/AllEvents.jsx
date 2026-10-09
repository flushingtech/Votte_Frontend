import { useNavigate } from 'react-router-dom';
import EventsList from '../components/admin/EventsList';
import Navbar from '../components/Navbar';
import Sidebar from '../components/dashboard/Sidebar';
import { useEffect, useState } from 'react';
import { getUserProfile, getEvents } from '../api/API';

const AllEvents = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';
  const [sidebarExpanded, setSidebarExpanded] = useState(() => window.innerWidth >= 1024);
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [totalEvents, setTotalEvents] = useState(0);

  useEffect(() => {
    const fetchUserName = async () => {
      if (userEmail) {
        try {
          const profile = await getUserProfile(userEmail);
          setUserName(profile.name || userEmail.split('@')[0]);
          setProfilePicture(profile.profile_picture || '');
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserName(userEmail.split('@')[0]);
        }
      }
    };
    fetchUserName();

    const fetchEventCount = async () => {
      try {
        const events = await getEvents();
        setTotalEvents(events.length);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEventCount();
  }, [userEmail]);

  const handleEventSelect = (event) => {
    navigate(`/event/${event.id}`);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden text-white" style={{ background: '#000000' }}>
      <div className="relative z-50 flex-shrink-0">
        <Navbar userName={userName || userEmail} profilePicture={profilePicture} backToHome={true} />
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-[60%] right-[15%] w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-[20%] left-[20%] w-56 h-56 bg-cyan-400/12 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[40%] right-[40%] w-72 h-72 bg-blue-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(e => !e)} />

        <div
          className="relative flex-1 min-w-0 overflow-y-auto"
          style={{ paddingLeft: sidebarExpanded ? '220px' : '52px', transition: 'padding-left 200ms ease' }}
        >
        <div className="px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-800/60 to-indigo-800/60 border border-purple-700/50 p-6 shadow-2xl rounded-none">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white p-3 rounded-xl font-semibold transition-all flex items-center justify-center"
                title="Back to Admin"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-purple-200">Admin Tools</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">All Events</h1>
                <p className="text-gray-300 text-sm mt-1">Manage all hackathon events and sync from Meetup.</p>
              </div>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full text-sm font-semibold">
                {totalEvents} total
              </span>
            </div>
          </div>

          {/* Events List */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 shadow-2xl p-4 rounded-none">
            <EventsList onEventSelect={handleEventSelect} />
          </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AllEvents;
