import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventsList from '../components/admin/EventsList';
import Navbar from '../components/Navbar';
import AddEvent from '../components/admin/AddEvent';
import { getUserProfile, getMonthlyVisitors } from '../api/API';

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
    monthlyData: []
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

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

  const handleAddEventSuccess = () => {
    setEventsRefreshKey((prevKey) => prevKey + 1);
  };

  const handleEventSelect = (event) => {
    navigate(`/admin/event/${event.id}`, { state: { event } });
  };

  return (
    <div
      className="admin-page flex flex-col min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%)',
      }}
    >
      <div className="sticky top-0 z-50">
        <Navbar userName={userName || userEmail} profilePicture={profilePicture} backToHome={true} />
      </div>

      {/* Welcome Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            ⚙️ Admin Dashboard
          </h1>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
            Manage events and oversee all hackathon activities
          </p>
        </div>
      </div>

      {/* Analytics Stats */}
      <div className="px-4 sm:px-6 pb-4">
        <div className="max-w-7xl mx-auto">
          {loadingAnalytics ? (
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-xl p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-400">Loading analytics...</span>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>📊</span>
                    Visitor Analytics
                  </h2>
                  <p className="text-gray-400 text-sm">Monthly visitor statistics from Google Analytics</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Current Month */}
                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-4">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="text-3xl font-bold text-green-300">{analyticsData.currentMonth.toLocaleString()}</div>
                  <div className="text-sm text-green-200/70 mb-1">This Month</div>
                  <div className="text-xs text-gray-400">{analyticsData.currentMonthSessions.toLocaleString()} sessions</div>
                </div>

                {/* Last Month */}
                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="text-2xl mb-2">📅</div>
                  <div className="text-3xl font-bold text-blue-300">{analyticsData.lastMonth.toLocaleString()}</div>
                  <div className="text-sm text-blue-200/70">Last Month</div>
                  <div className="text-xs text-gray-400">
                    {analyticsData.currentMonth > analyticsData.lastMonth ? (
                      <span className="text-green-400">↑ {Math.round(((analyticsData.currentMonth - analyticsData.lastMonth) / analyticsData.lastMonth) * 100)}%</span>
                    ) : analyticsData.currentMonth < analyticsData.lastMonth ? (
                      <span className="text-red-400">↓ {Math.round(((analyticsData.lastMonth - analyticsData.currentMonth) / analyticsData.lastMonth) * 100)}%</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </div>

                {/* All Time */}
                <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-4">
                  <div className="text-2xl mb-2">🌐</div>
                  <div className="text-3xl font-bold text-purple-300">{analyticsData.allTime.toLocaleString()}</div>
                  <div className="text-sm text-purple-200/70">All Time</div>
                  <div className="text-xs text-gray-400">Total users</div>
                </div>

                {/* Growth Rate */}
                <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-lg p-4">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="text-3xl font-bold text-orange-300">
                    {analyticsData.lastMonth > 0
                      ? `${Math.round(((analyticsData.currentMonth - analyticsData.lastMonth) / analyticsData.lastMonth) * 100)}%`
                      : '—'}
                  </div>
                  <div className="text-sm text-orange-200/70">Growth Rate</div>
                  <div className="text-xs text-gray-400">Month over month</div>
                </div>
              </div>

              {/* Monthly Trend */}
              {analyticsData.monthlyData.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">6-Month Trend</h3>
                  <div className="flex items-end justify-between gap-2 h-32">
                    {analyticsData.monthlyData.slice(-6).map((month, idx) => {
                      const maxVisitors = Math.max(...analyticsData.monthlyData.slice(-6).map(m => m.visitors));
                      const heightPercent = maxVisitors > 0 ? (month.visitors / maxVisitors) * 100 : 0;

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center">
                          <div className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all hover:opacity-80"
                            style={{ height: `${heightPercent}%` }}
                            title={`${month.month} ${month.year}: ${month.visitors} visitors`}
                          />
                          <div className="text-xs text-gray-400 mt-2">{month.month}</div>
                          <div className="text-xs text-gray-500">{month.visitors}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Section: Add Event & Admin Tools */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl p-6">
                <AddEvent userEmail={userEmail} onSuccess={handleAddEventSuccess} />
              </div>

              {/* Admin Tools Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/admin/duplicates')}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
                >
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span className="text-lg">Merge Duplicate Ideas</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Admin Tool</span>
                </button>

                <button
                  onClick={() => navigate('/admin/all-projects')}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
                >
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="text-lg">All Projects</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Manage Featured</span>
                </button>
              </div>
            </div>

            {/* Right Section: Events List */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl p-6 h-[600px]">
              <EventsList key={eventsRefreshKey} onEventSelect={handleEventSelect} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
