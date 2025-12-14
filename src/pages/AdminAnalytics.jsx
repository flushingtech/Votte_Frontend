import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getMonthlyVisitors, getUserProfile } from '../api/API';

const AdminAnalytics = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email || '';
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [analyticsData, setAnalyticsData] = useState({
    currentMonth: 0,
    currentMonthSessions: 0,
    lastMonth: 0,
    allTime: 0,
    monthlyData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserName = async () => {
      if (userEmail) {
        try {
          const profile = await getUserProfile(userEmail);
          setUserName(profile.name || userEmail.split('@')[0]);
          setProfilePicture(profile.profile_picture || '');
        } catch {
          setUserName(userEmail.split('@')[0]);
        }
      }
    };
    fetchUserName();
  }, [userEmail]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMonthlyVisitors();
        setAnalyticsData(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const growthPercent =
    analyticsData.lastMonth > 0
      ? Math.round(((analyticsData.currentMonth - analyticsData.lastMonth) / analyticsData.lastMonth) * 100)
      : null;

  const maxVisitors =
    analyticsData.monthlyData && analyticsData.monthlyData.length > 0
      ? Math.max(...analyticsData.monthlyData.map((m) => m.visitors))
      : 0;

  return (
    <div
      className="min-h-screen flex flex-col text-white relative overflow-hidden"
      style={{ background: '#000000' }}
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

      <div className="flex-1 px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-indigo-800/70 to-purple-800/70 border border-indigo-700/50 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-indigo-200">Analytics</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Advanced Analytics</h1>
                <p className="text-gray-300 text-sm mt-1">Deep dive into trends and engagement.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4 shadow">
              <p className="text-xs text-blue-200 uppercase tracking-wide">This Month</p>
              <p className="text-3xl font-bold text-white">{analyticsData.currentMonth.toLocaleString()}</p>
              <p className="text-xs text-blue-100/70">{analyticsData.currentMonthSessions.toLocaleString()} sessions</p>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-lg p-4 shadow">
              <p className="text-xs text-cyan-200 uppercase tracking-wide">Last Month</p>
              <p className="text-3xl font-bold text-white">{analyticsData.lastMonth.toLocaleString()}</p>
              <p className="text-xs text-cyan-100/70">Baseline for comparison</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-400/20 rounded-lg p-4 shadow">
              <p className="text-xs text-amber-200 uppercase tracking-wide">Growth</p>
              <p className="text-3xl font-bold text-white">
                {growthPercent !== null ? `${growthPercent}%` : '—'}
              </p>
              <p className="text-xs text-amber-100/70">Month over month</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-300">Trend</p>
                <h2 className="text-xl font-bold text-white">6-Month Visitor Trend</h2>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
              </div>
            ) : error ? (
              <div className="text-red-400 text-sm">{error}</div>
            ) : analyticsData.monthlyData.length === 0 ? (
              <div className="text-gray-400 text-sm">No data available.</div>
            ) : (
              <div className="flex items-end justify-between gap-2 h-28">
                {analyticsData.monthlyData.slice(-6).map((month, idx) => {
                  const heightPercent = maxVisitors > 0 ? (month.visitors / maxVisitors) * 100 : 0;
                  return (
                    <div key={`${month.month}-${idx}`} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all hover:opacity-80"
                        style={{ height: `${heightPercent}%` }}
                        title={`${month.month} ${month.year}: ${month.visitors} visitors`}
                      />
                      <div className="text-xs text-gray-400 mt-2">{month.month}</div>
                      <div className="text-xs text-gray-500">{month.visitors}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
