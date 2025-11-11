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
  const [showWins, setShowWins] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joinedDate, setJoinDate] = useState(0);

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
        setJoinDate(joinedDate);
      } catch (error) {
        console.error('Error fetching profile stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.email]);

  const tileStyle =
    'flex flex-col items-center justify-center bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-600/50 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hover:border-slate-500';

  return (
    <div className="profile-container p-6 text-white">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-purple-500 p-2 rounded-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold">My Profile</h2>
      </div>

      {loading ? (
        <p className="text-center text-sm">Loading your stats...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div className={tileStyle}>
              <div className="text-3xl mb-2">💡</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{contributedCount}</div>
                <div className="text-xs text-gray-300">Ideas Submitted</div>
              </div>
            </div>

            <div className={tileStyle}>
              <div className="text-3xl mb-2">🗳️</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{totalVotes}</div>
                <div className="text-xs text-gray-300">Votes Received</div>
              </div>
            </div>

            <div className={tileStyle}>
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{hackathonWins}</div>
                <div className="text-xs text-gray-300">Hackathon Wins</div>
                {hackathonWins > 0 && (
                  <button
                    className="text-xs text-purple-300 hover:text-purple-200 underline mt-1 transition-colors"
                    onClick={() => setShowWins(prev => !prev)}
                  >
                    {showWins ? 'Hide' : 'View Details'}
                  </button>
                )}
              </div>
            </div>

            <div className={`${tileStyle} opacity-60 cursor-not-allowed`}>
              <div className="text-3xl mb-2">📅</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{joinedDate}</div>
                <div className="text-xs text-gray-500">Join Date</div>
              </div>
            </div>

            <div className={`${tileStyle} opacity-60 cursor-not-allowed`}>
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Coming Soon</div>
                <div className="text-xs text-gray-500">Streak</div>
              </div>
            </div>

            <div className={`${tileStyle} opacity-60 cursor-not-allowed`}>
              <div className="text-3xl mb-2">📊</div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Coming Soon</div>
                <div className="text-xs text-gray-500">Analytics</div>
              </div>
            </div>
          </div>

          {showWins && (
            <div className="mt-4">
              <h3 className="text-sm text-gray-300 mb-1">🏆 Hackathon Wins:</h3>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                {detailedWins.map(win => (
                  <li key={win.event_id}>
                    <span className="text-white font-medium">{win.event_title}</span>{' '}
                    –{' '}
                    {new Date(win.event_date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;
