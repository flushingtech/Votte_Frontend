import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AddEvent from '../components/admin/AddEvent';
import ContributorRequests from '../components/admin/ContributorRequests';
import { getUserProfile, getMonthlyVisitors, getContributorRequestCount } from '../api/API';

const AdminPage = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';
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

  const handleEventSelect = (event) => {
    navigate(`/admin/event/${event.id}`, { state: { event } });
  };

  const growthPercent =
    analyticsData.lastMonth > 0
      ? Math.round(((analyticsData.currentMonth - analyticsData.lastMonth) / analyticsData.lastMonth) * 100)
      : null;

  return (
    <div
      className="admin-page flex flex-col min-h-screen relative overflow-hidden"
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

      <div className="sticky top-0 z-50">
        <Navbar userName={userName || userEmail} profilePicture={profilePicture} backToHome={true} />
      </div>

      <div className="px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero + summary strip */}
          <div className="bg-gradient-to-r from-slate-800/80 via-slate-900/80 to-slate-800/80 border border-slate-700/60 p-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Admin Control Room</h1>
                <p className="text-gray-400 text-sm sm:text-base lg:text-lg mt-2">
                  Curate events, manage contributors, and keep the community humming.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-100 min-w-[140px]">
                  <p className="text-xs uppercase tracking-wide text-emerald-200">Requests</p>
                  <p className="text-2xl font-bold">{loadingRequests ? '—' : requestCount}</p>
                  <p className="text-xs text-emerald-200/80">Pending contributors</p>
                </div>
                <div className="px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-400/30 text-blue-100 min-w-[140px]">
                  <p className="text-xs uppercase tracking-wide text-blue-200">This Month</p>
                  <p className="text-2xl font-bold">
                    {loadingAnalytics ? '—' : analyticsData.currentMonth.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-200/80">Visitors</p>
                </div>
                <div className="px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-400/30 text-purple-100 min-w-[140px]">
                  <p className="text-xs uppercase tracking-wide text-purple-200">Growth</p>
                  <p className="text-2xl font-bold">{loadingAnalytics ? '—' : growthPercent !== null ? `${growthPercent}%` : '—'}</p>
                  <p className="text-xs text-purple-200/80">Month over month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Core grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Column 1: Event creation + quick actions */}
            <div className="space-y-4 h-[680px] flex flex-col">
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-700/50 shadow-2xl p-4">
                <AddEvent userEmail={userEmail} onSuccess={handleAddEventSuccess} />
              </div>

              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 shadow-2xl p-4 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-purple-200">Quick Actions</p>
                    <h2 className="text-xl font-bold text-white">Manage Projects</h2>
                  </div>
                  <span className="text-purple-200 text-xs bg-purple-500/10 border border-purple-400/30 px-3 py-1 rounded-full">
                    Shortcuts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate('/admin/duplicates')}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/15">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <span>Merge Duplicates</span>
                    </div>
                    <span className="text-xs text-white/80 group-hover:text-white">Review</span>
                  </button>

                  <button
                    onClick={() => navigate('/admin/all-projects')}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/15">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <span>All Projects</span>
                    </div>
                    <span className="text-xs text-white/80 group-hover:text-white">Curate</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/requests')}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/15">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405M15 17v-2a3 3 0 00-3-3H6a3 3 0 00-3 3v2m12 0a3 3 0 01-3 3H6a3 3 0 01-3-3m12 0v2m0 0h6m-6-6V5a2 2 0 00-2-2H9l-2 2H5a2 2 0 00-2 2v6" />
                        </svg>
                      </div>
                      <span>Contributor Requests</span>
                    </div>
                    <span className="text-xs text-white/80 group-hover:text-white">Review</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Column 2: Analytics */}
            <div className="space-y-6 h-[680px] flex flex-col">
              <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-700/50 p-6 shadow-2xl">
                {loadingAnalytics ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-blue-200">Analytics</p>
                        <h2 className="text-xl font-bold text-white">Visitor Insights</h2>
                        <p className="text-gray-400 text-sm">Google Analytics snapshot</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
                        <p className="text-xs text-blue-200">This Month</p>
                        <p className="text-2xl font-bold text-white">{analyticsData.currentMonth.toLocaleString()}</p>
                        <p className="text-xs text-blue-100/70">{analyticsData.currentMonthSessions.toLocaleString()} sessions</p>
                      </div>
                      <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-lg p-4">
                        <p className="text-xs text-cyan-200">Last Month</p>
                        <p className="text-2xl font-bold text-white">{analyticsData.lastMonth.toLocaleString()}</p>
                        <p className="text-xs text-cyan-100/70">
                          {analyticsData.currentMonth > analyticsData.lastMonth
                            ? 'Up'
                            : analyticsData.currentMonth < analyticsData.lastMonth
                            ? 'Down'
                            : 'Flat'}
                        </p>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-4">
                        <p className="text-xs text-purple-200">All Time</p>
                        <p className="text-2xl font-bold text-white">{analyticsData.allTime.toLocaleString()}</p>
                        <p className="text-xs text-purple-100/70">Total users</p>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-400/20 rounded-lg p-4">
                        <p className="text-xs text-amber-200">Growth</p>
                        <p className="text-2xl font-bold text-white">
                          {analyticsData.lastMonth > 0 ? `${growthPercent}%` : '—'}
                        </p>
                        <p className="text-xs text-amber-100/70">MoM change</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={() => navigate('/admin/analytics')}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m4 0H5" />
                        </svg>
                        <span>Advanced Analytics</span>
                      </button>
                    </div>
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
