import { useEffect, useState } from 'react';
import { getLeaderboard } from '../api/API';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏆</span>
          <h2 className="text-xl font-bold text-white">Leaderboard</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏆</span>
          <h2 className="text-xl font-bold text-white">Leaderboard</h2>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <p>No winners yet</p>
          <p className="text-sm mt-2">Complete a hackathon to appear here!</p>
        </div>
      </div>
    );
  }

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '🏅';
  };

  const getMedalColor = (index) => {
    if (index === 0) return 'from-yellow-600/30 to-orange-600/30 border-yellow-500/50';
    if (index === 1) return 'from-gray-400/30 to-gray-500/30 border-gray-400/50';
    if (index === 2) return 'from-orange-700/30 to-orange-800/30 border-orange-600/50';
    return 'from-purple-600/20 to-pink-600/20 border-purple-500/30';
  };

  const scrollbarStyle = {
    scrollbarWidth: 'thin',
    scrollbarColor: '#9333ea #1e293b'
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <style>{`
        .leaderboard-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .leaderboard-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 4px;
        }
        .leaderboard-scrollbar::-webkit-scrollbar-thumb {
          background: #9333ea;
          border-radius: 4px;
        }
        .leaderboard-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a855f7;
        }
      `}</style>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🏆</span>
        <h2 className="text-xl font-bold text-white">Leaderboard</h2>
        <span className="ml-auto text-sm text-gray-400">Top {leaderboard.length}</span>
      </div>

      <div className="flex-1 overflow-y-scroll overflow-x-hidden space-y-2 pr-2 leaderboard-scrollbar" style={scrollbarStyle}>
        {leaderboard.map((user, index) => (
          <div
            key={user.email}
            className={`bg-gradient-to-r ${getMedalColor(index)} backdrop-blur-sm border rounded-lg p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform`}
          >
            {/* Rank & Medal */}
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-white/30 w-8 text-center">
                {index + 1}
              </div>
              <div className="text-3xl">
                {getMedalEmoji(index)}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold truncate">
                {user.email.split('@')[0]}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {user.email}
              </div>
            </div>

            {/* Wins Badge */}
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <span className="text-yellow-400 font-bold text-lg">
                {user.total_wins}
              </span>
              <span className="text-gray-300 text-sm">
                {user.total_wins === 1 ? 'Win' : 'Wins'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
