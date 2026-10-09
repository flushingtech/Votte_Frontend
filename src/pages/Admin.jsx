import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/dashboard/Sidebar';
import AddEvent from '../components/admin/AddEvent';
import { getUserProfile, getMonthlyVisitors, getContributorRequestCount } from '../api/API';

const QUICK_ACTIONS = [
  {
    label: 'All Events',
    description: 'Edit, cancel, or review past events',
    path: '/admin/all-events',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
  },
  {
    label: 'All Projects',
    description: 'Browse and curate submitted projects',
    path: '/admin/all-projects',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    ),
  },
  {
    label: 'Merge Duplicates',
    description: 'Clean up duplicate project entries',
    path: '/admin/duplicates',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    ),
  },
  {
    label: 'Contributor Requests',
    description: 'Approve or deny join requests',
    path: '/admin/requests',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405M15 17v-2a3 3 0 00-3-3H6a3 3 0 00-3 3v2m12 0a3 3 0 01-3 3H6a3 3 0 01-3-3m12 0v2m0 0h6m-6-6V5a2 2 0 00-2-2H9l-2 2H5a2 2 0 00-2 2v6" />
    ),
    badgeKey: 'requestCount',
  },
];

const AdminPage = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';
  const [sidebarExpanded, setSidebarExpanded] = useState(() => window.innerWidth >= 1024);
  const [eventsRefreshKey, setEventsRefreshKey] = useState(0);
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [analyticsData, setAnalyticsData] = useState({
    currentMonth: 0,
    currentMonthSessions: 0,
    lastMonth: 0,
    allTime: 0,
    monthlyData: [],
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [requestCount, setRequestCount] = useState(0);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const navigate = useNavigate();

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
  }, [userEmail]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getMonthlyVisitors();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoadingAnalytics(false);
      }
    };
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!userEmail) return;
      setLoadingRequests(true);
      try {
        const count = await getContributorRequestCount(userEmail);
        setRequestCount(count || 0);
      } catch (error) {
        console.error('Error fetching contributor requests:', error);
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchRequests();
  }, [userEmail]);

  const handleAddEventSuccess = () => {
    setEventsRefreshKey((prevKey) => prevKey + 1);
  };

  const growthPercent =
    analyticsData.lastMonth > 0
      ? Math.round(((analyticsData.currentMonth - analyticsData.lastMonth) / analyticsData.lastMonth) * 100)
      : null;

  const growthUp = growthPercent !== null && growthPercent > 0;
  const growthDown = growthPercent !== null && growthPercent < 0;
  const growthColor = growthUp ? 'text-emerald-400' : growthDown ? 'text-red-400' : 'text-slate-300';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950">
      {/* Navbar */}
      <div className="relative z-50 flex-shrink-0">
        <Navbar userName={userName || userEmail} profilePicture={profilePicture} backToHome={true} />
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(e => !e)} />

        {/* Main scroll area */}
        <div
          className="relative flex-1 min-w-0 overflow-y-auto"
          style={{ paddingLeft: sidebarExpanded ? '220px' : '52px', transition: 'padding-left 200ms ease' }}
        >
          <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-6xl mx-auto w-full flex flex-col gap-3 sm:gap-4">

            {/* HEADER */}
            <div className="bg-slate-900 border border-slate-700 p-4 sm:p-5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm shadow shadow-blue-500/30">
                    🛠️
                  </span>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Control Room</h1>
                    <p className="text-slate-400 text-xs sm:text-sm">
                      Curate events, manage contributors, and keep the community humming.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className={`px-2.5 py-1 border text-xs font-semibold ${requestCount > 0 ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-slate-800/60 border-slate-700 text-blue-300'}`}>
                    {loadingRequests ? '—' : requestCount} pending {requestCount === 1 ? 'request' : 'requests'}
                  </div>
                  <div className="px-2.5 py-1 bg-slate-800/60 border border-slate-700 text-xs font-semibold text-blue-300">
                    {loadingAnalytics ? '—' : analyticsData.currentMonth.toLocaleString()} visitors this month
                  </div>
                  <div className={`px-2.5 py-1 bg-slate-800/60 border border-slate-700 text-xs font-semibold ${growthColor}`}>
                    {loadingAnalytics ? '—' : growthPercent !== null ? `${growthPercent > 0 ? '+' : ''}${growthPercent}% MoM` : '— MoM'}
                  </div>
                </div>
              </div>
            </div>

            {/* CORE GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 sm:gap-4 items-start">

              {/* LEFT: Create event + quick actions */}
              <div className="xl:col-span-2 flex flex-col gap-3 sm:gap-4">
                <div className="bg-slate-900 border border-slate-700 p-4">
                  <AddEvent userEmail={userEmail} onSuccess={handleAddEventSuccess} />
                </div>

                <div className="bg-slate-900 border border-slate-700">
                  <div className="flex items-center gap-2 px-4 pt-4 pb-3">
                    <span className="w-6 h-6 flex-shrink-0 rounded-md bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs shadow shadow-purple-500/30">⚡</span>
                    <h2 className="text-sm font-bold uppercase tracking-wide text-white">Quick Actions</h2>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {QUICK_ACTIONS.map((action) => {
                      const badge = action.badgeKey === 'requestCount' ? requestCount : 0;
                      return (
                        <button
                          key={action.path}
                          onClick={() => navigate(action.path)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/60 transition-colors group"
                        >
                          <span className="w-8 h-8 flex-shrink-0 bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/40 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {action.icon}
                            </svg>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-white">{action.label}</span>
                            <span className="block text-xs text-slate-500 truncate">{action.description}</span>
                          </span>
                          {badge > 0 && (
                            <span className="flex-shrink-0 bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-bold px-1.5 py-0.5">
                              {badge} new
                            </span>
                          )}
                          <svg className="w-4 h-4 flex-shrink-0 text-slate-600 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT: Analytics */}
              <div className="xl:col-span-3 bg-slate-900 border border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 flex-shrink-0 rounded-md bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-xs shadow shadow-blue-500/30">📊</span>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wide text-white">Visitor Insights</h2>
                    <p className="text-xs text-slate-500">Google Analytics snapshot</p>
                  </div>
                </div>

                {loadingAnalytics ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      <div className="bg-slate-800/60 border border-slate-700 p-3">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">This Month</p>
                        <p className="text-xl font-bold text-white tabular-nums">{analyticsData.currentMonth.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500">{analyticsData.currentMonthSessions.toLocaleString()} sessions</p>
                      </div>
                      <div className="bg-slate-800/60 border border-slate-700 p-3">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">Last Month</p>
                        <p className="text-xl font-bold text-white tabular-nums">{analyticsData.lastMonth.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500">
                          {analyticsData.currentMonth > analyticsData.lastMonth
                            ? 'Trending up'
                            : analyticsData.currentMonth < analyticsData.lastMonth
                            ? 'Trending down'
                            : 'Flat'}
                        </p>
                      </div>
                      <div className="bg-slate-800/60 border border-slate-700 p-3">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">All Time</p>
                        <p className="text-xl font-bold text-white tabular-nums">{analyticsData.allTime.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500">Total users</p>
                      </div>
                      <div className="bg-slate-800/60 border border-slate-700 p-3">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">Growth</p>
                        <p className={`text-xl font-bold tabular-nums ${growthColor}`}>
                          {analyticsData.lastMonth > 0 ? `${growthPercent > 0 ? '+' : ''}${growthPercent}%` : '—'}
                        </p>
                        <p className="text-[10px] text-slate-500">MoM change</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/admin/analytics')}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m4 0H5" />
                      </svg>
                      <span>Advanced Analytics</span>
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
