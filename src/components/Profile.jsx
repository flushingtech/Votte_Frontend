import { useEffect, useState } from 'react';
import {
  getContributedIdeaCount,
  getTotalVotesForUser,
  getHackathonWins,
  getHackathonWinsDetails,
  getJoinDate
} from '../api/API';

const Profile = ({ user }) => {
  const [contributedCount, setContributedCount] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [hackathonWins, setHackathonWins] = useState(0);
  const [detailedWins, setDetailedWins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinedDate, setJoinedDate] = useState(0);

  useEffect(() => {
    if (!user?.email) return;

    const fetchStats = async () => {
      try {
        const [count, votes, wins, winDetails, joinedDate] = await Promise.all([
          getContributedIdeaCount(user.email),
          getTotalVotesForUser(user.email),
          getHackathonWins(user.email),
          getHackathonWinsDetails(user.email),
          getJoinDate(user.email),
        ]);
        setContributedCount(count);
        setTotalVotes(votes);
        setHackathonWins(wins);
        setDetailedWins(winDetails);
        setJoinedDate(joinedDate);
      } catch (error) {
        console.error('Error fetching profile stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.email]);

  if (loading) {
    return (
      <div className="profile-container p-6 text-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container p-6 text-white max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-4 rounded-2xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {user.email.split('@')[0]}
            </h2>
            <p className="text-gray-400 text-sm mt-1">Member since {joinedDate}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Profile Level</div>
            <div className="text-2xl font-bold text-purple-400">
              {Math.floor((contributedCount + totalVotes + hackathonWins * 10) / 10)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
          <div className="text-4xl mb-2">💡</div>
          <div className="text-3xl font-bold text-yellow-400">{contributedCount}</div>
          <div className="text-sm text-gray-300">Ideas</div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
          <div className="text-4xl mb-2">🗳️</div>
          <div className="text-3xl font-bold text-green-400">{totalVotes}</div>
          <div className="text-sm text-gray-300">Votes</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-3xl font-bold text-purple-400">{hackathonWins}</div>
          <div className="text-sm text-gray-300">Wins</div>
        </div>

        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-3xl font-bold text-blue-400">
            {contributedCount > 0 ? Math.round((totalVotes / contributedCount) * 10) / 10 : 0}
          </div>
          <div className="text-sm text-gray-300">Avg Votes</div>
        </div>
      </div>

      {/* Hackathon Victories */}
      {hackathonWins > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🏆</span>
            Hackathon Victories
          </h3>
          <div className="space-y-2">
            {detailedWins.map(win => (
              <div
                key={win.event_id}
                className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/20 rounded-lg p-4 flex items-center justify-between hover:border-yellow-500/40 transition-colors"
              >
                <div>
                  <div className="font-semibold text-white">{win.event_title}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(win.event_date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div className="text-3xl">🥇</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
