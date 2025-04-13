import { useEffect, useState } from 'react';
import {
  getContributedIdeaCount,
  getTotalVotesForUser,
  getHackathonWins,
  getHackathonWinsDetails,
} from '../api/API';

const Profile = ({ user }) => {
  const [contributedCount, setContributedCount] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [hackathonWins, setHackathonWins] = useState(0);
  const [detailedWins, setDetailedWins] = useState([]);
  const [showWins, setShowWins] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    const fetchStats = async () => {
      try {
        const [count, votes, wins, winDetails] = await Promise.all([
          getContributedIdeaCount(user.email),
          getTotalVotesForUser(user.email),
          getHackathonWins(user.email),
          getHackathonWinsDetails(user.email),
        ]);
        setContributedCount(count);
        setTotalVotes(votes);
        setHackathonWins(wins);
        setDetailedWins(winDetails);
      } catch (error) {
        console.error('Error fetching profile stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.email]);

  const tileStyle =
    'flex flex-col items-center justify-center bg-[#10141B] border border-gray-600 p-4 w-[150px] h-[110px]';

  return (
    <div className="profile-container p-4 text-white">
      <div className="text-center text-xl font-bold mb-4">My Profile</div>

      {loading ? (
        <p className="text-center text-sm">Loading your stats...</p>
      ) : (
        <>
          <div className="flex gap-2 justify-center flex-wrap md:flex-nowrap overflow-x-auto pb-2">
            <div className={tileStyle}>
              <span className="text-2xl">💡</span>
              <div className="mt-2 text-sm">
                <span className="font-bold">{contributedCount}</span> Ideas Submitted
              </div>
            </div>

            <div className={tileStyle}>
              <span className="text-2xl">🗳️</span>
              <div className="mt-2 text-sm">
                <span className="font-bold">{totalVotes}</span> Votes Received
              </div>
            </div>

            <div className={tileStyle}>
              <span className="text-2xl">🏆</span>
              <div className="mt-2 text-sm">
                <span className="font-bold">{hackathonWins}</span> Hackathon Wins
              </div>
              {hackathonWins > 0 && (
                <button
                  className="text-xs text-blue-300 underline mt-1"
                  onClick={() => setShowWins(prev => !prev)}
                >
                  {showWins ? 'Hide' : 'View'}
                </button>
              )}
            </div>

            <div className={tileStyle}>
              <span className="text-2xl">📅</span>
              <div className="mt-2 text-sm text-gray-400 font-medium">Coming Soon – Joined On</div>
            </div>

            <div className={tileStyle}>
              <span className="text-2xl">🔥</span>
              <div className="mt-2 text-sm text-gray-400 font-medium">Coming Soon – Streak</div>
            </div>

            <div className={tileStyle}>
              <span className="text-2xl">📦</span>
              <div className="mt-2 text-sm text-gray-400 font-medium">Coming Soon – Projects</div>
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
