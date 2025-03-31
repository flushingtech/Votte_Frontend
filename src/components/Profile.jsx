import { useEffect, useState } from 'react';
import { getContributedIdeaCount, getTotalVotesForUser, getHackathonWins, getHackathonWinsDetails } from '../api/API';

const Profile = ({ user }) => {
    const [contributedCount, setContributedCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [totalVotes, setTotalVotes] = useState(0);
    const [hackathonWins, setHackathonWins] = useState(0);
    const [detailedWins, setDetailedWins] = useState([]);
    const [showWins, setShowWins] = useState(false);

    useEffect(() => {
        if (!user?.email) return;

        const fetchStats = async () => {
            try {
                const [count, wins, winDetails] = await Promise.all([
                    getContributedIdeaCount(user.email),
                    getHackathonWins(user.email),
                    getHackathonWinsDetails(user.email),
                ]);
                setContributedCount(count);
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


    return (
        <div className="profile-container relative flex flex-col h-full">
            {/* Sticky Header */}
            <div className="p-2 border shadow-md bg-[#1E2A3A] border-white sticky top-0 z-10">
                <h2 className="text-xl sm:text-lg font-bold text-white text-center">My Profile</h2>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-4">
                {loading ? (
                    <p className="text-sm text-center">Loading your stats...</p>
                ) : (
                    <div className="text-white text-sm sm:text-base space-y-2">
                        <div className="flex justify-between border-b border-gray-600 pb-1">
                            <span className="font-medium">Total Contributions</span>
                            <span className="text-green-400 font-bold">{contributedCount}</span>
                        </div>

                        <div className="flex justify-between border-b border-gray-600 pb-1">
                            <span className="font-medium">Total Votes Received</span>
                            <span className="text-blue-400 font-bold">{totalVotes}</span>
                        </div>

                        <div className="flex justify-between items-center border-b border-gray-600 pb-1">
                            <span className="font-medium">Hackathon Wins</span>
                            <div className="flex items-center gap-3">
                                <span className="text-purple-400 font-bold">{hackathonWins}</span>
                                {hackathonWins > 0 && (
                                    <button
                                        onClick={() => setShowWins(prev => !prev)}
                                        className="text-xs underline text-blue-300 hover:text-blue-200"
                                    >
                                        {showWins ? 'Hide' : 'View'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {showWins && (
                            <ul className="pl-4 list-disc text-gray-300 mt-2 space-y-1">
                                {detailedWins.map(win => (
                                    <li key={win.event_id}>
                                        <span className="text-white font-medium">{win.event_title}</span> –{' '}
                                        {new Date(win.event_date).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>


                )}
            </div>
        </div>
    );
};

export default Profile;
